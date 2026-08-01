import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authEndpoints } from '@/api/endpoints';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

export function PasswordResetConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Récupérer le token depuis l'URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      setError('Lien de réinitialisation invalide ou expiré.');
      return;
    }
    setToken(urlToken);
  }, [searchParams]);

  const resetConfirm = useMutation({
    mutationFn: (data: {
      token: string;
      password: string;
      password_confirm: string;
    }) => authEndpoints.passwordResetConfirm(data).then((res) => res.data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/connexion'), 3000);
    },
    onError: (err: any) => {
      const errors = err.response?.data;
      if (errors?.password) {
        setError(Array.isArray(errors.password) ? errors.password.join(', ') : errors.password);
      } else if (errors?.token) {
        setError('Le lien de réinitialisation est invalide ou a expiré.');
      } else {
        setError(
          errors?.detail ||
            errors?.message ||
            'Une erreur est survenue. Veuillez réessayer.'
        );
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 10) {
      setError('Le mot de passe doit contenir au moins 10 caractères.');
      return;
    }

    if (!token) return;

    setError('');
    resetConfirm.mutate({
      token,
      password,
      password_confirm: passwordConfirm,
    });
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="h-8 w-8 text-green-600"
            />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Mot de passe réinitialisé !
          </h2>
          <p className="text-neutral-600">
            Votre mot de passe a été mis à jour avec succès.
          </p>
          <p className="text-sm text-neutral-500">
            Vous allez être redirigé vers la page de connexion...
          </p>
          <Link
            to="/connexion"
            className="inline-block text-primary-600 hover:text-primary-700 font-medium"
          >
            Se connecter maintenant
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100">
            <FontAwesomeIcon
              icon={faLock}
              className="h-8 w-8 text-primary-600"
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
            Nouveau mot de passe
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Entrez votre nouveau mot de passe
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="mr-2 mt-0.5"
              />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Nouveau mot de passe
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={10}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Au moins 10 caractères
            </p>
          </div>

          <div>
            <label
              htmlFor="password_confirm"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Confirmer le mot de passe
            </label>
            <Input
              id="password_confirm"
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              autoComplete="new-password"
              minLength={10}
            />
          </div>

          <Button
            type="submit"
            disabled={resetConfirm.isPending || !token}
            className="w-full"
          >
            {resetConfirm.isPending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Réinitialisation...
              </>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
