// ============================================================
// REGISTER PAGE — Avec Google OAuth
// ============================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, googleLogin, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState('');

  // Si déjà connecté, rediriger
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  // ✅ Handler pour Google Login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setGlobalError('');
      console.log('✅ Google credential received');

      await googleLogin.mutateAsync({
        credential: credentialResponse.credential,
      });

      navigate('/');
    } catch (err: any) {
      console.error('❌ Google login error:', err);
      setGlobalError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Erreur lors de la connexion avec Google'
      );
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Google Login Failed');
    setGlobalError('Erreur lors de la connexion avec Google');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    // Validation côté client
    if (formData.password !== formData.password_confirm) {
      setErrors({ password_confirm: ['Les mots de passe ne correspondent pas'] });
      return;
    }

    if (formData.password.length < 10) {
      setErrors({ password: ['Le mot de passe doit contenir au moins 10 caractères'] });
      return;
    }

    try {
      await register.mutateAsync(formData);
      navigate('/');
    } catch (error: any) {
      console.error('Register error:', error);

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.error) {
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
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="card-static max-w-md w-full space-y-8 p-6 sm:p-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-neutral-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Ou{' '}
            <Link
              to="/connexion"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              connectez-vous
            </Link>
          </p>
        </div>

        {/* ✅ ERREUR GLOBALE */}
        {globalError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {globalError}
          </div>
        )}

        {/* ✅ COMPOSANT Google Login */}
        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
            locale="fr"
          />
        </div>

        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-neutral-50 text-neutral-500">
              Ou avec email
            </span>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

          <Button type="submit" disabled={register.isPending} className="w-full">
            {register.isPending ? (
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
