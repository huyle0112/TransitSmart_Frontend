import { useState } from 'react';
import BusRouteMapViewer from './BusRouteMapViewer';
import BusRouteStepList from './BusRouteStepList';
import { Button } from './ui/button';

/**
 * Demo component showing OSRM-integrated bus route visualization
 * Uses the JSON format from your backend API
 */
export default function BusRouteDemo() {
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  // Sample data matching your JSON format
  const sampleRouteData = {
    "from": {
      "lat": 21.025097,
      "lng": 105.780674
    },
    "to": {
      "lat": 20.991275,
      "lng": 105.839416
    },
    "departure_time": "08:00:00",
    "total_routes_found": 4,
    "routes": [
      {
        "route_id": "21B_1_S27_dest_2_0",
        "max_transfers": 2,
        "origin_stop": {
          "id": "21B_1_S27",
          "name": "Bến Đường cao tốc Vành đai 3",
          "lat": 21.02315,
          "lon": 105.778875,
          "distance_from_origin": 285.8954255234752
        },
        "destination_coordinates": {
          "lat": 20.991275,
          "lng": 105.839416
        },
        "summary": "2 tuyến, 1 lần chuyển, tổng 3124",
        "details": {
          "total_time_sec": 3124,
          "walking_time_sec": 291,
          "transit_time_sec": 2833,
          "transfers_count": 2
        },
        "segments": [
          {
            "lineId": "29_1",
            "lineName": "29",
            "mode": "bus",
            "duration_sec": 252,
            "duration_min": 4,
            "from_stop": "29_1_S23",
            "to_stop": "29_1_S25",
            "departure_time": "08:01:05",
            "arrival_time": "08:05:17",
            "trip_id": "29_1_AM_5",
            "fromStopName": "Bến Đường cao tốc Vành đai 3",
            "fromStopLat": 21.02315,
            "fromStopLon": 105.778875,
            "toStopName": "Bến Đường Phạm Văn Đồng",
            "toStopLat": 21.034649,
            "toStopLon": 105.780275
          },
          {
            "lineId": "16_1",
            "lineName": "16",
            "mode": "bus",
            "duration_sec": 2416,
            "duration_min": 40,
            "from_stop": "16_1_S3",
            "to_stop": "16_1_S19",
            "departure_time": "08:05:37",
            "arrival_time": "08:45:53",
            "trip_id": "16_1_AM_10",
            "fromStopName": "Bến Đường Phạm Văn Đồng",
            "fromStopLat": 21.034649,
            "fromStopLon": 105.780275,
            "toStopName": "Bến Đường Giải Phóng",
            "toStopLat": 20.98785,
            "toStopLon": 105.840791
          }
        ]
      },
      {
        "route_id": "16_1_S2_dest_1_0",
        "max_transfers": 1,
        "origin_stop": {
          "id": "16_1_S2",
          "name": "Bến Đường Phạm Hùng",
          "lat": 21.027766,
          "lon": 105.779302,
          "distance_from_origin": 329.1748021867325
        },
        "destination_coordinates": {
          "lat": 20.991275,
          "lng": 105.839416
        },
        "summary": "1 tuyến, 0 lần chuyển, tổng 3124",
        "details": {
          "total_time_sec": 3124,
          "walking_time_sec": 241,
          "transit_time_sec": 2883,
          "transfers_count": 1
        },
        "segments": [
          {
            "lineId": "16_1",
            "lineName": "16",
            "mode": "bus",
            "duration_sec": 2601,
            "duration_min": 43,
            "from_stop": "16_1_S2",
            "to_stop": "16_1_S19",
            "departure_time": "08:02:32",
            "arrival_time": "08:45:53",
            "trip_id": "16_1_AM_10",
            "fromStopName": "Bến Đường Phạm Hùng",
            "fromStopLat": 21.027766,
            "fromStopLon": 105.779302,
            "toStopName": "Bến Đường Giải Phóng",
            "toStopLat": 20.98785,
            "toStopLon": 105.840791
          }
        ]
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Demo: OSRM Bus Route Integration</h1>
        <p className="text-gray-600">
          Chọn một lộ trình để xem bản đồ với đường đi chính xác từ OSRM API
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Route Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-navy">Chọn lộ trình:</h2>
          {sampleRouteData.routes.map((route, index) => (
            <Button
              key={route.route_id}
              variant={selectedRoute?.route_id === route.route_id ? "default" : "outline"}
              className="w-full text-left justify-start h-auto p-4"
              onClick={() => setSelectedRoute(route)}
            >
              <div>
                <div className="font-semibold">Lộ trình {index + 1}</div>
                <div className="text-sm opacity-75">{route.summary}</div>
                <div className="text-xs opacity-60 mt-1">
                  {Math.ceil(route.details.total_time_sec / 60)} phút • {route.details.transfers_count} chuyển tuyến
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Map and Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRoute ? (
            <>
              {/* Map */}
              <div className="h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <BusRouteMapViewer
                  segments={selectedRoute.segments}
                  originCoords={sampleRouteData.from}
                  destinationCoords={sampleRouteData.to}
                />
              </div>

              {/* Step List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-navy mb-6 pb-4 border-b border-gray-100">
                  Chi tiết từng bước
                </h3>
                <BusRouteStepList
                  segments={selectedRoute.segments}
                  originCoords={sampleRouteData.from}
                  destinationCoords={sampleRouteData.to}
                  departureTime={sampleRouteData.departure_time}
                />
              </div>
            </>
          ) : (
            <div className="h-[400px] rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🗺️</div>
                <p>Chọn một lộ trình để xem bản đồ</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="mt-12 bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">✨ Tính năng mới:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <span className="text-blue-600">🛣️</span>
            <div>
              <strong>OSRM Integration:</strong> Đường đi chính xác trên đường thật, không còn đường thẳng chim bay
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600">🚌</span>
            <div>
              <strong>Bus Route Visualization:</strong> Màu sắc khác nhau cho xe buýt (xanh dương) và đi bộ (xám, nét đứt)
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600">📍</span>
            <div>
              <strong>Smart Markers:</strong> Điểm chuyển tuyến, trạm xe buýt với popup thông tin chi tiết
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600">⚡</span>
            <div>
              <strong>Loading States:</strong> Hiển thị trạng thái "Đang tải bản đồ..." khi fetch OSRM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
