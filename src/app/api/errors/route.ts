import { NextRequest, NextResponse } from 'next/server';

interface ErrorLogData {
  message: string;
  stack?: string;
  errorId: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string | null;
  additionalData?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const errorData: ErrorLogData = await request.json();

    // Validate required fields
    if (!errorData.message || !errorData.errorId || !errorData.timestamp) {
      return NextResponse.json(
        { error: 'Missing required error data fields' },
        { status: 400 }
      );
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Client Error Logged:', {
        id: errorData.errorId,
        message: errorData.message,
        url: errorData.url,
        timestamp: errorData.timestamp,
        stack: errorData.stack,
      });
    }

    return NextResponse.json(
      { 
        success: true, 
        errorId: errorData.errorId,
        message: 'Error logged successfully' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to log client error:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok', 
      service: 'error-logging',
      timestamp: new Date().toISOString() 
    },
    { status: 200 }
  );
}