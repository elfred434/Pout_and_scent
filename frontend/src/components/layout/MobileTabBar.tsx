import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Sparkles, UserRound, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';

export function MobileTabBar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { totalItems } = useCart();

  const items = [
    { label: 'Accueil', href: '/', icon: Home, active: location.pathname === '/' },
    { label: 'Boutique', href: '/catalogue', icon: ShoppingBag, active: location.pathname === '/catalogue' || location.pathname.startsWith('/produit/') },
    { label: 'Offres', href: '/promotions', icon: Sparkles, active: location.pathname === '/promotions' },
    { label: 'Panier', href: '/panier', icon: ShoppingCart, active: location.pathname === '/panier' || location.pathname === '/checkout', badge: totalItems },
    { label: 'Compte', href: isAuthenticated ? '/profil' : '/connexion', icon: UserRound, active: location.pathname.startsWith('/profil') || location.pathname === '/connexion' || location.pathname === '/inscription' },
  ];

  return (
    <nav className="ios-tab-bar md:hidden" aria-label="Navigation principale mobile">
      <div className="ios-tab-bar-material">
        {items.map(({ label, href, icon: Icon, active, badge }) => (
          <Link
            key={label}
            to={href}
            aria-current={active ? 'page' : undefined}
            className={`ios-tab-item ${active ? 'ios-tab-item-active' : ''}`}
          >
            <span className="relative">
              <Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.35 : 1.9} />
              {Boolean(badge) && (
                <span className="absolute -right-3 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary-600 px-1 text-[9px] font-bold text-white shadow-sm">
                  {badge! > 99 ? '99+' : badge}
                </span>
              )}
            </span>
            <span className="text-[9px] font-semibold leading-none">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
