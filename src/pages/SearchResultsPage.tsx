import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FilterTabs from '@/components/FilterTabs';
import RouteSummaryCard from '@/components/RouteSummaryCard';
import { findRoutes, saveFavorite, saveSearchHistory } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateError } from '@/utils/errorTranslator';

export default function SearchResultsPage() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [activeFilter, setActiveFilter] = useState('fastest');
    const [routes, setRoutes] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const searchPayload =
        location.state ||
        JSON.parse(sessionStorage.getItem('last-search') || 'null');

    useEffect(() => {
        if (location.state) {
            sessionStorage.setItem('last-search', JSON.stringify(location.state));
        }
    }, [location.state]);

    useEffect(() => {
        const runSearch = async () => {
            if (!searchPayload?.from || !searchPayload?.to) return;
            try {
                setLoading(true);
                const response = await findRoutes({
                    from: searchPayload.from.coords,
                    to: searchPayload.to.coords,
                }) as any;

                // Handle walking route proposal
                if (response.walkingRoute) {
                    setSummary({
                        from: response.from,
                        to: response.to,
                        walkingRoute: response.walkingRoute
                    });
                    setRoutes([]);
                 } else {
                    const transformedRoutes = response.routes.map((route: any) => {
                        const transformedSegments = route.segments.map((seg: any) => ({
                            lineId: seg.lineId || 'walk',
                            lineName: seg.lineName || (seg.mode === 'walk' ? t('home.leastWalking') : 'Transit'),
                            mode: seg.mode,
                            duration: seg.duration_min || Math.ceil((seg.duration_sec || 0) / 60),
                            cost: seg.fare || 0,
                            from: seg.from_stop || 'origin',
                            to: seg.to_stop,
                            fromStopName: seg.fromStopName || (seg.from_coordinates ? searchPayload.from.label || t('home.from') : ''),
                            toStopName: seg.toStopName,
                            from_coordinates: seg.from_coordinates,
                            to_coordinates: seg.to_coordinates,
                            waiting_time_sec: seg.waiting_time_sec
                        }));

                        return {
                            id: route.route_id,
                            title: route.summary || 'Route',
                            filters: route.filters || [],
                            from: {
                                id: route.origin_stop?.id,
                                name: route.origin_stop?.name || searchPayload.from.label,
                                coords: {
                                    lat: route.origin_stop?.lat,
                                    lng: route.origin_stop?.lon
                                }
                            },
                            to: {
                                name: searchPayload.to.label || t('home.to'),
                                coords: route.destination_coordinates
                            },
                            segments: transformedSegments,
                            summary: {
                                totalDuration: Math.ceil((route.details?.total_time_sec || 0) / 60),
                                totalCost: route.details?.total_fare || 0,
                                transfers: route.details?.transfers_count || 0,
                                startWalkTime: Math.ceil((route.details?.walking_time_sec || 0) / 60)
                            },
                            details: route.details
                        };
                    });
                    setRoutes(transformedRoutes);
                    setSummary({ from: response.from, to: response.to });
                }

                // Ghi lại lịch sử tìm kiếm cho người dùng đã đăng nhập
                if (isAuthenticated) {
                    saveSearchHistory({
                        from: searchPayload.from,
                        to: searchPayload.to,
                    }).catch(() => {
                        /* ignore history errors to keep UX smooth */
                    });
                }
            } catch (err: any) {
                setError(
                    translateError(err?.response?.data?.message || 'Không tìm thấy lộ trình phù hợp. Vui lòng thử lại.', t)
                );
            } finally {
                setLoading(false);
            }
        };

        runSearch();
    }, [searchPayload, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

    const sortedRoutes = useMemo(() => {
        if (!routes.length) return [];
        const target = routes.find((route) => route.filters?.includes(activeFilter));
        if (!target) return routes;
        const others = routes.filter((route) => route.id !== target.id);
        return [target, ...others];
    }, [routes, activeFilter]);

    const handleSaveFavorite = async (routeId: string) => {
        if (!isAuthenticated) {
            setToast(t('errors.loginRequiredToSave'));
            navigate('/profile');
            return;
        }
        try {
            await saveFavorite({ routeId });
            setToast(t('errors.savedToFavorites'));
        } catch (err: any) {
            setToast(translateError(err?.response?.data?.message || 'Không thể lưu lộ trình.', t));
        }
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    if (!searchPayload) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-gray-600">{t('searchResults.noRouteEntered')}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <header className="mb-8">
                <div className="mb-4">
                    <p className="text-sm font-semibold text-orange uppercase tracking-wider">
                        {t('searchResults.fromTo', { from: summary?.from?.name, to: summary?.to?.name })}
                    </p>
                    <h1 className="text-3xl font-bold text-navy">{t('searchResults.title')}</h1>
                </div>
                {!summary?.walkingRoute && <FilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />}
            </header>

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-orange" />
                    <span className="ml-2 text-gray-600">{t('searchResults.searchingOptimal')}</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                    {error}
                </div>
            )}

            {/* Show walking proposal if close */}
            {summary?.walkingRoute && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-green-800 mb-2">🚶 {t('searchResults.walkingProposal')}</h2>
                    <p className="text-lg text-green-900 mb-4">
                        {summary.walkingRoute.message}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-green-800">
                        <p><strong>{t('searchResults.distance')}</strong> {(summary.walkingRoute.distance * 1000).toFixed(0)} {t('searchResults.meters')}</p>
                        <p><strong>{t('searchResults.expectedTime')}</strong> {summary.walkingRoute.duration} {t('searchResults.minutes')}</p>
                    </div>
                    <p className="mt-4 text-green-700 text-sm italic">
                        {t('searchResults.walkingTip')}
                    </p>
                </div>
            )}

            <div className="grid gap-6">
                {sortedRoutes.map((route, index) => (
                    <RouteSummaryCard
                        key={route.id}
                        route={route}
                        highlight={index === 0}
                        onSaveFavorite={handleSaveFavorite}
                    />
                ))}
            </div>

            {!loading && !error && !summary?.walkingRoute && sortedRoutes.length === 0 && (
                <p className="bg-gray-50 text-gray-600 p-8 rounded-xl text-center">
                    {t('searchResults.noRouteFound')}
                </p>
            )}

            {toast && (
                <div className="fixed bottom-4 right-4 bg-navy text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4">
                    {toast}
                </div>
            )}
        </div>
    );
}
