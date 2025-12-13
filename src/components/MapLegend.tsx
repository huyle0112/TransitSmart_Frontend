import { Bus, Footprints } from 'lucide-react';

interface MapLegendProps {
  segments?: Array<{
    lineName: string;
    mode: 'bus' | 'walk';
  }>;
}

// Helper function to generate colors for different bus lines (same as in BusRouteMapViewer)
function getBusLineColor(lineName: string): string {
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
  
  if (busColors[lineName]) {
    return busColors[lineName];
  }
  
  let hash = 0;
  for (let i = 0; i < lineName.length; i++) {
    hash = lineName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash) % 20);
  const lightness = 45 + (Math.abs(hash) % 15);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Map legend showing route colors and types
 */
export default function MapLegend({ segments = [] }: MapLegendProps) {
  // Get unique bus lines
  const busLines = [...new Set(
    segments
      .filter(s => s.mode === 'bus')
      .map(s => s.lineName)
  )];
  
  const hasWalking = segments.some(s => s.mode === 'walk');

  if (busLines.length === 0 && !hasWalking) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 z-[1000] max-w-[200px]">
      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        Chú thích bản đồ
      </h4>
      
      <div className="space-y-2">
        {/* Bus lines */}
        {busLines.map(lineName => (
          <div key={lineName} className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Bus className="h-3 w-3 text-gray-600" />
              <div 
                className="w-4 h-0.5 rounded"
                style={{ backgroundColor: getBusLineColor(lineName) }}
              />
            </div>
            <span className="font-medium text-gray-700">Tuyến {lineName}</span>
          </div>
        ))}
        
        {/* Walking */}
        {hasWalking && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Footprints className="h-3 w-3" style={{ color: '#ffd97d' }} />
              <div 
                className="w-4 h-1 rounded"
                style={{ 
                  background: `repeating-linear-gradient(
                    to right,
                    #ffd97d 0px,
                    #ffd97d 4px,
                    transparent 4px,
                    transparent 7px
                  )`
                }}
              />
            </div>
            <span className="font-medium text-gray-700">Đi bộ</span>
          </div>
        )}
      </div>
    </div>
  );
}
