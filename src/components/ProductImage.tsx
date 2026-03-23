'use client';

interface ProductImageProps {
  slug: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
}

const sizeClasses = {
  sm: 'w-full h-full',
  md: 'w-full h-full',
  lg: 'w-full h-full',
  xl: 'w-full h-full',
  hero: 'w-full h-full',
};

export default function ProductImage({ slug, name, size = 'md', className = '' }: ProductImageProps) {
  return (
    <img
      src={`/products/${slug}.webp`}
      alt={name}
      loading="lazy"
      className={`object-cover ${sizeClasses[size]} ${className}`}
      onError={(e) => {
        // fallback to a styled div if image fails
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        if (target.parentElement) {
          target.parentElement.innerHTML = `<span class="text-4xl flex items-center justify-center w-full h-full">🍽️</span>`;
        }
      }}
    />
  );
}
