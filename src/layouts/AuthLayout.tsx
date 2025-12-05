import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="mb-8 text-center">
                <div className="w-12 h-12 bg-orange rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-md mx-auto mb-4">
                    A
                </div>
                <h1 className="text-2xl font-bold text-navy">Welcome Back</h1>
                <p className="text-secondary mt-2">Please sign in to continue</p>
            </div>

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <Outlet />
                </div>
            </div>

            <footer className="mt-8 text-center text-sm text-gray-400">
                &copy; {new Date().getFullYear()} My App. All rights reserved.
            </footer>
        </div>
    );
}
