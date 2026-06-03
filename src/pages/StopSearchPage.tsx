import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Map as MapIcon, Info, ArrowLeft, Loader2, Crosshair } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PlaceAutocomplete from '@/components/PlaceAutocomplete';
import WalkingRouteMap from '@/components/WalkingRouteMap';
import StopDetailModal from '@/components/StopDetailModal';
import { getNearbyStops } from '@/services/api';
import useGeolocation from '@/hooks/useGeolocation';

export default function StopSearchPage() {
    const navigate = useNavigate();
    const { requestPosition, loading: geoLoading } = useGeolocation();
    const { t } = useTranslation();
    
    // States
    const defaultPlace = {
        label: "Đại học Bách khoa Hà Nội, Đường Đại Cồ Việt",
        fullName: "Đại học Bách khoa Hà Nội, Đường Đại Cồ Việt",
        coords: { lat: 21.0064, lng: 105.8431 }
    };

    const [selectedPlace, setSelectedPlace] = useState<any>(defaultPlace);
    const [stops, setStops] = useState<any[]>([]);
    const [origin, setOrigin] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
    const [detailStop, setDetailStop] = useState<any>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // --- Handlers ---

    const handlePlaceSelect = (place: any) => {
        setSelectedPlace(place);
        setError(null);
    };

    const fetchWalkingRoute = async (stopId: string, originCoords: any) => {
        try {
            const url = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/route/walking-route/${stopId}?originLat=${originCoords.lat}&originLng=${originCoords.lng}`;
            const routeResponse = await fetch(url);
            
            if (routeResponse.ok) {
                const routeData = await routeResponse.json();
                setStops(prevStops =>
                    prevStops.map(stop =>
                        stop.id === stopId
                            ? {
                                ...stop,
                                walkingRoute: routeData.walkingRoute,
                                walkingDistance: routeData.walkingDistance,
                                walkingDuration: routeData.walkingDuration
                            }
                            : stop
                    )
                );
            }
        } catch (error) {
            console.error('[StopSearch] Failed to fetch walking route:', error);
        }
    };

    // Helper: Hàm lọc trùng lặp bến xe
    const deduplicateStops = (rawStops: any[]) => {
        const uniqueMap = new Map();
        
        rawStops.forEach((stop: any) => {
            const key = `${stop.coords?.lat?.toFixed(5)}_${stop.coords?.lng?.toFixed(5)}`;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, stop);
            }
        });

        return Array.from(uniqueMap.values());
    };

    // Helper: Hàm đánh số 
    const reindexStops = (stopsList: any[]) => {
        return stopsList.map((stop, index) => ({
            ...stop,
            orderNumber: index + 1 
        }));
    };

    const handleFindNearby = async () => {
        try {
            setError(null);
            const coords = await requestPosition();
            setLoading(true);
            
            setSelectedPlace({ label: t('home.yourLocation'), coords });

            const response = await getNearbyStops(coords) as any;
            const uniqueStops = deduplicateStops(response.stops);
            const reindexedStops = reindexStops(uniqueStops);

            setStops(reindexedStops);
            setOrigin(response.origin);
            setHasSearched(true);

            // Auto-select first stop
            if (reindexedStops.length > 0) {
                const firstStopId = (reindexedStops[0] as any).id;
                setSelectedStopId(firstStopId);
                fetchWalkingRoute(firstStopId, response.origin);
            }
        } catch (err: any) {
            setError(err.message || t('stops.locationError'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!selectedPlace || !selectedPlace.coords) {
            setError(t('stops.invalidPlace'));
            return;
        }

        try {
            setError(null);
            setLoading(true);
            const { lat, lng } = selectedPlace.coords;

            if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
                setError(t('stops.invalidCoords'));
                setLoading(false);
                return;
            }

            const coords = { lat, lng };
            const response = await getNearbyStops(coords) as any;

            // 1. Lọc trùng
            const uniqueStops = deduplicateStops(response.stops);
            // 2. Đánh số lại (1, 2, 3...)
            const reindexedStops = reindexStops(uniqueStops);

            setStops(reindexedStops);
            setOrigin(response.origin);
            setHasSearched(true);

            if (reindexedStops.length > 0) {
                const firstStopId = (reindexedStops[0] as any).id;
                setSelectedStopId(firstStopId);
                fetchWalkingRoute(firstStopId, response.origin);
            }
        } catch (err: any) {
            setError(err.message || t('stops.noResults'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Auto-search default place on mount
        if (selectedPlace && selectedPlace.coords) {
            handleSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStopClick = async (stopId: string) => {
        setSelectedStopId(stopId);
        if (origin && stopId) {
            const stop = stops.find(s => s.id === stopId);
            if (!stop?.walkingRoute) {
                fetchWalkingRoute(stopId, origin);
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

    // --- UI Helpers ---
    const cardClass = "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden";
    
    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl min-h-screen">
            {/* Header Section */}
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:bg-transparent hover:text-orange cursor-pointer">
                <ArrowLeft className="h-4 w-4 mr-2" /> {t('stops.back')}
            </Button>

            <header className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <p className="text-sm font-semibold text-orange uppercase tracking-wider mb-1">{t('stops.quickSearch')}</p>
                        <h1 className="text-2xl md:text-3xl font-bold text-navy">
                            {t('stops.title')}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {t('stops.subtitle')}
                        </p>
                    </div>
                    
                    {/* Search Controls */}
                    <div className="w-full md:w-auto md:min-w-[500px] flex gap-2">
                        <div className="flex-1 flex items-center bg-gray-50 border-2 border-transparent hover:bg-gray-100 rounded-lg transition-all focus-within:bg-orange/5 focus-within:border-orange focus-within:ring-1 focus-within:ring-orange relative z-50">
                            <div className="flex-1">
                                <PlaceAutocomplete
                                    value={selectedPlace}
                                    onChange={handlePlaceSelect}
                                    placeholder={t('stops.placeholder')}
                                    className="border-none shadow-none bg-transparent focus-visible:ring-0 w-full h-11" 
                                />
                            </div>
                            <div className="pr-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-100/50 rounded-full transition-all cursor-pointer"
                                    onClick={handleFindNearby}
                                    disabled={geoLoading || loading}
                                    title={t('home.getCurrentLocation')}
                                >
                                    {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <Button
                            onClick={handleSearch}
                            disabled={!selectedPlace || loading}
                            className="bg-navy hover:bg-navy/90 text-white h-auto px-6 cursor-pointer"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Search className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center">
                        <Info className="h-4 w-4 mr-2" /> {error}
                    </div>
                )}
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Map */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={`${cardClass} h-[500px] relative z-0`}>
                        {hasSearched && origin ? (
                            <WalkingRouteMap
                                origin={origin}
                                stops={stops}
                                selectedStopId={selectedStopId || undefined}
                                onStopSelect={handleStopClick}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                                <MapIcon className="h-16 w-16 mb-4 opacity-20" />
                                <p>{t('stops.mapPlaceholder')}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Stats Summary */}
                    {stops.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <article className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">{t('stops.numStops')}</h3>
                                <p className="text-xl font-bold text-navy">{stops.length}</p>
                            </article>
                            <article className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">{t('stops.nearestStop')}</h3>
                                <p className="text-xl font-bold text-navy">
                                    {stops[0]?.distanceText || 'N/A'}
                                </p>
                            </article>
                        </div>
                    )}
                </div>

                {/* Right Column: Stops List */}
                <div className={`${cardClass} h-[600px] flex flex-col`}>
                    <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                            {t('stops.stopsList')}
                            {stops.length > 0 && <span className="text-sm font-normal text-gray-500">({stops.length})</span>}
                        </h2>
                        {stops.length > 0 && (
                             <p className="text-xs text-gray-500 mt-1">
                                {t('stops.selectStopPrompt')}
                             </p>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
                        {stops.length > 0 ? (
                            stops.map((stop) => {
                                const isSelected = stop.id === selectedStopId;
                                return (
                                    <div
                                        key={stop.id}
                                        onClick={() => handleStopClick(stop.id)}
                                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer group ${
                                            isSelected
                                                ? 'bg-orange/5 border-orange shadow-sm'
                                                : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Badge Number: Hiển thị orderNumber mới đã re-index */}
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                                                isSelected
                                                    ? 'bg-orange text-white'
                                                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                            }`}>
                                                {stop.orderNumber}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-navy' : 'text-gray-700'}`}>
                                                    {stop.displayName || stop.name}
                                                </h4>
                                                
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <span>{stop.distanceText}</span>
                                                    <span>•</span>
                                                    <span>{Math.round(stop.walkingDuration || 0)} {t('stops.minutesWalk')}</span>
                                                </div>

                                                {/* Bus Routes Tags */}
                                                {stop.busRoutes && stop.busRoutes.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {stop.busRoutes.slice(0, 3).map((route: any) => (
                                                            <span 
                                                                key={route.id}
                                                                className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm bg-navy"
                                                            >
                                                                {route.name}
                                                            </span>
                                                        ))}
                                                        {stop.busRoutes.length > 3 && (
                                                            <span className="text-[10px] text-gray-400 self-center">+{stop.busRoutes.length - 3}</span>
                                                        )}
                                                    </div>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => handleShowDetail(stop, e)}
                                                    className={`mt-2 h-7 px-0 text-xs hover:bg-transparent cursor-pointer ${isSelected ? 'text-orange' : 'text-blue-600'}`}
                                                >
                                                    {t('stops.viewDetails')} <Info className="h-3 w-3 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">{t('stops.noResults')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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