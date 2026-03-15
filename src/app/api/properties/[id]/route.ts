import { NextRequest, NextResponse } from 'next/server';

import { clearCache } from '@/lib/cache';
import {
  AuthenticatedRequest,
  withAgentAuth,
} from '@/lib/auth-middleware';
import { transformPropertyRecord } from '@/lib/property-response';
import { prisma } from '@/lib/prisma';
import { validatePropertyData } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(transformPropertyRecord(property));
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export const PUT = withAgentAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const data = await request.json();
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: {
        ownerId: true,
      },
    });

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const canManageProperty =
      request.auth.user.role === 'ADMIN' ||
      (!request.auth.user.isVirtual && existingProperty.ownerId === request.auth.user.id);

    if (!canManageProperty) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validationResult = validatePropertyData({
      title: data.title,
      description: data.description,
      price: data.price,
      street: data.address?.street ?? data.street,
      city: data.address?.city ?? data.city,
      state: data.address?.state ?? data.state,
      zipCode: data.address?.zipCode ?? data.zipCode,
      latitude: data.address?.coordinates?.lat ?? data.latitude,
      longitude: data.address?.coordinates?.lng ?? data.longitude,
      bedrooms: data.details?.bedrooms ?? data.bedrooms,
      bathrooms: data.details?.bathrooms ?? data.bathrooms,
      squareFootage: data.details?.squareFootage ?? data.squareFootage,
      propertyType: data.details?.propertyType ?? data.propertyType,
      yearBuilt: data.details?.yearBuilt ?? data.yearBuilt,
      images: data.images ?? [],
      features: data.features ?? [],
      status: data.status ?? 'active',
      listingType: data.listingType ?? 'sale',
      isPinned: data.isPinned ?? false,
    });

    if (!validationResult.isValid) {
      const errorDetails: Record<string, string> = {};
      validationResult.errors.forEach((error) => {
        errorDetails[error.field] = error.message;
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errorDetails,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        title: validationResult.sanitizedData.title,
        description: validationResult.sanitizedData.description,
        price: validationResult.sanitizedData.price,
        street: validationResult.sanitizedData.street,
        city: validationResult.sanitizedData.city,
        state: validationResult.sanitizedData.state,
        zipCode: validationResult.sanitizedData.zipCode,
        latitude: validationResult.sanitizedData.latitude,
        longitude: validationResult.sanitizedData.longitude,
        bedrooms: validationResult.sanitizedData.bedrooms,
        bathrooms: validationResult.sanitizedData.bathrooms,
        squareFootage: validationResult.sanitizedData.squareFootage,
        propertyType: validationResult.sanitizedData.propertyType.toUpperCase(),
        yearBuilt: validationResult.sanitizedData.yearBuilt,
        images: JSON.stringify(validationResult.sanitizedData.images),
        features: JSON.stringify(validationResult.sanitizedData.features),
        status: validationResult.sanitizedData.status.toUpperCase(),
        listingType: validationResult.sanitizedData.listingType.toUpperCase(),
        isPinned: validationResult.sanitizedData.isPinned,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    clearCache();

    return NextResponse.json({
      success: true,
      data: transformPropertyRecord(property),
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
});

export const DELETE = withAgentAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      select: {
        ownerId: true,
      },
    });

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const canManageProperty =
      request.auth.user.role === 'ADMIN' ||
      (!request.auth.user.isVirtual && existingProperty.ownerId === request.auth.user.id);

    if (!canManageProperty) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.property.delete({
      where: { id },
    });

    clearCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
});
