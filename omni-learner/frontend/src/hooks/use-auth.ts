'use client';

import { useAuthStore } from '../store/auth';
import { authService } from '../services/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { LoginCredentials } from '../types';

export function useAuth() {
    const router = useRouter();
    const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            setError(null);

            const { tokens, user } = await authService.login(credentials);
            setAuth(user, tokens);

            router.push('/boards');
            return true;
        } catch (err: any) {
            let errorMessage = 'Login failed. Please check your credentials.';

            if (err.response) {
                // Server responded with a status code outside 2xx
                errorMessage = err.response.data?.detail || errorMessage;
            } else if (err.request) {
                // Request was made but no response received (Backend down / Network error)
                errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
            } else {
                // Something happened in setting up the request
                errorMessage = err.message || errorMessage;
            }

            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            clearAuth();
            router.push('/login');
        }
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
    };
}
