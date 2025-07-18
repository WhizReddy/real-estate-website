import { Property } from '@/types';

interface StructuredDataProps {
  property?: Property;
  type: 'website' | 'property' | 'organization';
}

export default function StructuredData({ property, type }: StructuredDataProps) {
  const generateWebsiteSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Pasuritë e Tiranës",
    "description": "Platforma më e mirë për blerjen dhe qiranë e pasurive të patundshme në Tiranë dhe Shqipëri",
    "url": "https://pasurite-tiranes.al",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://pasurite-tiranes.al/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Pasuritë e Tiranës",
      "url": "https://pasurite-tiranes.al",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+355-69-123-4567",
        "contactType": "customer service",
        "email": "info@pasuritëtiranës.al",
        "availableLanguage": ["Albanian", "English"]
      }
    }
  });

  const generatePropertySchema = (prop: Property) => ({
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": prop.title,
    "description": prop.description,
    "url": `https://pasurite-tiranes.al/properties/${prop.id}`,
    "image": prop.images,
    "datePosted": prop.createdAt,
    "dateModified": prop.updatedAt,
    "offers": {
      "@type": "Offer",
      "price": prop.price,
      "priceCurrency": "EUR",
      "availability": prop.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": prop.address.street,
      "addressLocality": prop.address.city,
      "addressRegion": prop.address.state,
      "postalCode": prop.address.zipCode,
      "addressCountry": "AL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": prop.address.coordinates.lat,
      "longitude": prop.address.coordinates.lng
    },
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": prop.details.squareFootage,
      "unitCode": "MTK"
    },
    "numberOfRooms": prop.details.bedrooms,
    "numberOfBathroomsTotal": prop.details.bathrooms,
    "yearBuilt": prop.details.yearBuilt,
    "category": prop.details.propertyType,
    "additionalProperty": prop.features.map(feature => ({
      "@type": "PropertyValue",
      "name": feature
    })),
    "seller": {
      "@type": "Organization",
      "name": "Pasuritë e Tiranës",
      "url": "https://pasurite-tiranes.al",
      "telephone": "+355-69-123-4567",
      "email": "info@pasuritëtiranës.al"
    }
  });

  const generateOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Pasuritë e Tiranës",
    "description": "Agjent profesional i pasurive të patundshme në Tiranë dhe Shqipëri",
    "url": "https://pasurite-tiranes.al",
    "logo": "https://pasurite-tiranes.al/logo.png",
    "image": "https://pasurite-tiranes.al/logo.png",
    "telephone": "+355-69-123-4567",
    "email": "info@pasuritëtiranës.al",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Tiranë",
      "addressCountry": "AL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 41.3275,
      "longitude": 19.8187
    },
    "openingHours": [
      "Mo-Fr 09:00-18:00",
      "Sa-Su 10:00-16:00"
    ],
    "priceRange": "€€",
    "serviceArea": {
      "@type": "AdministrativeArea",
      "name": "Tiranë, Shqipëri"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Tiranë"
      },
      {
        "@type": "Country",
        "name": "Shqipëri"
      }
    ]
  });

  let schema;
  switch (type) {
    case 'property':
      if (!property) return null;
      schema = generatePropertySchema(property);
      break;
    case 'organization':
      schema = generateOrganizationSchema();
      break;
    case 'website':
    default:
      schema = generateWebsiteSchema();
      break;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}