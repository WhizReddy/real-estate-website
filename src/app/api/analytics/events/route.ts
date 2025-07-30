import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const event: AnalyticsEvent = await request.json();

    // Validate event data
    if (!event.name) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Log event in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', {
        name: event.name,
        properties: event.properties,
        timestamp: event.timestamp || Date.now(),
      });
    }

    // In production, you would send this to your analytics service
    if (process.env.NODE_ENV === 'production') {
      await sendToAnalyticsService(event);
    }

    // Store in database if needed
    // await storeEventInDatabase(event);

    return NextResponse.json(
      { 
        success: true,
        message: 'Event tracked successfully' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to track analytics event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

// Example function to send to external analytics service
async function sendToAnalyticsService(event: AnalyticsEvent) {
  try {
    // Example: Send to Google Analytics 4
    if (process.env.GA_MEASUREMENT_ID && process.env.GA_API_SECRET) {
      await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: event.properties?.sessionId || 'anonymous',
          events: [{
            name: event.name.replace(/[^a-zA-Z0-9_]/g, '_'), // GA4 event name format
            parameters: event.properties,
          }],
        }),
      });
    }

    // Example: Send to Mixpanel
    if (process.env.MIXPANEL_TOKEN) {
      const mixpanelData = {
        event: event.name,
        properties: {
          ...event.properties,
          token: process.env.MIXPANEL_TOKEN,
          time: event.timestamp || Date.now(),
        },
      };

      await fetch('https://api.mixpanel.com/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([mixpanelData]),
      });
    }

    // Example: Send to custom analytics endpoint
    if (process.env.CUSTOM_ANALYTICS_ENDPOINT) {
      await fetch(process.env.CUSTOM_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CUSTOM_ANALYTICS_TOKEN}`,
        },
        body: JSON.stringify(event),
      });
    }

    console.log('Event sent to analytics service:', event.name);
  } catch (error) {
    console.error('Failed to send to analytics service:', error);
  }
}

// Example function to store in database
// async function storeEventInDatabase(event: AnalyticsEvent) {
//   try {
//     // Using Prisma example
//     // await prisma.analyticsEvent.create({
//     //   data: {
//     //     name: event.name,
//     //     properties: event.properties,
//     //     timestamp: new Date(event.timestamp || Date.now()),
//     //   },
//     // });
//   } catch (error) {
//     console.error('Failed to store event in database:', error);
//   }
// }

// Health check endpoint
export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok', 
      service: 'analytics-events',
      timestamp: new Date().toISOString() 
    },
    { status: 200 }
  );
}