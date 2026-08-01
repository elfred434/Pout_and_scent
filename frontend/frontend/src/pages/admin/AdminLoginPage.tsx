/**
 * ADMIN LOGIN PAGE — Page de connexion administrateur
 * Pout & Scent
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Shield, Lock } from 'lucide-react';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Rediriger si déjà connecté et admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login.mutateAsync({
        ...formData,
        rememberMe: true,
      });

      // Vérifier si l'utilisateur est admin
      if (response.user?.role !== 'ADMIN') {
        setError('Accès réservé aux administrateurs');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err: any) {
      let errorMessage = 'Email ou mot de passe incorrect';

      if (err.response?.data) {
        const data = err.response.data;
        if (data.error?.message) {
          errorMessage = data.error.message;
        } else if (data.detail) {
          errorMessage = typeof data.detail === 'string' ? data.detail : 'Erreur d\'authentification';
        }
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Administration
          </h1>
          <p className="text-neutral-600">
            Connectez-vous pour accéder au panneau d'administration
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email administrateur"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
              placeholder="admin@poutscent.bj"
            />

            <Input
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />

            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full"
            >
              <Lock className="h-5 w-5 mr-2" />
              {login.isPending ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
            >
              ← Retour au site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
