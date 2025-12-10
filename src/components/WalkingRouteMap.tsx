import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WalkingRouteMapProps {
  origin: { lat: number; lng: number };
  stops: Array<{
    id: string;
    name: string;
    coords: { lat: number; lng: number };
    walkingRoute?: {
      type: string;
      coordinates: number[][];
    };
    distanceText: string;
    walkingDuration: number;
  }>;
  selectedStopId?: string;
  onStopSelect?: (stopId: string) => void;
}

export default function WalkingRouteMap({
  origin,
  stops,
  selectedStopId,
  onStopSelect
}: WalkingRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    markers: L.Layer[];
    routes: L.Layer[];
  }>({ markers: [], routes: [] });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([origin.lat, origin.lng], 14);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous layers
    layersRef.current.markers.forEach(layer => layer.remove());
    layersRef.current.routes.forEach(layer => layer.remove());
    layersRef.current = { markers: [], routes: [] };

    // Create custom icon for user location
    const userIcon = L.divIcon({
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      `,
      className: 'user-location-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add user location marker
    const userMarker = L.marker([origin.lat, origin.lng], { icon: userIcon })
      .bindPopup('<b>Vị trí của bạn</b>')
      .addTo(map);
    layersRef.current.markers.push(userMarker);

    // Add stops and walking routes
    const bounds = L.latLngBounds([[origin.lat, origin.lng]]);

    stops.forEach((stop) => {
      const isSelected = stop.id === selectedStopId;

      // Create custom icon for stop
      const stopIcon = L.divIcon({
        html: `
          <div style="
            width: ${isSelected ? '24px' : '20px'};
            height: ${isSelected ? '24px' : '20px'};
            background: ${isSelected ? '#22c55e' : '#ef4444'};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,${isSelected ? '0.4' : '0.3'});
            cursor: pointer;
          "></div>
        `,
        className: 'stop-marker',
        iconSize: [isSelected ? 24 : 20, isSelected ? 24 : 20],
        iconAnchor: [isSelected ? 12 : 10, isSelected ? 12 : 10],
      });

      // Add stop marker
      const stopMarker = L.marker([stop.coords.lat, stop.coords.lng], {
        icon: stopIcon
      })
        .bindPopup(`
          <div style="min-width: 150px;">
            <b>${stop.name}</b><br/>
            <small>${stop.distanceText} · ${stop.walkingDuration} phút đi bộ</small>
          </div>
        `)
        .addTo(map);

      if (onStopSelect) {
        stopMarker.on('click', () => onStopSelect(stop.id));
      }

      layersRef.current.markers.push(stopMarker);
      bounds.extend([stop.coords.lat, stop.coords.lng]);

      // Draw walking route if available
      if (stop.walkingRoute && stop.walkingRoute.coordinates) {
        const routeColor = isSelected ? '#22c55e' : '#cbd5e1'; // Green for selected, lighter gray for others
        const routeWeight = isSelected ? 6 : 2;
        const routeOpacity = isSelected ? 0.9 : 0.4;

        const polyline = L.geoJSON(stop.walkingRoute as any, {
          style: {
            color: routeColor,
            weight: routeWeight,
            opacity: routeOpacity,
            dashArray: isSelected ? '0' : '8, 8', // Solid line for selected, dashed for others
          },
        }).addTo(map);

        layersRef.current.routes.push(polyline);

        // Add distance label at midpoint if selected
        if (isSelected && stop.walkingRoute.coordinates.length > 0) {
          const midIndex = Math.floor(stop.walkingRoute.coordinates.length / 2);
          const midPoint = stop.walkingRoute.coordinates[midIndex];

          const label = L.marker([midPoint[1], midPoint[0]], {
            icon: L.divIcon({
              html: `
                <div style="
                  background: white;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 600;
                  color: #22c55e;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  white-space: nowrap;
                ">${stop.distanceText}</div>
              `,
              className: 'route-label',
              iconSize: [0, 0],
            }),
          }).addTo(map);

          layersRef.current.markers.push(label);
        }
      }
    });

    // Fit map to show all markers
    if (stops.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [origin, stops, selectedStopId, onStopSelect]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
}

