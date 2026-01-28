import { api } from '../lib/api';
import type { LoginCredentials, AuthTokens, User } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: User }> {
    const { data: tokens } = await api.post<AuthTokens>('/api/token/', credentials);

    // Get user info (you'll need to create this endpoint or decode JWT)
    // For now, we'll create a placeholder
    const user: User = {
      id: 1,
      email: credentials.email,
      username: credentials.email.split('@')[0],
      wallet_balance: 0,
      penalty_per_miss: 5,
    };

    return { tokens, user };
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { data } = await api.post<{ access: string }>('/api/token/refresh/', {
      refresh: refreshToken,
    });

    return {
      access: data.access,
      refresh: refreshToken,
    };
  },

  async logout(): Promise<void> {
    // If you implement logout endpoint in backend
    // await api.post('/api/logout/');
  },
};
