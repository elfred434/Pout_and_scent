import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useTheme } from '@/contexts/ThemeContext';

const nav = [
  { name: 'Collection', href: '/catalogue' },
  { name: 'Promotions', href: '/promotions' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                Pout<span className="text-primary-600">.</span>Scent
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              <button className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <Search className="h-5 w-5" />
              </button>

              <Link 
                to="/panier" 
                className="relative p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link 
                    to="/profil" 
                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                  <button 
                    onClick={logout}
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Deconnexion
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/connexion" 
                    className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link to="/inscription" className="btn-primary text-sm py-2 px-4">
                    Creer un compte
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-neutral-900 pt-16">
          <div className="px-6 py-8 space-y-6">
            {/* Theme toggle mobile */}
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-3 text-lg text-neutral-900 dark:text-white"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              {theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            </button>

            {nav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="block text-2xl font-semibold text-neutral-900 dark:text-white"
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
              <Link 
                to="/panier" 
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 text-lg text-neutral-900 dark:text-white"
              >
                <ShoppingBag className="h-5 w-5" />
                Panier
                {totalItems > 0 && (
                  <span className="bg-primary-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profil" 
                    onClick={() => setOpen(false)}
                    className="block text-lg text-neutral-900 dark:text-white"
                  >
                    Mon compte
                  </Link>
                  <button 
                    onClick={() => { logout(); setOpen(false); }}
                    className="block text-lg text-red-600"
                  >
                    Deconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/connexion" 
                    onClick={() => setOpen(false)}
                    className="block text-lg text-neutral-900 dark:text-white"
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/inscription" 
                    onClick={() => setOpen(false)}
                    className="btn-primary w-full text-center"
                  >
                    Creer un compte
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
