import TopBar from '@/components/TopBar';
import SearchOverlay from '@/components/SearchOverlay';
import BannerCarousel from '@/components/BannerCarousel';
import ProductSection from '@/components/ProductSection';
import { ToastProvider } from '@/components/Toast';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <ToastProvider />
      <SearchOverlay />
      <TopBar />
      <main className="space-y-6 pt-4 pb-8 flex-1">
        <BannerCarousel />
        <ProductSection />
      </main>
      <Footer />
    </div>
  );
}
