'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Product } from '@/lib/supabase';
import { useCartStore } from '@/stores/cart-store';
import { useToastStore } from '@/components/Toast';
import Link from 'next/link';
import CartDrawer from '@/components/CartDrawer';

const CATEGORIES = ['Todos', 'Lanches', 'Bebidas', 'Sobremesas', 'Combos'];

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [category, setCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.count());
  const cartTotal = useCartStore((s) => s.total());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    async function load() {
      const { data: allProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (allProducts) {
        setProducts(allProducts);
        setFeatured(allProducts.filter((p: Product) => p.is_featured));
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredProducts =
    category === 'Todos'
      ? products
      : products.filter((p) => p.category === category);

  const handleAdd = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      emoji: p.emoji,
      image_url: p.image_url,
    });
    addToast('Adicionado ao carrinho ✓');
  };

  return (
    <>
      {/* Em Destaque */}
      <section className="space-y-3">
        <div className="flex justify-between items-end px-4">
          <h3 className="text-lg font-[family-name:var(--font-noto-serif)] italic font-bold text-on-surface">
            Em destaque
          </h3>
          <span className="text-primary text-[11px] font-bold uppercase tracking-widest cursor-pointer">
            Ver tudo
          </span>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-3 px-4 pb-2 snap-x snap-mandatory">
          {loading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="min-w-[140px] h-[180px] rounded-2xl shimmer shrink-0" />
              ))
            : featured.map((p) => (
                <Link href={`/produto/${p.slug}`} key={p.id}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="min-w-[140px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow snap-start cursor-pointer border border-outline-variant/10"
                  >
                    <div className="h-24 bg-surface-container-low flex items-center justify-center text-4xl">
                      {p.emoji}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-on-surface leading-tight h-8 overflow-hidden line-clamp-2">
                        {p.name}
                      </p>
                      <p className="text-primary font-extrabold text-sm mt-1">
                        R$ {p.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
        </div>
      </section>

      {/* Category Pills */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              cat === category
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                : 'bg-white border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <section className="grid grid-cols-2 gap-3 px-4 pb-28">
        <AnimatePresence mode="popLayout">
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[220px] rounded-2xl shimmer" />
              ))
            : filteredProducts.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <Link href={`/produto/${p.slug}`}>
                    <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant/15 group hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="h-[130px] bg-surface-container-low flex items-center justify-center relative">
                        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                          {p.emoji}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => handleAdd(p, e)}
                          className="absolute bottom-2 right-2 bg-primary text-white w-8 h-8 rounded-lg shadow-lg flex items-center justify-center cursor-pointer hover:bg-primary-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </motion.button>
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-bold text-on-surface leading-tight line-clamp-1">
                          {p.name}
                        </h4>
                        <p className="text-primary font-extrabold text-base mt-0.5">
                          R$ {p.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </AnimatePresence>
      </section>

      {/* Sticky Bottom Cart Bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-40"
          >
            <div className="glass-dark py-4 px-5 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] border-t border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex flex-col text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    {cartCount} {cartCount === 1 ? 'item' : 'itens'}
                  </span>
                  <span className="text-xl font-[family-name:var(--font-noto-serif)] italic font-bold">
                    R$ {cartTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <button
                  onClick={openDrawer}
                  className="bg-white text-primary px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-surface transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  Ver carrinho
                  <span className="material-symbols-outlined text-[18px]">shopping_basket</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
