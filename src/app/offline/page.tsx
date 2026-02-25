"use client";

// Offline page component with basic internationalisation support.
//
// This page is shown when the user is offline.  It provides a status
// indicator, retry button, quick actions, and helpful tips.  All user
//‑facing text is translated via the `i18n` helper.  The component
// determines the locale based on the browser language (defaulting to
// Albanian) and uses keys defined in `src/lib/i18n.ts`.

import { useEffect, useState } from "react";
import {
  WifiOff,
  RefreshCw,
  Home as HomeIcon,
  Search as SearchIcon,
  Map as MapIcon,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  ResponsiveCard,
} from "@/components/ResponsiveContainer";
import { ResponsiveButton } from "@/components/ResponsiveForms";
import { getTranslation, SupportedLocale } from "@/lib/i18n";

/**
 * OfflinePage renders a friendly page for users who have lost their
 * internet connection.  It supports retrying the connection, quick
 * navigation to cached areas of the app, and displays helpful tips.
 */
export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [locale, setLocale] = useState<SupportedLocale>('sq');

  // Determine online status and locale on mount
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const language = navigator.language?.toLowerCase() || '';
    setLocale(language.startsWith('sq') ? 'sq' : 'en');

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Attempt to reconnect by pinging the health endpoint
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        cache: "no-cache",
      });
      if (response.ok) {
        window.location.href = "/";
      }
    } catch {
      // Ignore errors; user remains offline
    } finally {
      setIsRetrying(false);
    }
  };

  // Define quick actions with translated labels
  const quickActions = [
    {
      title: getTranslation('quickActionHome', locale),
      description: getTranslation('quickActionHomeDesc', locale),
      href: '/',
      icon: HomeIcon,
      color: 'blue',
    },
    {
      title: getTranslation('quickActionSearch', locale),
      description: getTranslation('quickActionSearchDesc', locale),
      href: '/search',
      icon: SearchIcon,
      color: 'green',
    },
    {
      title: getTranslation('quickActionMap', locale),
      description: getTranslation('quickActionMapDesc', locale),
      href: '/map',
      icon: MapIcon,
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <ResponsiveContainer maxWidth="md" className="text-center">
        <ResponsiveCard padding="lg" className="space-y-6">
          {/* Offline Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-slate-100  p-6">
              <WifiOff className="h-12 w-12 text-slate-400 " />
            </div>
          </div>

          {/* Status Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {isOnline
                ? getTranslation('offlineTitleOnline', locale)
                : getTranslation('offlineTitleOffline', locale)}
            </h1>
            <p className="text-slate-600 ">
              {isOnline
                ? getTranslation('offlineDescOnline', locale)
                : getTranslation('offlineDescOffline', locale)}
            </p>
          </div>

          {/* Connection Status Indicator */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isOnline ? 'bg-green-100 20 text-green-800 ' : 'bg-red-100 20 text-red-800 '
              }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}
            />
            {isOnline
              ? getTranslation('online', locale)
              : getTranslation('offline', locale)}
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
              {isRetrying
                ? getTranslation('checkingConnection', locale)
                : getTranslation('tryAgain', locale)}
            </ResponsiveButton>
          )}

          {/* Back Online Button */}
          {isOnline && (
            <ResponsiveButton
              onClick={() => (window.location.href = '/')}
              variant="primary"
              className="w-full sm:w-auto"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              {getTranslation('goToHomepage', locale)}
            </ResponsiveButton>
          )}

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {getTranslation('whatYouCanDoOffline', locale)}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const colorClasses: Record<string, string> = {
                  blue: 'bg-blue-50 10 text-blue-600  border-blue-200 50',
                  green: 'bg-green-50 10 text-green-600  border-green-200 50',
                  purple: 'bg-purple-50 10 text-purple-600  border-purple-200 50',
                };
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`block p-4 rounded-lg border-2 transition-colors hover:bg-opacity-80 ${colorClasses[action.color]
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
          <div className="bg-blue-50 10 rounded-lg p-4 text-left">
            <h3 className="font-medium text-blue-900  mb-2">
              {getTranslation('availableOfflineTitle', locale)}
            </h3>
            <ul className="text-sm text-blue-800 80 space-y-1">
              {/* Keeping these strings static for now.  Consider adding to i18n if needed. */}
              <li>• Browse recently viewed properties</li>
              <li>• View cached property details</li>
              <li>• Access saved favorites</li>
              <li>• Use basic map functionality</li>
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-slate-50 50 rounded-lg p-4 text-left">
            <h3 className="font-medium text-[var(--foreground)] mb-2">
              {getTranslation('tipsTitle', locale)}
            </h3>
            <ul className="text-sm text-slate-600  space-y-1">
              <li>• {getTranslation('tipCheckConnection', locale)}</li>
              <li>• {getTranslation('tipMoveLocation', locale)}</li>
              <li>• {getTranslation('tipRestartRouter', locale)}</li>
              <li>• {getTranslation('tipContactProvider', locale)}</li>
            </ul>
          </div>
        </ResponsiveCard>
      </ResponsiveContainer>
    </div>
  );
}