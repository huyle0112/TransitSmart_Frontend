import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
    const { user, logout, isAdmin } = useAuth();

    const navLinks = [
        { to: "/", label: "Tìm lộ trình" },
        { to: "/lines", label: "Tra cứu tuyến" },
        { to: "/stops", label: "Tra cứu điểm dừng" },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="sticky top-0 z-1100 w-full bg-navy text-white shadow-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center font-bold text-white shadow-sm group-hover:bg-orange-hover transition-colors">
                        T
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Transit<span className="text-orange">Smart</span>
                    </span>
                </Link>

                <nav className="hidden md:flex gap-6">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors ${isActive
                                    ? "text-orange"
                                    : "text-gray-300 hover:text-white"
                                }`
                            }
                            end={link.to === "/"}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="text-sm text-gray-300 hover:text-white hidden sm:inline-flex items-center gap-2">
                                <span>Xin chào, {user.name || user.email}</span>
                                {isAdmin && <span className="text-[10px] px-2 py-1 rounded-full border border-white/30 uppercase">Admin</span>}
                            </Link>
                            {isAdmin && (
                                <Link to="/admin/users" className="hidden md:inline-block">
                                    <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                                        Quản trị
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="text-sm text-white hover:bg-white/10 hover:text-white"
                                size="sm"
                            >
                                Đăng xuất
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" state={{ mode: 'login' }}>
                                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white font-medium">
                                    Đăng nhập
                                </Button>
                            </Link>

                            <div className="h-6 w-px bg-white/20 mx-2 hidden md:block"></div>
                            <Link to="/register" state={{ mode: 'register' }}>
                                <Button variant="default" size="sm" className="bg-orange hover:bg-orange-hover text-white border-none shadow-lg shadow-orange/20 font-bold px-4">
                                    Đăng ký
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
