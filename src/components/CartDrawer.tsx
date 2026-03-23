'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cart-store';
import { supabase, Product } from '@/lib/supabase';
import ProductImage from '@/components/ProductImage';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/components/Toast';

export default function CartDrawer() {
  const {
    items, isDrawerOpen, closeDrawer,
    updateQty, removeItem, total, count,
  } = useCartStore();
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadSuggestions() {
      if (items.length === 0) return;
      if (suggestions.length > 0) return; // don't refetch if already have them
      const ids = items.map((i) => i.id);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .not('id', 'in', `(${ids.join(',')})`)
        .limit(6);
      if (data && mounted) setSuggestions(data);
    }
    if (isDrawerOpen) loadSuggestions();
    return () => { mounted = false; };
  }, [isDrawerOpen, items, suggestions.length]);

  const cartTotal = total();
  const cartCount = count();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] cursor-pointer"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-[70] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col"
            style={{ height: '90dvh' }}
          >
            {/* Header */}
            <div className="relative flex flex-col items-center pt-3 pb-4 border-b border-outline-variant/20 shrink-0">
              <div className="w-10 h-1 bg-outline-variant/30 rounded-full mb-3" />
              <h2 className="font-[family-name:var(--font-noto-serif)] italic font-bold text-lg">
                Seu carrinho
              </h2>
              <button
                onClick={closeDrawer}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {cartCount === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[64px] text-outline-variant/40 mb-4 block">shopping_cart</span>
                  <p className="text-on-surface-variant font-medium">Seu carrinho está vazio</p>
                  <button
                    onClick={closeDrawer}
                    className="mt-4 text-primary font-bold text-sm cursor-pointer"
                  >
                    Explorar cardápio →
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                      ITENS SELECIONADOS
                    </h3>
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <motion.article
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.25 }}
                          className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm flex items-center gap-3 border border-outline-variant/10"
                        >
                          <div className="w-14 h-14 bg-surface-container rounded-xl overflow-hidden shrink-0">
                            <ProductImage slug={item.slug} name={item.name} size="sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-on-surface text-sm truncate">{item.name}</h4>
                            <p className="text-primary font-semibold text-sm">
                              R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                          <div className="flex items-center bg-surface-container rounded-full px-1.5 py-1 gap-2 shrink-0">
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-on-surface-variant active:scale-90 transition-transform cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {item.quantity === 1 ? 'delete' : 'remove'}
                              </span>
                            </button>
                            <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-on-primary active:scale-90 transition-transform cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          </div>
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Order Bump */}
                  {suggestions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                        Adicione também
                      </h3>
                      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-1 snap-x snap-mandatory -mx-1 px-1">
                        {suggestions.slice(0, 4).map((p) => (
                          <div
                            key={p.id}
                            className="min-w-[110px] bg-surface-container-low rounded-xl overflow-hidden flex flex-col items-center text-center snap-start border border-outline-variant/10"
                          >
                            <div className="w-full h-16 overflow-hidden">
                              <ProductImage slug={p.slug} name={p.name} size="sm" />
                            </div>
                            <div className="p-2">
                              <p className="text-[11px] font-bold line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-primary font-bold mt-0.5">
                                R$ {p.price.toFixed(2).replace('.', ',')}
                              </p>
                              <button
                                onClick={() => {
                                  addItem({
                                    id: p.id, slug: p.slug, name: p.name,
                                    price: p.price, emoji: p.emoji, image_url: p.image_url,
                                  });
                                  addToast('Adicionado ao carrinho ✓');
                                }}
                                className="mt-1.5 w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center active:scale-90 transition-transform cursor-pointer mx-auto"
                              >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-surface-container-low p-4 rounded-2xl space-y-3">
                    <h3 className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                      RESUMO
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Subtotal</span>
                        <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Taxa de entrega</span>
                        <span className="text-teal-600 font-bold text-[10px] bg-teal-50 px-2 py-0.5 rounded-full uppercase">
                          Grátis
                        </span>
                      </div>
                      <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-[family-name:var(--font-noto-serif)] italic font-bold text-xl text-primary">
                          R$ {cartTotal.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer buttons */}
            {cartCount > 0 && (
              <div className="shrink-0 px-4 pb-6 pt-3 space-y-2.5 border-t border-outline-variant/10">
                <button
                  onClick={() => {
                    closeDrawer();
                    router.push('/checkout/');
                  }}
                  className="w-full h-14 bg-primary text-on-primary font-bold rounded-full shadow-lg shadow-primary/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Finalizar pedido
                </button>
                <button
                  onClick={closeDrawer}
                  className="w-full h-12 bg-surface-container text-primary font-bold rounded-full active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
                  Continuar comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
