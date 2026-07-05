// ============================================================
// AUTH CONTEXT — Ajout de Google OAuth
// ============================================================
import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import { authEndpoints } from '@/api/endpoints';
import type { User, LoginPayload, RegisterPayload, LoginResponse } from '@/types';
import { useNavigate } from 'react-router-dom';
import { setTokens, clearTokens, getAccessToken, getRememberMe } from '@/lib/authStorage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: UseMutationResult<LoginResponse, Error, LoginPayload & { rememberMe?: boolean }>;
  register: UseMutationResult<any, Error, RegisterPayload>;
  googleLogin: UseMutationResult<any, Error, { credential: string }>; // ✅ NOUVEAU
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
      if (tokens.access && tokens.refresh) {
        const rememberMe = variables.rememberMe ?? getRememberMe();
        setTokens(tokens.access, tokens.refresh, rememberMe);
        console.log(`✅ Login successful`);
      }
    },
  });

  const register = useMutation({
    mutationFn: (data: RegisterPayload) =>
      authEndpoints.register(data).then((res) => res.data),
    onSuccess: (response) => {
      const tokens = response.data || response;
      if (tokens.access && tokens.refresh) {
        setTokens(tokens.access, tokens.refresh, true);
        console.log('✅ Register successful');
      }
    },
  });

  // ✅ NOUVEAU : Google OAuth
  const googleLogin = useMutation({
    mutationFn: (data: { credential: string }) =>
      authEndpoints.googleAuth(data).then((res) => res.data),
    onSuccess: (response) => {
      const tokens = response.data || response;
      if (tokens.access && tokens.refresh) {
        // Toujours persister pour Google OAuth
        setTokens(tokens.access, tokens.refresh, true);
        console.log('✅ Google login successful');
      }
    },
    onError: (error: any) => {
      console.error('❌ Google login error:', error);
    },
  });

  const logout = () => {
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
    googleLogin, // ✅ NOUVEAU
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