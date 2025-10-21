// Performance testing and optimization utilities

export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  static startMeasurement(name: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }
      
      this.measurements.get(name)!.push(duration);
      return duration;
    };
  }

  static getAverageTime(name: string): number {
    const times = this.measurements.get(name);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  static getStats(name: string) {
    const times = this.measurements.get(name);
    if (!times || times.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0 };
    }

    return {
      count: times.length,
      average: this.getAverageTime(name),
      min: Math.min(...times),
      max: Math.max(...times)
    };
  }

  static getAllStats() {
    const stats: Record<string, { count: number; average: number; min: number; max: number }> = {};
    for (const [name] of this.measurements) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }

  static clearMeasurements() {
    this.measurements.clear();
  }
}

// Debounce utility for search optimization
export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait: number
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: TArgs) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll events
export function throttle<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  limit: number
): (...args: TArgs) => void {
  let inThrottle = false;

  return (...args: TArgs) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Memory usage monitoring
type PerformanceWithMemory = Performance & {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
};

export function getMemoryUsage() {
  const perf = performance as Performance | PerformanceWithMemory;
  if ('memory' in perf) {
    const mem = (perf as PerformanceWithMemory).memory;
    return {
      usedJSHeapSize: mem.usedJSHeapSize,
      totalJSHeapSize: mem.totalJSHeapSize,
      jsHeapSizeLimit: mem.jsHeapSizeLimit,
    };
  }
  return null;
}

// Large dataset performance testing
export function generateLargePropertyDataset(size: number) {
  const cities = ['Tirana', 'Durres', 'Vlore', 'Shkoder', 'Elbasan', 'Korce', 'Fier', 'Berat'];
  const propertyTypes = ['apartment', 'house', 'condo', 'townhouse'];
  const listingTypes = ['sale', 'rent'];
  const features = ['parking', 'balcony', 'garden', 'garage', 'pool', 'gym', 'elevator'];

  const properties = [];
  
  for (let i = 0; i < size; i++) {
    properties.push({
      id: `prop-${i}`,
      title: `Property ${i}`,
      description: `Description for property ${i}`,
      price: Math.floor(Math.random() * 500000) + 50000,
      address: {
        city: cities[Math.floor(Math.random() * cities.length)],
        street: `Street ${i}`
      },
      details: {
        propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
        bedrooms: Math.floor(Math.random() * 5) + 1,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        squareFootage: Math.floor(Math.random() * 200) + 50
      },
      listingType: listingTypes[Math.floor(Math.random() * listingTypes.length)],
      agent: {
        id: `agent-${Math.floor(Math.random() * 10)}`,
        name: `Agent ${Math.floor(Math.random() * 10)}`
      },
      features: features.slice(0, Math.floor(Math.random() * 4) + 1),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      images: [`/images/property-${i}-1.jpg`],
      status: 'active'
    });
  }
  
  return properties;
}

// Performance test runner
export async function runPerformanceTests() {
  console.log('🚀 Starting performance tests...');
  
  // Test with different dataset sizes
  const testSizes = [100, 500, 1000, 5000];
  
  for (const size of testSizes) {
    console.log(`\n📊 Testing with ${size} properties...`);
    
    const dataset = generateLargePropertyDataset(size);
    
    // Test filtering performance
    const filterEnd = PerformanceMonitor.startMeasurement(`filter-${size}`);
    const filtered = dataset.filter(p => 
      p.address.city === 'Tirana' && 
      p.details.propertyType === 'apartment' &&
      p.price >= 100000 && p.price <= 300000
    );
    const filterTime = filterEnd();
    
    // Test sorting performance
  const sortEnd = PerformanceMonitor.startMeasurement(`sort-${size}`);
  const sorted = [...filtered].sort((a, b) => b.price - a.price);
  const sortTime = sortEnd();
    
    console.log(`  Filter: ${filterTime.toFixed(2)}ms (${filtered.length} results)`);
    console.log(`  Sort: ${sortTime.toFixed(2)}ms`);
    // Access sorted to avoid unused variable warning and provide a useful snippet
    if (sorted.length > 0) {
      console.log(`  Top price: ${sorted[0].price}`);
    }
    
    // Memory usage
    const memory = getMemoryUsage();
    if (memory) {
      console.log(`  Memory: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }
  
  console.log('\n📈 Performance Summary:');
  console.log(PerformanceMonitor.getAllStats());
}