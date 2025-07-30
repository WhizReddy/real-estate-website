'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { Property } from '@/types';

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  property?: Property;
  className?: string;
}

export default function Breadcrumbs({ items, property, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumbs automatically if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Kryesore', href: '/' }
    ];

    // Handle different page types
    if (pathSegments[0] === 'properties') {
      breadcrumbs.push({ label: 'Pasuritë', href: '/properties' });
      
      if (pathSegments[1] && property) {
        breadcrumbs.push({
          label: property.title,
          href: `/properties/${property.id}`,
          current: true
        });
      }
    } else if (pathSegments[0] === 'map') {
      breadcrumbs.push({
        label: 'Harta e Pasurive',
        href: '/map',
        current: true
      });
    } else if (pathSegments[0] === 'admin') {
      breadcrumbs.push({ label: 'Admin', href: '/admin' });
      
      if (pathSegments[1] === 'dashboard') {
        breadcrumbs.push({
          label: 'Dashboard',
          href: '/admin/dashboard',
          current: pathSegments.length === 2
        });
      } else if (pathSegments[1] === 'properties') {
        breadcrumbs.push({ label: 'Pasuritë', href: '/admin/properties' });
        
        if (pathSegments[2]) {
          breadcrumbs.push({
            label: pathSegments[3] === 'edit' ? 'Ndrysho' : 'Detajet',
            href: pathname,
            current: true
          });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Generate structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://pasurite-tiranes.al${item.href}`
    }))
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
      >
        <ol className="flex items-center space-x-1">
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" aria-hidden="true" />
              )}
              
              {item.current ? (
                <span
                  className="font-medium text-gray-900 truncate max-w-xs"
                  aria-current="page"
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1 inline" aria-hidden="true" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-blue-600 transition-colors truncate max-w-xs"
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1 inline" aria-hidden="true" />}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

// Utility function to generate breadcrumbs for property pages
export function generatePropertyBreadcrumbs(property: Property): BreadcrumbItem[] {
  return [
    { label: 'Kryesore', href: '/' },
    { label: 'Pasuritë', href: '/properties' },
    { label: property.address.city, href: `/properties?city=${encodeURIComponent(property.address.city)}` },
    { label: property.details.propertyType, href: `/properties?type=${property.details.propertyType}` },
    { label: property.title, href: `/properties/${property.id}`, current: true }
  ];
}

// Utility function to generate breadcrumbs for search results
export function generateSearchBreadcrumbs(searchParams: URLSearchParams): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Kryesore', href: '/' },
    { label: 'Pasuritë', href: '/properties' }
  ];

  const city = searchParams.get('city');
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  if (city) {
    breadcrumbs.push({
      label: city,
      href: `/properties?city=${encodeURIComponent(city)}`,
      current: !type && !search
    });
  }

  if (type) {
    const typeLabels: Record<string, string> = {
      house: 'Shtëpi',
      apartment: 'Apartament',
      condo: 'Kondo',
      townhouse: 'Shtëpi në Qytet'
    };
    
    breadcrumbs.push({
      label: typeLabels[type] || type,
      href: `/properties?type=${type}${city ? `&city=${encodeURIComponent(city)}` : ''}`,
      current: !search
    });
  }

  if (search) {
    breadcrumbs.push({
      label: `Kërkimi: "${search}"`,
      href: `/properties?search=${encodeURIComponent(search)}`,
      current: true
    });
  }

  return breadcrumbs;
}