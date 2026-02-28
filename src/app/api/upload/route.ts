import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received');
    console.log('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const typoToken = process.env.BLOP_READ_WRITE_TOKEN; // Check for user's reported typo

    const isProduction = process.env.NODE_ENV === 'production';
    const isValidToken = token && typeof token === 'string' && token.startsWith('vercel_blob_');
    const isDevToken = token === 'dev-blob-token';

    if (!token) {
      console.error('❌ BLOB_READ_WRITE_TOKEN is missing');
      const errorMsg = typoToken
        ? 'Upload configuration error: You used "BLOP" instead of "BLOB" in your environment variables.'
        : 'Upload configuration missing (Token not found). Please add BLOB_READ_WRITE_TOKEN to Vercel.';

      return NextResponse.json({
        error: errorMsg,
        details: typoToken ? 'Found BLOP_READ_WRITE_TOKEN but expected BLOB_READ_WRITE_TOKEN.' : 'No token found in process.env'
      }, { status: 503 });
    }

    if (!isProduction && !isValidToken && !isDevToken) {
      console.warn('⚠️ BLOB_READ_WRITE_TOKEN is invalid for development');
      return NextResponse.json({
        error: 'Upload configuration invalid for development',
        details: 'Please set a valid token or use dev-blob-token for local testing.'
      }, { status: 503 });
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
      token: token, // Explicitly pass token
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
    });

    // Provide helpful error messages
    let userMessage = 'Failed to upload file';
    let statusCode = 500;

    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      userMessage = 'Upload service is not properly configured (401).';
      statusCode = 503;
    } else if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
      userMessage = 'Unable to reach upload service. Please try again.';
      statusCode = 503;
    }

    return NextResponse.json(
      {
        error: `${userMessage}: ${errorMessage}`,
        system_error: errorMessage, // Expose actual error even in production for debugging
      },
      { status: statusCode }
    );
  }
}

// Set runtime to nodejs for fs access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';