import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://pasurite-tiranes.al';
  
  const robots = `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /auth/

# Allow specific API routes that are useful for SEO
Allow: /api/sitemap
Allow: /api/robots

# Crawl delay (optional)
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/api/sitemap

# Additional sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Specific rules for different bots
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

# Host directive (helps with canonicalization)
Host: ${baseUrl}`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}