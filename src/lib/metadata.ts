import { Metadata } from 'next';
import { Property } from '@/types';

const baseUrl = 'https://pasurite-tiranes.al';
const siteName = 'Pasuritë e Tiranës';
const defaultDescription = 'Platforma më e mirë për blerjen dhe qiranë e pasurive të patundshme në Tiranë dhe Shqipëri. Gjeni shtëpi, apartamente dhe pasuri komerciale me çmime konkurruese.';

// Generate metadata for homepage
export function generateHomeMetadata(): Metadata {
  return {
    title: {
      default: `${siteName} - Gjeni shtëpinë tuaj të ëndrrave`,
      template: `%s | ${siteName}`
    },
    description: defaultDescription,
    keywords: [
      'pasuri të patundshme',
      'shtëpi për shitje',
      'apartamente me qira',
      'Tiranë',
      'Shqipëri',
      'real estate',
      'property',
      'agjent pasurie',
      'blerje shtëpi',
      'qira apartament'
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/',
      languages: {
        'sq': '/',
        'en': '/?lang=en',
      },
    },
    openGraph: {
      type: 'website',
      locale: 'sq_AL',
      url: baseUrl,
      title: `${siteName} - Gjeni shtëpinë tuaj të ëndrrave`,
      description: defaultDescription,
      siteName,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${siteName} - Premium Properties in Tirana`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName} - Gjeni shtëpinë tuaj të ëndrrave`,
      description: defaultDescription,
      creator: '@pasurite_tiranes',
      images: ['/og-image.jpg'],
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
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  };
}

// Generate metadata for property pages
export function generatePropertyMetadata(property: Property): Metadata {
  const title = `${property.title} - ${property.address.city} | ${siteName}`;
  const description = generatePropertyDescription(property);
  const keywords = generatePropertyKeywords(property);
  const url = `${baseUrl}/properties/${property.id}`;
  const image = property.images[0] || '/og-image.jpg';

  return {
    title,
    description,
    keywords,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'sq_AL',
      url,
      title,
      description,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: property.title,
        },
        ...property.images.slice(1, 4).map(img => ({
          url: img,
          width: 800,
          height: 600,
          alt: property.title,
        })),
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@pasurite_tiranes',
      images: [image],
    },
    robots: {
      index: property.status === 'active',
      follow: true,
      googleBot: {
        index: property.status === 'active',
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'product:price:amount': property.price.toString(),
      'product:price:currency': 'EUR',
      'product:availability': property.status === 'active' ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:category': property.details.propertyType,
    },
  };
}

// Generate metadata for map page
export function generateMapMetadata(): Metadata {
  const title = `Harta e Pasurive - ${siteName}`;
  const description = 'Shikoni të gjitha pasuritë e disponueshme në hartë. Kërkoni dhe filtroni pasuritë sipas lokacionit, çmimit dhe karakteristikave të tjera.';
  const url = `${baseUrl}/map`;

  return {
    title,
    description,
    keywords: [
      'harta e pasurive',
      'property map',
      'lokacioni i pasurive',
      'Tiranë harta',
      'pasuri në hartë',
      'kërkimi gjeografik'
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'sq_AL',
      url,
      title,
      description,
      siteName,
      images: [
        {
          url: '/og-map-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Harta e Pasurive - Tiranë',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@pasurite_tiranes',
      images: ['/og-map-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate metadata for search results
export function generateSearchMetadata(searchParams: {
  city?: string;
  type?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
}): Metadata {
  let title = `Pasuritë`;
  let description = 'Shfletoni pasuritë e disponueshme';

  // Build title and description based on search parameters
  if (searchParams.city) {
    title += ` në ${searchParams.city}`;
    description += ` në ${searchParams.city}`;
  }

  if (searchParams.type) {
    const typeLabels: Record<string, string> = {
      house: 'Shtëpi',
      apartment: 'Apartament',
      condo: 'Kondo',
      townhouse: 'Shtëpi në Qytet'
    };
    const typeLabel = typeLabels[searchParams.type] || searchParams.type;
    title += ` - ${typeLabel}`;
    description += ` - ${typeLabel}`;
  }

  if (searchParams.search) {
    title += ` - Kërkimi: "${searchParams.search}"`;
    description += ` që përputhen me "${searchParams.search}"`;
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    const priceRange = [
      searchParams.minPrice ? `nga €${parseInt(searchParams.minPrice).toLocaleString()}` : '',
      searchParams.maxPrice ? `deri €${parseInt(searchParams.maxPrice).toLocaleString()}` : ''
    ].filter(Boolean).join(' ');
    
    if (priceRange) {
      title += ` - ${priceRange}`;
      description += ` me çmim ${priceRange}`;
    }
  }

  title += ` | ${siteName}`;

  const keywords = [
    'pasuri të patundshme',
    'kërkimi i pasurive',
    searchParams.city,
    searchParams.type,
    searchParams.search,
    'Tiranë',
    'Shqipëri'
  ].filter(Boolean);

  const url = `${baseUrl}/properties${buildSearchQuery(searchParams)}`;

  return {
    title,
    description,
    keywords,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'sq_AL',
      url,
      title,
      description,
      siteName,
      images: [
        {
          url: '/og-search-image.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@pasurite_tiranes',
      images: ['/og-search-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Helper functions
function generatePropertyDescription(property: Property): string {
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

function generatePropertyKeywords(property: Property): string[] {
  const baseKeywords = [
    'pasuri të patundshme',
    'real estate',
    property.details.propertyType,
    property.address.city,
    property.address.state,
    'Shqipëri',
    'Albania'
  ];
  
  const typeKeywords = property.listingType === 'sale' 
    ? ['për shitje', 'blerje', 'for sale'] 
    : ['me qira', 'qira', 'for rent'];
  
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

function buildSearchQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.append(key, value);
    }
  });
  
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}