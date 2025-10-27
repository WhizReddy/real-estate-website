import { MetadataRoute } from 'next';
import { getProperties } from '@/lib/data';

// Make sitemap dynamic instead of static
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pasurite-tiranes.al';
  
  // Get all properties for dynamic routes
  const properties = await getProperties();
  
  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/admin/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Dynamic property routes
  const propertyRoutes = properties.map((property) => ({
    url: `${baseUrl}/properties/${property.id}`,
    lastModified: new Date(property.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}