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

export const findRoutes = (payload: any) =>
    unwrap(apiClient.post('/route/find', payload));

export const getRouteDetails = (routeId: string) =>
    unwrap(apiClient.get('/route/details', { params: { id: routeId } }));

export const getNearbyStops = (coords: { lat: number; lng: number }) =>
    unwrap(apiClient.get('/nearby', { params: coords }));

export const searchLines = (query: string) =>
    unwrap(apiClient.get('/search/line', { params: { q: query } }));

export const getLineDetails = (id: string) =>
    unwrap(apiClient.get('/search/line/details', { params: { id } }));

export const register = (payload: any) =>
    unwrap(apiClient.post('/auth/register', payload));

export const login = (payload: any) =>
    unwrap(apiClient.post('/auth/login', payload));

export const getFavorites = () => unwrap(apiClient.get('/user/favorites'));

export const saveFavorite = (payload: any) =>
    unwrap(apiClient.post('/user/favorites', payload));

export const removeFavorite = (routeId: string) =>
    unwrap(apiClient.delete('/user/favorites', { params: { id: routeId } }));

export default apiClient;
