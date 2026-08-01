/**
 * Bannière de consentement cookies — Conformité Code du numérique béninois (Livre V)
 * Affichée au premier visite, permet d'accepter/refuser/personnaliser les cookies.
 */
import { useState, useEffect } from 'react';
import { Shield, Settings, X } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'pout_scent_cookie_consent';

export function getCookieConsent(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Toujours actifs
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setIsVisible(false);
  };

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  };

  const rejectAll = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[88dvh] overflow-y-auto bg-white dark:bg-neutral-900 border-t border-primary-300 dark:border-primary-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!showDetails ? (
          <>
            <div className="flex items-start gap-4 mb-4">
              <Shield className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  🍪 Respect de votre vie privée
                </h3>
                <p className="text-sm text-neutral-600">
                  Conformément au <strong>Code du numérique béninois (Loi n° 2017-20, Livre V)</strong>,
                  nous utilisons des cookies pour améliorer votre expérience, analyser notre trafic
                  et personnaliser notre contenu. Vous pouvez accepter, refuser ou personnaliser
                  vos préférences à tout moment.
                </p>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="icon-btn"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="form-actions !pt-0">
              <button
                onClick={acceptAll}
                className="btn-primary"
              >
                ✓ Tout accepter
              </button>
              <button
                onClick={rejectAll}
                className="btn-secondary"
              >
                ✗ Tout refuser
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="btn-secondary"
              >
                <Settings className="h-4 w-4" />
                Personnaliser
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary-600" />
                Préférences de cookies
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="icon-btn"
                aria-label="Retour"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Cookies nécessaires */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cookie-necessary"
                  checked={true}
                  disabled
                  className="check-control mt-0.5"
                />
                <div>
                  <label htmlFor="cookie-necessary" className="font-medium text-neutral-900">
                    Cookies nécessaires (toujours actifs)
                  </label>
                  <p className="text-sm text-neutral-600">
                    Essentiels au fonctionnement du site (authentification, panier, sécurité).
                  </p>
                </div>
              </div>

              {/* Cookies analytiques */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cookie-analytics"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="check-control mt-0.5"
                />
                <div>
                  <label htmlFor="cookie-analytics" className="font-medium text-neutral-900">
                    Cookies analytiques
                  </label>
                  <p className="text-sm text-neutral-600">
                    Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                  </p>
                </div>
              </div>

              {/* Cookies marketing */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cookie-marketing"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="check-control mt-0.5"
                />
                <div>
                  <label htmlFor="cookie-marketing" className="font-medium text-neutral-900">
                    Cookies marketing
                  </label>
                  <p className="text-sm text-neutral-600">
                    Permettent de vous proposer des offres personnalisées et de mesurer l'efficacité de nos campagnes.
                  </p>
                </div>
              </div>
            </div>

            <div className="form-actions !pt-0">
              <button
                onClick={saveCustom}
                className="btn-primary"
              >
                Enregistrer mes préférences
              </button>
              <button
                onClick={acceptAll}
                className="btn-secondary"
              >
                Tout accepter
              </button>
              <button
                onClick={rejectAll}
                className="btn-secondary"
              >
                Tout refuser
              </button>
            </div>
          </>
        )}

        <p className="text-xs text-neutral-500 mt-4">
          Pour en savoir plus, consultez notre{' '}
          <a href="/politique-cookies" className="text-primary-600 hover:underline">
            Politique de cookies
          </a>{' '}
          et notre{' '}
          <a href="/politique-confidentialite" className="text-primary-600 hover:underline">
            Politique de confidentialité
          </a>.
        </p>
      </div>
    </div>
  );
}
