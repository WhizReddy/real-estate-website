import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyDirect } from "@/lib/db-queries";
import PropertyDetailClient from "@/components/PropertyDetailClient";

// Disable static generation to avoid Leaflet SSR issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const property = await getPropertyDirect(id);

    if (!property) {
      return {
        title: "Pasuria nuk u gjet",
      };
    }

    const description = `${property.details.propertyType} për ${property.listingType === "sale" ? "shitje" : "qira"
      } në ${property.address.city}. ${property.details.bedrooms} dhoma gjumi, ${property.details.bathrooms
      } banjo, ${property.details.squareFootage
      }m². Çmimi: €${property.price.toLocaleString()}.`;

    return {
      title: `${property.title
        } - €${property.price.toLocaleString()} | Pasuritë e Tiranës`,
      description,
      keywords: [
        property.details.propertyType,
        property.address.city,
        property.address.state,
        property.listingType === "sale" ? "shitje" : "qira",
        "pasuri",
        "shtëpi",
        "apartament",
        "Tiranë",
        "Shqipëri",
      ].join(", "),
      openGraph: {
        title: property.title,
        description,
        images:
          property.images.length > 0
            ? [
              {
                url: property.images[0],
                width: 1200,
                height: 630,
                alt: property.title,
              },
            ]
            : [],
        type: "website",
        locale: "sq_AL",
      },
      twitter: {
        card: "summary_large_image",
        title: property.title,
        description,
        images: property.images.length > 0 ? [property.images[0]] : [],
      },
      alternates: {
        canonical: `/properties/${property.id}`,
      },
    };
  } catch (error) {
    console.warn('Failed to generate metadata during build:', error);
    return {
      title: "Pasuria nuk u gjet",
      description: "Pasuria që kërkoni nuk është e disponueshme.",
    };
  }
}

export default async function PropertyDetail({ params }: Props) {
  const { id } = await params;
  const property = await getPropertyDirect(id);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} />;
}
