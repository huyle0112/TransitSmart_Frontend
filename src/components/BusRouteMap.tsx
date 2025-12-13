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

interface BusRouteMapProps {
  stops: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
  }>;
}

export default function BusRouteMap({ stops }: BusRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    markers: L.Layer[];
    route: L.Layer | null;
  }>({ markers: [], route: null });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map (default view, will fit bounds later)
    const map = L.map(mapRef.current).setView([10.7769, 106.7009], 13);
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
    if (layersRef.current.route) layersRef.current.route.remove();
    layersRef.current = { markers: [], route: null };

    if (stops.length === 0) return;

    const bounds = L.latLngBounds([]);
    const routeCoords: [number, number][] = [];

    stops.forEach((stop, index) => {
      // Create custom icon for stop
      const isFirst = index === 0;
      const isLast = index === stops.length - 1;

      let bgColor = '#3b82f6'; // blue default
      if (isFirst) bgColor = '#22c55e'; // green start
      if (isLast) bgColor = '#ef4444'; // red end

      const stopIcon = L.divIcon({
        html: `
            <div style="
                width: 20px;
                height: 20px;
                background: ${bgColor};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: bold;
                color: white;
            ">
                ${index + 1}
            </div>
            `,
        className: 'bus-stop-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      // Add stop marker
      const stopMarker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
        .bindPopup(`<b>${index + 1}. ${stop.name}</b>`)
        .addTo(map);

      layersRef.current.markers.push(stopMarker);
      bounds.extend([stop.lat, stop.lng]);
      routeCoords.push([stop.lat, stop.lng]);
    });

    // Draw polyline connecting stops
    if (routeCoords.length > 1) {
      const polyline = L.polyline(routeCoords, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 10' // Dashed to indicate it's straight line connection, not exact path
      }).addTo(map);
      layersRef.current.route = polyline;
    }

    // Fit map to show all markers
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [stops]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg bg-gray-100"
      style={{ minHeight: '100%' }}
    />
  );
}
