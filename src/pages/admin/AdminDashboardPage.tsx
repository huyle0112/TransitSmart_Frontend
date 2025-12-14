import { useEffect, useState } from 'react';
import { getAdminStats } from '@/services/api';
import { Loader2, Users, Lock, Map, Star, Activity } from 'lucide-react';

const cards = [
  { key: 'usersTotal', label: 'Tổng người dùng', icon: Users, color: 'text-navy' },
  { key: 'usersActive', label: 'Người dùng hoạt động', icon: Activity, color: 'text-green-600' },
  { key: 'usersLocked', label: 'Tài khoản bị khóa', icon: Lock, color: 'text-red-500' },
  { key: 'reviews', label: 'Đánh giá', icon: Star, color: 'text-orange' },
  { key: 'routes', label: 'Tuyến', icon: Map, color: 'text-purple-500' },
  { key: 'stops', label: 'Trạm', icon: Map, color: 'text-blue-500' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAdminStats() as any;
        setStats(data);
        setError(null);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải thống kê.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cardValue = (key: string) => {
    if (!stats) return 0;
    switch (key) {
      case 'usersTotal': return stats.users?.total || 0;
      case 'usersActive': return stats.users?.active || 0;
      case 'usersLocked': return stats.users?.locked || 0;
      case 'reviews': return stats.totalReviews || 0;
      case 'routes': return stats.totalRoutes || 0;
      case 'stops': return stats.totalStops || 0;
      default: return 0;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Dashboard Quản trị</h1>
        <p className="text-gray-500 text-sm">Tổng quan người dùng, đánh giá và dữ liệu tuyến/trạm.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Đang tải...
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.key} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className={`flex items-center justify-between text-sm font-semibold ${c.color}`}>
                  <span>{c.label}</span>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-2 text-3xl font-bold text-navy">{cardValue(c.key)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
