import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import RouteDetailPage from "./pages/RouteDetailPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/results" element={<SearchResultsPage />} />
                    <Route path="/lines" element={<HomePage />} />
                    <Route path="/stops" element={<HomePage />} />
                    <Route path="/route/:routeId" element={<RouteDetailPage />} />
                    <Route path="/profile" element={<HomePage />} />
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
