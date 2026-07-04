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
    enabled: !!getAccessToken(), // ✅ Utiliser le helper
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
        return; // Le LoginPage gérera la redirection
      }

      // Stocker les tokens selon le choix "Se souvenir de moi"
      const tokens = response.data || response;
      if (tokens.access && tokens.refresh) {
        const rememberMe = variables.rememberMe ?? getRememberMe();
        setTokens(tokens.access, tokens.refresh, rememberMe);
        console.log(`✅ Login successful, tokens stored (${rememberMe ? 'localStorage' : 'sessionStorage'})`);
      }
    },
  });

  const register = useMutation({
    mutationFn: (data: RegisterPayload) =>
      authEndpoints.register(data).then((res) => res.data),
    onSuccess: (response) => {
      // Par défaut, on persiste pour l'inscription
      const tokens = response.data || response;
      if (tokens.access && tokens.refresh) {
        setTokens(tokens.access, tokens.refresh, true);
        console.log('✅ Register successful, tokens stored (localStorage)');
      }
    },
  });

  const logout = () => {
    clearTokens(); // ✅ Supprime des deux stockages
    navigate('/');
    window.location.reload();
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
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