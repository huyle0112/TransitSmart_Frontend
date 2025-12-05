import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getFavorites, removeFavorite } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Eye } from 'lucide-react';

export default function ProfilePage() {
    const { user, isAuthenticated, login, register } = useAuth();
    const location = useLocation();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'register'>(location.state?.mode || 'login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (location.state?.mode) {
            setMode(location.state.mode);
        }
    }, [location.state]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const loadFavorites = async () => {
            try {
                setLoading(true);
                const data = await getFavorites() as any;
                setFavorites(data.favorites);
            } catch (err) {
                setError('Không thể tải danh sách yêu thích.');
            } finally {
                setLoading(false);
            }
        };
        loadFavorites();
    }, [isAuthenticated]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (mode === 'login') {
                await login({ email: form.email, password: form.password });
            } else {
                await register(form);
            }
            setMessage('Đăng nhập thành công.');
            setError(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Không thể xử lý yêu cầu.');
        }
    };

    const handleRemoveFavorite = async (routeId: string) => {
        try {
            await removeFavorite(routeId);
            setFavorites((prev) => prev.filter((fav) => fav.routeId !== routeId));
        } catch (err) {
            setMessage('Không thể xoá lộ trình.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="flex border-b border-gray-100">
                        <button
                            type="button"
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-orange text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                            onClick={() => setMode('login')}
                        >
                            Đăng nhập
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'register' ? 'bg-orange text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                            onClick={() => setMode('register')}
                        >
                            Đăng ký
                        </button>
                    </div>

                    <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-navy">
                                {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-2">
                                {mode === 'login'
                                    ? 'Đăng nhập để truy cập lộ trình đã lưu của bạn'
                                    : 'Đăng ký để lưu lộ trình và đồng bộ hóa thiết bị'}
                            </p>
                        </div>

                        {mode === 'register' && (
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Họ tên</label>
                                <input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-navy ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/20 focus-visible:border-orange disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-navy ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/20 focus-visible:border-orange disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu</label>
                            <input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-navy ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/20 focus-visible:border-orange disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            />
                        </div>

                        {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
                        {message && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{message}</p>}

                        <Button type="submit" className="w-full bg-navy hover:bg-navy/90 text-white h-11">
                            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <header className="mb-8 p-6 bg-navy text-white rounded-2xl shadow-lg">
                <p className="text-orange text-sm font-semibold uppercase tracking-wider mb-1">Xin chào</p>
                <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
                <p className="text-white/70">{user?.email}</p>
            </header>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-navy mb-6 pb-4 border-b border-gray-100">Lộ trình đã lưu</h2>

                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-orange" />
                        <span className="ml-2 text-gray-500">Đang tải...</span>
                    </div>
                )}

                {!loading && favorites.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>Chưa có lộ trình nào được lưu.</p>
                        <Link to="/">
                            <Button variant="link" className="text-orange mt-2">Tìm kiếm lộ trình ngay</Button>
                        </Link>
                    </div>
                )}

                <ul className="space-y-4">
                    {favorites.map((fav) => (
                        <li key={fav.routeId} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                            <div>
                                <strong className="block text-navy text-lg mb-1">{fav.label}</strong>
                                <p className="text-sm text-gray-500">Lưu lúc: {new Date(fav.savedAt).toLocaleString()}</p>
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
            </section>
        </div>
    );
}
