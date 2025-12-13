import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
} from 'react';
import {
    login as loginRequest,
    register as registerRequest,
    getCurrentUser,
    setAuthToken,
} from '../services/api';

const STORAGE_KEY = 'transit-auth';

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
}

interface AuthContextType extends AuthState {
    login: (credentials: any) => Promise<any>;
    register: (payload: any) => Promise<any>;
    logout: () => void;
    refresh: () => Promise<void>;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: async () => { },
    register: async () => { },
    logout: () => { },
    isAuthenticated: false,
    isAdmin: false,
    refresh: async () => { },
});

function getInitialAuth(): AuthState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return { user: null, token: null };
        return JSON.parse(stored);
    } catch (error) {
        return { user: null, token: null };
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>(getInitialAuth);

    const logout = useCallback(() => setAuthState({ user: null, token: null }), []);

    useEffect(() => {
        if (authState.token) {
            setAuthToken(authState.token);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
        } else {
            setAuthToken(null);
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [authState]);

    const login = useCallback(async (credentials: any) => {
        const { email } = credentials;

        // Validate email format (all users must have @)
        if (!email.includes('@')) {
            throw new Error('Email phải chứa ký tự @');
        }

        // All logins go through backend
        const response = await loginRequest(credentials) as any;

        // Add role from backend response or default to 'user'
        const user = {
            ...response.user,
            role: response.user.role || (response.user.isAdmin ? 'admin' : 'user')
        };

        setAuthState({
            user,
            token: response.token,
        });
        return { user, token: response.token };
    }, []);

    const register = useCallback(async (payload: any) => {
        // Validate email for regular users
        if (!payload.email.includes('@')) {
            throw new Error('Email phải chứa ký tự @');
        }

        const response = await registerRequest(payload) as any;
        setAuthState({
            user: response.user,
            token: response.token,
        });
        return response;
    }, []);

    const refresh = useCallback(async () => {
        if (!authState.token) return;
        try {
            const response = await getCurrentUser() as any;
            const user = response?.user || response;
            if (user) {
                setAuthState((prev) => ({ ...prev, user }));
            }
        } catch (error) {
            logout();
        }
    }, [authState.token, logout]);

    useEffect(() => {
        if (authState.token && !authState.user) {
            refresh();
        }
    }, [authState.token, authState.user, refresh]);

    const value = useMemo(
        () => ({
            user: authState.user,
            token: authState.token,
            login,
            register,
            logout,
            refresh,
            isAuthenticated: Boolean(authState.token),
            isAdmin: authState.user?.role === 'admin',
        }),
        [authState, login, register, logout, refresh]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
