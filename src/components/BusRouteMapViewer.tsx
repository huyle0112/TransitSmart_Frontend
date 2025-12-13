import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchMultipleRouteShapes, optimizeRouteSegments } from '@/utils/osrm';
import { Loader2 } from 'lucide-react';
import MapLegend from './MapLegend';

// Fix default marker icons
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons logic
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const DEFAULT_CENTER: [number, number] = [21.028511, 105.804817];

interface BusRouteSegment {
  lineId: string;
  lineName: string;
  mode: 'bus' | 'walk';
  fromStopName: string;
  fromStopLat: number;
  fromStopLon: number;
  toStopName: string;
  toStopLat: number;
  toStopLon: number;
  duration_sec: number;
  duration_min: number;
}

interface BusRouteMapViewerProps {
  segments: BusRouteSegment[];
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

// Helper function to calculate bearing between two points
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

// Helper function to generate colors for different bus lines
function getBusLineColor(lineName: string): string {
  // Predefined colors for common bus lines
  const busColors: { [key: string]: string } = {
    '16': '#e74c3c',    // Red
    '29': '#3498db',    // Blue  
    '21B': '#2ecc71',   // Green
    '32': '#f39c12',    // Orange
    '103': '#9b59b6',   // Purple
    '01': '#1abc9c',    // Teal
    '02': '#34495e',    // Dark Blue
    '03': '#e67e22',    // Dark Orange
    '04': '#8e44ad',    // Dark Purple
    '05': '#27ae60',    // Dark Green
  };
  
  // If we have a predefined color, use it
  if (busColors[lineName]) {
    return busColors[lineName];
  }
  
  // Otherwise, generate a color based on line name hash
  let hash = 0;
  for (let i = 0; i < lineName.length; i++) {
    hash = lineName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate HSL color with good saturation and lightness for visibility
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
  const lightness = 45 + (Math.abs(hash) % 15);  // 45-60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Enhanced map viewer for bus routes with OSRM integration
 * Fetches accurate road-based routes for each segment
 */
export default function BusRouteMapViewer({
  segments = [],
  originCoords,
  destinationCoords,
  className,
  onMapClick
}: BusRouteMapViewerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeGeometries, setRouteGeometries] = useState<[number, number][][]>([]);

  // Initialize map once
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      console.log('🗺️ Initializing BusRouteMapViewer...');
      
      // Determine initial center from segments or use default
      let center = DEFAULT_CENTER;
      if (segments.length > 0) {
        const firstSegment = segments[0];
        center = [firstSegment.fromStopLat, firstSegment.fromStopLon];
      } else if (originCoords) {
        center = [originCoords.lat, originCoords.lng];
      }

      // Create map
      const map = L.map(mapRef.current, {
        center: center,
        zoom: 13,
        scrollWheelZoom: true,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a>',
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle map clicks
      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      // Fix size after render
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, []);

  // Fetch route geometries when segments change
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!segments || segments.length === 0) {
        setRouteGeometries([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`🚌 Processing ${segments.length} route segments...`);

        // Optimize segments to avoid unnecessary API calls
        const optimizedSegments = optimizeRouteSegments(segments);
        
        // Fetch route shapes from OSRM
        const geometries = await fetchMultipleRouteShapes(optimizedSegments);
        
        setRouteGeometries(geometries);
        console.log(`✅ Route geometries loaded: ${geometries.length} segments`);
        
      } catch (err) {
        console.error('Error fetching route geometries:', err);
        setError('Không thể tải đường đi chi tiết. Hiển thị đường thẳng.');
        
        // Fallback to straight lines
        const fallbackGeometries = segments.map(segment => [
          [segment.fromStopLat, segment.fromStopLon] as [number, number],
          [segment.toStopLat, segment.toStopLon] as [number, number]
        ]);
        setRouteGeometries(fallbackGeometries);
        
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [segments]);

  // Update map content when route geometries are loaded
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    console.log('🗺️ Updating map with route geometries...', {
      segments: segments.length,
      geometries: routeGeometries.length
    });

    // Clear existing layers
    layersRef.current.forEach(layer => {
      try {
        map.removeLayer(layer);
      } catch (e) {
        // Layer might already be removed
      }
    });
    layersRef.current = [];

    // Collect all coordinates for bounds calculation
    const allCoords: [number, number][] = [];

    // Add origin marker if provided
    if (originCoords) {
      const originMarker = L.marker([originCoords.lat, originCoords.lng], {
        icon: L.divIcon({
          html: `
            <div style="
              background: #22c55e;
              color: white;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 12px;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">A</div>
          `,
          className: 'origin-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
      .addTo(map)
      .bindPopup('<strong>Điểm xuất phát</strong>');
      
      layersRef.current.push(originMarker);
      allCoords.push([originCoords.lat, originCoords.lng]);
    }

    // Draw route segments
    routeGeometries.forEach((geometry, idx) => {
      if (!geometry || geometry.length < 2) return;

      const segment = segments[idx];
      if (!segment) return;

      const isBus = segment.mode === 'bus';
      const isWalk = segment.mode === 'walk';

      // Choose colors and styles based on mode and line
      let color: string;
      let weight: number;
      let opacity: number;
      let dashArray: string | undefined;

      if (isWalk) {
        // Walking segments: Bright contrasting color, completely different from all bus colors
        // Using bright cyan - totally different from warm colors used by buses
        color = '#ffd97d';        // Bright cyan - cool color, completely distinct from all bus lines
        
        // Alternative options if needed:
        // color = '#ff9800';        // Bright amber (but might conflict with orange bus)
        // color = '#795548';        // Brown (neutral but might be too dark)
        // color = '#607d8b';        // Blue grey (safe but less vibrant)
        
        weight = 5;               // Thicker than bus lines to stand out
        opacity = 0.9;            // High opacity for clarity
        dashArray = '8, 6';       // Larger dashes, shorter gaps for better visibility
      } else {
        // Bus segments: Different colors per line, solid, medium thickness
        color = getBusLineColor(segment.lineName);
        weight = 4;
        opacity = 0.8;
        dashArray = undefined;
      }

      // Create polyline with enhanced visibility for walking segments
      if (isWalk) {
        // For walking segments, add a shadow/outline effect for better visibility
        const shadowPolyline = L.polyline(geometry, {
          color: '#ffffff',         // White shadow/outline
          weight: weight + 2,       // Slightly thicker for outline effect
          opacity: 0.8,
          dashArray: dashArray,
        }).addTo(map);
        
        layersRef.current.push(shadowPolyline);
      }
      
      // Main polyline
      const polyline = L.polyline(geometry, {
        color,
        weight,
        opacity,
        dashArray,
      }).addTo(map);

      // Add direction arrows for bus routes
      if (isBus && geometry.length > 1) {
        // Add arrows at 25%, 50%, and 75% of the route
        const arrowPositions = [0.25, 0.5, 0.75];
        arrowPositions.forEach(position => {
          const index = Math.floor((geometry.length - 1) * position);
          if (index < geometry.length - 1) {
            const start = geometry[index];
            const end = geometry[index + 1];
            
            // Calculate arrow direction
            const bearing = calculateBearing(start[0], start[1], end[0], end[1]);
            
            // Create arrow marker
            const arrowIcon = L.divIcon({
              html: `
                <div style="
                  transform: rotate(${bearing}deg);
                  color: ${color};
                  font-size: 16px;
                  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
                ">▶</div>
              `,
              className: 'arrow-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });
            
            const arrowMarker = L.marker(start, { icon: arrowIcon }).addTo(map);
            layersRef.current.push(arrowMarker);
          }
        });
      }

      // Add popup with segment info
      const popupContent = `
        <div style="font-size: 12px;">
          <strong>${isBus ? `Tuyến ${segment.lineName}` : 'Đi bộ'}</strong><br/>
          <span style="color: #666;">
            ${segment.fromStopName} → ${segment.toStopName}
          </span><br/>
          <span style="color: #666;">
            Thời gian: ${segment.duration_min} phút
          </span>
        </div>
      `;
      polyline.bindPopup(popupContent);

      layersRef.current.push(polyline);
      allCoords.push(...geometry);
    });

    // Add transfer point markers (bus stop markers)
    const transferPoints = new Set<string>();
    segments.forEach((segment, idx) => {
      // Add from stop for first segment
      if (idx === 0) {
        const key = `${segment.fromStopLat},${segment.fromStopLon}`;
        if (!transferPoints.has(key)) {
          transferPoints.add(key);
          
          const marker = L.marker([segment.fromStopLat, segment.fromStopLon], {
            icon: L.divIcon({
              html: `
                <div style="
                  background: #f97316;
                  color: white;
                  border-radius: 50%;
                  width: 20px;
                  height: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 10px;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">🚌</div>
              `,
              className: 'bus-stop-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            }),
          })
          .addTo(map)
          .bindPopup(`<strong>${segment.fromStopName}</strong><br/><span style="color: #666;">Trạm xe buýt</span>`);
          
          layersRef.current.push(marker);
        }
      }
      
      // Add to stop for all segments
      const toKey = `${segment.toStopLat},${segment.toStopLon}`;
      if (!transferPoints.has(toKey)) {
        transferPoints.add(toKey);
        
        const isLastStop = idx === segments.length - 1;
        const marker = L.marker([segment.toStopLat, segment.toStopLon], {
          icon: L.divIcon({
            html: `
              <div style="
                background: ${isLastStop ? '#dc2626' : '#f97316'};
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 10px;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">${isLastStop ? 'B' : '🚌'}</div>
            `,
            className: 'bus-stop-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
        })
        .addTo(map)
        .bindPopup(`<strong>${segment.toStopName}</strong><br/><span style="color: #666;">${isLastStop ? 'Điểm đến' : 'Trạm xe buýt'}</span>`);
        
        layersRef.current.push(marker);
      }
    });

    // Add destination marker if provided and different from last segment
    if (destinationCoords) {
      const lastSegment = segments[segments.length - 1];
      const isDifferent = !lastSegment || 
        Math.abs(destinationCoords.lat - lastSegment.toStopLat) > 0.001 ||
        Math.abs(destinationCoords.lng - lastSegment.toStopLon) > 0.001;
        
      if (isDifferent) {
        const destMarker = L.marker([destinationCoords.lat, destinationCoords.lng], {
          icon: L.divIcon({
            html: `
              <div style="
                background: #dc2626;
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">B</div>
            `,
            className: 'destination-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        })
        .addTo(map)
        .bindPopup('<strong>Điểm đến</strong>');
        
        layersRef.current.push(destMarker);
        allCoords.push([destinationCoords.lat, destinationCoords.lng]);
      }
    }

    // Fit map to show all content
    if (allCoords.length > 0) {
      try {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (e) {
        console.warn('Could not fit bounds:', e);
      }
    }

  }, [segments, routeGeometries, originCoords, destinationCoords]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        console.log('🗺️ Cleaning up BusRouteMapViewer...');
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-orange" />
            <span className="text-sm font-medium text-gray-700">Đang tải bản đồ...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        </div>
      )}
      
      {/* Map Legend */}
      <MapLegend segments={segments} />
      
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}
