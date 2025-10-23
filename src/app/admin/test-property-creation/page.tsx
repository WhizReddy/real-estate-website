"use client";

import { useState } from "react";
import { saveProperty } from "@/lib/data";

// Test data generator for property creation
const generateTestProperty = () => ({
  title: `Test Property ${Date.now()}`,
  description: "This is a test property created for testing purposes. It includes all required fields and some optional ones.",
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
    propertyType: ["apartment", "house", "condo", "townhouse"][Math.floor(Math.random() * 4)] as any,
    yearBuilt: Math.floor(Math.random() * 30) + 1990,
  },
  images: [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  ],
  features: ["Parking", "Balcony", "Modern Kitchen"],
  status: "active" as const,
  listingType: Math.random() > 0.5 ? "sale" as const : "rent" as const,
  isPinned: Math.random() > 0.7,
});

export default function TestPropertyCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const testSinglePropertyCreation = async () => {
    setIsLoading(true);
    addLog("Starting single property creation test...");

    try {
      const testProperty = generateTestProperty();
      addLog(`Generated test property: ${testProperty.title}`);
      addLog(`Property details: ${JSON.stringify(testProperty, null, 2)}`);

      const startTime = Date.now();
      const result = await saveProperty(testProperty);
      const endTime = Date.now();

      addLog(`✅ Property created successfully in ${endTime - startTime}ms`);
      addLog(`Created property ID: ${result.id}`);
      
      setTestResults(prev => [...prev, {
        type: 'single',
        success: true,
        property: result,
        duration: endTime - startTime,
        timestamp: new Date().toISOString(),
      }]);

    } catch (error) {
      addLog(`❌ Error creating property: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => [...prev, {
        type: 'single',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const testBulkPropertyCreation = async () => {
    setIsLoading(true);
    addLog("Starting bulk property creation test (5 properties)...");

    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < 5; i++) {
      try {
        const testProperty = generateTestProperty();
        addLog(`Creating property ${i + 1}/5: ${testProperty.title}`);

        const result = await saveProperty(testProperty);
        addLog(`✅ Property ${i + 1} created: ${result.id}`);
        results.push({ success: true, property: result });

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        addLog(`❌ Error creating property ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    const endTime = Date.now();
    const successCount = results.filter(r => r.success).length;
    addLog(`Bulk test completed: ${successCount}/5 properties created in ${endTime - startTime}ms`);

    setTestResults(prev => [...prev, {
      type: 'bulk',
      results,
      successCount,
      totalCount: 5,
      duration: endTime - startTime,
      timestamp: new Date().toISOString(),
    }]);

    setIsLoading(false);
  };

  const testValidationErrors = async () => {
    setIsLoading(true);
    addLog("Starting validation error test...");

    const invalidProperty = {
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

    try {
      addLog("Attempting to create property with invalid data...");
      await saveProperty(invalidProperty);
      addLog("❌ Validation test failed: Invalid property was accepted");
    } catch (error) {
      addLog(`✅ Validation test passed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => [...prev, {
        type: 'validation',
        success: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults([]);
  };

  return (
    <div className="min-h-full bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Property Creation Testing Utilities
          </h1>
          <p className="text-gray-600 mb-6">
            This page provides utilities to test the property creation functionality in isolation.
            Use these tools to debug and validate the property creation process.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testSinglePropertyCreation}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Test Single Property
            </button>
            <button
              onClick={testBulkPropertyCreation}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Test Bulk Creation (5)
            </button>
            <button
              onClick={testValidationErrors}
              disabled={isLoading}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              Test Validation Errors
            </button>
          </div>

          <button
            onClick={clearLogs}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 mb-6"
          >
            Clear Logs
          </button>

          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-800">Running test...</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Debug Logs */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Logs</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Run a test to see debug information.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-4 h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">No test results yet. Run a test to see results.</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{result.type} Test</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Time: {new Date(result.timestamp).toLocaleString()}</div>
                      {result.duration && <div>Duration: {result.duration}ms</div>}
                      {result.successCount !== undefined && (
                        <div>Success Rate: {result.successCount}/{result.totalCount}</div>
                      )}
                      {result.error && <div className="text-red-600 mt-1">Error: {result.error}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* API Health Check */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Health Check</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Database Connection</h3>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/health/database');
                    const data = await response.json();
                    addLog(`Database health: ${JSON.stringify(data)}`);
                  } catch (error) {
                    addLog(`Database health check failed: ${error}`);
                  }
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Check Database
              </button>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Properties API</h3>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/properties');
                    const data = await response.json();
                    addLog(`Properties API: ${response.status} - ${data.properties?.length || 0} properties`);
                  } catch (error) {
                    addLog(`Properties API check failed: ${error}`);
                  }
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Check Properties API
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}