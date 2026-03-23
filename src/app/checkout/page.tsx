'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cart-store';
import { supabase, Settings } from '@/lib/supabase';
import { ToastProvider, useToastStore } from '@/components/Toast';

type Mode = 'local' | 'delivery';
type Payment = 'pix' | 'card' | 'cash';

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, count, clear } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const cartTotal = total();
  const cartCount = count();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [mode, setMode] = useState<Mode>('local');
  const [payment, setPayment] = useState<Payment>('pix');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [tableNumber, setTableNumber] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [cep, setCep] = useState('');
  const [city, setCity] = useState('');
  const [reference, setReference] = useState('');
  const [observations, setObservations] = useState('');
  const [changeAmount, setChangeAmount] = useState('');

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) setSettings(data);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (cartCount === 0) {
      router.push('/');
    }
  }, [cartCount, router]);

  // Phone formatting
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // CEP formatting and auto-fill
  const formatCep = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const handleCepChange = useCallback(async (val: string) => {
    const formatted = formatCep(val);
    setCep(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(`${data.localidade} - ${data.uf}`);
          addToast('Endereço preenchido automaticamente!', 'info');
        }
      } catch {
        // ignore
      }
    }
  }, [addToast]);

  // Validation
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório';
    if (mode === 'local') {
      if (!tableNumber.trim()) errs.tableNumber = 'Número da mesa é obrigatório';
    } else {
      if (!phone.trim()) errs.phone = 'WhatsApp é obrigatório';
      else if (phone.replace(/\D/g, '').length < 11) errs.phone = 'Número inválido';
      if (!street.trim()) errs.street = 'Rua é obrigatória';
      if (!neighborhood.trim()) errs.neighborhood = 'Bairro é obrigatório';
      if (!cep.trim()) errs.cep = 'CEP é obrigatório';
      else if (cep.replace(/\D/g, '').length < 8) errs.cep = 'CEP inválido';
      if (!city.trim()) errs.city = 'Cidade é obrigatória';
    }
    if (payment === 'cash' && !changeAmount.trim()) errs.changeAmount = 'Informe o valor do troco';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const deliveryFee = mode === 'delivery' ? (settings?.delivery_fee || 5) : 0;
  const grandTotal = cartTotal + deliveryFee;

  // Build WhatsApp message
  const buildMessage = () => {
    const header = mode === 'local'
      ? `*🍽️ Pedido — Mesa ${tableNumber}*`
      : `*🛵 Pedido — Delivery*`;

    const itemLines = items.map((i) =>
      `${i.quantity}x ${i.name} — R$ ${(i.price * i.quantity).toFixed(2).replace('.', ',')}`
    ).join('\n');

    let paymentLine = '';
    if (payment === 'pix') paymentLine = '*Pagamento: Pix*';
    else if (payment === 'card') paymentLine = '*Pagamento: Cartão na entrega*';
    else paymentLine = `*Pagamento: Dinheiro (troco p/ R$ ${changeAmount})*`;

    let msg = `${header}\n\nOlá! Segue meu pedido:\n\n${itemLines}\n\n`;

    if (mode === 'delivery') {
      msg += `*Subtotal: R$ ${cartTotal.toFixed(2).replace('.', ',')}*\n`;
      msg += `*Taxa de entrega: R$ ${deliveryFee.toFixed(2).replace('.', ',')}*\n`;
    }
    msg += `*Total: R$ ${grandTotal.toFixed(2).replace('.', ',')}*\n`;
    msg += `${paymentLine}\n\n`;
    msg += `Nome: ${name}\n`;
    if (phone) msg += `WhatsApp: ${phone}\n`;
    if (mode === 'delivery') {
      msg += `Endereço: ${street} — ${neighborhood}\n`;
      msg += `CEP: ${cep}\n`;
      if (reference) msg += `Referência: ${reference}\n`;
    }
    if (observations) msg += `Obs: ${observations}`;
    return msg.trim();
  };

  const handleSubmit = async () => {
    if (!validate()) {
      addToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    setSubmitting(true);

    // Save order to Supabase
    try {
      await supabase.from('orders').insert({
        mode,
        customer_name: name,
        customer_phone: phone || null,
        address_json: mode === 'delivery' ? { street, neighborhood, cep, city, reference } : null,
        payment_method: payment,
        change_amount: payment === 'cash' ? parseFloat(changeAmount.replace(',', '.')) : null,
        observations: observations || null,
        items_json: items,
        subtotal: cartTotal,
        delivery_fee: deliveryFee,
        total: grandTotal,
        table_number: mode === 'local' ? parseInt(tableNumber) : null,
      });
    } catch {
      // Continue even if save fails
    }

    // Open WhatsApp
    const whatsappNumber = settings?.whatsapp_number || '5511999999999';
    const message = encodeURIComponent(buildMessage());
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank');

    clear();
    setSubmitting(false);
    addToast('Pedido enviado com sucesso! 🎉');
    setTimeout(() => router.push('/'), 1500);
  };

  const inputClass = (field: string) =>
    `w-full bg-transparent border-0 border-b ${errors[field] ? 'border-red-400' : 'border-outline-variant/40'} focus:ring-0 focus:border-primary px-0 py-2 text-on-surface placeholder:text-outline text-sm transition-colors`;

  return (
    <>
      <ToastProvider />
      <div className="min-h-dvh bg-background pb-28">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 bg-white border-b border-outline-variant/15 shadow-sm">
          <div className="flex items-center justify-between px-5 py-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-primary font-medium cursor-pointer active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="text-sm">Voltar</span>
            </button>
            <h1 className="font-[family-name:var(--font-noto-serif)] italic font-bold text-lg text-primary">
              Checkout
            </h1>
            <div className="w-16" />
          </div>
        </header>

        <main className="px-4 py-5 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <span className="text-4xl">🍔</span>
          </div>

          {/* Delivery banner */}
          {mode === 'delivery' && settings && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary-container rounded-2xl p-4 flex items-center gap-3"
            >
              <span className="text-2xl">🛵</span>
              <div>
                <p className="font-bold text-sm text-on-secondary-container">Entrega rápida e de qualidade</p>
                <p className="text-xs text-on-secondary-container/70">
                  {settings.delivery_time} · Taxa fixa R$ {settings.delivery_fee.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </motion.div>
          )}

          {/* Section 1: Mode */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-noto-serif)] italic font-bold text-base text-on-surface-variant px-1">
              COMO DESEJA RECEBER?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(['local', 'delivery'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setErrors({}); }}
                  className={`relative rounded-2xl p-4 flex flex-col items-center text-center transition-all cursor-pointer active:scale-[0.97] ${
                    mode === m
                      ? 'bg-white border-2 border-primary shadow-md'
                      : 'bg-surface-container border border-outline-variant/20 opacity-60'
                  }`}
                >
                  <span className="text-3xl mb-2">{m === 'local' ? '🍽️' : '🛵'}</span>
                  <span className="font-bold text-sm">{m === 'local' ? 'Na mesa' : 'Delivery'}</span>
                  <span className="text-[10px] text-on-surface-variant">
                    {m === 'local' ? 'Consuma aqui' : 'Recebo em casa'}
                  </span>
                  {mode === m && (
                    <motion.div
                      layoutId="selected-badge"
                      className="absolute -top-2 right-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    >
                      Selecionado
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Section 2: Form fields */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-noto-serif)] italic font-bold text-base text-on-surface-variant px-1">
              DADOS
            </h2>
            <div className="bg-surface-container-low p-4 rounded-2xl space-y-4">
              <AnimatePresence mode="popLayout">
                {mode === 'local' && (
                  <motion.div key="mesa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                    <label className="text-[10px] font-bold text-primary tracking-widest uppercase">NÚMERO DA MESA</label>
                    <input type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className={inputClass('tableNumber')} placeholder="Ex: 5" />
                    <p className="text-[10px] text-on-surface-variant italic">Veja o número na sua mesa</p>
                    {errors.tableNumber && <p className="text-[10px] text-error font-medium">{errors.tableNumber}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-primary tracking-widest uppercase">SEU NOME</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass('name')} placeholder="Como quer ser chamado?" />
                {errors.name && <p className="text-[10px] text-error font-medium">{errors.name}</p>}
              </div>

              <AnimatePresence mode="popLayout">
                {mode === 'delivery' && (
                  <motion.div key="delivery" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary tracking-widest uppercase">SEU WHATSAPP</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className={inputClass('phone')} placeholder="(00) 00000-0000" />
                      {errors.phone && <p className="text-[10px] text-error font-medium">{errors.phone}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary tracking-widest uppercase">CEP</label>
                      <input type="text" value={cep} onChange={(e) => handleCepChange(e.target.value)} className={inputClass('cep')} placeholder="00000-000" />
                      {errors.cep && <p className="text-[10px] text-error font-medium">{errors.cep}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary tracking-widest uppercase">RUA E NÚMERO</label>
                      <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass('street')} placeholder="Rua das Flores, 123" />
                      {errors.street && <p className="text-[10px] text-error font-medium">{errors.street}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary tracking-widest uppercase">BAIRRO</label>
                      <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className={inputClass('neighborhood')} placeholder="Centro" />
                      {errors.neighborhood && <p className="text-[10px] text-error font-medium">{errors.neighborhood}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary tracking-widest uppercase">CIDADE</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass('city')} placeholder="São Paulo - SP" />
                      {errors.city && <p className="text-[10px] text-error font-medium">{errors.city}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-primary tracking-widest uppercase">PONTO DE REFERÊNCIA</label>
                      <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full bg-transparent border-0 border-b border-outline-variant/40 focus:ring-0 focus:border-primary px-0 py-2 text-on-surface placeholder:text-outline text-sm" placeholder="Próximo ao mercado..." />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Section 3: Payment */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-noto-serif)] italic font-bold text-base text-on-surface-variant px-1">
              FORMA DE PAGAMENTO
            </h2>
            <div className="space-y-2.5">
              {/* Pix */}
              <button
                onClick={() => setPayment('pix')}
                className={`w-full text-left rounded-xl p-4 transition-all cursor-pointer ${
                  payment === 'pix' ? 'bg-surface-container-high border border-primary/20' : 'bg-surface-container-low border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <span className="font-semibold">Pix</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === 'pix' ? 'border-primary' : 'border-outline'}`}>
                    {payment === 'pix' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>
                {payment === 'pix' && settings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-outline-variant/20"
                  >
                    <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-green-600 font-bold uppercase">Chave Pix</p>
                        <p className="text-sm font-mono font-bold text-green-800">{settings.pix_key}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(settings.pix_key || '');
                          addToast('Chave copiada!', 'info');
                        }}
                        className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                      >
                        <span className="material-symbols-outlined text-green-700 text-[18px]">content_copy</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </button>

              {/* Card */}
              <button
                onClick={() => setPayment('card')}
                className={`w-full text-left rounded-xl p-4 transition-all cursor-pointer ${
                  payment === 'card' ? 'bg-surface-container-high border border-primary/20' : 'bg-surface-container-low border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <span className="font-semibold">Cartão na entrega</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === 'card' ? 'border-primary' : 'border-outline'}`}>
                    {payment === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>
                {payment === 'card' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-xs text-on-surface-variant"
                  >
                    Aceitamos débito e crédito
                  </motion.p>
                )}
              </button>

              {/* Cash */}
              <button
                onClick={() => setPayment('cash')}
                className={`w-full text-left rounded-xl p-4 transition-all cursor-pointer ${
                  payment === 'cash' ? 'bg-surface-container-high border border-primary/20' : 'bg-surface-container-low border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💵</span>
                    <span className="font-semibold">Dinheiro</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === 'cash' ? 'border-primary' : 'border-outline'}`}>
                    {payment === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                </div>
                {payment === 'cash' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-outline-variant/20"
                  >
                    <label className="text-[10px] font-bold text-primary tracking-widest uppercase block mb-2">
                      TROCO PARA QUANTO?
                    </label>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">R$</span>
                      <input
                        type="text"
                        value={changeAmount}
                        onChange={(e) => setChangeAmount(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full bg-transparent border-0 border-b ${errors.changeAmount ? 'border-red-400' : 'border-outline-variant/40'} focus:ring-0 focus:border-primary pl-7 py-1 text-on-surface text-sm`}
                        placeholder="0,00"
                      />
                    </div>
                    {errors.changeAmount && <p className="text-[10px] text-error font-medium mt-1">{errors.changeAmount}</p>}
                  </motion.div>
                )}
              </button>
            </div>
          </section>

          {/* Observations */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-noto-serif)] italic font-bold text-base text-on-surface-variant px-1">
              OBSERVAÇÕES
            </h2>
            <div className="bg-surface-container-low p-4 rounded-2xl">
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full bg-transparent border-0 focus:ring-0 text-on-surface placeholder:text-outline italic text-sm resize-none"
                placeholder="Sem cebola, ponto da carne, sem glúten..."
                rows={3}
              />
            </div>
          </section>

          {/* Order Summary */}
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-noto-serif)] italic font-bold text-base text-on-surface-variant px-1">
              RESUMO DO PEDIDO
            </h2>
            <div className="bg-surface-container-low rounded-2xl p-5 space-y-3">
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between items-start">
                    <span className="text-sm font-medium">
                      <span className="text-primary font-bold">{item.quantity}x</span> {item.name}
                    </span>
                    <span className="text-sm font-semibold">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </li>
                ))}
              </ul>
              {mode === 'delivery' && (
                <div className="flex justify-between items-center text-sm text-on-surface-variant pt-2 border-t border-outline-variant/15">
                  <span>Taxa de entrega</span>
                  <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-primary/10 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-[family-name:var(--font-noto-serif)] italic font-extrabold text-2xl text-primary tracking-tight">
                  R$ {grandTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </section>
        </main>

        {/* WhatsApp Button */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-4 glass z-50">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-whatsapp hover:brightness-105 active:brightness-95 transition-all py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-white font-bold text-base shadow-lg shadow-green-200/50 cursor-pointer disabled:opacity-70"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            {submitting ? 'Enviando...' : 'Enviar pedido no WhatsApp'}
          </motion.button>
        </div>
      </div>
    </>
  );
}
