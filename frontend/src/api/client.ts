// ============================================================
// API CLIENT — Axios avec intercepteurs (Production-ready)
// ============================================================
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getTokens, clearTokens, setTokens, getRememberMe } from '@/lib/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Routes publiques (pas besoin de token)
const PUBLIC_ROUTES = [
  '/auth/login/',
  '/auth/register/',
  '/auth/password/reset/',
  '/auth/password/reset/confirm/',
  '/auth/refresh/',
  '/auth/google/',
  '/v1/catalog/',
  '/v1/products/',
  '/v1/categories/',
  '/v1/promotions/',
  '/v1/reviews/',
  '/api/schema/',
  '/api/docs/',
  // Chat : les routes nécessitent un token (pas publiques)
];

// Vérifier si une route est publique
function isPublicRoute(url: string): boolean {
  return PUBLIC_ROUTES.some((route) => url.includes(route));
}

// Logger conditionnel (uniquement en dev)
const isDev = import.meta.env.DEV;
function log(...args: unknown[]) {
  if (isDev) console.log(...args);
}
function logWarn(...args: unknown[]) {
  if (isDev) console.warn(...args);
}
function logError(...args: unknown[]) {
  if (isDev) console.error(...args);
}

// Créer l'instance Axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête — Ajouter le token automatiquement
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      log('🔑 Token ajouté à la requête:', config.url);
    } else if (!isPublicRoute(config.url || '')) {
      logWarn(`⚠️ Pas de token pour la route protégée: ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse — Gérer les erreurs 401 et refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    logError('❌ API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Tentative de refresh du token sur 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refresh } = getTokens();

        if (!refresh) {
          throw new Error('No refresh token');
        }

        log('🔄 Tentative de rafraîchissement du token...');

        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh,
        });

        const { access } = response.data as { access: string };

        // Stocker le nouveau token en respectant le choix "Se souvenir de moi"
        const rememberMe = getRememberMe();
        setTokens(access, refresh, rememberMe);

        log('✅ Token rafraîchi avec succès');

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        logError('❌ Échec du rafraîchissement du token');
        clearTokens();
        window.location.href = '/connexion';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
