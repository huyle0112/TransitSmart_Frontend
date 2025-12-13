/**
 * OSRM (Open Source Routing Machine) utility functions
 * For fetching accurate road-based routes between coordinates
 */

export interface OSRMRouteResponse {
  routes: Array<{
    geometry: {
      coordinates: number[][];
      type: string;
    };
    legs: Array<{
      steps: any[];
      distance: number;
      duration: number;
    }>;
    distance: number;
    duration: number;
  }>;
  waypoints: Array<{
    hint: string;
    distance: number;
    name: string;
    location: number[];
  }>;
  code: string;
  message?: string;
}

/**
 * Fetch route shape from OSRM API
 * @param startLat - Starting latitude
 * @param startLon - Starting longitude  
 * @param endLat - Ending latitude
 * @param endLon - Ending longitude
 * @param profile - Routing profile ('driving', 'walking', 'cycling')
 * @returns Array of [lat, lon] coordinates for the route
 */
export async function fetchRouteShape(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<[number, number][]> {
  try {
    // OSRM uses lon,lat format (opposite of Google Maps)
    const url = `https://router.project-osrm.org/route/v1/${profile}/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
    
    console.log(`🛣️ Fetching OSRM route: ${startLat},${startLon} → ${endLat},${endLon} (${profile})`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status} ${response.statusText}`);
    }
    
    const data: OSRMRouteResponse = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.warn('OSRM returned no routes, falling back to straight line');
      return [[startLat, startLon], [endLat, endLon]];
    }
    
    const route = data.routes[0];
    const coordinates = route.geometry.coordinates;
    
    // Convert from [lon, lat] to [lat, lon] format for Leaflet
    const leafletCoords: [number, number][] = coordinates.map(coord => [coord[1], coord[0]]);
    
    console.log(`✅ OSRM route fetched: ${leafletCoords.length} points`);
    return leafletCoords;
    
  } catch (error) {
    console.error('Error fetching OSRM route:', error);
    // Fallback to straight line
    return [[startLat, startLon], [endLat, endLon]];
  }
}

/**
 * Fetch multiple route segments in parallel
 * @param segments - Array of route segments with coordinates
 * @returns Promise resolving to array of coordinate arrays
 */
export async function fetchMultipleRouteShapes(
  segments: Array<{
    fromStopLat: number;
    fromStopLon: number;
    toStopLat: number;
    toStopLon: number;
    mode: string;
  }>
): Promise<[number, number][][]> {
  console.log(`🚌 Fetching ${segments.length} route segments...`);
  
  const promises = segments.map(segment => {
    const profile = segment.mode === 'bus' ? 'driving' : 'walking';
    return fetchRouteShape(
      segment.fromStopLat,
      segment.fromStopLon,
      segment.toStopLat,
      segment.toStopLon,
      profile
    );
  });
  
  try {
    const results = await Promise.all(promises);
    console.log(`✅ All route segments fetched successfully`);
    return results;
  } catch (error) {
    console.error('Error fetching multiple route shapes:', error);
    // Return fallback straight lines for all segments
    return segments.map(segment => [
      [segment.fromStopLat, segment.fromStopLon],
      [segment.toStopLat, segment.toStopLon]
    ]);
  }
}

/**
 * Check if two coordinates are close enough to skip routing
 * @param lat1 - First latitude
 * @param lon1 - First longitude
 * @param lat2 - Second latitude
 * @param lon2 - Second longitude
 * @param thresholdMeters - Distance threshold in meters (default: 50m)
 * @returns True if coordinates are very close
 */
export function areCoordinatesClose(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  thresholdMeters: number = 50
): boolean {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance < thresholdMeters;
}

/**
 * Optimize route fetching by skipping very close coordinates
 * @param segments - Route segments
 * @returns Optimized segments with routing decisions
 */
export function optimizeRouteSegments(
  segments: Array<{
    fromStopLat: number;
    fromStopLon: number;
    toStopLat: number;
    toStopLon: number;
    mode: string;
  }>
): Array<{
  fromStopLat: number;
  fromStopLon: number;
  toStopLat: number;
  toStopLon: number;
  mode: string;
  needsRouting: boolean;
}> {
  return segments.map(segment => ({
    ...segment,
    needsRouting: !areCoordinatesClose(
      segment.fromStopLat,
      segment.fromStopLon,
      segment.toStopLat,
      segment.toStopLon,
      100 // 100m threshold for bus stops
    )
  }));
}
