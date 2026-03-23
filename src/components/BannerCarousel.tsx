'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banner, supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BannerCarousel() {
  const [banners, setBanners] = useState<(Banner & { product_slug?: string })[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('banners')
        .select('*, products!banners_product_id_fkey(slug)')
        .eq('active', true)
        .order('sort_order');
      if (data) {
        const mapped = data.map((b: Record<string, unknown>) => ({
          ...b,
          product_slug: (b.products as { slug: string } | null)?.slug,
        })) as (Banner & { product_slug?: string })[];
        setBanners(mapped);
      }
    }
    load();
  }, []);

  const next = useCallback(() => {
    if (banners.length > 0) {
      setCurrent((c) => (c + 1) % banners.length);
    }
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(next, 3500);
    return () => clearInterval(interval);
  }, [banners.length, next]);

  if (banners.length === 0) {
    return <div className="mx-4 h-[160px] rounded-2xl shimmer" />;
  }

  const banner = banners[current];

  return (
    <div className="px-4">
      <Link href={banner.product_slug ? `/produto/${banner.product_slug}` : '/'}>
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-2xl p-5 flex items-center justify-between cursor-pointer"
          style={{ backgroundColor: banner.bg_color }}
        >
          <div className="z-10 flex flex-col items-start gap-2 flex-1">
            <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
              {banner.label}
            </span>
            <h2 className="text-xl font-[family-name:var(--font-noto-serif)] italic font-bold text-on-surface leading-tight">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="text-xs text-on-surface-variant leading-snug">{banner.subtitle}</p>
            )}
            <span className="text-primary font-bold text-sm flex items-center gap-1 mt-1">
              Aproveitar
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
          <div className="text-6xl drop-shadow-lg ml-2 shrink-0">
            {banner.emoji}
          </div>
        </motion.div>
      </Link>

      {/* Dot pagination */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-outline-variant/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
