import { useState } from 'react';
import BusRouteSearch from '@/components/BusRouteSearch';
import BusRouteDetail from '@/components/BusRouteDetail';
import { BusFront } from 'lucide-react';

export default function BusLinesPage() {
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-orange/10 rounded-full mr-4">
          <BusFront className="w-8 h-8 text-orange" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-navy">Tra cứu tuyến buýt</h1>
          <p className="text-gray-500 mt-1">Tìm kiếm và xem thông tin chi tiết các tuyến buýt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-navy mb-4">Tìm kiếm tuyến</h2>
            <BusRouteSearch onSelect={setSelectedRoute} />
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-navy mb-2">Thông tin hỗ trợ</h3>
            <p className="text-sm text-gray-600 mb-1">Tổng đài: <span className="font-medium text-orange">1900 1234</span></p>
            <p className="text-sm text-gray-600">Email: <span className="font-medium text-navy">hotro@transitsmart.vn</span></p>
          </div>
        </div>

        <div className="lg:col-span-8">
          {selectedRoute ? (
            <BusRouteDetail routeName={selectedRoute.name} />
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <BusFront className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-400">Chọn một tuyến để xem chi tiết</h3>
              <p className="text-sm text-gray-400 mt-1">Nhập số tuyến hoặc tên vào ô tìm kiếm bên trái</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
