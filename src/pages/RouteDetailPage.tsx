import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SimpleMapViewer from '@/components/SimpleMapViewer';
import StepList from '@/components/StepList';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getRouteDetails, saveFavorite } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';

export default function RouteDetailPage() {
    const { routeId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [route, setRoute] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        const loadDetails = async () => {
            try {
                setLoading(true);
                if (!routeId) throw new Error('Thiếu ID lộ trình');
                const data = await getRouteDetails(routeId);
                setRoute(data);
                setError(null);
            } catch (err: any) {
                console.error('Error loading route:', err);
                setError(err?.response?.data?.message || 'Không thể tải chi tiết lộ trình.');
            } finally {
                setLoading(false);
            }
        };

        if (routeId) {
            loadDetails();
        } else {
            setError('Thiếu ID lộ trình');
            setLoading(false);
        }
    }, [routeId]);

    const handleSave = async () => {
        if (!isAuthenticated) {
            setToast('Đăng nhập để lưu lộ trình.');
            navigate('/profile');
            return;
        }
        try {
            if (!routeId) return;
            await saveFavorite({ routeId });
            setToast('Đã lưu vào yêu thích.');
        } catch (err: any) {
            setToast(err?.response?.data?.message || 'Không thể lưu lộ trình này.');
        }
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-orange" />
                <span className="ml-2 text-gray-600">Đang tải chi tiết lộ trình...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                    {error}
                </div>
                <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
                </Button>
            </div>
        );
    }

    if (!route) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p>Không tìm thấy lộ trình.</p>
                <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
                </Button>
            </div>
        );
    }

    const realtimeAvailable = route.steps && route.steps.some((step: any) => step.status);

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:bg-transparent hover:text-orange">
                <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
            </Button>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <p className="text-sm font-semibold text-orange uppercase tracking-wider mb-1">{route.title}</p>
                    <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">
                        {route.from.name} → {route.to.name}
                    </h1>
                    <p className="text-gray-600">
                        Khởi hành: {new Date(route.summary.departureTime).toLocaleTimeString()} •
                        Dự kiến đến: {new Date(route.summary.arrivalTime).toLocaleTimeString()}
                    </p>
                </div>
                <Button onClick={handleSave} variant="outline" className="border-orange text-orange hover:bg-orange hover:text-white">
                    <Heart className="h-4 w-4 mr-2" />
                    Lưu lộ trình
                </Button>
            </header>

            {route.notices && route.notices.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
                    {route.notices.map((notice: string, idx: number) => (
                        <p key={idx} className="text-blue-800 flex items-start gap-2">
                            <span>ℹ️</span> {notice}
                        </p>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ErrorBoundary>
                        <div className="h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                            <SimpleMapViewer
                                coordinates={route.coordinates || []}
                                geometries={route.geometries || []}
                                segments={route.segments || []}
                            />
                        </div>
                    </ErrorBoundary>

                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <article className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Tổng thời gian</h3>
                            <p className="text-xl font-bold text-navy">{route.summary.totalDuration} phút</p>
                        </article>
                        <article className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Chi phí ước tính</h3>
                            <p className="text-xl font-bold text-navy">{route.summary.totalCost.toLocaleString()}₫</p>
                        </article>
                        <article className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Số lần chuyển tuyến</h3>
                            <p className="text-xl font-bold text-navy">{route.summary.transfers}</p>
                        </article>
                    </section>

                    {!realtimeAvailable && (
                        <p className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm border border-yellow-100">
                            ⚠️ Dữ liệu thời gian thực hiện chưa khả dụng. Hiển thị theo lịch trình cố định.
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                    <h2 className="text-lg font-bold text-navy mb-6 pb-4 border-b border-gray-100">Chi tiết từng bước</h2>
                    {route.steps && route.steps.length > 0 ? (
                        <StepList steps={route.steps} />
                    ) : (
                        <p className="text-gray-500 text-center py-8">Không có thông tin chi tiết.</p>
                    )}
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-4 right-4 bg-navy text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4">
                    {toast}
                </div>
            )}
        </div>
    );
}
