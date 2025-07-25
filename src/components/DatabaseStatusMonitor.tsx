"use client";

import { useState } from 'react';
import { useDatabaseStatus } from '@/hooks/useDatabaseStatus';
import { Database, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DatabaseStatusMonitorProps {
  showDetails?: boolean;
  className?: string;
}

export default function DatabaseStatusMonitor({ 
  showDetails = false, 
  className = "" 
}: DatabaseStatusMonitorProps) {
  const { status, refresh } = useDatabaseStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'disconnected':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'checking':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'disconnected':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'checking':
        return <Clock className="h-4 w-4 animate-pulse" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'connected':
        return 'Database Connected';
      case 'disconnected':
        return 'Database Disconnected';
      case 'error':
        return 'Database Error';
      case 'checking':
        return 'Checking Database...';
      default:
        return 'Unknown Status';
    }
  };

  if (!showDetails) {
    // Compact status indicator
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor()} ${className}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        {status.fallbackActive && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
            Fallback Active
          </span>
        )}
      </div>
    );
  }

  // Detailed status panel
  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor()}`}>
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Database Status</h3>
              <p className="text-sm text-gray-600">Real-time connection monitoring</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Connection Status</span>
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        </div>

        {/* Response Time */}
        {status.responseTime !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Response Time</span>
            <span className={`text-sm font-mono ${
              status.responseTime < 100 ? 'text-green-600' :
              status.responseTime < 500 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {status.responseTime}ms
            </span>
          </div>
        )}

        {/* Last Checked */}
        {status.lastChecked && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Last Checked</span>
            <span className="text-sm text-gray-600">
              {status.lastChecked.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Fallback Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Fallback Storage</span>
          <span className={`text-sm px-2 py-1 rounded-full ${
            status.fallbackActive 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {status.fallbackActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Error Message */}
        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start space-x-2">
              <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error Details</p>
                <p className="text-sm text-red-700 mt-1">{status.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fallback Warning */}
        {status.fallbackActive && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Fallback Mode Active</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Data is being stored locally. Properties will be synced when database connection is restored.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Recovery */}
        {status.status === 'connected' && status.fallbackActive && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Connection Restored</p>
                <p className="text-sm text-blue-700 mt-1">
                  Database connection has been restored. Fallback data can now be synchronized.
                </p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Sync Fallback Data →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}