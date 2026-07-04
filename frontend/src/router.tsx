// ============================================================
// ROUTER — Configuration TanStack Router
// ============================================================
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';

// Layout
import { Layout } from '@/components/layout/Layout';

// Pages racine
import { HomePage } from '@/pages/HomePage';
import { ProfilePage } from '@/pages/ProfilePage';

// Pages catalogue
import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { ProductDetailPage } from '@/pages/catalog/ProductDetailPage';

// Pages panier & checkout
import { CartPage } from '@/pages/cart/CartPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';

// Pages auth
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Pages user (profil)
import { AddressesPage } from '@/pages/user/AddressesPage';
import { OrdersPage } from '@/pages/user/OrdersPage';
import { SecurityPage } from '@/pages/user/SecurityPage';

// ============================================================
// ROUTE RACINE (avec Layout)
// ============================================================
const rootRoute = createRootRoute({
  component: Layout,
});

// ============================================================
// ROUTES PRINCIPALES
// ============================================================

// Accueil
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

// Catalogue
const catalogueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalogue',
  component: CatalogPage,
});

// Détail produit (avec paramètre dynamique $id)
const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/produit/$id',
  component: ProductDetailPage,
});

// Panier
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/panier',
  component: CartPage,
});

// Checkout
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

// Connexion
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/connexion',
  component: LoginPage,
});

// Inscription
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inscription',
  component: RegisterPage,
});

// ============================================================
// ROUTES PROFIL (avec sous-routes)
// ============================================================

// Route parent /profil
const profileIndexRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: '/',
  component: ProfileIndexContent,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profil',
  component: ProfilePage,
});

// Sous-route /profil/adresses
const profileAddressesRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: '/adresses',
  component: AddressesPage,
});

// Sous-route /profil/commandes
const profileOrdersRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: '/commandes',
  component: OrdersPage,
});

// Sous-route /profil/securite
const profileSecurityRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: '/securite',
  component: SecurityPage,
});

// ============================================================
// ASSEMBLAGE DE L'ARBRE DE ROUTES
// ============================================================
const routeTree = rootRoute.addChildren([
  indexRoute,
  catalogueRoute,
  productRoute,
  cartRoute,
  checkoutRoute,
  loginRoute,
  registerRoute,
  profileRoute.addChildren([
    profileIndexRoute, 
    profileAddressesRoute,
    profileOrdersRoute,
    profileSecurityRoute,
  ]),
]);

export const router = createRouter({ routeTree });

// ============================================================
// DÉCLARATION DE TYPE pour typage fort des hooks TanStack
// ============================================================
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}