'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase, Product } from '@/lib/supabase';
import { useCartStore } from '@/stores/cart-store';
import { useToastStore, ToastProvider } from '@/components/Toast';
import ProductImage from '@/components/ProductImage';
import Link from 'next/link';

export default function ProductPageClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.count());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      if (data) {
        setProduct(data);
        if (data.combina_com && data.combina_com.length > 0) {
          const { data: rel } = await supabase
            .from('products')
            .select('*')
            .in('id', data.combina_com)
            .eq('is_active', true);
          if (rel) setRelated(rel);
        } else {
          const { data: rel } = await supabase
            .from('products')
            .select('*')
            .eq('category', data.category)
            .neq('id', data.id)
            .eq('is_active', true)
            .limit(3);
          if (rel) setRelated(rel);
        }
      }
      setLoading(false);
    }
    load();
    setQty(1);
  }, [slug]);

  const handleAdd = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id, slug: product.slug, name: product.name,
        price: product.price, emoji: product.emoji, image_url: product.image_url,
      });
    }
    addToast('Adicionado ao carrinho ✓');
  };

  const stars = product ? Math.round(product.rating) : 0;

  if (loading) {
    return (
      <div className="min-h-dvh bg-white flex flex-col">
        <div className="h-16 shimmer" />
        <div className="h-[280px] shimmer" />
        <div className="p-4 space-y-4">
          <div className="h-8 w-48 rounded-lg shimmer" />
          <div className="h-6 w-24 rounded-lg shimmer" />
          <div className="h-24 rounded-2xl shimmer" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-dvh bg-white flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-[64px] text-outline-variant">search_off</span>
        <p className="font-bold text-lg">Produto não encontrado</p>
        <button onClick={() => router.push('/')} className="text-primary font-bold cursor-pointer">
          ← Voltar ao cardápio
        </button>
      </div>
    );
  }

  return (
    <>
      <ToastProvider />
      <div className="min-h-dvh bg-white flex flex-col pb-24">
        <header className="sticky top-0 z-50 bg-primary-container flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-white active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <h1 className="text-white font-bold text-sm truncate max-w-[200px]">{product.name}</h1>
          <button
            onClick={openDrawer}
            className="relative w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-white">shopping_basket</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-secondary-container text-on-secondary-container text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </header>

        {/* Hero Image — REAL IMAGE */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-[280px] bg-surface-container relative overflow-hidden"
        >
          <ProductImage slug={product.slug} name={product.name} size="hero" className="object-cover" />
          <div className="absolute bottom-4 left-4">
            <span className="bg-secondary-container text-on-secondary-container text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
              {product.category} · Popular
            </span>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 pt-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-[family-name:var(--font-noto-serif)] italic font-bold text-[22px] leading-tight flex-1">
              {product.name}
            </h2>
            <p className="text-primary font-extrabold text-xl whitespace-nowrap">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: s <= stars ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              ))}
            </div>
            <span className="font-bold text-sm">{product.rating}</span>
            <span className="text-on-surface-variant text-[12px]">({product.rating_count} avaliações)</span>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-4">
            <p className="text-sm text-on-surface-variant leading-relaxed">{product.description}</p>
          </div>
        </motion.section>

        <section className="px-4 py-4 space-y-3">
          <h3 className="font-bold text-sm">Avaliações</h3>
          <div className="space-y-2">
            <div className="bg-surface-container rounded-xl p-3 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[13px]">Ana P.</span>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
              </div>
              <p className="text-[12px] text-on-surface-variant">Melhor da região! Super recomendo.</p>
            </div>
            <div className="bg-surface-container rounded-xl p-3 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[13px]">Carlos M.</span>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4].map((s) => (
                    <span key={s} className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                  <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
                </div>
              </div>
              <p className="text-[12px] text-on-surface-variant">Muito bom, no ponto certo.</p>
            </div>
          </div>
        </section>

        {/* Combina com — with real images */}
        {related.length > 0 && (
          <section className="px-4 pb-6">
            <h3 className="font-bold text-sm mb-3">Combina com</h3>
            <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 snap-x snap-mandatory">
              {related.map((p) => (
                <Link href={`/produto/${p.slug}/`} key={p.id}>
                  <div className="min-w-[120px] bg-white rounded-xl border border-outline-variant/15 overflow-hidden flex flex-col items-center text-center snap-start hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-full h-20 overflow-hidden">
                      <ProductImage slug={p.slug} name={p.name} size="sm" />
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-bold line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-primary font-bold mt-0.5">
                        R$ {p.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-outline-variant/15 px-4 py-4 flex items-center gap-3 z-50">
        <div className="bg-surface-container-low h-12 px-2 rounded-full flex items-center justify-between w-28 shrink-0">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-on-surface-variant active:scale-90 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <span className="font-bold text-base">{qty}</span>
          <button
            onClick={() => setQty(qty + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white active:scale-90 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          className="flex-1 bg-primary text-white h-12 rounded-full font-bold text-[15px] flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer"
        >
          Adicionar · R$ {(product.price * qty).toFixed(2).replace('.', ',')}
        </motion.button>
      </div>
    </>
  );
}
