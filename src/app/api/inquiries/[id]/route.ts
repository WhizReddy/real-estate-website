import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Validation schema for inquiry updates
const InquiryUpdateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED']).optional(),
});

// GET /api/inquiries/[id] - Get a single inquiry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            images: true,
          },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 }
    );
  }
}

// PUT /api/inquiries/[id] - Update an inquiry (mainly for status updates)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = InquiryUpdateSchema.parse(body);

    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
    });

    if (!existingInquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: validatedData,
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

    return NextResponse.json(updatedInquiry);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}

// DELETE /api/inquiries/[id] - Delete an inquiry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
    });

    if (!existingInquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    await prisma.inquiry.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Inquiry deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}