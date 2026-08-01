/**
 * SECURITY PAGE — Changement de mot de passe
 * Pout & Scent
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { toast } from '@/components/common/ToastContainer';
import { extractApiError } from '@/hooks/useToast';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';

export function SecurityPage() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { current_password: string; new_password: string }) => {
      await apiClient.post('/auth/password/change/', data);
    },
    onSuccess: () => {
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Mot de passe modifié avec succès !');
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.new_password.length < 10) {
      toast.warning('Le mot de passe doit contenir au moins 10 caractères');
      return;
    }

    changePasswordMutation.mutate({
      current_password: formData.current_password,
      new_password: formData.new_password,
    });
  };

  return (
    <div className="surface p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-neutral-900">Sécurité</h2>
      </div>

      <div className="max-w-lg">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Conseil :</strong> Utilisez un mot de passe unique d'au moins 10 caractères,
            mélangeant lettres, chiffres et caractères spéciaux.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mot de passe actuel"
            type={showPasswords ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={formData.current_password}
            onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
          />

          <Input
            label="Nouveau mot de passe"
            type={showPasswords ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={formData.new_password}
            onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
          />

          <Input
            label="Confirmer le nouveau mot de passe"
            type={showPasswords ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={formData.confirm_password}
            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
          />

          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="check-control"
            />
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Afficher les mots de passe
          </label>

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
