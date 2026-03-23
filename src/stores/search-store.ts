'use client';

import { create } from 'zustand';
import { Product, SearchLog } from '@/lib/supabase';

interface SearchStore {
  query: string;
  results: Product[];
  popular: SearchLog[];
  isOpen: boolean;
  isLoading: boolean;
  setQuery: (q: string) => void;
  setResults: (r: Product[]) => void;
  setPopular: (p: SearchLog[]) => void;
  open: () => void;
  close: () => void;
  setLoading: (l: boolean) => void;
}

export const useSearchStore = create<SearchStore>()((set) => ({
  query: '',
  results: [],
  popular: [],
  isOpen: false,
  isLoading: false,
  setQuery: (q) => set({ query: q }),
  setResults: (r) => set({ results: r }),
  setPopular: (p) => set({ popular: p }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, query: '', results: [] }),
  setLoading: (l) => set({ isLoading: l }),
}));
