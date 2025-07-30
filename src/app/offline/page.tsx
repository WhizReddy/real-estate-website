"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Home, Search, Map } from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  ResponsiveCard,
} from "@/components/ResponsiveContainer";
import { ResponsiveButton } from "@/components/ResponsiveForms";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      // Try to fetch a simple endpoint to test connectivity
      const response = await fetch("/api/health", {
        method: "GET",
        cache: "no-cache",
      });

      if (response.ok) {
        // Redirect to home page if connection is restored
        window.location.href = "/";
      }
    } catch {
      console.log("Still offline");
    } finally {
      setIsRetrying(false);
    }
  };

  const quickActions = [
    {
      title: "Home",
      description: "Return to homepage",
      href: "/",
      icon: Home,
      color: "blue",
    },
    {
      title: "Search",
      description: "Browse cached properties",
      href: "/search",
      icon: Search,
      color: "green",
    },
    {
      title: "Map View",
      description: "View properties on map",
      href: "/map",
      icon: Map,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <ResponsiveContainer maxWidth="md" className="text-center">
        <ResponsiveCard padding="lg" className="space-y-6">
          {/* Offline Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-gray-100 p-6">
              <WifiOff className="h-12 w-12 text-gray-400" />
            </div>
          </div>

          {/* Status Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {isOnline ? "Connection Restored!" : "You're Offline"}
            </h1>
            <p className="text-gray-600">
              {isOnline
                ? "Your internet connection has been restored. You can now access all features."
                : "It looks like you're not connected to the internet. Some features may be limited, but you can still browse cached content."}
            </p>
          </div>

          {/* Connection Status Indicator */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              isOnline
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {isOnline ? "Online" : "Offline"}
          </div>

          {/* Retry Button */}
          {!isOnline && (
            <ResponsiveButton
              onClick={handleRetry}
              disabled={isRetrying}
              loading={isRetrying}
              variant="primary"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isRetrying ? "Checking Connection..." : "Try Again"}
            </ResponsiveButton>
          )}

          {/* Back Online Button */}
          {isOnline && (
            <ResponsiveButton
              onClick={() => (window.location.href = "/")}
              variant="primary"
              className="w-full sm:w-auto"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </ResponsiveButton>
          )}

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              What you can do offline:
            </h2>

            <div className="grid gap-3 sm:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const colorClasses = {
                  blue: "bg-blue-50 text-blue-600 border-blue-200",
                  green: "bg-green-50 text-green-600 border-green-200",
                  purple: "bg-purple-50 text-purple-600 border-purple-200",
                };

                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`block p-4 rounded-lg border-2 transition-colors hover:bg-opacity-80 ${
                      colorClasses[action.color as keyof typeof colorClasses]
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Icon className="h-6 w-6" />
                      <div>
                        <h3 className="font-medium text-sm">{action.title}</h3>
                        <p className="text-xs opacity-75">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Offline Features Info */}
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h3 className="font-medium text-blue-900 mb-2">
              Available Offline:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Browse recently viewed properties</li>
              <li>• View cached property details</li>
              <li>• Access saved favorites</li>
              <li>• Use basic map functionality</li>
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-medium text-gray-900 mb-2">Tips:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Try moving to a different location</li>
              <li>• Restart your router if using WiFi</li>
              <li>
                • Contact your internet service provider if issues persist
              </li>
            </ul>
          </div>
        </ResponsiveCard>
      </ResponsiveContainer>
    </div>
  );
}
