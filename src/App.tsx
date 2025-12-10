import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import HomePage from "./pages/HomePage";
import BusLinesPage from "./pages/BusLinesPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import RouteDetailPage from "./pages/RouteDetailPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProfilePage from "./pages/ProfilePage";
import AdminBusLinesPage from "./pages/admin/AdminBusLinesPage";
import StopsPage from "./pages/StopsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/results" element={<SearchResultsPage />} />
                    <Route path="/lines" element={<BusLinesPage />} />
                    <Route path="/stops" element={<StopsPage />} />
                    <Route path="/route/:routeId" element={<RouteDetailPage />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Admin Routes */}
                    <Route path="/admin/bus-lines" element={<AdminBusLinesPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                </Route>

                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
