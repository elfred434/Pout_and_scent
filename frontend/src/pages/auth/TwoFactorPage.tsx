import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authEndpoints } from '@/api/endpoints';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { setTokens } from '@/lib/authStorage';

export function TwoFactorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true); // ✅ Par défaut true

  // Récupérer le temp_token et rememberMe depuis l'URL
  useEffect(() => {
    const token = searchParams.get('temp_token');
    const remember = searchParams.get('remember') === 'true';

    if (!token) {
      navigate('/connexion');
      return;
    }
    setTempToken(token);
    setRememberMe(remember); // ✅ Restaurer le choix
  }, [searchParams, navigate]);

  const verify2FA = useMutation({
    mutationFn: (data: { temp_token: string; otp_code: string }) =>
      authEndpoints.verify2FA(data).then((res) => res.data),
    onSuccess: (response) => {
      // Stocker les tokens selon le choix "Se souvenir de moi"
      const tokens = response.data || response;
      if (tokens.access && tokens.refresh) {
        setTokens(tokens.access, tokens.refresh, rememberMe); // ✅ Utiliser le helper
        console.log(`✅ 2FA verified, tokens stored (${rememberMe ? 'localStorage' : 'sessionStorage'})`);
        navigate('/');
      } else {
        setError('Réponse invalide du serveur');
      }
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Code OTP invalide. Veuillez réessayer.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) return;

    setError('');
    verify2FA.mutate({
      temp_token: tempToken,
      otp_code: otpCode,
    });
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-start justify-center bg-neutral-50 px-4 py-8 sm:items-center sm:px-6 sm:py-12 lg:px-8 dark:bg-neutral-950">
      <div className="card-static max-w-md w-full space-y-8 p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100">
            <FontAwesomeIcon
              icon={faShieldAlt}
              className="h-8 w-8 text-primary-600"
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
            Vérification 2FA
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Entrez le code à 6 chiffres de votre application d'authentification
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="otp_code"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Code OTP
            </label>
            <Input
              id="otp_code"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              pattern="[0-9]{6}"
              required
              autoComplete="one-time-code"
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <Button
            type="submit"
            disabled={verify2FA.isPending || otpCode.length !== 6}
            className="w-full"
          >
            {verify2FA.isPending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Vérification...
              </>
            ) : (
              'Vérifier'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
