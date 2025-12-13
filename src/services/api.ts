import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
    baseURL: `${API_BASE}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token: string | null) => {
    if (token) {
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common.Authorization;
    }
};

const unwrap = <T>(promise: Promise<{ data: T }>): Promise<T> => promise.then((res) => res.data);

export const findRoutes = (payload: any) => unwrap(apiClient.post('/route/find', payload));

export const getRouteDetails = (routeId: string) =>
    unwrap(apiClient.get('/route/details', { params: { id: routeId } }));

export const getNearbyStops = (coords: { lat: number; lng: number }) =>
    unwrap(apiClient.get('/nearby', { params: coords }));

export const searchLines = (query: string) =>
    unwrap(apiClient.get('/search/line', { params: { q: query } }));

export const getLineDetails = (id: string) =>
    unwrap(apiClient.get('/search/line/details', { params: { id } }));

export const register = (payload: any) => unwrap(apiClient.post('/auth/register', payload));

export const login = (payload: any) => unwrap(apiClient.post('/auth/login', payload));

export const getCurrentUser = () => unwrap(apiClient.get('/auth/me'));

export const fetchProfile = () => unwrap(apiClient.get('/user/me'));

export const getFavorites = () => unwrap(apiClient.get('/user/favorites'));

export const saveFavorite = (payload: any) => unwrap(apiClient.post('/user/favorites', payload));

export const removeFavorite = (routeId: string) =>
    unwrap(apiClient.delete('/user/favorites', { params: { id: routeId } }));

export const getHistory = () => unwrap(apiClient.get('/user/history'));

export const addHistory = (payload: any) => unwrap(apiClient.post('/user/history', payload));

export const deleteHistory = (id: string) => unwrap(apiClient.delete(`/user/history/${id}`));

// Aliases for older imports
export const saveSearchHistory = addHistory;

// Stop endpoints
export const getAllStops = () => unwrap(apiClient.get('/stop'));

export const getStopById = (stopId: string) =>
    unwrap(apiClient.get(`/stop/${stopId}`));

export const getStopWithTimes = (stopId: string) =>
    unwrap(apiClient.get(`/stop/${stopId}/times`));

export const createStop = (payload: any) =>
    unwrap(apiClient.post('/stop', payload));

// Bus Routes API
export const searchBusRoutes = (query: string) =>
    unwrap(apiClient.get('/bus-lines/search', { params: { q: query } }));

export const getBusLineDetails = (name: string) =>
    unwrap(apiClient.get('/bus-lines/details', { params: { name } }));

export const getBusRouteSchedule = (routeId: string) =>
    unwrap(apiClient.get('/bus-lines/schedule', { params: { routeId } }));

// Admin Bus Routes API
export const createBusRoute = (data: any) => unwrap(apiClient.post('/bus-lines', data));

export const updateBusRoute = (id: string, data: any) => unwrap(apiClient.put(`/bus-lines/${id}`, data));

export const deleteBusRoute = (id: string) => unwrap(apiClient.delete(`/bus-lines/${id}`));

// Reviews API
export const getReviews = (targetType: string, targetId: string) =>
    unwrap(apiClient.get('/reviews', { params: { targetType, targetId } }));

export const submitReview = (payload: any) => unwrap(apiClient.post('/reviews', payload));
export const deleteReview = (id: string) => unwrap(apiClient.delete(`/reviews/${id}`));

// Admin users API
export const getUsers = () => unwrap(apiClient.get('/admin/users'));
export const getUsersAdmin = getUsers;

export const updateUserRole = (id: string, role: string) =>
    unwrap(apiClient.patch(`/admin/users/${id}/role`, { role }));

export const deleteUser = (id: string) => unwrap(apiClient.delete(`/admin/users/${id}`));
export const deleteUserAdmin = deleteUser;

// Health check endpoint
export const healthCheck = () =>
    unwrap(apiClient.get('/health', { baseURL: API_BASE }));

export default apiClient;
