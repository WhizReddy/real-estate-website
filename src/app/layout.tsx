import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import ResourcePreloader from "@/components/ResourcePreloader";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pasuritë e Tiranës - Gjeni shtëpinë tuaj të ëndrrave",
    template: "%s | Pasuritë e Tiranës"
  },
  description: "Platforma më e mirë për blerjen dhe qiranë e pasurive të patundshme në Tiranë dhe Shqipëri. Gjeni shtëpi, apartamente dhe pasuri komerciale me çmime konkurruese.",
  keywords: [
    "pasuri të patundshme",
    "shtëpi për shitje",
    "apartamente me qira",
    "Tiranë",
    "Shqipëri",
    "real estate",
    "property",
    "agjent pasurie",
    "blerje shtëpi",
    "qira apartament"
  ],
  authors: [{ name: "Pasuritë e Tiranës" }],
  creator: "Pasuritë e Tiranës",
  publisher: "Pasuritë e Tiranës",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pasurite-tiranes.al'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'sq_AL',
    url: 'https://pasurite-tiranes.al',
    title: 'Pasuritë e Tiranës - Gjeni shtëpinë tuaj të ëndrrave',
    description: 'Platforma më e mirë për blerjen dhe qiranë e pasurive të patundshme në Tiranë dhe Shqipëri.',
    siteName: 'Pasuritë e Tiranës',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pasuritë e Tiranës - Gjeni shtëpinë tuaj të ëndrrave',
    description: 'Platforma më e mirë për blerjen dhe qiranë e pasurive të patundshme në Tiranë dhe Shqipëri.',
    creator: '@pasurite_tiranes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#dc2626" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pasuritë e Tiranës" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ToastProvider>
          <PerformanceMonitor />
          <ResourcePreloader />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
