import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Map as MapIcon, Info } from 'lucide-react';
import PlaceAutocomplete from '@/components/PlaceAutocomplete';
import WalkingRouteMap from '@/components/WalkingRouteMap';
import StopDetailModal from '@/components/StopDetailModal';
import { getNearbyStops } from '@/services/api';

export default function StopSearchPage() {
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [stops, setStops] = useState<any[]>([]);
    const [origin, setOrigin] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
    const [detailStop, setDetailStop] = useState<any>(null);
    const [showMap, setShowMap] = useState(false);

    const handlePlaceSelect = (place: any) => {
        setSelectedPlace(place);
        setError(null);
    };

    const handleSearch = async () => {
        if (!selectedPlace || !selectedPlace.coords) {
            setError('Vui lòng chọn địa điểm hợp lệ');
            return;
        }

        try {
            setError(null);
            setLoading(true);
            // PlaceAutocomplete returns coords as object {lat, lng}
            const { lat, lng } = selectedPlace.coords;

            // Validate coordinates are valid numbers
            if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
                setError('Tọa độ không hợp lệ');
                setLoading(false);
                return;
            }

            const coords = { lat, lng };
            console.log('Searching for stops near:', coords);
            const response = await getNearbyStops(coords) as any;
            setStops(response.stops);
            setOrigin(response.origin);
            setShowMap(true);

            if (response.stops.length > 0) {
                setSelectedStopId(response.stops[0].id);
            }
        } catch (err: any) {
            setError(err.message || 'Không thể tìm điểm dừng gần vị trí này.');
            setShowMap(false);
        } finally {
            setLoading(false);
        }
    };

    const handleStopClick = async (stopId: string) => {
        setSelectedStopId(stopId);

        // Fetch walking route on-demand
        if (origin && stopId) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/route/walking-route/${stopId}?originLat=${origin.lat}&originLng=${origin.lng}`
                );

                if (response.ok) {
                    const data = await response.json();

                    setStops(prevStops =>
                        prevStops.map(stop =>
                            stop.id === stopId
                                ? {
                                    ...stop,
                                    walkingRoute: data.walkingRoute,
                                    walkingDistance: data.walkingDistance,
                                    walkingDuration: data.walkingDuration
                                }
                                : stop
                        )
                    );
                }
            } catch (error) {
                console.error('Failed to fetch walking route:', error);
            }
        }
    };

    const handleShowDetail = (stop: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setDetailStop(stop);
    };

    const handleCloseDetail = () => {
        setDetailStop(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Floating Search Box (Google Maps Style) */}
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] w-full max-w-2xl px-4">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200">
                    {/* Search Input Row */}
                    <div className="flex gap-2 items-center p-3">
                        <div className="flex-1">
                            <PlaceAutocomplete
                                value={selectedPlace}
                                onChange={handlePlaceSelect}
                                placeholder="Tìm trạm xe buýt gần địa điểm..."
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={!selectedPlace || loading}
                            className="bg-navy hover:bg-navy/90 px-6"
                            size="lg"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="px-3 pb-3">
                            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
                        </div>
                    )}

                    {/* Selected Place Info */}
                    {selectedPlace && (
                        <div className="px-3 pb-3">
                            <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span className="font-medium">{selectedPlace.label}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results - Full Screen */}
            {showMap && origin && stops.length > 0 ? (
                <div className="flex flex-col lg:flex-row h-screen">
                    {/* Left Column: Map (65% width) - Full Height */}
                    <div className="w-full lg:w-[65%] flex-shrink-0 h-[400px] lg:h-full">
                        <div className="sticky top-0 h-full overflow-hidden">
                            <WalkingRouteMap
                                origin={origin}
                                stops={stops}
                                selectedStopId={selectedStopId || undefined}
                                onStopSelect={handleStopClick}
                            />
                        </div>
                    </div>

                    {/* Right Column: Stops List (35% width, Scrollable) */}
                    <div className="w-full lg:w-[35%] flex-shrink-0 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 bg-white">
                            <div className="p-4 pt-32">
                                {/* Add padding-top to avoid overlap with header + floating search */}
                                <div className="mb-4">
                                    <h2 className="text-lg font-bold text-navy mb-1">
                                        Tìm thấy {stops.length} trạm gần đây
                                    </h2>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapIcon className="h-3 w-3" />
                                        <span>Xanh dương: Vị trí · Đỏ: Trạm · Xanh lá: Đã chọn</span>
                                    </p>
                                </div>

                            <ul className="space-y-3">
                                {stops.map((stop) => {
                                    const isSelected = stop.id === selectedStopId;
                                    return (
                                        <li
                                            key={stop.id}
                                            className={`p-3 rounded-lg transition-all cursor-pointer border-2 ${
                                                isSelected 
                                                    ? 'bg-green-50 border-green-400 shadow-sm' 
                                                    : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                                            }`}
                                            onClick={() => handleStopClick(stop.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Order Number Badge */}
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                    isSelected 
                                                        ? 'bg-green-500 text-white' 
                                                        : 'bg-gray-200 text-gray-700'
                                                }`}>
                                                    {stop.orderNumber || stop.sequenceNumber || 1}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    {/* Stop Name */}
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MapPin className={`h-4 w-4 flex-shrink-0 ${
                                                            isSelected ? 'text-green-600' : 'text-gray-500'
                                                        }`} />
                                                        <strong className={`block truncate ${
                                                            isSelected ? 'text-green-700' : 'text-gray-900'
                                                        }`}>
                                                            {stop.displayName || stop.name}
                                                        </strong>
                                                    </div>

                                                    {/* Distance Info */}
                                                    <p className="text-sm text-gray-500 mb-2">
                                                        {stop.distanceText} · {Math.round(stop.walkingDuration)} phút đi bộ
                                                    </p>

                                                    {/* Bus Routes */}
                                                    {stop.busRoutes && stop.busRoutes.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                                            <p className="text-xs font-semibold text-gray-600 mb-1.5">
                                                                Xe buýt sắp đến:
                                                            </p>
                                                            <div className="space-y-1.5">
                                                                {stop.busRoutes.map((route: any) => (
                                                                    <div
                                                                        key={route.id}
                                                                        className="flex items-center justify-between text-xs"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span
                                                                                className="px-2 py-0.5 rounded font-semibold text-white"
                                                                                style={{ backgroundColor: route.color }}
                                                                            >
                                                                                {route.name}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-gray-600">
                                                                            {route.nextArrivals && route.nextArrivals.slice(0, 2).map((time: number, idx: number) => (
                                                                                <span
                                                                                    key={idx}
                                                                                    className={`font-medium ${idx === 0 ? 'text-green-600' : ''}`}
                                                                                >
                                                                                    {time}'
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Route Indicator */}
                                                    {stop.walkingRoute && (
                                                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                                            <MapIcon className="h-3 w-3" />
                                                            <span>
                                                                {isSelected ? 'Đường đi đang hiển thị' : 'Click để xem đường đi'}
                                                            </span>
                                                        </p>
                                                    )}

                                                    {/* Action Button */}
                                                    <div className="mt-3">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => handleShowDetail(stop, e)}
                                                            className="w-full text-navy border-navy hover:bg-navy hover:text-white"
                                                        >
                                                            <Info className="h-4 w-4 mr-1" />
                                                            Xem chi tiết
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : !loading && !showMap && (
                /* Empty State - Full Screen */
                <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center px-6">
                        <MapPin className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                        <h3 className="text-2xl font-bold text-gray-700 mb-3">
                            Tra cứu điểm dừng
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Nhập địa điểm vào ô tìm kiếm phía trên để xem các trạm xe buýt gần đó
                        </p>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailStop && (
                <StopDetailModal
                    stop={detailStop}
                    onClose={handleCloseDetail}
                />
            )}
        </div>
    );
}

