import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authEndpoints } from '@/api/endpoints';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faSpinner,
  faCheckCircle,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';

export function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const resetPassword = useMutation({
    mutationFn: (data: { email: string }) =>
      authEndpoints.passwordReset(data).then((res) => res.data),
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword.mutate({ email });
  };

  if (success) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex items-start justify-center bg-neutral-50 px-4 py-8 sm:items-center sm:px-6 sm:py-12 lg:px-8 dark:bg-neutral-950">
        <div className="card-static max-w-md w-full space-y-8 p-6 text-center sm:p-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="h-8 w-8 text-green-600"
            />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Email envoyé !
          </h2>
          <p className="text-neutral-600">
            Si un compte existe avec l'adresse <strong>{email}</strong>, vous
            recevrez un email avec les instructions pour réinitialiser votre mot
            de passe.
          </p>
          <p className="text-sm text-neutral-500">
            Vérifiez votre dossier spam si vous ne recevez pas l'email.
          </p>
          <Link
            to="/connexion"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-start justify-center bg-neutral-50 px-4 py-8 sm:items-center sm:px-6 sm:py-12 lg:px-8 dark:bg-neutral-950">
      <div className="card-static max-w-md w-full space-y-8 p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="h-8 w-8 text-primary-600"
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
            Mot de passe oublié ?
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {resetPassword.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {(resetPassword.error as any)?.response?.data?.detail ||
                'Une erreur est survenue. Veuillez réessayer.'}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Adresse email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <Button
            type="submit"
            disabled={resetPassword.isPending}
            className="w-full"
          >
            {resetPassword.isPending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Envoi en cours...
              </>
            ) : (
              'Envoyer le lien'
            )}
          </Button>

          <div className="text-center">
            <Link
              to="/connexion"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
