import { useState } from 'react';
import useGeolocation from '@/hooks/useGeolocation';
import { getNearbyStops } from '@/services/api';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface NearbyStopsProps {
    onSelectStop?: (data: { stop: any; origin: any }) => void;
}

export default function NearbyStops({ onSelectStop }: NearbyStopsProps) {
    const { requestPosition, loading: geoLoading, error: geoError } = useGeolocation();
    const [stops, setStops] = useState<any[]>([]);
    const [origin, setOrigin] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFindNearby = async () => {
        try {
            setError(null);
            const coords = await requestPosition();
            setLoading(true);
            const response = await getNearbyStops(coords) as any;
            setStops(response.stops);
            setOrigin(response.origin);
        } catch (err: any) {
            setError(err.message || 'Không thể xác định vị trí của bạn lúc này.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <p className="text-xs font-semibold text-orange uppercase tracking-wider mb-1">Gợi ý gần bạn</p>
                    <h3 className="text-lg font-bold text-navy">Trạm gần đây</h3>
                </div>
                <Button
                    variant="default"
                    onClick={handleFindNearby}
                    disabled={geoLoading || loading}
                    className="bg-navy hover:bg-navy/90"
                >
                    {geoLoading || loading ? 'Đang tìm...' : 'Tìm trạm gần đây'}
                </Button>
            </header>

            <div className="p-6">
                {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
                {geoError && <p className="text-sm text-red-500 mb-4">{geoError}</p>}

                <ul className="space-y-4">
                    {stops.map((stop) => (
                        <li key={stop.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-blue-50 rounded-full text-blue-600">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <strong className="block text-gray-900">{stop.name}</strong>
                                    <p className="text-sm text-gray-500">{stop.distanceText} · {Math.round(stop.walkingDuration)} phút đi bộ</p>
                                </div>
                            </div>
                            {onSelectStop && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onSelectStop({ stop, origin })}
                                    className="text-orange hover:text-orange-hover hover:bg-orange/10"
                                >
                                    <Navigation className="h-4 w-4 mr-1" />
                                    Dẫn đường
                                </Button>
                            )}
                        </li>
                    ))}
                    {!stops.length && !loading && !geoLoading && (
                        <li className="text-center text-gray-500 py-8">
                            Nhấn "Tìm trạm gần đây" để xem các trạm xe buýt xung quanh bạn.
                        </li>
                    )}
                </ul>
            </div>
        </section>
    );
}
