
import { apiClient } from './client';
import type {
  PaginatedResponse,
  Produit,
  Categorie,
  Adresse,
  Commande,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  CheckoutPayload,
  User,
  Promotion,
  Avis,
} from '@/types';

// Authentification
export const authEndpoints = {
  login: (data: LoginPayload) =>
    apiClient.post<AuthTokens>('/auth/login/', data),

  register: (data: RegisterPayload) =>
    apiClient.post<AuthTokens>('/auth/register/', data),

  logout: () =>
    apiClient.post('/auth/logout/'),

  me: () =>
    apiClient.get<User>('/auth/me/'),

  resetPassword: (email: string) =>
    apiClient.post('/auth/password/reset/', { email }),

  resetPasswordConfirm: (token: string, newPassword: string) =>
    apiClient.post('/auth/password/reset/confirm/', {
      token,
      new_password: newPassword,
    }),
      // 🆕 Vérification 2FA (admin)
  verify2FA: (data: { temp_token: string; otp_code: string }) =>
    apiClient.post<any>('/auth/2fa/verify/', data),

  // 🆕 Demande de reset password (envoi email)
  passwordReset: (data: { email: string }) =>
    apiClient.post('/auth/password/reset/', data),

  // 🆕 Confirmation du reset password (avec token)
  passwordResetConfirm: (data: {
    token: string;
    password: string;
    password_confirm: string;
  }) => apiClient.post('/auth/password/reset/confirm/', data),
};

// Catalogue
export const catalogEndpoints = {
  getProducts: (params?: {
    page?: number;
    page_size?: number;
    categorie?: string;
    marque?: string;
    prix_min?: number;
    prix_max?: number;
    search?: string;
    ordering?: string;
  }) => apiClient.get<PaginatedResponse<Produit>>('/v1/catalog/products/', { params }),

  getProduct: (id: string) =>
    apiClient.get<Produit>(`/v1/catalog/products/${id}/`),

  getCategories: () =>
    apiClient.get<PaginatedResponse<Categorie>>('/v1/catalog/categories/'),
};

// Utilisateurs
export const userEndpoints = {
  getAddresses: () =>
    apiClient.get<PaginatedResponse<Adresse>>('/v1/users/addresses/'),

  createAddress: (data: Omit<Adresse, 'id' | 'user'>) =>
    apiClient.post<Adresse>('/v1/users/addresses/', data),

  updateAddress: (id: string, data: Partial<Adresse>) =>
    apiClient.patch<Adresse>(`/v1/users/addresses/${id}/`, data),

  deleteAddress: (id: string) =>
    apiClient.delete(`/v1/users/addresses/${id}/`),
};

// Commandes
export const orderEndpoints = {
  checkout: (data: CheckoutPayload) =>
    apiClient.post<Commande>('/v1/orders/checkout/', data),

  getMyOrders: () =>
    apiClient.get<PaginatedResponse<Commande>>('/v1/orders/'),

  getOrder: (id: string) =>
    apiClient.get<Commande>(`/v1/orders/${id}/`),
};

// Promotions
export const promotionEndpoints = {
  getActivePromotions: () =>
    apiClient.get<PaginatedResponse<Promotion>>('/v1/promotions/', {
      params: { is_active: true },
    }),
};

// Avis
export const reviewEndpoints = {
  getProductReviews: (productId: string) =>
    apiClient.get<PaginatedResponse<Avis>>('/v1/reviews/', {
      params: { produit: productId },
    }),

  createReview: (data: { produit: string; note: number; commentaire: string }) =>
    apiClient.post<Avis>('/v1/reviews/', data),
};