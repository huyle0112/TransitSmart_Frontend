import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, ArrowRight, Heart } from 'lucide-react';

interface RouteSummaryCardProps {
    route: any;
    highlight?: boolean;
    onSaveFavorite?: (routeId: string) => void;
}

export default function RouteSummaryCard({
    route,
    highlight,
    onSaveFavorite,
}: RouteSummaryCardProps) {
    return (
        <article className={`bg-white rounded-xl p-5 shadow-sm border transition-all hover:shadow-md ${highlight ? 'border-orange ring-1 ring-orange/20' : 'border-gray-100'
            }`}>
            <header className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs font-semibold text-orange uppercase tracking-wider mb-1">{route.title}</p>
                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                        {route.from.name} <ArrowRight className="h-4 w-4 text-gray-400" /> {route.to.name}
                    </h3>
                </div>
                <span className="flex items-center gap-1 text-lg font-bold text-navy bg-gray-50 px-3 py-1 rounded-lg">
                    <Clock className="h-4 w-4 text-orange" />
                    {route.details?.total_time_sec ? Math.ceil(route.details.total_time_sec / 60) : route.summary?.totalDuration || 0}p
                </span>
            </header>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-50">
                <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Chi phí: {route.details?.transfers_count ? (route.details.transfers_count * 7000).toLocaleString() : route.summary?.totalCost?.toLocaleString() || 0}₫
                </span>
                <span>•</span>
                <span>{route.details?.transfers_count || route.summary?.transfers || 0} lần chuyển tuyến</span>
                {route.details?.walking_time_sec && (
                    <>
                        <span>•</span>
                        <span>Đi bộ: {Math.ceil(route.details.walking_time_sec / 60)} phút</span>
                    </>
                )}
                {route.summary?.startWalkTime > 0 && (
                    <>
                        <span>•</span>
                        <span>Đi bộ tới trạm: {route.summary.startWalkTime} phút</span>
                    </>
                )}
            </div>

            <ul className="flex flex-wrap gap-2 mb-4">
                {route.segments.map((segment: any, idx: number) => (
                    <li key={`${segment.lineId}-${segment.from_stop || segment.from}-${segment.to_stop || segment.to}-${idx}`} className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${segment.mode === 'walk'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                            {segment.mode === 'walk' ? 'Đi bộ' : segment.lineName}
                        </span>
                        <span className="text-xs text-gray-500">{segment.duration_min || segment.duration}p</span>
                        {idx < route.segments.length - 1 && <span className="text-gray-300">→</span>}
                    </li>
                ))}
            </ul>

            <footer className="flex justify-between items-center pt-2">
                <Link to={`/route/${route.route_id || route.id}`}>
                    <Button variant="outline" size="sm" className="border-orange text-orange hover:bg-orange hover:text-white">
                        Xem chi tiết
                    </Button>
                </Link>
                {onSaveFavorite && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSaveFavorite(route.route_id || route.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                        <Heart className="h-4 w-4 mr-1" />
                        Lưu
                    </Button>
                )}
            </footer>
        </article>
    );
}
