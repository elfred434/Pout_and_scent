import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si déjà connecté, rediriger
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');
    setLoading(true);

    // Validation côté client
    if (formData.password !== formData.password_confirm) {
      setErrors({ password_confirm: ['Les mots de passe ne correspondent pas'] });
      setLoading(false);
      return;
    }

    if (formData.password.length < 10) {
      setErrors({ password: ['Le mot de passe doit contenir au moins 10 caractères'] });
      setLoading(false);
      return;
    }

    try {
      await register.mutateAsync(formData);
      navigate('/');
    } catch (error: any) {
      console.error('Register error:', error);

      // Le backend renvoie {success: false, error: {...}}
      if (error.response?.data) {
        const errorData = error.response.data;

        // Si c'est la structure custom du backend
        if (errorData.error) {
          // error.error peut être un objet avec des tableaux de messages
          const formattedErrors: Record<string, string[]> = {};
          
          if (typeof errorData.error === 'object') {
            Object.entries(errorData.error).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                formattedErrors[key] = value;
              } else if (typeof value === 'string') {
                formattedErrors[key] = [value];
              }
            });
          } else if (typeof errorData.error === 'string') {
            setGlobalError(errorData.error);
          }
          
          setErrors(formattedErrors);
        } else {
          // Structure DRF standard
          const formattedErrors: Record<string, string[]> = {};
          Object.entries(errorData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              formattedErrors[key] = value;
            } else if (typeof value === 'string') {
              formattedErrors[key] = [value];
            }
          });
          setErrors(formattedErrors);
        }
      } else if (error.message) {
        setGlobalError(error.message);
      } else {
        setGlobalError('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/connexion"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              connectez-vous
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {globalError}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Prénom"
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              error={errors.first_name?.[0]}
            />
            <Input
              label="Nom"
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
              error={errors.last_name?.[0]}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
              error={errors.email?.[0]}
            />
            <Input
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="new-password"
              error={errors.password?.[0]}
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              value={formData.password_confirm}
              onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
              required
              autoComplete="new-password"
              error={errors.password_confirm?.[0]}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Inscription...
              </>
            ) : (
              'S\'inscrire'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}