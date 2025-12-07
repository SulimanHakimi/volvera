import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AuthProvider from "@/components/providers/AuthProvider";
import Header from "@/components/layout/Header";
import ScrollToTop from "./ScrollToTop";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "VOLVERA - Keep 99.5% of Your Earnings",
  description: "Join thousands of creators who trust VOLVERA for growth, support, and maximum earnings retention. Partner with us and keep 99.5% of your revenue.",
  keywords: "volvera, Volvera, youtube partnership, content creator, earnings, monetization",
  authors: [{ name: "VOLVERA" }],
  openGraph: {
    title: "VOLVERA - Keep 99.5% of Your Earnings",
    description: "Join thousands of creators who trust VOLVERA for growth, support, and maximum earnings retention.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            <Suspense fallback={null}>
              <ScrollToTop />
            </Suspense>
            <Header />
            <main className="">
              {children}
            </main>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
