import TopBar from '@/components/TopBar';
import SearchOverlay from '@/components/SearchOverlay';
import BannerCarousel from '@/components/BannerCarousel';
import ProductSection from '@/components/ProductSection';
import { ToastProvider } from '@/components/Toast';

export default function HomePage() {
  return (
    <>
      <ToastProvider />
      <SearchOverlay />
      <TopBar />
      <main className="space-y-6 pt-4 pb-8">
        <BannerCarousel />
        <ProductSection />
      </main>
    </>
  );
}
