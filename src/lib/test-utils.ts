// Test utilities for property creation functionality

export interface TestResult {
  success: boolean;
  message: string;
  duration?: number;
  data?: any;
  error?: string;
}

export interface PropertyTestData {
  title: string;
  description: string;
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    propertyType: 'apartment' | 'house' | 'condo' | 'townhouse';
    yearBuilt?: number;
  };
  images: string[];
  features: string[];
  status: 'active' | 'inactive' | 'pending' | 'sold';
  listingType: 'sale' | 'rent';
  isPinned: boolean;
}

// Generate valid test property data
export function generateValidPropertyData(): PropertyTestData {
  const propertyTypes = ['apartment', 'house', 'condo', 'townhouse'] as const;
  const listingTypes = ['sale', 'rent'] as const;
  const statuses = ['active', 'inactive', 'pending', 'sold'] as const;

  return {
    title: `Test Property ${Date.now()}`,
    description: "This is a comprehensive test property with all required fields properly filled out. It includes detailed information about the property features and location.",
    price: Math.floor(Math.random() * 500000) + 50000,
    address: {
      street: `Test Street ${Math.floor(Math.random() * 100) + 1}`,
      city: "Tiranë",
      state: "Tiranë",
      zipCode: "1001",
      coordinates: {
        lat: 41.3275 + (Math.random() - 0.5) * 0.1,
        lng: 19.8187 + (Math.random() - 0.5) * 0.1,
      },
    },
    details: {
      bedrooms: Math.floor(Math.random() * 4) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      squareFootage: Math.floor(Math.random() * 200) + 50,
      propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
      yearBuilt: Math.floor(Math.random() * 30) + 1990,
    },
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
    ],
    features: [
      "Parking",
      "Balcony", 
      "Modern Kitchen",
      "Air Conditioning",
      "Hardwood Floors"
    ].slice(0, Math.floor(Math.random() * 3) + 2),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    listingType: listingTypes[Math.floor(Math.random() * listingTypes.length)],
    isPinned: Math.random() > 0.7,
  };
}

// Generate invalid test property data for validation testing
export function generateInvalidPropertyData(): Partial<PropertyTestData> {
  return {
    title: "", // Invalid: empty title
    description: "", // Invalid: empty description
    price: -100, // Invalid: negative price
    address: {
      street: "", // Invalid: empty street
      city: "",
      state: "",
      zipCode: "",
      coordinates: {
        lat: 200, // Invalid: out of range
        lng: 200, // Invalid: out of range
      },
    },
    details: {
      bedrooms: -1, // Invalid: negative
      bathrooms: 0, // Invalid: zero
      squareFootage: 0, // Invalid: zero
      propertyType: "invalid" as any, // Invalid type
    },
    images: [], // Invalid: no images
    features: [],
    status: "invalid" as any, // Invalid status
    listingType: "invalid" as any, // Invalid listing type
    isPinned: false,
  };
}

