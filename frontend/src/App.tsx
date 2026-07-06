// ============================================================
// APP — Point d'entrée React avec Google OAuth Provider
// ============================================================
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { queryClient } from '@/lib/queryClient';

// Context
import { AuthProvider } from '@/contexts/AuthContext';

// Components
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';

// Pages publiques
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { ProductDetailPage } from '@/pages/catalog/ProductDetailPage';
import { CartPage } from '@/pages/cart/CartPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';

// Pages auth
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { TwoFactorPage } from '@/pages/auth/TwoFactorPage';
import { PasswordResetPage } from '@/pages/auth/PasswordResetPage';
import { PasswordResetConfirmPage } from '@/pages/auth/PasswordResetConfirmPage';

// Pages profil
import { ProfilePage } from '@/pages/ProfilePage';
import { ProfileIndexContent } from '@/pages/ProfilePage';
import { AddressesPage } from '@/pages/user/AddressesPage';
import { OrdersPage } from '@/pages/user/OrdersPage';
import { SecurityPage } from '@/pages/user/SecurityPage';

// ✅ Récupérer le Google Client ID depuis les variables d'environnement
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {/* ✅ GoogleOAuthProvider enveloppe tout l'app */}
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AuthProvider>
              <Routes>
                <Route element={<Layout />}>
                  {/* Routes publiques */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalogue" element={<CatalogPage />} />
                  <Route path="/produit/:id" element={<ProductDetailPage />} />
                  <Route path="/panier" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />

                  {/* Routes auth */}
                  <Route path="/connexion" element={<LoginPage />} />
                  <Route path="/inscription" element={<RegisterPage />} />
                  <Route path="/2fa" element={<TwoFactorPage />} />
                  <Route path="/password-reset" element={<PasswordResetPage />} />
                  <Route
                    path="/password-reset/confirm"
                    element={<PasswordResetConfirmPage />}
                  />

                  {/* Routes profil avec sous-routes */}
                  <Route path="/profil" element={<ProfilePage />}>
                    <Route index element={<ProfileIndexContent />} />
                    <Route path="adresses" element={<AddressesPage />} />
                    <Route path="commandes" element={<OrdersPage />} />
                    <Route path="securite" element={<SecurityPage />} />
                  </Route>
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}