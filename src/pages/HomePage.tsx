import SearchForm from '@/components/SearchForm';
import NearbyStops from '@/components/NearbyStops';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Shield } from 'lucide-react';

const FEATURE_CARDS = [
    {
        title: 'Tìm chuyến đi tối ưu',
        description: 'So sánh nhanh lộ trình nhanh nhất, ít chuyển tuyến và chi phí tiết kiệm.',
        icon: <Navigation className="h-6 w-6 text-white" />,
        color: 'bg-blue-500'
    },
    {
        title: 'Chi tiết từng bước',
        description: 'Xem bản đồ, hướng dẫn di chuyển, trạng thái trễ/chậm theo thời gian thực.',
        icon: <MapPin className="h-6 w-6 text-white" />,
        color: 'bg-orange'
    },
    {
        title: 'Lưu và đồng bộ',
        description: 'Đăng nhập để lưu lộ trình yêu thích và đồng bộ giữa các thiết bị.',
        icon: <Shield className="h-6 w-6 text-white" />,
        color: 'bg-green-500'
    },
];

export default function HomePage() {
    const navigate = useNavigate();

    const handleSearch = ({ from, to }: { from: any; to: any }) => {
        navigate('/results', { state: { from, to } });
    };


    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <section className="bg-navy text-white pt-16 pb-24 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-orange rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <p className="text-orange font-semibold tracking-wider uppercase text-sm">Lộ trình tàu & xe buýt giả lập</p>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                Định tuyến dễ dàng, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-yellow-400">tối ưu từng hành trình.</span>
                            </h1>
                            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
                                Ứng dụng giúp bạn tìm tuyến công cộng nhanh nhất, ít lần chuyển nhất hoặc tiết kiệm nhất dựa trên dữ liệu địa phương.
                            </p>
                        </div>

                        <div className="w-full max-w-md mx-auto lg:ml-auto">
                            <SearchForm onSubmit={handleSearch} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="container mx-auto px-4 -mt-16 relative z-20 mb-16">
                <div className="grid md:grid-cols-3 gap-6">
                    {FEATURE_CARDS.map((card) => (
                        <article key={card.title} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:transform hover:-translate-y-1 transition-all duration-300">
                            <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4 shadow-md`}>
                                {card.icon}
                            </div>
                            <h3 className="text-xl font-bold text-navy mb-2">{card.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{card.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Nearby Stops - Full Width */}
            <section className="pb-16">
                <NearbyStops />
            </section>
        </div>
    );
}
