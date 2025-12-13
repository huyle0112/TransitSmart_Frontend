import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, Trash2, Crosshair } from 'lucide-react';

import SimpleMapViewer from '@/components/SimpleMapViewer';
import BusRouteMapViewer from '@/components/BusRouteMapViewer';
import PlaceAutocomplete from '@/components/PlaceAutocomplete';
import EnhancedRouteCard from '@/components/EnhancedRouteCard';
import { VideoHero } from '@/components/VideoHero';
import { Button } from '@/components/ui/button';

import { findRoutes } from '@/services/api';
import { reverseGeocode } from '@/services/geocoding';
// import { useAuth } from '@/contexts/AuthContext'; // Not used with mock data
import useGeolocation from '@/hooks/useGeolocation';

// Key lưu trữ session
const STORAGE_KEY = 'home-map-search-state';
const MIN_WIDTH = 320;
const MAX_WIDTH = 600;

export default function HomePage() {
    const { requestPosition, loading: locating } = useGeolocation();
    
    // --- Refs ---
    const mainContentRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef(false);

    // --- State Initialization ---
    // Removed savedState as it's not being used with mock data

    // --- States ---
    const [sidebarWidth, setSidebarWidth] = useState(400);
    // State kiểm tra màn hình Desktop (để xử lý responsive logic trong JS nếu cần)
    const [isDesktop, setIsDesktop] = useState(true);

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
        "departure_time": "08:00:00",
        "routes": [
            {
                "route_id": "21B_1_S27_dest_2_0",
                "title": "Lộ trình nhanh nhất",
                "from": { "name": "Điểm xuất phát" },
                "to": { "name": "Điểm đến" },
                "summary": "2 tuyến, 1 lần chuyển, tổng 3124",
                "details": {
                    "total_time_sec": 2640, // 44 minutes - fastest route
                    "walking_time_sec": 291,
                    "transit_time_sec": 2349,
                    "transfers_count": 2
                },
                "segments": [
                    {
                        "lineId": "walk_start",
                        "lineName": "Đi bộ",
                        "mode": "walk",
                        "duration_sec": 180,
                        "duration_min": 3,
                        "from_stop": "origin",
                        "to_stop": "29_1_S23",
                        "departure_time": "08:00:00",
                        "arrival_time": "08:03:00",
                        "trip_id": "walk_1",
                        "fromStopName": "Điểm xuất phát",
                        "fromStopLat": 21.025097,
                        "fromStopLon": 105.780674,
                        "toStopName": "Bến Đường cao tốc Vành đai 3",
                        "toStopLat": 21.02315,
                        "toStopLon": 105.778875
                    },
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
                        "lineId": "walk_transfer",
                        "lineName": "Đi bộ",
                        "mode": "walk",
                        "duration_sec": 120,
                        "duration_min": 2,
                        "from_stop": "29_1_S25",
                        "to_stop": "16_1_S3",
                        "departure_time": "08:05:17",
                        "arrival_time": "08:07:17",
                        "trip_id": "walk_2",
                        "fromStopName": "Bến Đường Phạm Văn Đồng",
                        "fromStopLat": 21.034649,
                        "fromStopLon": 105.780275,
                        "toStopName": "Bến Đường Phạm Văn Đồng (Chuyển tuyến)",
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
                    },
                    {
                        "lineId": "walk_end",
                        "lineName": "Đi bộ",
                        "mode": "walk",
                        "duration_sec": 240,
                        "duration_min": 4,
                        "from_stop": "16_1_S19",
                        "to_stop": "destination",
                        "departure_time": "08:45:53",
                        "arrival_time": "08:49:53",
                        "trip_id": "walk_3",
                        "fromStopName": "Bến Đường Giải Phóng",
                        "fromStopLat": 20.98785,
                        "fromStopLon": 105.840791,
                        "toStopName": "Điểm đến",
                        "toStopLat": 20.991275,
                        "toStopLon": 105.839416
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

    const [fromPlace, setFromPlace] = useState<any>(mockRouteData.from);
    const [toPlace, setToPlace] = useState<any>(mockRouteData.to);
    const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);
    const [routes, setRoutes] = useState<any[]>(mockRouteData.routes);
    const [selectedRouteId, setSelectedRouteId] = useState<string>(mockRouteData.routes[0]?.route_id || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetKey, setResetKey] = useState(0);

    // --- Effects ---
    
    // 1. Check window size cập nhật state isDesktop
    useEffect(() => {
        const checkScreen = () => setIsDesktop(window.innerWidth >= 768);
        checkScreen(); // Check ngay khi mount
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    // 2. Save state vào Session Storage
    useEffect(() => {
        const stateToSave = { from: fromPlace, to: toPlace, routes: routes };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [fromPlace, toPlace, routes]);

    // --- Handlers ---
    const handleScrollDown = () => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Logic kéo thả thay đổi kích thước Sidebar (chỉ dùng cho Desktop)
    const startResizing = useCallback(() => {
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;
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

    // --- Logic Lấy vị trí hiện tại ---
    const handleUseCurrentLocation = async () => {
        try {
            const coords = await requestPosition();
            
            let newPlace = {
                label: 'Vị trí của bạn',
                fullName: 'Đang xác định địa chỉ...',
                coords: coords
            };
            setFromPlace(newPlace);

            try {
                const placeInfo = await reverseGeocode([coords.lat, coords.lng]);
                newPlace = {
                    label: placeInfo.shortName || 'Vị trí của bạn',
                    fullName: placeInfo.name,
                    coords: coords
                };
                setFromPlace(newPlace);
            } catch (err) {
                console.warn('Reverse geocode failed');
            }
        } catch (err: any) {
            setError(err.message || 'Không thể lấy vị trí hiện tại.');
        }
    };

    const handleMapClick = async (lat: number, lng: number) => {
        if (!activeField) return;

        try {
            const tempPlace = { label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, coords: { lat, lng } };
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
            console.error(err);
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
            // Nếu là Desktop thì scroll xuống, còn Mobile thì map đã ở trên rồi ko cần scroll
            if (isDesktop) handleScrollDown();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Không tìm thấy lộ trình.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFromPlace(null);
        setToPlace(null);
        setRoutes([]);
        setError(null);
        sessionStorage.removeItem(STORAGE_KEY);
        setResetKey(prev => prev + 1);
    };

    // --- Helpers ---
    const mapCoordinates = useMemo(() => {
        const coords = [];
        if (fromPlace?.coords) coords.push({ ...fromPlace, name: 'Điểm đi' });
        if (toPlace?.coords) coords.push({ ...toPlace, name: 'Điểm đến' });
        return coords;
    }, [fromPlace, toPlace]);

    const activeRoute = routes.find(r => r.route_id === selectedRouteId) || routes[0];

    // Helper tạo class chung cho các ô input
    const getContainerClass = (field: 'from' | 'to') => {
        const isActive = activeField === field;
        return `flex items-center rounded-lg border-2 transition-colors relative ${
            isActive ? 'border-orange bg-orange/5 ring-1 ring-orange' : 'border-transparent bg-gray-50 hover:bg-gray-100'
        }`;
    };

    return (
        <div className="flex flex-col min-h-screen">
            
            {/* --- VIDEO HERO SECTION --- */}
            <VideoHero onStartClick={handleScrollDown} />

            {/* --- GIAO DIỆN BẢN ĐỒ & TÌM KIẾM --- */}
            <div 
                ref={mainContentRef} 
                // Flex-col cho mobile (dọc), md:flex-row cho desktop (ngang)
                className="flex flex-col md:flex-row h-[calc(100vh-64px)] relative border-b border-gray-200 bg-white scroll-mt-16"
            >
                {/* --- KHỐI 1: SIDEBAR TÌM KIẾM --- */}
                {/* Mobile: Order 2 (nằm dưới map). Desktop: Order 1 (nằm bên trái) */}
                <div 
                    className="bg-white border-r border-gray-200 flex flex-col z-10 shadow-xl flex-shrink-0 order-2 md:order-1 w-full md:w-auto
                        max-h-[50vh] overflow-y-auto md:max-h-none"
                    style={isDesktop ? { width: sidebarWidth } : {}}
                >
                    <div className="p-4 border-b border-gray-100 bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-navy">Tra cứu lộ trình</h2>
                            {(fromPlace || toPlace || routes.length > 0) && (
                                <Button variant="ghost" size="sm" onClick={handleClear} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2">
                                    <Trash2 className="h-4 w-4 mr-1" /> Xóa
                                </Button>
                            )}
                        </div>
                        
                        <div className="space-y-3">
                            {/* --- INPUT ĐIỂM ĐI --- */}
                            <div className={getContainerClass('from')}>
                                <div 
                                    className="flex-1 p-2 cursor-pointer" 
                                    onClick={() => setActiveField('from')}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div>
                                        <span className={`text-xs font-bold ${activeField === 'from' ? 'text-orange' : 'text-gray-500'}`}>
                                            Điểm đi {activeField === 'from' && '(Đang chọn...)'}
                                        </span>
                                    </div>
                                    <PlaceAutocomplete
                                        key={`from-${resetKey}`}
                                        value={fromPlace}
                                        onChange={setFromPlace}
                                        placeholder="Nhập hoặc click bản đồ"
                                        className="border-none shadow-none p-0 h-auto bg-transparent placeholder:text-gray-400 focus-visible:ring-0 w-full"
                                    />
                                </div>
                                <div className="pr-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-100/50 rounded-full transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUseCurrentLocation();
                                        }}
                                        disabled={locating}
                                        title="Lấy vị trí hiện tại"
                                    >
                                        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            {/* --- INPUT ĐIỂM ĐẾN --- */}
                            <div className={getContainerClass('to')} onClick={() => setActiveField('to')}>
                                <div className="flex-1 p-2 cursor-pointer">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-red-600 shadow-sm"></div>
                                        <span className={`text-xs font-bold ${activeField === 'to' ? 'text-orange' : 'text-gray-500'}`}>
                                            Điểm đến {activeField === 'to' && '(Đang chọn...)'}
                                        </span>
                                    </div>
                                    <PlaceAutocomplete
                                        key={`to-${resetKey}`}
                                        value={toPlace}
                                        onChange={setToPlace}
                                        placeholder="Nhập hoặc click bản đồ"
                                        className="border-none shadow-none p-0 h-auto bg-transparent placeholder:text-gray-400 focus-visible:ring-0 w-full"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSearch}
                                disabled={loading || !fromPlace || !toPlace}
                                className="w-full bg-navy hover:bg-navy/90 text-white mt-2 py-3 md:py-6 font-bold text-base shadow-sm"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5 mr-2" />}
                                Tìm lộ trình
                            </Button>
                        </div>
                    </div>

                    {/* Danh sách kết quả - Fixed height with scrolling */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/30 to-gray-50/60 h-[calc(100vh-280px)]">
                        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100/50 mb-6 shadow-sm">{error}</div>}
                        
                        <div className="space-y-6">
                            {routes.map((route) => (
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
                            <div className="text-center text-gray-400 py-16 text-sm flex flex-col items-center">
                                <MapPin className="h-12 w-12 mb-4 opacity-30" />
                                <p className="leading-relaxed">Chọn điểm đi và điểm đến trên bản đồ<br />để bắt đầu tìm kiếm.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- KHỐI 2: RESIZER BAR (Chỉ hiện Desktop) --- */}
                <div 
                    className="hidden md:flex w-1.5 bg-gray-200 hover:bg-orange cursor-col-resize z-20 items-center justify-center transition-colors group order-2"
                    onMouseDown={startResizing}
                >
                    <div className="h-8 w-1 rounded-full bg-gray-400 group-hover:bg-white/80"></div>
                </div>

                {/* --- KHỐI 3: MAP COMPONENT --- */}
                {/* Mobile: Order 1 (trên cùng), h-[50vh] (50% màn hình). Desktop: Order 3 (bên phải), tự giãn */}
                <div className="relative min-w-0 bg-gray-100 order-1 md:order-3 w-full h-[50vh] md:h-auto md:flex-1">
                    {/* Wrapper w-full h-full để map chiếm trọn vẹn div cha */}
                    <div className="w-full h-full">
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
                    </div>
                    
                    {/* Thông báo Floating khi đang chọn điểm */}
                    {activeField && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg border border-orange z-[1000] text-xs md:text-sm font-medium text-orange flex items-center animate-bounce whitespace-nowrap">
                            <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                            Đang chọn {activeField === 'from' ? 'Điểm đi' : 'Điểm đến'}...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}