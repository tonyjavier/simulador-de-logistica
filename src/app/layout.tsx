import type { Metadata, Viewport } from "next";
import { Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "O Zé Boteco | Cardápio Digital",
  description: "O melhor boteco da cidade! Peça seus lanches, bebidas e sobremesas favoritas pelo cardápio digital.",
  keywords: ["cardápio digital", "restaurante", "boteco", "lanches", "delivery"],
  openGraph: {
    title: "O Zé Boteco | Cardápio Digital",
    description: "Peça pelo cardápio digital do Zé Boteco!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#dc2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${notoSerif.variable} ${plusJakarta.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh max-w-[390px] mx-auto overflow-x-hidden bg-background text-on-surface">
        {children}
      </body>
    </html>
  );
}
