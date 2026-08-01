/**
 * ADMIN LAYOUT — Layout principal de l'administration
 * Pout & Scent
 */
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Tag,
  Star,
  MessageSquare,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import logoIcon from '@/assets/logo-icon.svg';

const navigation = [
  { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { name: 'Produits', href: '/admin/products', icon: Package },
  { name: 'Catégories', href: '/admin/categories', icon: FolderOpen },
  { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Promotions', href: '/admin/promotions', icon: Tag },
  { name: 'Avis', href: '/admin/reviews', icon: Star },
  { name: 'Conversations', href: '/admin/conversations', icon: MessageSquare },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Rediriger si non connecté ou non admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Afficher un loader pendant la vérification
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-neutral-900/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
              <h2 className="text-lg font-bold text-neutral-900">Administration</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-neutral-500 hover:text-neutral-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Layout principal */}
      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-neutral-200 fixed inset-y-0 left-0">
          <div className="flex items-center h-16 px-6 border-b border-neutral-200">
            <Link to="/admin" className="flex items-center gap-2.5">
              <img src={logoIcon} alt="" className="h-9 w-9" />
              <span className="text-sm font-semibold tracking-[0.1em] text-neutral-900 dark:text-white">
                POUT <span className="text-primary-600">&amp;</span> SCENT
              </span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-neutral-200">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-neutral-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <div className="flex-1 lg:ml-64">
          {/* Header mobile */}
          <header className="lg:hidden flex items-center justify-between h-16 px-6 bg-white border-b border-neutral-200">
            <button onClick={() => setSidebarOpen(true)} className="text-neutral-600 hover:text-neutral-900">
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold text-neutral-900">Administration</h2>
            <button onClick={handleLogout} className="text-neutral-600 hover:text-red-600">
              <LogOut className="h-5 w-5" />
            </button>
          </header>

          {/* Contenu */}
          <main className="p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
