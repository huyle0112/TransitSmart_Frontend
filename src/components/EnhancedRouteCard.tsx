import { Clock, DollarSign, Footprints, Bus } from 'lucide-react';

interface RouteSegment {
  lineId: string;
  lineName: string;
  mode: 'bus' | 'walk';
  duration_min: number;
  fromStopName: string;
  fromStopLat?: number;
  fromStopLon?: number;
  toStopName: string;
  toStopLat?: number;
  toStopLon?: number;
  departure_time: string;
  arrival_time: string;
}

interface EnhancedRouteCardProps {
  route: {
    route_id: string;
    title: string;
    summary: string;
    details: {
      total_time_sec: number;
      walking_time_sec: number;
      transfers_count: number;
    };
    segments: RouteSegment[];
  };
  isSelected: boolean;
  onClick: () => void;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
}

/**
 * Enhanced route card with inline timeline - no "View Details" button
 * Shows complete route information for quick comparison
 */
export default function EnhancedRouteCard({
  route,
  isSelected,
  onClick,
  originCoords,
  destinationCoords
}: EnhancedRouteCardProps) {
  
  // Generate timeline steps including walking segments
  const generateTimelineSteps = () => {
    const steps: any[] = [];
    
    // Add initial walking step if needed
    if (originCoords && route.segments.length > 0) {
      const firstSegment = route.segments[0];
      const distance = calculateDistance(
        originCoords.lat,
        originCoords.lng,
        firstSegment.fromStopLat || 21.02315,
        firstSegment.fromStopLon || 105.778875
      );
      
      if (distance > 0.05) {
        steps.push({
          type: 'walk',
          title: 'Đi bộ đến trạm',
          detail: firstSegment.fromStopName,
          duration: Math.ceil(distance * 12),
          time: route.segments[0].departure_time
        });
      }
    }
    
    // Add bus segments and transfers
    route.segments.forEach((segment, index) => {
      steps.push({
        type: 'bus',
        title: `Tuyến ${segment.lineName}`,
        detail: `${segment.fromStopName} → ${segment.toStopName}`,
        duration: segment.duration_min,
        time: `${segment.departure_time} - ${segment.arrival_time}`,
        isTransfer: index > 0
      });
      
      // Add walking transfer if there's a next segment
      if (index < route.segments.length - 1) {
        steps.push({
          type: 'walk',
          title: 'Chuyển tuyến',
          detail: 'Đi bộ đến trạm tiếp theo',
          duration: 2,
          time: segment.arrival_time
        });
      }
    });
    
    // Add final walking step if needed
    if (destinationCoords && route.segments.length > 0) {
      const lastSegment = route.segments[route.segments.length - 1];
      const distance = calculateDistance(
        lastSegment.toStopLat || 20.98785,
        lastSegment.toStopLon || 105.840791,
        destinationCoords.lat,
        destinationCoords.lng
      );
      
      if (distance > 0.05) {
        steps.push({
          type: 'walk',
          title: 'Đi bộ đến đích',
          detail: 'Từ trạm cuối đến điểm đến',
          duration: Math.ceil(distance * 12),
          time: route.segments[route.segments.length - 1].arrival_time
        });
      }
    }
    
    return steps;
  };

  const timelineSteps = generateTimelineSteps();
  const totalDuration = Math.ceil(route.details.total_time_sec / 60);
  const estimatedCost = route.details.transfers_count * 7000;
  const walkingTime = Math.ceil(route.details.walking_time_sec / 60);

  return (
    <div
      className={`bg-white rounded-2xl transition-all cursor-pointer hover:shadow-lg ${
        isSelected 
          ? 'shadow-xl ring-2 ring-orange/30 border border-orange/20' 
          : 'shadow-sm hover:shadow-md border border-gray-100/50'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-50/80">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <h3 className="font-bold text-gray-900 text-xl mb-2">{route.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{route.summary}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-1">
              <Clock className="h-5 w-5 text-orange-500" />
              {totalDuration}p
            </div>
            <div className="text-xs text-gray-400 font-medium">
              {Math.floor(totalDuration / 60) > 0 && `${Math.floor(totalDuration / 60)}h `}
              {totalDuration % 60}min
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="flex items-center gap-2 text-gray-700">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="font-semibold">{estimatedCost.toLocaleString()}₫</span>
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="text-gray-700">
            <span className="font-semibold">{route.details.transfers_count}</span> chuyển tuyến
          </span>
          {walkingTime > 0 && (
            <>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-gray-700">
                Đi bộ: <span className="font-semibold">{walkingTime}p</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Timeline Body */}
      <div className="p-6 pt-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {/* Timeline steps */}
          <div className="space-y-4">
            {timelineSteps.map((step, index) => {
              const isWalk = step.type === 'walk';
              
              return (
                <div key={index} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-3 border-white flex items-center justify-center shadow-sm ${
                    isWalk ? 'bg-yellow-400' : 'bg-blue-500'
                  }`}>
                    {isWalk ? (
                      <Footprints className="h-4 w-4 text-white" />
                    ) : (
                      <Bus className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isWalk ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {step.title}
                        </span>
                        {step.isTransfer && (
                          <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full font-medium">
                            Chuyển tuyến
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {step.duration}p
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-1" title={step.detail}>
                      {step.detail}
                    </p>
                    
                    {step.time && (
                      <p className="text-xs text-gray-400 font-medium">
                        {step.time}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 text-orange-600 text-sm font-medium bg-orange-50 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            Đang hiển thị trên bản đồ
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}
