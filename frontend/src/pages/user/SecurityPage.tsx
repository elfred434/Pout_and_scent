// ============================================================
// SECURITY PAGE — Changement de mot de passe
// ============================================================
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';

export function SecurityPage() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiClient.post('/auth/password/change/', data);
    },
    onSuccess: () => {
      setSuccess('Mot de passe modifié avec succès !');
      setError('');
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Erreur lors du changement de mot de passe');
      setSuccess('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.new_password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    changePasswordMutation.mutate(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">Sécurité</h2>
      </div>

      <div className="max-w-lg">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Conseil :</strong> Utilisez un mot de passe unique d'au moins 8 caractères,
            mélangeant lettres, chiffres et caractères spéciaux.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mot de passe actuel"
            type={showPasswords ? 'text' : 'password'}
            required
            value={formData.current_password}
            onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
          />

          <Input
            label="Nouveau mot de passe"
            type={showPasswords ? 'text' : 'password'}
            required
            value={formData.new_password}
            onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
          />

          <Input
            label="Confirmer le nouveau mot de passe"
            type={showPasswords ? 'text' : 'password'}
            required
            value={formData.confirm_password}
            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
          />

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="h-4 w-4 text-purple-600 rounded"
            />
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Afficher les mots de passe
          </label>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="w-full"
          >
            <Lock className="h-4 w-4 mr-2" />
            {changePasswordMutation.isPending ? 'Modification...' : 'Changer le mot de passe'}
          </Button>
        </form>
      </div>
    </div>
  );
}