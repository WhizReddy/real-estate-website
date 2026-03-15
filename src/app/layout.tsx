import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { initializeErrorHandler } from "@/lib/errorHandler";
import "./globals.css";

// Fix for hydration issues in Dev mode
if (typeof window !== 'undefined') {
  initializeErrorHandler();
}

export const metadata: Metadata = {
  title: "Pasuritë e Tiranës - Gjeni shtëpinë tuaj të ëndrrave",
  description: "Platforma më e mirë për pasuritë e patundshme në Tiranë.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.svg?v=20260315", type: "image/svg+xml" }],
    shortcut: [{ url: "/favicon.svg?v=20260315", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-192x192.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <body className="font-sans antialiased bg-white text-slate-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
