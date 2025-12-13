import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleMapViewer from '@/components/SimpleMapViewer';
import BusRouteMapViewer from '@/components/BusRouteMapViewer';
import PlaceAutocomplete from '@/components/PlaceAutocomplete';
import RouteSummaryCard from '@/components/RouteSummaryCard';
import EnhancedRouteCard from '@/components/EnhancedRouteCard';
import { Button } from '@/components/ui/button';
import { findRoutes, saveFavorite } from '@/services/api';
import { reverseGeocode } from '@/services/geocoding';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Search, MapPin, Loader2, Trash2 } from 'lucide-react';

// Key dùng để lưu trữ trong Session Storage
const STORAGE_KEY = 'map-search-state';
// Giới hạn kích thước Sidebar
const MIN_WIDTH = 320;
const MAX_WIDTH = 600;

export default function MapSearchPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // --- State Initialization ---
    const getSavedState = () => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    };

    const savedState = getSavedState();

    // --- State: Layout Resizing ---
    const [sidebarWidth, setSidebarWidth] = useState(400); // Mặc định 400px
    const isResizing = useRef(false);

    // Mock data - bypass search logic for testing
    const mockRouteData = {
        "from": {
            "lat": 21.025097,
            "lng": 105.780674,
            "name": "Điểm xuất phát",
            "coords": { "lat": 21.025097, "lng": 105.780674 }
        },
        "to": {
            "lat": 20.991275,
            "lng": 105.839416,
            "name": "Điểm đến",
            "coords": { "lat": 20.991275, "lng": 105.839416 }
        },
        "routes": [
            {
                "route_id": "21B_1_S27_dest_2_0",
                "title": "Lộ trình nhanh nhất",
                "from": { "name": "Điểm xuất phát" },
                "to": { "name": "Điểm đến" },
                "summary": "2 tuyến, 1 lần chuyển, tổng 2640",
                "details": {
                    "total_time_sec": 2640, // 44 minutes - fastest route
                    "walking_time_sec": 291,
                    "transit_time_sec": 2349,
                    "transfers_count": 2
                },
                "segments": [
                    {
                        "lineId": "29_1",
                        "lineName": "29",
                        "mode": "bus",
                        "duration_sec": 252,
                        "duration_min": 4,
                        "from_stop": "29_1_S23",
                        "to_stop": "29_1_S25",
                        "departure_time": "08:01:05",
                        "arrival_time": "08:05:17",
                        "trip_id": "29_1_AM_5",
                        "fromStopName": "Bến Đường cao tốc Vành đai 3",
                        "fromStopLat": 21.02315,
                        "fromStopLon": 105.778875,
                        "toStopName": "Bến Đường Phạm Văn Đồng",
                        "toStopLat": 21.034649,
                        "toStopLon": 105.780275
                    },
                    {
                        "lineId": "16_1",
                        "lineName": "16",
                        "mode": "bus",
                        "duration_sec": 2416,
                        "duration_min": 40,
                        "from_stop": "16_1_S3",
                        "to_stop": "16_1_S19",
                        "departure_time": "08:05:37",
                        "arrival_time": "08:45:53",
                        "trip_id": "16_1_AM_10",
                        "fromStopName": "Bến Đường Phạm Văn Đồng",
                        "fromStopLat": 21.034649,
                        "fromStopLon": 105.780275,
                        "toStopName": "Bến Đường Giải Phóng",
                        "toStopLat": 20.98785,
                        "toStopLon": 105.840791
                    }
                ]
            },
            {
                "route_id": "103_1_S2_dest_2_0",
                "title": "Lộ trình thay thế",
                "from": { "name": "Điểm xuất phát" },
                "to": { "name": "Điểm đến" },
                "summary": "2 tuyến, 1 lần chuyển, tổng 2940",
                "details": {
                    "total_time_sec": 2940, // 49 minutes - alternative route
                    "walking_time_sec": 250,
                    "transit_time_sec": 2690,
                    "transfers_count": 2
                },
                "segments": [
                    {
                        "lineId": "21B_1",
                        "lineName": "21B",
                        "mode": "bus",
                        "duration_sec": 113,
                        "duration_min": 1,
                        "from_stop": "21B_1_S27",
                        "to_stop": "21B_1_S28",
                        "departure_time": "08:00:30",
                        "arrival_time": "08:02:23",
                        "trip_id": "21B_1_AM_4",
                        "fromStopName": "Bến Đường cao tốc Vành đai 3",
                        "fromStopLat": 21.02315,
                        "fromStopLon": 105.778875,
                        "toStopName": "Bến Đường Phạm Hùng",
                        "toStopLat": 21.027766,
                        "toStopLon": 105.779302
                    },
                    {
                        "lineId": "16_1",
                        "lineName": "16",
                        "mode": "bus",
                        "duration_sec": 2601,
                        "duration_min": 43,
                        "from_stop": "16_1_S2",
                        "to_stop": "16_1_S19",
                        "departure_time": "08:02:32",
                        "arrival_time": "08:45:53",
                        "trip_id": "16_1_AM_10",
                        "fromStopName": "Bến Đường Phạm Hùng",
                        "fromStopLat": 21.027766,
                        "fromStopLon": 105.779302,
                        "toStopName": "Bến Đường Giải Phóng",
                        "toStopLat": 20.98785,
                        "toStopLon": 105.840791
                    }
                ]
            },
            {
                "route_id": "16_1_S2_dest_1_0",
                "title": "Lộ trình trực tiếp",
                "from": { "name": "Điểm xuất phát" },
                "to": { "name": "Điểm đến" },
                "summary": "1 tuyến, 0 lần chuyển, tổng 3300",
                "details": {
                    "total_time_sec": 3300, // 55 minutes - direct route (slower but no transfers)
                    "walking_time_sec": 241,
                    "transit_time_sec": 3059,
                    "transfers_count": 1
                },
                "segments": [
                    {
                        "lineId": "16_1",
                        "lineName": "16",
                        "mode": "bus",
                        "duration_sec": 2601,
                        "duration_min": 43,
                        "from_stop": "16_1_S2",
                        "to_stop": "16_1_S19",
                        "departure_time": "08:02:32",
                        "arrival_time": "08:45:53",
                        "trip_id": "16_1_AM_10",
                        "fromStopName": "Bến Đường Phạm Hùng",
                        "fromStopLat": 21.027766,
                        "fromStopLon": 105.779302,
                        "toStopName": "Bến Đường Giải Phóng",
                        "toStopLat": 20.98785,
                        "toStopLon": 105.840791
                    }
                ]
            },
            {
                "route_id": "21B_1_S27_dest_1_0",
                "title": "Lộ trình dự phòng",
                "from": { "name": "Điểm xuất phát" },
                "to": { "name": "Điểm đến" },
                "summary": "1 tuyến, 0 lần chuyển, tổng 3480",
                "details": {
                    "total_time_sec": 3480, // 58 minutes - backup route (slowest)
                    "walking_time_sec": 291,
                    "transit_time_sec": 3189,
                    "transfers_count": 1
                },
                "segments": [
                    {
                        "lineId": "21B_2",
                        "lineName": "21B",
                        "mode": "bus",
                        "duration_sec": 2667,
                        "duration_min": 44,
                        "from_stop": "21B_2_S2",
                        "to_stop": "21B_2_S23",
                        "departure_time": "08:02:06",
                        "arrival_time": "08:46:33",
                        "trip_id": "21B_2_AM_10",
                        "fromStopName": "Bến Đường Phạm Hùng",
                        "fromStopLat": 21.023566,
                        "fromStopLon": 105.778292,
                        "toStopName": "Bến Đường Giải Phóng",
                        "toStopLat": 20.98785,
                        "toStopLon": 105.840791
                    }
                ]
            }
        ]
    };

    // --- State: Input & Selection ---
    const [fromPlace, setFromPlace] = useState<any>(mockRouteData.from);
    const [toPlace, setToPlace] = useState<any>(mockRouteData.to);
    const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);

    // --- State: Data & UI ---
    const [routes, setRoutes] = useState<any[]>(mockRouteData.routes);
    const [selectedRouteId, setSelectedRouteId] = useState<string>(mockRouteData.routes[0]?.route_id || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Effect: Auto-save ---
    useEffect(() => {
        const stateToSave = {
            from: fromPlace,
            to: toPlace,
            routes: routes
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [fromPlace, toPlace, routes]);

    // --- Logic: Resizing Sidebar ---
    const startResizing = useCallback(() => {
        isResizing.current = true;
        document.body.style.cursor = 'col-resize'; // Đổi con trỏ chuột toàn trang
        document.body.style.userSelect = 'none';     // Chặn bôi đen văn bản khi kéo

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;

        // Tính toán chiều rộng mới dựa trên vị trí chuột (e.clientX)
        // Giới hạn trong khoảng MIN_WIDTH và MAX_WIDTH
        let newWidth = e.clientX;
        if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
        if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;

        setSidebarWidth(newWidth);
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
    }, [handleMouseMove]);


    // --- Logic: Map & Search ---
    const handleMapClick = async (lat: number, lng: number) => {
        if (!activeField) return;

        try {
            const tempPlace = {
                label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                coords: { lat, lng }
            };

            if (activeField === 'from') setFromPlace(tempPlace);
            else setToPlace(tempPlace);

            const place = await reverseGeocode([lat, lng]);

            const newPlace = {
                label: place.shortName || place.name,
                fullName: place.name,
                coords: { lat, lng }
            };

            if (activeField === 'from') {
                setFromPlace(newPlace);
                setActiveField('to');
            } else if (activeField === 'to') {
                setToPlace(newPlace);
                setActiveField(null);
            }
        } catch (err) {
            console.error('Error fetching address:', err);
        }
    };

    const handleSearch = async () => {
        if (!fromPlace?.coords || !toPlace?.coords) return;

        setLoading(true);
        setError(null);
        setRoutes([]);

        try {
            const response = await findRoutes({
                from: fromPlace.coords,
                to: toPlace.coords,
            }) as any;

            if (response.walkingRoute) {
                setRoutes([{
                    id: 'walking',
                    title: 'Đi bộ',
                    from: response.from,
                    to: response.to,
                    segments: [{
                        mode: 'walk',
                        duration: response.walkingRoute.duration,
                        from: response.from.id,
                        to: response.to.id
                    }],
                    summary: {
                        totalDuration: response.walkingRoute.duration,
                        totalCost: 0,
                        transfers: 0,
                        startWalkTime: response.walkingRoute.duration
                    },
                    coordinates: [response.from, response.to]
                }]);
            } else {
                setRoutes(response.routes);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Không tìm thấy lộ trình phù hợp.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFromPlace(null);
        setToPlace(null);
        setRoutes([]);
        sessionStorage.removeItem(STORAGE_KEY);
    };

    const mapCoordinates = useMemo(() => {
        const coords = [];
        if (fromPlace?.coords) coords.push({ ...fromPlace, name: 'Điểm đi' });
        if (toPlace?.coords) coords.push({ ...toPlace, name: 'Điểm đến' });
        return coords;
    }, [fromPlace, toPlace]);

    const activeRoute = routes.find(r => r.route_id === selectedRouteId) || routes[0];

    const getInputContainerClass = (field: 'from' | 'to') => {
        const isActive = activeField === field;
        return `relative p-2 rounded-lg border-2 transition-colors cursor-pointer ${isActive
                ? 'border-orange bg-orange/5 ring-1 ring-orange'
                : 'border-transparent bg-gray-50 hover:bg-gray-100'
            }`;
    };

    return (
        // SỬA: Thêm 'overflow-hidden' vào container chính để chặn scroll toàn trang
        // SỬA: Đảm bảo chiều cao tính toán chính xác để khớp với màn hình
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            <div className="flex flex-1 overflow-hidden relative">

                {/* --- LEFT SIDEBAR (RESIZABLE) --- */}
                <div
                    className="bg-white border-r border-gray-200 flex flex-col z-10 shadow-xl flex-shrink-0"
                    style={{ width: sidebarWidth }}
                >
                    {/* Input Section giữ nguyên */}
                    <div className="p-4 border-b border-gray-100 bg-white">
                        {/* ... nội dung input ... */}
                        <div className="flex justify-between items-center mb-4">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-gray-500 pl-0">
                                <ArrowLeft className="h-4 w-4 mr-1" /> Trang chủ
                            </Button>
                            {(fromPlace || toPlace) && (
                                <Button variant="ghost" size="sm" onClick={handleClear} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2">
                                    <Trash2 className="h-4 w-4 mr-1" /> Xóa
                                </Button>
                            )}
                        </div>

                        <h2 className="text-lg font-bold text-navy mb-4">Tìm đường trên bản đồ</h2>

                        <div className="space-y-3">
                            <div className={getInputContainerClass('from')} onClick={() => setActiveField('from')}>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div>
                                    <span className={`text-xs font-bold ${activeField === 'from' ? 'text-orange' : 'text-gray-500'}`}>
                                        Điểm đi {activeField === 'from' && '(Đang chọn...)'}
                                    </span>
                                </div>
                                <PlaceAutocomplete
                                    value={fromPlace}
                                    onChange={setFromPlace}
                                    placeholder="Nhập hoặc click bản đồ"
                                    className="border-none shadow-none p-0 h-auto bg-transparent placeholder:text-gray-400 focus-visible:ring-0"
                                />
                            </div>

                            <div className={getInputContainerClass('to')} onClick={() => setActiveField('to')}>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-red-600 shadow-sm"></div>
                                    <span className={`text-xs font-bold ${activeField === 'to' ? 'text-orange' : 'text-gray-500'}`}>
                                        Điểm đến {activeField === 'to' && '(Đang chọn...)'}
                                    </span>
                                </div>
                                <PlaceAutocomplete
                                    value={toPlace}
                                    onChange={setToPlace}
                                    placeholder="Nhập hoặc click bản đồ"
                                    className="border-none shadow-none p-0 h-auto bg-transparent placeholder:text-gray-400 focus-visible:ring-0"
                                />
                            </div>

                            <Button
                                onClick={handleSearch}
                                disabled={loading || !fromPlace || !toPlace}
                                className="w-full bg-navy hover:bg-navy/90 text-white mt-2"
                            >
                                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4 mr-2" />}
                                Tìm lộ trình
                            </Button>
                        </div>
                    </div>

                    {/* Results List - Enhanced with proper scrolling */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 h-[calc(100vh-280px)]">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 mb-4">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {routes.map((route, idx) => (
                                <EnhancedRouteCard
                                    key={route.route_id}
                                    route={route}
                                    isSelected={selectedRouteId === route.route_id}
                                    onClick={() => setSelectedRouteId(route.route_id)}
                                    originCoords={fromPlace?.coords}
                                    destinationCoords={toPlace?.coords}
                                />
                            ))}
                        </div>

                        {!loading && routes.length === 0 && !error && (
                            <div className="text-center text-gray-400 py-12 text-sm flex flex-col items-center">
                                <MapPin className="h-10 w-10 mb-3 opacity-20" />
                                <p>Chọn điểm đi và điểm đến trên bản đồ<br />để bắt đầu tìm kiếm.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resizer & Map giữ nguyên */}
                <div
                    className="w-1.5 bg-gray-200 hover:bg-orange cursor-col-resize z-20 flex items-center justify-center transition-colors group"
                    onMouseDown={startResizing}
                >
                    <div className="h-8 w-1 rounded-full bg-gray-400 group-hover:bg-white/80"></div>
                </div>

                <div className="flex-1 relative min-w-0">
                    {activeRoute?.segments ? (
                        <BusRouteMapViewer
                            segments={activeRoute.segments}
                            originCoords={fromPlace?.coords}
                            destinationCoords={toPlace?.coords}
                            onMapClick={handleMapClick}
                        />
                    ) : (
                        <SimpleMapViewer
                            coordinates={mapCoordinates}
                            geometries={activeRoute?.geometries}
                            segments={activeRoute?.segments}
                            onMapClick={handleMapClick}
                        />
                    )}

                    {activeField && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-orange z-[1000] text-sm font-medium text-orange flex items-center animate-bounce">
                            <MapPin className="h-4 w-4 mr-2" />
                            Đang chọn {activeField === 'from' ? 'Điểm đi' : 'Điểm đến'}... Click vào bản đồ
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}