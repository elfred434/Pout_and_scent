/**
 * ADMIN USERS — Gestion des utilisateurs
 * Pout & Scent
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Shield,
  User,
  Search,
  Mail,
  Calendar
} from 'lucide-react';
import { apiClient } from '@/api/client';
import { Select } from '@/components/common/Select';

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => apiClient.get('/v1/users/', {
      params: {
        search: search || undefined,
        role: roleFilter || undefined,
        page_size: 50
      }
    }).then(r => r.data),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiClient.patch(`/v1/users/${id}/`, { is_active: active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const users = usersData?.results || [];
  const totalUsers = usersData?.count || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Utilisateurs</h1>
          <p className="text-neutral-600">{totalUsers} utilisateurs inscrits</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="surface p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input type="text" placeholder="Rechercher par email, prénom, nom..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-search" />
          </div>
          <Select aria-label="Filtrer par rôle" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="sm:w-48">
            <option value="">Tous les rôles</option>
            <option value="CLIENT">Clients</option>
            <option value="ADMIN">Admins</option>
          </Select>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {isLoading ? (
          <div className="p-6 text-center text-neutral-500">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-neutral-600">Modifiez vos filtres de recherche</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {users.map((u: any) => (
              <button key={u.id} onClick={() => setSelectedUser(u)}
                className="w-full p-4 hover:bg-neutral-50 transition-colors text-left">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      u.role === 'ADMIN' ? 'bg-primary-100' : 'bg-neutral-100'
                    }`}>
                      {u.role === 'ADMIN'
                        ? <Shield className="h-5 w-5 text-primary-600" />
                        : <User className="h-5 w-5 text-neutral-600" />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {u.full_name || u.email}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {u.email}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          u.role === 'ADMIN' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {u.role}
                        </span>
                        {u.is_2fa_enabled && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">2FA</span>
                        )}
                        {!u.is_active && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Désactivé</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left text-sm text-neutral-500 sm:text-right">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {u.date_joined ? new Date(u.date_joined).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal détail */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  selectedUser.role === 'ADMIN' ? 'bg-primary-100' : 'bg-neutral-100'
                }`}>
                  {selectedUser.role === 'ADMIN'
                    ? <Shield className="h-7 w-7 text-primary-600" />
                    : <User className="h-7 w-7 text-neutral-600" />
                  }
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">{selectedUser.full_name || selectedUser.email}</h2>
                  <p className="text-sm text-neutral-500">{selectedUser.email}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="form-grid">
                <div>
                  <p className="text-xs text-neutral-500">Rôle</p>
                  <p className="font-medium">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Statut</p>
                  <p className={`font-medium ${selectedUser.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedUser.is_active ? 'Actif' : 'Désactivé'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">2FA</p>
                  <p className="font-medium">{selectedUser.is_2fa_enabled ? 'Activé' : 'Désactivé'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Inscription</p>
                  <p className="font-medium">{new Date(selectedUser.date_joined).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <button
                  onClick={() => {
                    toggleActive.mutate({ id: selectedUser.id, active: !selectedUser.is_active });
                    setSelectedUser({ ...selectedUser, is_active: !selectedUser.is_active });
                  }}
                  className={`btn-base w-full ${
                    selectedUser.is_active
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40'
                      : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950/40'
                  }`}
                >
                  {selectedUser.is_active ? 'Désactiver le compte' : 'Réactiver le compte'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
