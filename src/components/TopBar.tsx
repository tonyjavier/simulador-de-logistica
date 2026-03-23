'use client';

import { useCartStore } from '@/stores/cart-store';
import { useSearchStore } from '@/stores/search-store';
import { motion } from 'framer-motion';

export default function TopBar() {
  const count = useCartStore((s) => s.count());
  const openSearch = useSearchStore((s) => s.open);
  const openDrawer = useCartStore((s) => s.openDrawer);

  return (
    <header className="sticky top-0 z-50 glass-dark">
      <div className="flex items-center justify-between px-5 h-16">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo O Zé Boteco" className="w-[42px] h-[42px] object-contain rounded-full shadow-sm" />
          <div className="flex flex-col">
            <h1 className="text-lg font-[family-name:var(--font-noto-serif)] italic font-bold text-white tracking-tight leading-tight">
              O Zé Boteco
            </h1>
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest leading-none">
              Aberto agora · 10h–22h
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={openSearch}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-white">search</span>
          </button>
          <button
            onClick={openDrawer}
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-white">shopping_basket</span>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary-container"
              >
                {count}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
