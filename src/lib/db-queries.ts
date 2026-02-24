import { prisma } from '@/lib/prisma';
import { Property } from '@/types';

/**
 * Direct Prisma queries for Server Components.
 * These bypass the fetch API to avoid SSR self-referencing timeouts on Vercel.
 */

function transformProperty(dbProperty: any): Property {
    return {
        id: dbProperty.id,
        title: dbProperty.title,
        description: dbProperty.description,
        price: dbProperty.price,
        address: {
            street: dbProperty.street,
            city: dbProperty.city,
            state: dbProperty.state,
            zipCode: dbProperty.zipCode,
            coordinates: {
                lat: dbProperty.latitude,
                lng: dbProperty.longitude,
            },
        },
        details: {
            bedrooms: dbProperty.bedrooms,
            bathrooms: dbProperty.bathrooms,
            squareFootage: dbProperty.squareFootage,
            propertyType: dbProperty.propertyType.toLowerCase(),
            yearBuilt: dbProperty.yearBuilt,
        },
        images: JSON.parse(dbProperty.images || '[]'),
        features: JSON.parse(dbProperty.features || '[]'),
        status: dbProperty.status.toLowerCase() as Property['status'],
        listingType: dbProperty.listingType.toLowerCase() as 'sale' | 'rent',
        isPinned: dbProperty.isPinned,
        agent: dbProperty.owner
            ? {
                id: dbProperty.owner.id,
                name: dbProperty.owner.name || 'Real Estate Agent',
                email: dbProperty.owner.email,
                phone: '+355 69 123 4567',
            }
            : {
                id: 'default-agent',
                name: 'Real Estate Agent',
                email: 'agent@realestate-tirana.al',
                phone: '+355 69 123 4567',
            },
        createdAt: dbProperty.createdAt.toISOString(),
        updatedAt: dbProperty.updatedAt.toISOString(),
    };
}

export async function getPropertyDirect(id: string): Promise<Property | null> {
    try {
        const property = await prisma.property.findUnique({
            where: { id },
            include: { owner: true },
        });

        if (!property) return null;
        return transformProperty(property);
    } catch (error) {
        console.error('Failed to fetch property directly from DB:', error);
        return null;
    }
}

export async function getActivePropertiesDirect(): Promise<Property[]> {
    try {
        const properties = await prisma.property.findMany({
            where: { status: 'ACTIVE' },
            include: { owner: true },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        });

        return properties.map(transformProperty);
    } catch (error) {
        console.error('Failed to fetch active properties directly from DB:', error);
        return [];
    }
}
