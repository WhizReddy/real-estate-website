'use client';

import Head from 'next/head';
import { Property } from '@/types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  property?: Property;
  noIndex?: boolean;
  canonical?: string;
}

export default function SEOHead({
  title = "Pasuritë e Tiranës - Gjeni shtëpinë tuaj të ëndrrave",
  description = "Platforma më e mirë për blerjen dhe qiranë e pasurive të patundshme në Tiranë dhe Shqipëri. Gjeni shtëpi, apartamente dhe pasuri komerciale me çmime konkurruese.",
  keywords = [
    "pasuri të patundshme",
    "shtëpi për shitje",
    "apartamente me qira",
    "Tiranë",
    "Shqipëri",
    "real estate",
    "property",
    "agjent pasurie"
  ],
  image = "/og-image.jpg",
  url = "https://pasurite-tiranes.al",
  type = "website",
  property,
  noIndex = false,
  canonical,
}: SEOHeadProps) {
  // Generate property-specific SEO data
  if (property) {
    title = `${property.title} - ${property.address.city} | Pasuritë e Tiranës`;
    description = `${property.description.substring(0, 150)}... Çmimi: €${property.price.toLocaleString()}. ${property.details.bedrooms} dhoma, ${property.details.bathrooms} banjo, ${property.details.squareFootage}m².`;
    keywords = [
      ...keywords,
      property.details.propertyType,
      property.address.city,
      property.address.state,
      `${property.details.bedrooms} dhoma`,
      property.listingType === 'sale' ? 'për shitje' : 'me qira',
      ...property.features.slice(0, 5)
    ];
    image = property.images[0] || image;
    url = `${url}/properties/${property.id}`;
    type = 'product';
  }

  const siteName = "Pasuritë e Tiranës";
  const twitterHandle = "@pasurite_tiranes";

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={siteName} />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <meta name="language" content="sq" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || url} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="sq_AL" />
      
      {/* Property-specific Open Graph */}
      {property && (
        <>
          <meta property="product:price:amount" content={property.price.toString()} />
          <meta property="product:price:currency" content="EUR" />
          <meta property="product:availability" content={property.status === 'active' ? 'in stock' : 'out of stock'} />
          <meta property="product:condition" content="new" />
          <meta property="product:category" content={property.details.propertyType} />
        </>
      )}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="application-name" content={siteName} />
      
      {/* Geo Tags for Local SEO */}
      <meta name="geo.region" content="AL-TR" />
      <meta name="geo.placename" content="Tiranë" />
      <meta name="geo.position" content="41.3275;19.8187" />
      <meta name="ICBM" content="41.3275, 19.8187" />
      
      {/* Property-specific Geo Tags */}
      {property && (
        <>
          <meta name="geo.position" content={`${property.address.coordinates.lat};${property.address.coordinates.lng}`} />
          <meta name="ICBM" content={`${property.address.coordinates.lat}, ${property.address.coordinates.lng}`} />
          <meta name="geo.placename" content={property.address.city} />
        </>
      )}
      
      {/* Preload critical resources */}
      <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//tile.openstreetmap.org" />
      
      {/* Alternate Languages */}
      <link rel="alternate" hrefLang="sq" href={url} />
      <link rel="alternate" hrefLang="en" href={`${url}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={url} />
    </Head>
  );
}

// Utility function to generate SEO-friendly URLs
export function generateSEOUrl(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  return `/properties/${id}/${slug}`;
}

// Utility function to generate meta description for properties
export function generatePropertyMetaDescription(property: Property): string {
  const { title, price, details, address, description } = property;
  const priceStr = `€${price.toLocaleString()}`;
  const roomsStr = details.bedrooms > 0 ? `${details.bedrooms} dhoma, ` : '';
  const bathsStr = `${details.bathrooms} banjo`;
  const areaStr = `${details.squareFootage}m²`;
  const locationStr = `${address.city}, ${address.state}`;
  
  const shortDesc = description.length > 100 
    ? `${description.substring(0, 100)}...` 
    : description;
  
  return `${title} në ${locationStr}. ${priceStr}. ${roomsStr}${bathsStr}, ${areaStr}. ${shortDesc}`;
}

// Utility function to generate keywords for properties
export function generatePropertyKeywords(property: Property): string[] {
  const baseKeywords = [
    "pasuri të patundshme",
    "real estate",
    property.details.propertyType,
    property.address.city,
    property.address.state,
    "Shqipëri",
    "Albania"
  ];
  
  const typeKeywords = property.listingType === 'sale' 
    ? ["për shitje", "blerje", "for sale"] 
    : ["me qira", "qira", "for rent"];
  
  const roomKeywords = property.details.bedrooms > 0 
    ? [`${property.details.bedrooms} dhoma`, `${property.details.bedrooms} bedroom`]
    : [];
  
  const featureKeywords = property.features.slice(0, 5);
  
  return [
    ...baseKeywords,
    ...typeKeywords,
    ...roomKeywords,
    ...featureKeywords
  ].filter(Boolean);
}