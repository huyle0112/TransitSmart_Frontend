import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const DEFAULT_CENTER: [number, number] = [21.028511, 105.804817];

interface SimpleMapViewerProps {
    coordinates?: any[];
    geometries?: any[];
    segments?: any[];
}

/**
 * Simple MapViewer using vanilla Leaflet to avoid React-Leaflet re-render issues
 */
export default function SimpleMapViewer({ coordinates = [], geometries = [], segments = [] }: SimpleMapViewerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const layersRef = useRef<L.Layer[]>([]);

    useEffect(() => {
        // Only initialize map once
        if (!mapInstanceRef.current && mapRef.current) {
            console.log('🗺️ Initializing map...');

            const positions = coordinates
                .filter(point => point && point.coords)
                .map(point => [point.coords.lat, point.coords.lng] as [number, number]);

            const center = positions[0] || DEFAULT_CENTER;

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

            // Fix size after render
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }

        // Update map content when data changes
        if (mapInstanceRef.current) {
            console.log('🗺️ Updating map content...', {
                coordinates: coordinates.length,
                geometries: geometries?.length || 0,
                segments: segments?.length || 0
            });

            // Clear existing layers
            layersRef.current.forEach(layer => {
                try {
                    mapInstanceRef.current?.removeLayer(layer);
                } catch (e) {
                    // Layer might already be removed
                }
            });
            layersRef.current = [];

            const positions = coordinates
                .filter(point => point && point.coords)
                .map(point => [point.coords.lat, point.coords.lng] as [number, number]);

            // Draw geometries or fallback to straight lines
            const hasGeometries = geometries && geometries.length > 0;

            if (hasGeometries) {
                geometries.forEach((geometry, idx) => {
                    if (!geometry || geometry.length < 2) return;

                    const segment = segments[idx];
                    const isWalk = segment?.mode === 'walk';

                    const polyline = L.polyline(geometry, {
                        color: isWalk ? '#10b981' : '#1f8eed',
                        weight: isWalk ? 4 : 5,
                        opacity: isWalk ? 0.7 : 0.8,
                        dashArray: isWalk ? '10, 10' : undefined,
                    }).addTo(mapInstanceRef.current!);

                    layersRef.current.push(polyline);
                });
            } else if (positions.length > 1) {
                // Fallback: straight line
                const polyline = L.polyline(positions, {
                    color: '#1f8eed',
                    weight: 6,
                }).addTo(mapInstanceRef.current!);

                layersRef.current.push(polyline);
            }

            // Add markers
            coordinates.forEach((point) => {
                if (!point || !point.coords) return;

                const marker = L.marker([point.coords.lat, point.coords.lng])
                    .addTo(mapInstanceRef.current!)
                    .bindPopup(`<strong>${point.name || 'Stop'}</strong><br/>${point.type || ''}`);

                layersRef.current.push(marker);
            });

            // Fit bounds if we have positions
            if (positions.length > 0) {
                try {
                    const bounds = L.latLngBounds(positions);
                    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
                } catch (e) {
                    console.warn('Could not fit bounds:', e);
                }
            }
        }

        // Cleanup function
        return () => {
            // Don't destroy map on every render, only on unmount
        };
    }, [coordinates, geometries, segments]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                console.log('🗺️ Cleaning up map...');
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
        <div
            ref={mapRef}
            style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                borderRadius: '12px',
                overflow: 'hidden'
            }}
        />
    );
}
