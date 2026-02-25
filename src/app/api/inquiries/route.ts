import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Validation schema for inquiry creation
const InquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
  propertyId: z.string().min(1, 'Property ID is required'),
});

// GET /api/inquiries - Get all inquiries (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build filter conditions
    const where: any = {};

    // Filter by property ID if provided
    if (searchParams.get('propertyId')) {
      where.propertyId = searchParams.get('propertyId');
    }

    // Filter by status if provided
    if (searchParams.get('status')) {
      where.status = searchParams.get('status');
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              city: true,
            },
          },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

// POST /api/inquiries - Create a new inquiry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = InquirySchema.parse(body);

    // Check if the property exists
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        propertyId: validatedData.propertyId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
          },
        },
      },
    });

    // Simulate email notification to agent
    console.log(`[EMAIL DISPATCH] New inquiry mapped to DB.`);
    console.log(`          To: agent@realestate-app.com`);
    console.log(`     Subject: New inquiry from ${inquiry.name} for property ${inquiry.property?.title}`);
    console.log(`============ END MOCK EMAIL ============`);

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    );
  }
}