import { useEffect, useState } from 'react';
import { getAdminReviews, deleteReviewAdmin } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, MessageSquare } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getAdminReviews() as any;
      setReviews(data.reviews || []);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá đánh giá vi phạm?')) return;
    await deleteReviewAdmin(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-orange" />
        <div>
          <h1 className="text-2xl font-bold text-navy">Kiểm duyệt đánh giá/bình luận</h1>
          <p className="text-gray-500 text-sm">Xem và xoá các đánh giá vi phạm.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-orange" />
          </div>
        ) : error ? (
          <p className="p-6 text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                <tr>
                  <th className="p-4">Mục tiêu</th>
                  <th className="p-4">Nội dung</th>
                  <th className="p-4 hidden md:table-cell">Người gửi</th>
                  <th className="p-4 hidden md:table-cell">Thời gian</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      Chưa có đánh giá nào.
                    </td>
                  </tr>
                ) : (
                  reviews.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-semibold text-navy">{r.targetType}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{r.targetId}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-orange font-semibold">★ {r.rating || 0}</div>
                        <div className="text-gray-700 text-sm whitespace-pre-line">{r.comment || '—'}</div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-gray-700">
                        {r.user?.name || '—'}
                        <div className="text-xs text-gray-500">{r.user?.email}</div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-gray-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
