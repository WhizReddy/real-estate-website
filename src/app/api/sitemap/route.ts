import { NextResponse } from 'next/server';
import { getProperties } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const properties = await getProperties();
    const baseUrl = 'https://pasurite-tiranes.al';
    
    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/map`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/properties`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];

    // Property pages
    const propertyPages = properties
      .filter(property => property.status === 'active')
      .map(property => ({
        url: `${baseUrl}/properties/${property.id}`,
        lastModified: property.updatedAt || property.createdAt || new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    // City pages (group properties by city)
    const cities = [...new Set(properties.map(p => p.address.city))];
    const cityPages = cities.map(city => ({
      url: `${baseUrl}/properties?city=${encodeURIComponent(city)}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.6,
    }));

    // Property type pages
    const propertyTypes = ['house', 'apartment', 'condo', 'townhouse'];
    const typePages = propertyTypes.map(type => ({
      url: `${baseUrl}/properties?type=${type}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.6,
    }));

    const allPages = [...staticPages, ...propertyPages, ...cityPages, ...typePages];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages
  .map(
    page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
    <mobile:mobile/>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
