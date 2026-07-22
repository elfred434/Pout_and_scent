// ============================================================
// PROFILE PAGE — Layout profil avec sidebar + sous-pages
// ============================================================
import { useState } from 'react'; // ✅ AJOUTER CET IMPORT
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { User, MapPin, ShoppingBag, Lock, LogOut, Mail, Phone } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================
interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  telephone: string;
  role: string;
}

// ============================================================
// PROFILE PAGE — Layout principal avec sidebar
// ============================================================
export function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/me/');
      return response.data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
    onSuccess: () => {
      queryClient.clear();
      navigate('/');
      window.location.reload();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Vous devez être connecté.</p>
        <Link to="/connexion" className="text-purple-600 hover:underline mt-4 inline-block">
          Se connecter
        </Link>
      </div>
    );
  }

  const navItems = [
    { to: '/profil', label: 'Informations', icon: User, end: true },
    { to: '/profil/adresses', label: 'Adresses', icon: MapPin },
    { to: '/profil/commandes', label: 'Commandes', icon: ShoppingBag },
    { to: '/profil/securite', label: 'Sécurité', icon: Lock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-purple-600" />
              </div>
              <h2 className="font-semibold text-lg">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => logoutMutation.mutate()}
              className="w-full flex items-center gap-3 px-4 py-3 mt-6 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Content — Outlet pour les sous-routes */}
        <div className="md:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROFILE INDEX — Contenu par défaut de /profil
// ============================================================
export function ProfileIndexContent() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    telephone: '',
  });

  const { data: user } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/me/');
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiClient.put('/auth/me/', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditing(false);
    },
  });

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Informations personnelles</h2>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Modifier
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Prénom"
            value={isEditing ? formData.first_name : user.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            disabled={!isEditing}
          />
          <Input
            label="Nom"
            value={isEditing ? formData.last_name : user.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <Mail className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">{user.email}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
        </div>

        {/* <Input
          label="Téléphone"
          type="tel"
          value={isEditing ? formData.telephone : user.telephone || ''}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          disabled={!isEditing}
          placeholder="+229 XX XX XX XX"
        /> */}

        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}