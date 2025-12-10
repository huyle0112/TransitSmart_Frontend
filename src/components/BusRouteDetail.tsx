import { useEffect, useState } from 'react';
import { getBusLineDetails } from '@/services/api';
import BusRouteSchedule from './BusRouteSchedule';
import { Loader2, ArrowRightLeft, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusRouteDetailProps {
  routeName: string;
}

export default function BusRouteDetail({ routeName }: BusRouteDetailProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getBusLineDetails(routeName);
        setDetails(data);
        // Reset to forward when new route is selected
        setActiveTab('forward');
      } catch (error) {
        console.error("Failed to fetch bus line details", error);
      } finally {
        setLoading(false);
      }
    };

    if (routeName) {
      fetchDetails();
    }
  }, [routeName]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-orange" /></div>;
  }

  if (!details) return null;

  const currentDirection = details.directions.find((d: any) => d.direction === activeTab);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 bg-navy text-white">
        <h2 className="text-xl font-bold">{details.name}</h2>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('forward')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors relative",
            activeTab === 'forward'
              ? "text-orange"
              : "text-gray-600 hover:text-navy hover:bg-gray-50"
          )}
        >
          Lượt đi
          {activeTab === 'forward' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('backward')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors relative",
            activeTab === 'backward'
              ? "text-orange"
              : "text-gray-600 hover:text-navy hover:bg-gray-50"
          )}
        >
          Lượt về
          {activeTab === 'backward' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange" />
          )}
        </button>
      </div>

      <div className="p-4">
        {currentDirection ? (
          <>
            <div className="mb-4 flex items-center text-sm text-gray-500">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              <span>{currentDirection.headsign}</span>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-navy flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-orange" />
                Danh sách trạm
              </h3>
              <div className="relative pl-4 border-l-2 border-gray-200 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {currentDirection.stops.map((stop: any) => (
                  <div key={stop.id} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-orange" />
                    <p className="text-sm font-medium text-gray-800">{stop.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <BusRouteSchedule routeId={currentDirection.route_id} />
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không có dữ liệu cho chiều này.
          </div>
        )}
      </div>
    </div>
  );
}
