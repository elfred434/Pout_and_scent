import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, MapPin, ShoppingBag, Lock, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const sidebarItems = [
  { name: 'Informations', href: '/profil', icon: User, end: true },
  { name: 'Adresses', href: '/profil/adresses', icon: MapPin },
  { name: 'Commandes', href: '/profil/commandes', icon: ShoppingBag },
  { name: 'Sécurité', href: '/profil/securite', icon: Lock },
];

export function ProfilePage() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Générer les initiales pour l'avatar
  const initials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen">
      {/* ═══ Header — fond blanc ═══ */}
      <section className="bg-white dark:bg-neutral-900 py-12 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-6">
            {/* Avatar avec initiales */}
            <div className="avatar-lg">
              {initials}
            </div>
            <div>
              <p className="text-tiny font-semibold text-primary-600 uppercase tracking-[0.2em] mb-1">
                Mon compte
              </p>
              <h1 className="text-display text-neutral-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Contenu — fond gris ═══ */}
      <section className="py-12 bg-neutral-150 dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar avec items actifs stylés */}
            <div className="lg:col-span-1">
              <div className="card-static dark:bg-neutral-900 dark:border-neutral-700 p-4 space-y-2 sticky top-24">
                {sidebarItems.map((item) => {
                  const isActive = item.end
                    ? location.pathname === item.href
                    : location.pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={isActive ? 'sidebar-item-active dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800' : 'sidebar-item dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <div className="divider dark:border-neutral-700 my-4" />

                <button
                  onClick={logout}
                  className="sidebar-item dark:text-neutral-400 dark:hover:bg-neutral-800 w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-3">
              <Outlet />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══ ProfileIndexContent — Informations personnelles ═══
export function ProfileIndexContent() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  const initials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : 'U';

  return (
    <div className="card-static dark:bg-neutral-900 dark:border-neutral-700 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-title text-neutral-900 dark:text-white">Informations personnelles</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 text-sm"
          >
            Modifier
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Avatar + nom */}
        <div className="flex items-center gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-700">
          <div className="avatar-lg">
            {initials}
          </div>
          <div>
            <p className="text-base font-medium text-neutral-900 dark:text-white">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{user?.email}</p>
          </div>
        </div>

        {/* Champs avec meilleur espacement */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Prénom
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="input dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
              />
            ) : (
              <p className="text-sm text-neutral-900 dark:text-white py-3 px-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
                {user?.first_name || '—'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Nom
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="input dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
              />
            ) : (
              <p className="text-sm text-neutral-900 dark:text-white py-3 px-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
                {user?.last_name || '—'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Email
            </label>
            <p className="text-sm text-neutral-900 dark:text-white py-3 px-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
              {user?.email}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              L'email ne peut pas etre modifie
            </p>
          </div>
        </div>

        {/* Boutons d'édition */}
        {isEditing && (
          <div className="form-actions border-t border-neutral-200 dark:border-neutral-700">
            <button className="btn-primary">
              Enregistrer
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
