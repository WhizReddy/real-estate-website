/**
 * OpenStreetMap Overpass API Integration
 * Fetches real nearby places (schools, hospitals, restaurants, shops, etc.)
 * 100% Free - No API key required
 */

export interface OSMPlace {
  id: string;
  name: string;
  type: 'school' | 'shopping' | 'hospital' | 'restaurant' | 'transport';
  distance: number;
  coordinates: { lat: number; lng: number };
  address?: string;
  tags?: Record<string, string>;
}

interface OverpassNode {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Categorize OSM amenity/shop tags into our place types
 */
function categorizePlace(tags: Record<string, string>): OSMPlace['type'] | null {
  const amenity = tags.amenity?.toLowerCase();
  const shop = tags.shop?.toLowerCase();

  // Schools
  if (amenity === 'school' || amenity === 'kindergarten' || amenity === 'college' || amenity === 'university') {
    return 'school';
  }

  // Hospitals & Healthcare
  if (amenity === 'hospital' || amenity === 'clinic' || amenity === 'doctors' || amenity === 'pharmacy') {
    return 'hospital';
  }

  // Restaurants & Cafes
  if (amenity === 'restaurant' || amenity === 'cafe' || amenity === 'fast_food' || amenity === 'bar') {
    return 'restaurant';
  }

  // Shopping
  if (shop || amenity === 'marketplace' || amenity === 'supermarket') {
    return 'shopping';
  }

  // Transport
  if (amenity === 'bus_station' || amenity === 'taxi' || tags.public_transport) {
    return 'transport';
  }

  return null;
}

/**
 * Build address from OSM tags
 */
function buildAddress(tags: Record<string, string>): string | undefined {
  const parts = [];
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

/**
 * Fetch nearby places from OpenStreetMap Overpass API
 * @param lat - Latitude of the center point
 * @param lng - Longitude of the center point
 * @param radiusKm - Search radius in kilometers (default: 2km)
 * @param limit - Maximum number of places per category (default: 5)
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radiusKm: number = 2,
  limit: number = 5
): Promise<OSMPlace[]> {
  try {
    const radiusMeters = radiusKm * 1000;

    // Overpass QL query to find nearby amenities
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"school|kindergarten|college|university|hospital|clinic|doctors|pharmacy|restaurant|cafe|fast_food|bar|marketplace|supermarket|bus_station|taxi"](around:${radiusMeters},${lat},${lng});
        node["shop"](around:${radiusMeters},${lat},${lng});
        node["public_transport"](around:${radiusMeters},${lat},${lng});
      );
      out body;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      // Handle 504 Gateway Timeout and other errors gracefully
      if (response.status === 504) {
        console.warn('Overpass API timeout - the service is temporarily overloaded. Returning empty results.');
        return [];
      }
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    const places: OSMPlace[] = [];
    const categoryCounts: Record<string, number> = {
      school: 0,
      shopping: 0,
      hospital: 0,
      restaurant: 0,
      transport: 0,
    };

    // Process nodes
    for (const element of data.elements as OverpassNode[]) {
      if (!element.tags) continue;

      const type = categorizePlace(element.tags);
      if (!type) continue;

      // Limit results per category
      if (categoryCounts[type] >= limit) continue;

      // Get name from various possible tags
      const name = element.tags.name || 
                   element.tags['name:sq'] || 
                   element.tags['name:en'] || 
                   element.tags['name:al'] ||
                   element.tags.operator ||
                   element.tags.brand;
      
      // Skip if no name found - we don't want unnamed places
      if (!name || name.trim() === '') continue;

      const distance = calculateDistance(lat, lng, element.lat, element.lon);

      places.push({
        id: `osm-${element.id}`,
        name,
        type,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimals
        coordinates: {
          lat: element.lat,
          lng: element.lon,
        },
        address: buildAddress(element.tags),
        tags: element.tags,
      });

      categoryCounts[type]++;
    }

    // Sort by distance
    places.sort((a, b) => a.distance - b.distance);

    return places;
  } catch (error) {
    // Handle timeout and network errors gracefully
    if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.message.includes('504')) {
        console.warn('OpenStreetMap API timeout - service is temporarily busy. Please try again later.');
      } else {
        console.error('Failed to fetch nearby places from OpenStreetMap:', error);
      }
    }
    return [];
  }
}

/**
 * Fetch nearby places with caching to avoid excessive API calls
 */
const cache = new Map<string, { data: OSMPlace[]; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function fetchNearbyPlacesCached(
  lat: number,
  lng: number,
  radiusKm: number = 2,
  limit: number = 5
): Promise<OSMPlace[]> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)},${radiusKm},${limit}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetchNearbyPlaces(lat, lng, radiusKm, limit);
  cache.set(cacheKey, { data, timestamp: Date.now() });

  return data;
}
