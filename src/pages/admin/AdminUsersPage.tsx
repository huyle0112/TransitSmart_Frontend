import { useEffect, useState } from 'react';
import { getUsersAdmin, deleteUserAdmin, lockUser, unlockUser } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, Trash2, Lock, Unlock } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsersAdmin() as any;
      setUsers(data.users || []);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn xoá người dùng này?')) return;
    try {
      await deleteUserAdmin(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể xoá người dùng.');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center">
            <ShieldCheck className="mr-2 h-6 w-6 text-orange" />
            Quản lý người dùng
          </h1>
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
                  <th className="p-4">Tên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 hidden md:table-cell">Ngày tạo</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hoạt động</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      Chưa có người dùng.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-medium text-navy">{user.name || '—'}</td>
                      <td className="p-4 text-gray-700">{user.email}</td>
                      <td className="p-4 hidden md:table-cell text-gray-500">
                        {user.created_at ? new Date(user.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="p-4 text-gray-700">
                        {user.role === 'locked' ? (
                          <span className="text-red-500 font-semibold">Đã khóa</span>
                        ) : user.role === 'admin' ? (
                          <span className="text-green-600 font-semibold">Admin</span>
                        ) : (
                          <span className="text-gray-700">Người dùng</span>
                        )}
                      </td>
                      <td className="p-4 text-right text-gray-600">
                        {user.favoritesCount || 0} yêu thích · {user.historyCount || 0} lịch sử · {user.reviewsCount || 0} đánh giá
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {user.role === 'locked' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:bg-green-50"
                              onClick={async () => {
                                await unlockUser(user.id);
                                setUsers((prev) =>
                                  prev.map((u) => (u.id === user.id ? { ...u, role: 'user' } : u))
                                );
                              }}
                            >
                              <Unlock className="h-4 w-4 mr-1" />
                              Mở khóa
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-orange hover:bg-orange/10"
                              onClick={async () => {
                                if (!confirm('Khóa tài khoản này?')) return;
                                await lockUser(user.id);
                                setUsers((prev) =>
                                  prev.map((u) => (u.id === user.id ? { ...u, role: 'locked' } : u))
                                );
                              }}
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Khóa
                            </Button>
                          )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
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
