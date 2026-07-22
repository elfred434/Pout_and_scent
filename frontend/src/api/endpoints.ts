import { apiClient } from './client';
import type {
  PaginatedResponse,
  Produit,
  Categorie,
  Adresse,
  Commande,
  LoginPayload,
  RegisterPayload,
  CheckoutPayload,
  User,
  Promotion,
  Avis,
  LoginResponse,
  Conversation,
  ChatMessage,
  CreateConversationPayload,
  SendMessagePayload,
} from '@/types';

export const authEndpoints = {
  login: (data: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/login/', data),

  register: (data: RegisterPayload) =>
    apiClient.post<LoginResponse>('/auth/register/', data),

  logout: (data?: { refresh?: string }) =>
    apiClient.post('/auth/logout/', data || {}),

  me: () =>
    apiClient.get<User>('/auth/me/'),

  refresh: (refresh: string) =>
    apiClient.post<{ access: string }>('/auth/refresh/', { refresh }),

  verify2FA: (data: { temp_token: string; otp_code: string } | { token: string }) =>
    apiClient.post<LoginResponse>('/auth/2fa/verify/', data),

  passwordReset: (data: { email: string }) =>
    apiClient.post('/auth/password/reset/', data),

  passwordResetConfirm: (data: {
    token: string;
    new_password?: string;
    password?: string;
    password_confirm?: string;
  }) => apiClient.post('/auth/password/reset/confirm/', data),
  
  googleAuth: (data: { credential: string }) =>
    apiClient.post<LoginResponse>('/auth/google/', data),
};

export type { LoginResponse, LoginPayload, RegisterPayload, User };

export const catalogEndpoints = {
  getProducts: (params?: any) =>
    apiClient.get<PaginatedResponse<Produit>>('/v1/catalog/products/', { params }),
  getProduct: (id: string) =>
    apiClient.get<Produit>(`/v1/catalog/products/${id}/`),
  getCategories: () =>
    apiClient.get<PaginatedResponse<Categorie>>('/v1/catalog/categories/'),
  getCategory: (id: string) =>
    apiClient.get<Categorie>(`/v1/catalog/categories/${id}/`),
};

export const userEndpoints = {
  getAddresses: () =>
    apiClient.get<PaginatedResponse<Adresse>>('/v1/users/addresses/'),
  createAddress: (data: Partial<Adresse>) =>
    apiClient.post<Adresse>('/v1/users/addresses/', data),
  updateAddress: (id: string, data: Partial<Adresse>) =>
    apiClient.patch<Adresse>(`/v1/users/addresses/${id}/`, data),
  deleteAddress: (id: string) =>
    apiClient.delete(`/v1/users/addresses/${id}/`),
};

export const orderEndpoints = {
  checkout: (data: CheckoutPayload) =>
    apiClient.post<Commande>('/v1/orders/checkout/', data),
  getMyOrders: (params?: { page?: number }) =>
    apiClient.get<PaginatedResponse<Commande>>('/v1/orders/', { params }),
  getOrder: (id: string) =>
    apiClient.get<Commande>(`/v1/orders/${id}/`),
  cancelOrder: (id: string) =>
    apiClient.post<Commande>(`/v1/orders/${id}/cancel/`),
  transitionOrder: (id: string, statut: string) =>
    apiClient.post<Commande>(`/v1/orders/${id}/transition/`, { statut }),
};

export const promotionEndpoints = {
  getActivePromotions: (params?: any) =>
    apiClient.get<PaginatedResponse<Promotion>>('/v1/promotions/', {
      params: { is_active: true, ...params },
    }),
  getPromotion: (id: string) =>
    apiClient.get<Promotion>(`/v1/promotions/${id}/`),
};

export const reviewEndpoints = {
  getProductReviews: (productId: string, params?: any) =>
    apiClient.get<PaginatedResponse<Avis>>('/v1/reviews/', {
      params: { produit: productId, ...params },
    }),
  createReview: (data: { produit: string; note: number; commentaire: string }) =>
    apiClient.post<Avis>('/v1/reviews/', data),
  getMyReviews: () =>
    apiClient.get<PaginatedResponse<Avis>>('/v1/reviews/'),
};

export const chatEndpoints = {
  getConversations: (params?: { statut?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<Conversation>>('/v1/chat/conversations/', { params }),
  getConversation: (id: string) =>
    apiClient.get<Conversation>(`/v1/chat/conversations/${id}/`),
  createConversation: (data: CreateConversationPayload) =>
    apiClient.post<Conversation>('/v1/chat/conversations/', data),
  sendMessage: (conversationId: string, data: SendMessagePayload) =>
    apiClient.post<ChatMessage>(`/v1/chat/conversations/${conversationId}/send/`, data),
  getMessages: (conversationId: string) =>
    apiClient.get<ChatMessage[]>(`/v1/chat/conversations/${conversationId}/messages/`),
  closeConversation: (conversationId: string) =>
    apiClient.post<Conversation>(`/v1/chat/conversations/${conversationId}/close/`),
  markAsRead: (conversationId: string) =>
    apiClient.post(`/v1/chat/conversations/${conversationId}/mark-read/`),
};
