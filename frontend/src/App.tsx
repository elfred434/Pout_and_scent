/**
 * APP — Point d'entrée React
 * Pout & Scent
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { queryClient } from '@/lib/queryClient';

// Context
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Components
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { ToastContainer } from '@/components/common/ToastContainer';
import { CookieBanner } from '@/components/common/CookieBanner';

// Pages publiques
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { ProductDetailPage } from '@/pages/catalog/ProductDetailPage';
import { CartPage } from '@/pages/cart/CartPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { OrderSuccessPage } from '@/pages/checkout/OrderSuccessPage';

// Pages auth
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { TwoFactorPage } from '@/pages/auth/TwoFactorPage';
import { PasswordResetPage } from '@/pages/auth/PasswordResetPage';
import { PasswordResetConfirmPage } from '@/pages/auth/PasswordResetConfirmPage';

// Pages profil
import { ProfilePage, ProfileIndexContent } from '@/pages/ProfilePage';
import { AddressesPage } from '@/pages/user/AddressesPage';
import { OrdersPage } from '@/pages/user/OrdersPage';
import { SecurityPage } from '@/pages/user/SecurityPage';

// Pages promotions
import { PromotionsPage } from '@/pages/promotions/PromotionsPage';

// Pages légales
import { MentionsLegalesPage } from '@/pages/legal/MentionsLegalesPage';
import { CGVPage } from '@/pages/legal/CGVPage';
import { PolitiqueConfidentialitePage } from '@/pages/legal/PolitiqueConfidentialitePage';
import { PolitiqueCookiesPage } from '@/pages/legal/PolitiqueCookiesPage';
import { SignalementPage } from '@/pages/legal/SignalementPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
              <AuthProvider>
              {/* Toast notifications globales */}
              <ToastContainer />

              {/* Bannière cookies — Conformité Code du numérique béninois */}
              <CookieBanner />

              <Routes>
                <Route element={<Layout />}>
                  {/* Routes publiques */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalogue" element={<CatalogPage />} />
                  <Route path="/promotions" element={<PromotionsPage />} />
                  <Route path="/produit/:id" element={<ProductDetailPage />} />
                  <Route path="/panier" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/commande/success" element={<OrderSuccessPage />} />

                  {/* Routes auth */}
                  <Route path="/connexion" element={<LoginPage />} />
                  <Route path="/inscription" element={<RegisterPage />} />
                  <Route path="/2fa" element={<TwoFactorPage />} />
                  <Route path="/password-reset" element={<PasswordResetPage />} />
                  <Route path="/password-reset/confirm" element={<PasswordResetConfirmPage />} />

                  {/* Routes profil */}
                  <Route path="/profil" element={<ProfilePage />}>
                    <Route index element={<ProfileIndexContent />} />
                    <Route path="adresses" element={<AddressesPage />} />
                    <Route path="commandes" element={<OrdersPage />} />
                    <Route path="securite" element={<SecurityPage />} />
                  </Route>

                  {/* Routes légales — Conformité Code du numérique béninois */}
                  <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
                  <Route path="/cgv" element={<CGVPage />} />
                  <Route path="/politique-confidentialite" element={<PolitiqueConfidentialitePage />} />
                  <Route path="/politique-cookies" element={<PolitiqueCookiesPage />} />
                  <Route path="/signalement" element={<SignalementPage />} />
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
