import { prisma } from '@/lib/prisma';
import { transformPropertyRecord } from '@/lib/property-response';
import { Property } from '@/types';

/**
 * Direct Prisma queries for Server Components.
 * These bypass the fetch API to avoid SSR self-referencing timeouts on Vercel.
 */

function transformProperty(dbProperty: any): Property {
    return transformPropertyRecord(dbProperty);
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
        // Re-throw so the page shows a proper error, not a silent 404
        throw error;
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
