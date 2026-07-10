import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import { authEndpoints } from '@/api/endpoints';
import type { LoginResponse, LoginPayload, RegisterPayload, User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { setTokens, clearTokens, getAccessToken, getRememberMe, getTokens } from '@/lib/authStorage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: UseMutationResult<LoginResponse, Error, LoginPayload & { rememberMe?: boolean }>;
  register: UseMutationResult<LoginResponse, Error, RegisterPayload>;
  googleLogin: UseMutationResult<LoginResponse, Error, { credential: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['user'],
    queryFn: () => authEndpoints.me().then((res) => res.data),
    retry: false,
    enabled: !!getAccessToken(),
  });

  const login = useMutation<LoginResponse, Error, LoginPayload & { rememberMe?: boolean }>({
    mutationFn: (data) => {
      const { rememberMe, ...credentials } = data;
      return authEndpoints.login(credentials).then((res) => res.data);
    },
    onSuccess: (response, variables) => {
      if (response.requires_2fa) {
        console.log('🔐 2FA required');
        return;
      }
      const tokens = response.data || response;
      if ((tokens as any).access && (tokens as any).refresh) {
        const rememberMe = variables.rememberMe ?? getRememberMe();
        setTokens((tokens as any).access, (tokens as any).refresh, rememberMe);
      }
    },
  });

  const register = useMutation<LoginResponse, Error, RegisterPayload>({
    mutationFn: (data) =>
      authEndpoints.register(data).then((res) => res.data),
    onSuccess: (response) => {
      const tokens = response.data || response;
      if ((tokens as any).access && (tokens as any).refresh) {
        setTokens((tokens as any).access, (tokens as any).refresh, true);
      }
    },
  });

  const googleLogin = useMutation<LoginResponse, Error, { credential: string }>({
    mutationFn: (data) =>
      authEndpoints.googleAuth(data).then((res) => res.data),
    onSuccess: (response) => {
      const tokens = response.data || response;
      if ((tokens as any).access && (tokens as any).refresh) {
        setTokens((tokens as any).access, (tokens as any).refresh, true);
      }
    },
    onError: (error) => {
      console.error('❌ Google login error:', error);
    },
  });

  const logout = () => {
    const { refresh } = getTokens();
    if (refresh) {
      authEndpoints.logout({ refresh }).catch(() => {});
    }
    clearTokens();
    navigate('/');
    window.location.reload();
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    googleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
