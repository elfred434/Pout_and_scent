// ============================================================
// LOGIN PAGE — Avec Google OAuth et 2FA
// ============================================================
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getRememberMe } from '@/lib/authStorage';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [rememberMe, setRememberMe] = useState(getRememberMe());
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  // Si déjà connecté, rediriger
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  // ✅ Handler pour Google Login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError('');
      console.log('✅ Google credential received');
      
      await googleLogin.mutateAsync({
        credential: credentialResponse.credential,
      });
      
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('❌ Google login error:', err);
      
      // ✅ CORRECTION : Extraire le message correctement
      let errorMessage = 'Erreur lors de la connexion avec Google';
      
      if (err.response?.data) {
        const data = err.response.data;
        
        // Structure custom du backend : {success: false, error: {code, message, details}}
        if (data.error?.message) {
          errorMessage = data.error.message;
        } 
        // Structure DRF standard : {detail: "..."}
        else if (data.detail) {
          errorMessage = data.detail;
        }
        // Structure avec message direct : {message: "..."}
        else if (data.message) {
          errorMessage = data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Google Login Failed');
    setError('Erreur lors de la connexion avec Google');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login.mutateAsync({
        ...formData,
        rememberMe,
      });

      // ✅ Vérifier si le backend demande le 2FA
      if (response.requires_2fa && response.temp_token) {
        console.log('🔐 2FA required, redirecting...');
        navigate(`/2fa?temp_token=${response.temp_token}&remember=${rememberMe}`);
        return;
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('❌ Login error:', err);

      // ✅ CORRECTION : Extraire le message correctement
      let errorMessage = 'Email ou mot de passe incorrect';
      
      if (err.response?.data) {
        const data = err.response.data;
        
        // Structure custom du backend : {success: false, error: {code, message, details}}
        if (data.error?.message) {
          errorMessage = data.error.message;
        }
        // Structure avec error string
        else if (typeof data.error === 'string') {
          errorMessage = data.error;
        }
        // Structure DRF standard : {detail: "..."}
        else if (data.detail) {
          errorMessage = data.detail;
        }
        // Structure avec message direct
        else if (data.message) {
          errorMessage = data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Connexion
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/inscription"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              créez un compte
            </Link>
          </p>
        </div>

        {/* ✅ ERREUR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ✅ COMPOSANT Google Login */}
        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            locale="fr"
          />
        </div>

        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">
              Ou avec email
            </span>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
            <Input
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 block text-sm text-gray-700">
                Se souvenir de moi
              </span>
            </label>
            <Link
              to="/password-reset"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" disabled={login.isPending} className="w-full">
            {login.isPending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}