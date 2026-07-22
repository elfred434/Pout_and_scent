// ============================================================
// AUTH CONTEXT — Gestion de l'authentification
// ============================================================
import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import { authEndpoints, LoginResponse, LoginPayload, RegisterPayload, User } from '@/api/endpoints';
import { useNavigate } from 'react-router-dom';
import { setTokens, clearTokens, getAccessToken, getRememberMe } from '@/lib/authStorage';

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

  // ✅ Récupérer le profil utilisateur si un token existe
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['user'],
    queryFn: () => authEndpoints.me().then((res) => res.data),
    retry: false,
    enabled: !!getAccessToken(),
  });

  // ✅ Login avec gestion du 2FA et "Se souvenir de moi"
  const login = useMutation<LoginResponse, Error, LoginPayload & { rememberMe?: boolean }>({
    mutationFn: (data) => {
      const { rememberMe, ...credentials } = data;
      return authEndpoints.login(credentials).then((res) => res.data);
    },
    onSuccess: (response, variables) => {
      // Si le backend demande le 2FA, ne pas stocker les tokens
      if (response.requires_2fa) {
        console.log('🔐 2FA required');
        return;
      }

      // Stocker les tokens selon le choix "Se souvenir de moi"
      const tokens = response.data || response;
      if (tokens.access && tokens.refresh) {
        const rememberMe = variables.rememberMe ?? getRememberMe();
        setTokens(tokens.access, tokens.refresh, rememberMe);
        console.log(`✅ Login successful (${rememberMe ? 'localStorage' : 'sessionStorage'})`);
      }
    },
  });

  // ✅ Register
  const register = useMutation<LoginResponse, Error, RegisterPayload>({
    mutationFn: (data) =>
      authEndpoints.register(data).then((res) => res.data),
    onSuccess: (response) => {
      const tokens = response.data || response;
      if (tokens.access && tokens.refresh) {
        setTokens(tokens.access, tokens.refresh, true);
        console.log('✅ Register successful');
      }
    },
  });

  // ✅ Google OAuth
  const googleLogin = useMutation<LoginResponse, Error, { credential: string }>({
    mutationFn: (data) =>
      authEndpoints.googleAuth(data).then((res) => res.data),
    onSuccess: (response) => {
      const tokens = response.data || response;
      if (tokens.access && tokens.refresh) {
        // Toujours persister pour Google OAuth
        setTokens(tokens.access, tokens.refresh, true);
        console.log('✅ Google login successful');
      }
    },
    onError: (error) => {
      console.error('❌ Google login error:', error);
    },
  });

  // ✅ Logout
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