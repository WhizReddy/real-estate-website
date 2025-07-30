import { NextRequest, NextResponse } from 'next/server';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

export async function POST(request: NextRequest) {
  try {
    const metric: PerformanceMetric = await request.json();

    // Validate metric data
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Metric name and numeric value are required' },
        { status: 400 }
      );
    }

    // Log metric in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metric:', {
        name: metric.name,
        value: metric.value,
        timestamp: metric.timestamp,
        url: metric.url,
      });
    }

    // In production, send to performance monitoring service
    if (process.env.NODE_ENV === 'production') {
      await sendToPerformanceService(metric);
    }

    // Store in database if needed
    // await storeMetricInDatabase(metric);

    return NextResponse.json(
      { 
        success: true,
        message: 'Performance metric tracked successfully' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to track performance metric:', error);
    return NextResponse.json(
      { error: 'Failed to track performance metric' },
      { status: 500 }
    );
  }
}

// Example function to send to external performance monitoring service
async function sendToPerformanceService(metric: PerformanceMetric) {
  try {
    // Example: Send to New Relic
    if (process.env.NEW_RELIC_LICENSE_KEY) {
      await fetch('https://insights-collector.newrelic.com/v1/accounts/YOUR_ACCOUNT_ID/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-License-Key': process.env.NEW_RELIC_LICENSE_KEY,
        },
        body: JSON.stringify([{
          eventType: 'WebVitals',
          metricName: metric.name,
          metricValue: metric.value,
          timestamp: metric.timestamp,
          url: metric.url,
          userAgent: metric.userAgent,
        }]),
      });
    }

    // Example: Send to DataDog
    if (process.env.DATADOG_API_KEY) {
      await fetch('https://api.datadoghq.com/api/v1/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': process.env.DATADOG_API_KEY,
        },
        body: JSON.stringify({
          series: [{
            metric: `web.performance.${metric.name.toLowerCase().replace(/\s+/g, '_')}`,
            points: [[Math.floor(metric.timestamp / 1000), metric.value]],
            tags: [
              `url:${metric.url}`,
              `browser:${getBrowserFromUserAgent(metric.userAgent)}`,
            ],
          }],
        }),
      });
    }

    // Example: Send to custom performance endpoint
    if (process.env.CUSTOM_PERFORMANCE_ENDPOINT) {
      await fetch(process.env.CUSTOM_PERFORMANCE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CUSTOM_PERFORMANCE_TOKEN}`,
        },
        body: JSON.stringify(metric),
      });
    }

    console.log('Performance metric sent:', metric.name, metric.value);
  } catch (error) {
    console.error('Failed to send to performance service:', error);
  }
}

// Helper function to extract browser from user agent
function getBrowserFromUserAgent(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'chrome';
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('Safari')) return 'safari';
  if (userAgent.includes('Edge')) return 'edge';
  return 'unknown';
}

// Example function to store in database
// async function storeMetricInDatabase(metric: PerformanceMetric) {
//   try {
//     // Using Prisma example
//     // await prisma.performanceMetric.create({
//     //   data: {
//     //     name: metric.name,
//     //     value: metric.value,
//     //     timestamp: new Date(metric.timestamp),
//     //     url: metric.url,
//     //     userAgent: metric.userAgent,
//     //   },
//     // });
//   } catch (error) {
//     console.error('Failed to store metric in database:', error);
//   }
// }

// Get performance metrics summary
export async function GET() {
  try {
    // In a real application, you would fetch this from your database
    const mockMetrics = {
      averageLCP: 2.5,
      averageFID: 100,
      averageCLS: 0.1,
      averageFCP: 1.8,
      averageTTFB: 600,
      totalPageViews: 1250,
      averageLoadTime: 3.2,
      bounceRate: 0.35,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(mockMetrics, { status: 200 });
  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get performance metrics' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function OPTIONS() {
  return NextResponse.json(
    { 
      status: 'ok', 
      service: 'analytics-performance',
      timestamp: new Date().toISOString() 
    },
    { status: 200 }
  );
}