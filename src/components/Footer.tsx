export default function Footer() {
    return (
        <footer className="bg-navy text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4">TransitSmart</h3>
                        <p className="text-gray-300 text-sm">
                            Ứng dụng tìm kiếm lộ trình giao thông công cộng thông minh, giúp bạn di chuyển dễ dàng hơn.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">Liên kết</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-orange transition-colors">Về chúng tôi</a></li>
                            <li><a href="#" className="hover:text-orange transition-colors">Điều khoản sử dụng</a></li>
                            <li><a href="#" className="hover:text-orange transition-colors">Chính sách bảo mật</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">Liên hệ</h3>
                        <p className="text-gray-300 text-sm">
                            Email: contact@transitsmart.com<br />
                            Phone: (84) 123 456 789
                        </p>
                    </div>
                </div>
                <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} TransitSmart. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
