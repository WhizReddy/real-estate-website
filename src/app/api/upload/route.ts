import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received');
    console.log('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const isValidToken = token && typeof token === 'string' && token !== 'dev-blob-token' && token.startsWith('vercel_blob_');

    if (!token) {
      console.error('❌ BLOB_READ_WRITE_TOKEN is missing');
    } else if (!isValidToken) {
      console.warn('⚠️ BLOB_READ_WRITE_TOKEN appears to be invalid or a dummy token');
      console.warn('Token length:', token.length);
      console.warn('Starts with vercel_blob_:', token.startsWith('vercel_blob_'));
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file provided in upload request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Upload directly to Vercel Blob storage
    console.log('Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Uploading to Vercel Blob storage...');
    const blob = await put(`properties/${file.name}`, buffer, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: true,
    });

    console.log('Upload successful:', blob.url);

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error uploading file:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      isBlobAuthError: errorMessage.includes('401') || errorMessage.includes('Unauthorized')
    });

    // Provide helpful error messages
    let userMessage = 'Failed to upload file';
    let statusCode = 500;

    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      userMessage = 'Upload service is not properly configured. Please contact support.';
      statusCode = 503;
    } else if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
      userMessage = 'Unable to reach upload service. Please try again.';
      statusCode = 503;
    }

    return NextResponse.json(
      {
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: statusCode }
    );
  }
}

// Set runtime to nodejs for fs access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';