// Test API endpoint directly
export async function testPropertyAPI(propertyData: PropertyTestData): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        street: propertyData.address.street,
        city: propertyData.address.city,
        state: propertyData.address.state,
        zipCode: propertyData.address.zipCode,
        latitude: propertyData.address.coordinates.lat,
        longitude: propertyData.address.coordinates.lng,
        bedrooms: propertyData.details.bedrooms,
        bathrooms: propertyData.details.bathrooms,
        squareFootage: propertyData.details.squareFootage,
        propertyType: propertyData.details.propertyType.toUpperCase(),
        yearBuilt: propertyData.details.yearBuilt,
        images: propertyData.images,
        features: propertyData.features,
        status: propertyData.status,
        listingType: propertyData.listingType.toUpperCase(),
        isPinned: propertyData.isPinned,
      }),
    });

    const result = await response.json();
    const duration = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        message: `Property created successfully via API in ${duration}ms`,
        duration,
        data: result,
      };
    } else {
      return {
        success: false,
        message: `API request failed: ${result.error?.message || 'Unknown error'}`,
        duration,
        error: result.error?.message || 'Unknown error',
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      message: `API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Test database health
export async function testDatabaseHealth(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('/api/health/database');
    const result = await response.json();
    const duration = Date.now() - startTime;

    if (response.ok && result.status === 'connected') {
      return {
        success: true,
        message: `Database is healthy (${duration}ms)`,
        duration,
        data: result,
      };
    } else {
      return {
        success: false,
        message: `Database health check failed: ${result.error || 'Unknown error'}`,
        duration,
        error: result.error || 'Unknown error',
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Test form validation
export function validatePropertyData(data: Partial<PropertyTestData>): TestResult {
  const errors: string[] = [];

  if (!data.title?.trim()) errors.push("Title is required");
  if (!data.description?.trim()) errors.push("Description is required");
  if (!data.price || data.price <= 0) errors.push("Valid price is required");
  if (!data.address?.street?.trim()) errors.push("Street address is required");
  if (!data.address?.city?.trim()) errors.push("City is required");
  if (!data.address?.state?.trim()) errors.push("State is required");
  if (data.address?.coordinates?.lat === undefined || data.address?.coordinates?.lat === null) {
    errors.push("Latitude is required");
  }
  if (data.address?.coordinates?.lng === undefined || data.address?.coordinates?.lng === null) {
    errors.push("Longitude is required");
  }
  if (!data.details?.bathrooms || data.details.bathrooms <= 0) {
    errors.push("Number of bathrooms is required");
  }
  if (!data.details?.squareFootage || data.details.squareFootage <= 0) {
    errors.push("Square footage is required");
  }
  if (!data.images || data.images.length === 0) {
    errors.push("At least one image is required");
  }

  // Type validation
  const validPropertyTypes = ['apartment', 'house', 'condo', 'townhouse'];
  const validStatuses = ['active', 'inactive', 'pending', 'sold'];
  const validListingTypes = ['sale', 'rent'];

  if (data.details?.propertyType && !validPropertyTypes.includes(data.details.propertyType)) {
    errors.push("Invalid property type");
  }
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push("Invalid status");
  }
  if (data.listingType && !validListingTypes.includes(data.listingType)) {
    errors.push("Invalid listing type");
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: `Validation failed: ${errors.join(', ')}`,
      error: errors.join(', '),
    };
  }

  return {
    success: true,
    message: "Property data is valid",
  };
}

// Run comprehensive property creation test suite
export async function runPropertyCreationTestSuite(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: Database health check
  results.push(await testDatabaseHealth());

  // Test 2: Valid property creation
  const validProperty = generateValidPropertyData();
  results.push(await testPropertyAPI(validProperty));

  // Test 3: Validation with invalid data
  const invalidProperty = generateInvalidPropertyData();
  const validationResult = validatePropertyData(invalidProperty);
  results.push(validationResult);

  // Test 4: API validation with invalid data
  try {
    const apiValidationResult = await testPropertyAPI(invalidProperty as PropertyTestData);
    results.push({
      success: !apiValidationResult.success, // We expect this to fail
      message: apiValidationResult.success 
        ? "API validation test failed: Invalid data was accepted"
        : "API validation test passed: Invalid data was rejected",
      error: apiValidationResult.error,
    });
  } catch (error) {
    results.push({
      success: true,
      message: "API validation test passed: Invalid data was rejected",
    });
  }

  return results;
}

// Performance test for bulk property creation
export async function runPerformanceTest(count: number = 5): Promise<TestResult> {
  const startTime = Date.now();
  const results = [];

  for (let i = 0; i < count; i++) {
    const testProperty = generateValidPropertyData();
    const result = await testPropertyAPI(testProperty);
    results.push(result);
    
    // Small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const endTime = Date.now();
  const successCount = results.filter(r => r.success).length;
  const totalDuration = endTime - startTime;
  const averageDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;

  return {
    success: successCount === count,
    message: `Performance test: ${successCount}/${count} properties created in ${totalDuration}ms (avg: ${averageDuration.toFixed(2)}ms per property)`,
    duration: totalDuration,
    data: {
      totalCount: count,
      successCount,
      totalDuration,
      averageDuration,
      results,
    },
  };
}