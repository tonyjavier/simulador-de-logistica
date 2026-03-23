'use client';

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchStore } from '@/stores/search-store';
import { useCartStore } from '@/stores/cart-store';
import { useToastStore } from '@/components/Toast';
import { supabase, Product } from '@/lib/supabase';
import Link from 'next/link';

export default function SearchOverlay() {
  const {
    isOpen, close, query, setQuery, results, setResults,
    popular, setPopular, isLoading, setLoading,
  } = useSearchStore();
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    async function fetchPopular() {
      const { data } = await supabase.rpc('get_popular_searches');
      if (data) setPopular(data);
    }
    if (isOpen && popular.length === 0) fetchPopular();
  }, [isOpen, popular.length, setPopular]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    await supabase.rpc('increment_search', { search_query: q });
    const { data } = await supabase.rpc('search_products', { search_query: q });
    if (data) setResults(data);
    else {
      const { data: fallback } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${q}%`)
        .eq('is_active', true)
        .limit(10);
      if (fallback) setResults(fallback);
    }
    setLoading(false);
  }, [setResults, setLoading]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleChipClick = (term: string) => {
    setQuery(term);
    search(term);
  };

  const handleAddToCart = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: p.id, slug: p.slug, name: p.name, price: p.price, emoji: p.emoji, image_url: p.image_url });
    addToast('Adicionado ao carrinho ✓');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] bg-white flex flex-col max-w-[390px] mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/20">
            <button
              onClick={close}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container active:scale-90 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Buscar no cardápio..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary/20 placeholder:text-outline transition-all"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setResults([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-outline text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {!query && popular.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  Mais pesquisados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popular.map((p) => (
                    <button
                      key={p.query}
                      onClick={() => handleChipClick(p.query)}
                      className="px-4 py-2 bg-surface-container-low rounded-full text-xs font-semibold text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
                    >
                      {p.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-2xl shimmer" />
                ))}
              </div>
            )}

            {!isLoading && query.length >= 2 && results.length === 0 && (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">🔍</span>
                <p className="text-on-surface-variant text-sm">
                  Nenhum resultado para &quot;{query}&quot;
                </p>
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="space-y-3">
                {results.map((p) => (
                  <Link href={`/produto/${p.slug}`} key={p.id} onClick={close}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-2xl shrink-0">
                        {p.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{p.name}</h4>
                        <p className="text-primary font-bold text-sm">
                          R$ {p.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        className="w-9 h-9 bg-primary text-on-primary rounded-xl flex items-center justify-center active:scale-90 transition-transform shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
