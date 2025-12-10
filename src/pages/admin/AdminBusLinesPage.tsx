import AdminBusRouteList from '@/components/admin/AdminBusRouteList';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminBusLinesPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center">
            <LayoutDashboard className="mr-2 h-6 w-6 text-orange" />
            Quản lý tuyến buýt
          </h1>
          <p className="text-gray-500 mt-1">
            Thêm, sửa, xóa các tuyến buýt trong hệ thống.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate('/')}>
          Về trang chủ
        </Button>
      </div>

      <AdminBusRouteList />
    </div>
  );
}
