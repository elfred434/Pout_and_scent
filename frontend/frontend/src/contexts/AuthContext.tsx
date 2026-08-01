/**
 * AuthContext — Gestion centralisée de l'authentification
 * Pout & Scent
 *
 * Utilise TanStack Query pour le user, et useMutation pour login/register/google.
 */
import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { authEndpoints } from '@/api/endpoints';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/components/common/ToastContainer';
import { extractApiError } from '@/hooks/useToast';
import type { LoginResponse, LoginPayload, RegisterPayload, User } from '@/types';
import { useNavigate } from 'react-router-dom';
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getRememberMe,
  getTokens,
} from '@/lib/authStorage';

// ─── Types ─────────────────────────────────────────────────

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

// ─── Provider ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Récupérer l'utilisateur connecté
  const { data: user, isLoading } = useQuery<User>({
    queryKey: queryKeys.auth.user(),
    queryFn: () => authEndpoints.me().then((res) => res.data),
    retry: false,
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 min
  });

  // Login
  const login = useMutation<LoginResponse, Error, LoginPayload & { rememberMe?: boolean }>({
    mutationFn: (data) => {
      const { rememberMe, ...credentials } = data;
      return authEndpoints.login(credentials).then((res) => res.data);
    },
    onSuccess: (response, variables) => {
      if (response.requires_2fa) return;

      const tokens = response.data || response;
      if ((tokens as any).access && (tokens as any).refresh) {
        const rememberMe = variables.rememberMe ?? getRememberMe();
        setTokens((tokens as any).access, (tokens as any).refresh, rememberMe);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      }
    },
    onError: (error) => {
      // Ne pas afficher de toast ici — la page login gère ses propres erreurs
      // pour pouvoir rediriger vers 2FA si nécessaire
    },
  });

  // Register
  const register = useMutation<LoginResponse, Error, RegisterPayload>({
    mutationFn: (data) =>
      authEndpoints.register(data).then((res) => res.data),
    onSuccess: (response) => {
      const tokens = response.data || response;
      if ((tokens as any).access && (tokens as any).refresh) {
        setTokens((tokens as any).access, (tokens as any).refresh, true);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
        toast.success('Compte créé avec succès !');
      }
    },
    onError: (error) => {
      // La page register gère ses propres erreurs pour afficher les erreurs de validation
    },
  });

  // Google OAuth
  const googleLogin = useMutation<LoginResponse, Error, { credential: string }>({
    mutationFn: (data) =>
      authEndpoints.googleAuth(data).then((res) => res.data),
    onSuccess: (response) => {
      const tokens = response.data || response;
      if ((tokens as any).access && (tokens as any).refresh) {
        setTokens((tokens as any).access, (tokens as any).refresh, true);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
        toast.success('Connexion Google réussie !');
      }
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });

  // Logout
  const logout = useCallback(() => {
    const { refresh } = getTokens();
    if (refresh) {
      authEndpoints.logout({ refresh }).catch(() => {});
    }
    clearTokens();
    queryClient.clear();
    navigate('/');
    toast.info('Vous avez été déconnecté');
  }, [navigate, queryClient]);

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

// ─── Hook ──────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
