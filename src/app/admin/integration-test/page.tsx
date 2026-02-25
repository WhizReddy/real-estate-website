"use client";

import { useState, useEffect } from "react";
import { runPropertyCreationTestSuite, runPerformanceTest } from "@/lib/test-utils";
import { useDatabaseStatus } from "@/hooks/useDatabaseStatus";
import { getFallbackStats, syncAllFallbackProperties } from "@/lib/fallback-sync";
import DatabaseStatusMonitor from "@/components/DatabaseStatusMonitor";
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw } from "lucide-react";

interface TestResult {
  success: boolean;
  message: string;
  duration?: number;
  data?: any;
  error?: string;
}

export default function IntegrationTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [fallbackStats, setFallbackStats] = useState<any>(null);
  const [syncResults, setSyncResults] = useState<any>(null);
  const { status: dbStatus } = useDatabaseStatus();

  useEffect(() => {
    // Load fallback stats on component mount
    loadFallbackStats();
  }, []);

  const loadFallbackStats = () => {
    const stats = getFallbackStats();
    setFallbackStats(stats);
  };

  const runCompleteTestSuite = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Run comprehensive test suite
      const results = await runPropertyCreationTestSuite();
      setTestResults(results);

      // Run performance test
      const perfResult = await runPerformanceTest(3);
      setTestResults(prev => [...prev, perfResult]);

      // Update fallback stats
      loadFallbackStats();

    } catch (error) {
      setTestResults(prev => [...prev, {
        success: false,
        message: `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runFallbackSync = async () => {
    try {
      const results = await syncAllFallbackProperties();
      setSyncResults(results);
      loadFallbackStats();
    } catch (error) {
      setSyncResults({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const getResultIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  return (
    <div className="min-h-full bg-[var(--background)] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="card p-6 border-none mb-6">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
            Property Creation Integration Test
          </h1>
          <p className="text-slate-600  mb-6">
            This page tests the complete property creation workflow including database connectivity,
            API endpoints, form validation, image uploads, fallback systems, and error handling.
          </p>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={runCompleteTestSuite}
              disabled={isRunning}
              className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "Running Tests..." : "Run Complete Test Suite"}
            </button>

            <button
              onClick={runFallbackSync}
              className="flex items-center bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Fallback Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Database Status */}
          <div className="lg:col-span-1">
            <DatabaseStatusMonitor showDetails={true} />
          </div>

          {/* Fallback Statistics */}
          <div className="lg:col-span-1">
            <div className="card p-6 border-none">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Fallback Storage</h2>
              {fallbackStats ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 ">Total Properties:</span>
                    <span className="font-medium">{fallbackStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 ">Pending Sync:</span>
                    <span className="font-medium text-orange-600">{fallbackStats.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 ">Synced:</span>
                    <span className="font-medium text-green-600">{fallbackStats.synced}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 ">Failed:</span>
                    <span className="font-medium text-red-600">{fallbackStats.failed}</span>
                  </div>
                  {fallbackStats.oldestPending && (
                    <div className="pt-2 border-t border-gray-200 ">
                      <span className="text-sm text-slate-500 ">
                        Oldest pending: {new Date(fallbackStats.oldestPending).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 ">Loading stats...</div>
              )}

              {syncResults && (
                <div className="mt-4 p-3 bg-blue-50 10 border border-blue-200 50 rounded-md">
                  <h3 className="font-medium text-blue-900  mb-2">Last Sync Results</h3>
                  {syncResults.error ? (
                    <p className="text-red-600 text-sm">{syncResults.error}</p>
                  ) : (
                    <div className="text-sm text-blue-800 ">
                      <div>Synced: {syncResults.synced}/{syncResults.total}</div>
                      <div>Failed: {syncResults.failed}</div>
                      <div>Skipped: {syncResults.skipped}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="lg:col-span-1">
            <div className="card p-6 border-none">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">System Health</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 ">Database:</span>
                  <div className="flex items-center space-x-2">
                    {dbStatus.isConnected ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${dbStatus.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {dbStatus.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 ">Fallback System:</span>
                  <div className="flex items-center space-x-2">
                    {dbStatus.fallbackActive ? (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <span className={`text-sm ${dbStatus.fallbackActive ? 'text-orange-600' : 'text-green-600'}`}>
                      {dbStatus.fallbackActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {dbStatus.responseTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 ">Response Time:</span>
                    <span className={`text-sm font-mono ${dbStatus.responseTime < 100 ? 'text-green-600' :
                        dbStatus.responseTime < 500 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                      {dbStatus.responseTime}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="card p-6 border-none mt-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Test Results</h2>

          {testResults.length === 0 ? (
            <div className="text-slate-500  text-center py-8">
              No test results yet. Click "Run Complete Test Suite" to start testing.
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200  rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    {getResultIcon(result.success)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-[var(--foreground)]">
                          Test {index + 1}
                        </h3>
                        {result.duration && (
                          <span className="text-sm text-slate-500 ">
                            {result.duration}ms
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.message}
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600 mt-1 font-mono bg-red-50 p-2 rounded">
                          {result.error}
                        </p>
                      )}
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-sm text-slate-600  cursor-pointer">
                            View Details
                          </summary>
                          <pre className="text-xs text-slate-600  mt-2 bg-slate-50 50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Integration Checklist */}
        <div className="card p-6 border-none mt-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Integration Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-[var(--foreground)] mb-3">Core Functionality</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Database connection monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Property creation API endpoint</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Form validation and sanitization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Image upload functionality</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Interactive map integration</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-[var(--foreground)] mb-3">Error Handling & Fallbacks</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Fallback storage system</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Data synchronization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Comprehensive error messages</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Form state management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Unsaved changes warning</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}