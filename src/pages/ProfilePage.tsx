import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProfile, removeFavorite, deleteHistory } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Eye, History, ShieldCheck } from 'lucide-react';

interface FavoriteItem {
    id: string;
    routeId: string;
    label: string;
    savedAt?: string;
}

interface HistoryItem {
    id: string;
    from?: { label: string; coords?: { lat: number; lng: number } } | null;
    to?: { label: string; coords?: { lat: number; lng: number } } | null;
    createdAt?: string;
}

export default function ProfilePage() {
    const { user, isAuthenticated, isAdmin } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const data = await fetchProfile() as any;
            setFavorites(data.favorites || []);
            setHistory(data.history || []);
            setError(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Không thể tải thông tin người dùng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [isAuthenticated]);

    const handleRemoveFavorite = async (routeId: string) => {
        try {
            await removeFavorite(routeId);
            setFavorites((prev) => prev.filter((fav) => fav.routeId !== routeId && fav.id !== routeId));
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Không thể xoá lộ trình.');
        }
    };

    const handleDeleteHistory = async (id: string) => {
        try {
            await deleteHistory(id);
            setHistory((prev) => prev.filter((item) => item.id !== id));
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Không thể xoá lịch sử.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center space-y-4">
                    <h2 className="text-2xl font-bold text-navy">Đăng nhập để đồng bộ</h2>
                    <p className="text-gray-500 text-sm">Lưu lộ trình yêu thích, đánh giá trạm và xem lại lịch sử tìm kiếm trên mọi thiết bị.</p>
                    <div className="flex gap-3 justify-center">
                        <Link to="/login">
                            <Button className="bg-orange text-white">Đăng nhập</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="outline" className="border-orange text-orange">Đăng ký</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
            <header className="p-6 bg-navy text-white rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <p className="text-orange text-sm font-semibold uppercase tracking-wider mb-1">Xin chào</p>
                    <h1 className="text-3xl font-bold mb-1">{user?.name || user?.email}</h1>
                    <p className="text-white/70 text-sm">{user?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <Link to="/admin/users">
                            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" /> Quản trị người dùng
                            </Button>
                        </Link>
                    )}
                    <Link to="/admin/bus-lines">
                        <Button variant="ghost" className="text-white hover:bg-white/10">Trang quản lý tuyến</Button>
                    </Link>
                </div>
            </header>

            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-orange" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-navy">Lộ trình đã lưu</h2>
                            <span className="text-sm text-gray-500">{favorites.length} mục</span>
                        </div>

                        {favorites.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                Chưa có lộ trình nào. Thử tìm kiếm và lưu lại nhé!
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {favorites.map((fav) => (
                                    <li key={fav.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                                        <div>
                                            <strong className="block text-navy text-lg mb-1">{fav.label}</strong>
                                            <p className="text-sm text-gray-500">Lưu lúc: {fav.savedAt ? new Date(fav.savedAt).toLocaleString() : '—'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link to={`/route/${fav.routeId}`}>
                                                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                    <Eye className="h-4 w-4 mr-1" /> Xem lại
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveFavorite(fav.routeId)}
                                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                                <History className="h-5 w-5 text-orange" /> Lịch sử tìm kiếm
                            </h2>
                            <span className="text-sm text-gray-500">{history.length} mục</span>
                        </div>

                        {history.length === 0 ? (
                            <p className="text-sm text-gray-500">Chưa có lịch sử được lưu.</p>
                        ) : (
                            <ul className="space-y-3">
                                {history.map((item) => (
                                    <li key={item.id} className="flex items-start justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <div>
                                            <p className="font-semibold text-navy text-sm">{item.from?.label || 'Điểm đi'} → {item.to?.label || 'Điểm đến'}</p>
                                            <p className="text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteHistory(item.id)}
                                            className="text-gray-400 hover:text-red-500"
                                            title="Xoá lịch sử"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
