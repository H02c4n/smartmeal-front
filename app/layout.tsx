import type { Metadata } from "next";
import "./globals.css";  // ← BU SATIR ŞART

export const metadata: Metadata = {
  title: "SmartMeal",
  description: "Yemek sipariş yönetim sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}