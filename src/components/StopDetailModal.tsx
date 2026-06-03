import { X, MapPin, Clock, Bus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface StopDetailModalProps {
    stop: any;
    onClose: () => void;
}

export default function StopDetailModal({ stop, onClose }: StopDetailModalProps) {
    const { t } = useTranslation();
    if (!stop) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-navy to-orange text-white p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/20 rounded-full">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">
                                {stop.displayName || stop.name}
                            </h2>
                            <div className="flex items-center gap-4 text-sm opacity-90">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {stop.distanceText}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    ~{Math.round(stop.walkingDuration)} {t('stops.minutesWalk')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] scrollbar-thin scrollbar-thumb-gray-200">
                    {/* Bus Routes Section */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Bus className="h-5 w-5 text-navy" />
                            <h3 className="text-lg font-bold text-navy">
                                {t('stops.passingRoutes')}
                            </h3>
                        </div>

                        {stop.busRoutes && stop.busRoutes.length > 0 ? (
                            <div className="space-y-3">
                                {stop.busRoutes.map((route: any) => (
                                    <div
                                        key={route.id}
                                        className="p-4 border-2 border-gray-100 rounded-lg hover:border-orange/30 hover:bg-orange/5 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                {/* Badge số tuyến - ĐÃ SỬA: Ép dùng màu Navy */}
                                                <span
                                                    className="px-3 py-1.5 rounded-lg font-bold text-white text-lg shadow-sm bg-navy"
                                                    // Bỏ style backgroundColor từ API
                                                >
                                                    {route.name}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-navy">
                                                        {t('stops.route')} {route.name}
                                                    </p>
                                                    {route.destinationName && (
                                                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                                                            <ArrowRight className="h-3.5 w-3.5" />
                                                            <span className="font-medium">
                                                                {t('stops.toDestination', { destination: route.destinationName })}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Next Arrivals - ĐÃ SỬA: Đồng bộ màu Navy/Cam */}
                                        <div className="bg-navy/5 p-3 rounded-lg border border-navy/10">
                                            <p className="text-xs font-semibold text-navy mb-2 flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {t('stops.upcomingBuses')}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                {route.nextArrivals && route.nextArrivals.map((time: number, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        // Highlight màu cam cho xe sắp đến nhất
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                                                            idx === 0
                                                                ? 'bg-orange text-white border-orange shadow-sm'
                                                                : 'bg-white text-navy border-gray-200'
                                                        }`}
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                        <span className="font-bold text-lg">
                                                            {time}
                                                        </span>
                                                        <span className="text-sm">{t('routeDetail.mins')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {route.nextArrivals && route.nextArrivals[0] && (
                                                <p className="text-xs text-gray-500 mt-2 font-medium">
                                                    {route.nextArrivals[0] <= 3
                                                        ? t('stops.busArriving')
                                                        : route.nextArrivals[0] <= 5
                                                        ? t('stops.busApproaching')
                                                        : t('stops.timeToWait')}
                                                </p>
                                            )}
                                        </div>

                                        {/* Frequency Info */}
                                        <div className="mt-3 flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                {t('stops.frequency')}: <span className="font-semibold text-navy">{t('stops.frequencyValue')}</span>
                                            </span>
                                            <span className="text-gray-600">
                                                {t('stops.fare')}: <span className="font-semibold text-orange">{t('routeCard.cost', { cost: '7,000' }).replace(/^[^:]+:\s*/, '')}</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Bus className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>{t('stops.noRoutesInfo')}</p>
                            </div>
                        )}
                    </div>

                    {/* Stop Info */}
                    <div className="border-t border-gray-100 pt-4">
                        <h4 className="font-semibold text-navy mb-3">{t('stops.stopInfo')}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-gray-500 mb-1 font-medium">{t('stops.distance')}</p>
                                <p className="font-bold text-navy">{stop.distanceText}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-gray-500 mb-1 font-medium">{t('stops.walkingDuration')}</p>
                                <p className="font-bold text-navy">~{Math.round(stop.walkingDuration)} {t('routeDetail.mins')}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-gray-500 mb-1 font-medium">{t('stops.numRoutes')}</p>
                                <p className="font-bold text-navy">
                                    {t('stops.routesCount', { count: stop.busRoutes ? stop.busRoutes.length : 0 })}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-gray-500 mb-1 font-medium">{t('stops.stopType')}</p>
                                <p className="font-bold text-navy capitalize">{stop.type || t('stops.stop')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4 bg-gray-50 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        {t('stops.close')}
                    </Button>
                    <Button
                        className="flex-1 bg-navy hover:bg-navy/90 text-white"
                        onClick={() => {
                            console.log('Navigate to route with stop:', stop.id);
                            onClose();
                        }}
                    >
                        {t('stops.findRoutesFromHere')}
                    </Button>
                </div>
            </div>
        </div>
    );
}