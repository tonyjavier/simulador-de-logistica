import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  emoji: string;
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  rating_count: number;
  combina_com: string[];
  tags: string[];
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  label: string;
  product_id: string | null;
  image_url: string | null;
  emoji: string;
  bg_color: string;
  active: boolean;
  sort_order: number;
}

export interface Settings {
  id: string;
  restaurant_name: string;
  logo_url: string | null;
  whatsapp_number: string;
  delivery_fee: number;
  delivery_time: string;
  pix_key: string;
  is_open: boolean;
}

export interface Order {
  id?: string;
  mode: 'local' | 'delivery';
  status?: string;
  customer_name: string;
  customer_phone?: string;
  address_json?: Record<string, string>;
  payment_method: 'pix' | 'card' | 'cash';
  change_amount?: number;
  observations?: string;
  items_json: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  table_number?: number;
}

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  emoji: string;
  image_url: string | null;
  quantity: number;
}

export interface SearchLog {
  query: string;
  count: number;
}
