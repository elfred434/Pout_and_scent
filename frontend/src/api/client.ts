// ============================================================
// API CLIENT — Axios avec intercepteurs
// ============================================================
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getTokens, clearTokens, setTokens, getRememberMe } from '@/lib/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ✅ Liste des routes publiques (pas besoin de token)
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
];

// Vérifier si une route est publique
function isPublicRoute(url: string): boolean {
  return PUBLIC_ROUTES.some((route) => url.includes(route));
}

// Créer l'instance Axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Intercepteur de requête — Ajouter le token automatiquement
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ✅ Utiliser le helper qui cherche dans localStorage ET sessionStorage
    const token = getAccessToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token found, adding to request:', config.url);
    } else if (!isPublicRoute(config.url || '')) {
      console.warn(`⚠️ No token for protected route: ${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Intercepteur de réponse — Gérer les erreurs 401 et refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log des erreurs pour debug
    console.error('❌ API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ Utiliser le helper pour chercher dans les deux stockages
        const { refresh } = getTokens();
        
        if (!refresh) {
          throw new Error('No refresh token');
        }

        console.log('🔄 Attempting token refresh...');
        
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh,
        });

        const { access } = response.data as { access: string };
        
        // ✅ Stocker le nouveau token en respectant le choix "Se souvenir de moi"
        const rememberMe = getRememberMe();
        setTokens(access, refresh, rememberMe);
        
        console.log('✅ Token refreshed successfully');

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed');
        // ✅ Supprimer des deux stockages
        clearTokens();
        // ✅ Rediriger vers la bonne URL
        window.location.href = '/connexion';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;