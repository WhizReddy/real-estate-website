import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Transform the data to match the expected format
    const transformedProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      address: {
        street: property.street,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        coordinates: {
          lat: property.latitude,
          lng: property.longitude
        }
      },
      details: {
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFootage: property.squareFootage,
        propertyType: property.propertyType.toLowerCase(),
        yearBuilt: property.yearBuilt
      },
      images: JSON.parse(property.images || '[]'),
      features: JSON.parse(property.features || '[]'),
      status: property.status.toLowerCase(),
      listingType: property.listingType.toLowerCase(),
      isPinned: property.isPinned,
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    };

    return NextResponse.json(transformedProperty);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        street: data.address?.street || data.street,
        city: data.address?.city || data.city,
        state: data.address?.state || data.state,
        zipCode: data.address?.zipCode || data.zipCode || '',
        latitude: data.address?.coordinates?.lat || data.latitude,
        longitude: data.address?.coordinates?.lng || data.longitude,
        bedrooms: data.details?.bedrooms || data.bedrooms,
        bathrooms: data.details?.bathrooms || data.bathrooms,
        squareFootage: data.details?.squareFootage || data.squareFootage,
        propertyType: (data.details?.propertyType || data.propertyType).toUpperCase(),
        yearBuilt: data.details?.yearBuilt || data.yearBuilt,
        images: JSON.stringify(data.images || []),
        features: JSON.stringify(data.features || []),
        status: (data.status || 'ACTIVE').toUpperCase(),
        listingType: (data.listingType || 'SALE').toUpperCase(),
        isPinned: data.isPinned || false
      }
    });

    // Transform the response to match expected format
    const transformedProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      address: {
        street: property.street,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        coordinates: {
          lat: property.latitude,
          lng: property.longitude
        }
      },
      details: {
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFootage: property.squareFootage,
        propertyType: property.propertyType.toLowerCase(),
        yearBuilt: property.yearBuilt
      },
      images: JSON.parse(property.images || '[]'),
      features: JSON.parse(property.features || '[]'),
      status: property.status.toLowerCase(),
      listingType: property.listingType.toLowerCase(),
      isPinned: property.isPinned,
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    };

    return NextResponse.json(transformedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.property.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}