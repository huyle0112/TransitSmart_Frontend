import { Clock, DollarSign, Footprints, Bus, MapPin, ArrowRight } from 'lucide-react';

interface BusRouteSegment {
  lineId: string;
  lineName: string;
  mode: 'bus' | 'walk';
  duration_sec: number;
  duration_min: number;
  from_stop: string;
  to_stop: string;
  departure_time: string;
  arrival_time: string;
  trip_id: string;
  fromStopName: string;
  fromStopLat: number;
  fromStopLon: number;
  toStopName: string;
  toStopLat: number;
  toStopLon: number;
}

interface BusRouteStepListProps {
  segments: BusRouteSegment[];
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  departureTime?: string;
}

/**
 * Enhanced step list component for bus routes
 * Converts route segments into step-by-step instructions
 */
export default function BusRouteStepList({
  segments = [],
  originCoords,
  destinationCoords,
  departureTime
}: BusRouteStepListProps) {
  
  // Convert segments to steps with walking segments for transfers
  const generateSteps = () => {
    const steps: any[] = [];
    
    // Add initial walking step if origin is different from first stop
    if (originCoords && segments.length > 0) {
      const firstSegment = segments[0];
      const distance = calculateDistance(
        originCoords.lat,
        originCoords.lng,
        firstSegment.fromStopLat,
        firstSegment.fromStopLon
      );
      
      if (distance > 0.05) { // More than 50 meters
        steps.push({
          lineId: 'walk',
          lineName: 'Đi bộ',
          mode: 'walk',
          title: `Đi bộ đến ${firstSegment.fromStopName}`,
          instruction: `Đi bộ từ điểm xuất phát đến trạm xe buýt ${firstSegment.fromStopName}`,
          duration: Math.ceil(distance * 12), // ~12 minutes per km walking
          distance: distance,
          cost: 0,
          isTransfer: false,
          departureTime: departureTime || '08:00:00',
          arrivalTime: addMinutes(departureTime || '08:00:00', Math.ceil(distance * 12))
        });
      }
    }
    
    // Add bus segments and walking transfers
    segments.forEach((segment, index) => {
      // Add bus segment
      steps.push({
        lineId: segment.lineId,
        lineName: segment.lineName,
        mode: segment.mode,
        title: `Tuyến ${segment.lineName}: ${segment.fromStopName} → ${segment.toStopName}`,
        instruction: `Lên xe buýt tuyến ${segment.lineName} tại ${segment.fromStopName}, xuống tại ${segment.toStopName}`,
        duration: segment.duration_min,
        distance: calculateDistance(
          segment.fromStopLat,
          segment.fromStopLon,
          segment.toStopLat,
          segment.toStopLon
        ),
        cost: 7000, // Standard bus fare in Vietnam
        isTransfer: index > 0,
        departureTime: segment.departure_time,
        arrivalTime: segment.arrival_time,
        waitTime: index === 0 ? 0 : 2, // Assume 2 minutes wait for transfers
        status: index === 0 ? 'Đúng giờ' : null
      });
      
      // Add walking transfer step if there's a next segment
      if (index < segments.length - 1) {
        const currentSegment = segment;
        const nextSegment = segments[index + 1];
        
        const transferDistance = calculateDistance(
          currentSegment.toStopLat,
          currentSegment.toStopLon,
          nextSegment.fromStopLat,
          nextSegment.fromStopLon
        );
        
        if (transferDistance > 0.02) { // More than 20 meters
          steps.push({
            lineId: 'walk',
            lineName: 'Đi bộ',
            mode: 'walk',
            title: `Chuyển tuyến: ${currentSegment.toStopName} → ${nextSegment.fromStopName}`,
            instruction: `Đi bộ từ ${currentSegment.toStopName} đến ${nextSegment.fromStopName} để chuyển tuyến`,
            duration: Math.ceil(transferDistance * 15), // ~15 minutes per km for short walks
            distance: transferDistance,
            cost: 0,
            isTransfer: true,
            departureTime: currentSegment.arrival_time,
            arrivalTime: addMinutes(currentSegment.arrival_time, Math.ceil(transferDistance * 15))
          });
        }
      }
    });
    
    // Add final walking step if destination is different from last stop
    if (destinationCoords && segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      const distance = calculateDistance(
        lastSegment.toStopLat,
        lastSegment.toStopLon,
        destinationCoords.lat,
        destinationCoords.lng
      );
      
      if (distance > 0.05) { // More than 50 meters
        steps.push({
          lineId: 'walk',
          lineName: 'Đi bộ',
          mode: 'walk',
          title: `Đi bộ đến điểm đến`,
          instruction: `Đi bộ từ ${lastSegment.toStopName} đến điểm đến`,
          duration: Math.ceil(distance * 12), // ~12 minutes per km walking
          distance: distance,
          cost: 0,
          isTransfer: false,
          departureTime: lastSegment.arrival_time,
          arrivalTime: addMinutes(lastSegment.arrival_time, Math.ceil(distance * 12))
        });
      }
    }
    
    return steps;
  };
  
  const steps = generateSteps();

  // Format wait time
  const formatWaitTime = (status: string, waitTime: number) => {
    if (!status && !waitTime) return null;

    if (status) {
      if (status.includes('Đúng giờ') || status === 'Đúng giờ') {
        return 'Khởi hành ngay';
      }
    }

    if (waitTime) {
      if (waitTime === 0) return 'Khởi hành ngay';
      return `Thời gian chờ: ${waitTime} phút`;
    }

    return status;
  };

  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Không có thông tin chi tiết về lộ trình.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Route Summary */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Bus className="h-4 w-4" />
          Tóm tắt lộ trình
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">Tổng thời gian:</span>
            <span className="ml-2 text-blue-900">{steps.reduce((sum, step) => sum + step.duration, 0)} phút</span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Chi phí ước tính:</span>
            <span className="ml-2 text-blue-900">{steps.reduce((sum, step) => sum + step.cost, 0).toLocaleString()}₫</span>
          </div>
        </div>
      </div>

      {/* Step List */}
      <ol className="relative border-l-2 border-gray-200 ml-3 space-y-6 py-4">
        {steps.map((step, index) => {
          const isWalk = step.mode === 'walk';
          const isTransfer = step.isTransfer;
          const waitTimeText = formatWaitTime(step.status, step.waitTime);

          return (
            <li key={`${step.lineId}-${index}`} className={`relative pl-8 ${isTransfer ? 'mt-8' : ''}`}>
              <span className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${
                isWalk ? 'bg-gray-400' : 'bg-blue-600'
              }`}></span>

              {isTransfer && (
                <div className="mb-3 p-2 bg-orange/10 text-orange rounded-lg text-sm font-medium inline-flex items-center gap-2">
                  <span>🔄</span>
                  <strong>Chuyển Tuyến</strong>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      isWalk ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isWalk ? <Footprints className="h-3 w-3 inline mr-1" /> : <Bus className="h-3 w-3 inline mr-1" />}
                      {isWalk ? 'Đi bộ' : `Tuyến ${step.lineName}`}
                    </span>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{step.duration} phút • {step.distance.toFixed(1)} km</div>
                    {step.departureTime && step.arrivalTime && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {step.departureTime.slice(0, 5)} <ArrowRight className="h-2 w-2" /> {step.arrivalTime.slice(0, 5)}
                      </div>
                    )}
                  </div>
                </div>

                <h4 className="font-semibold text-navy mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{step.instruction}</p>

                <div className="flex flex-wrap gap-3 text-xs">
                  {!isWalk && step.cost > 0 && (
                    <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                      <DollarSign className="h-3 w-3" />
                      Giá vé: {step.cost.toLocaleString()}₫
                    </span>
                  )}
                  {waitTimeText && (
                    <span className="flex items-center gap-1 text-orange font-medium bg-orange-50 px-2 py-1 rounded">
                      <Clock className="h-3 w-3" />
                      {waitTimeText}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Helper functions
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

function addMinutes(timeString: string, minutes: number): string {
  const [hours, mins, secs] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, secs || 0);
  return date.toTimeString().slice(0, 8);
}
