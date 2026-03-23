import { createClient } from '@supabase/supabase-js';
import ProductPageClient from '@/components/ProductPageClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateStaticParams() {
  const { data } = await supabase
    .from('products')
    .select('slug')
    .eq('is_active', true);

  return (data || []).map((p: { slug: string }) => ({
    slug: p.slug,
  }));
}

export default function ProductPage() {
  return <ProductPageClient />;
}
