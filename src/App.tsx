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
import MapSearchPage from "./pages/MapSearchPage";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/map" element={<MapSearchPage />} />
                    <Route path="/results" element={<SearchResultsPage />} />
                    <Route path="/lines" element={<BusLinesPage />} />
                    <Route path="/stops" element={<HomePage />} />
                    <Route path="/route/:routeId" element={<RouteDetailPage />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Admin Routes */}
                    <Route path="/admin/bus-lines" element={<AdminBusLinesPage />} />
                </Route>

                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<div>Login Page Placeholder</div>} />
                    <Route path="/register" element={<div>Register Page Placeholder</div>} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
