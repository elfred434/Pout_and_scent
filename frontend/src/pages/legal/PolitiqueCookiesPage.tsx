/**
 * POLITIQUE DE COOKIES — Conformité Livre V du Code du numérique béninois
 */
import { Link } from 'react-router-dom';

export function PolitiqueCookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de cookies</h1>
      <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 19 juillet 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-sm">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">1. Qu'est-ce qu'un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, smartphone)
            lors de la consultation d'un site web. Il permet au site de reconnaître votre appareil et
            de stocker certaines informations relatives à votre navigation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">2. Cookies utilisés sur ce site</h2>

          <h3 className="font-semibold text-gray-800 mt-4">🔒 Cookies strictement nécessaires</h3>
          <p>Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés.</p>
          <table className="w-full border border-gray-200 text-xs mt-2">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Nom</th>
                <th className="p-2 text-left">Finalité</th>
                <th className="p-2 text-left">Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2 font-mono">access_token</td>
                <td className="p-2">Authentification de l'utilisateur (JWT)</td>
                <td className="p-2">2 heures</td>
              </tr>
              <tr className="border-t">
                <td className="p-2 font-mono">refresh_token</td>
                <td className="p-2">Rafraîchissement du token d'authentification</td>
                <td className="p-2">7 jours</td>
              </tr>
              <tr className="border-t">
                <td className="p-2 font-mono">pout_scent_cart</td>
                <td className="p-2">Stockage du panier (Zustand)</td>
                <td className="p-2">Session</td>
              </tr>
              <tr className="border-t">
                <td className="p-2 font-mono">pout_scent_cookie_consent</td>
                <td className="p-2">Mémorisation de vos préférences de cookies</td>
                <td className="p-2">13 mois</td>
              </tr>
              <tr className="border-t">
                <td className="p-2 font-mono">remember_me</td>
                <td className="p-2">Choix « Se souvenir de moi »</td>
                <td className="p-2">Persistant</td>
              </tr>
            </tbody>
          </table>

          <h3 className="font-semibold text-gray-800 mt-6">📊 Cookies analytiques (optionnels)</h3>
          <p>Ces cookies nous aident à comprendre comment les visiteurs utilisent le site.</p>
          <table className="w-full border border-gray-200 text-xs mt-2">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Nom</th>
                <th className="p-2 text-left">Finalité</th>
                <th className="p-2 text-left">Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2 font-mono">_ga, _gid</td>
                <td className="p-2">Google Analytics (mesure d'audience)</td>
                <td className="p-2">13 mois</td>
              </tr>
            </tbody>
          </table>

          <h3 className="font-semibold text-gray-800 mt-6">🎯 Cookies marketing (optionnels)</h3>
          <p>Ces cookies permettent de personnaliser les publicités et de mesurer leur efficacité.</p>
          <table className="w-full border border-gray-200 text-xs mt-2">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Nom</th>
                <th className="p-2 text-left">Finalité</th>
                <th className="p-2 text-left">Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2 font-mono">Google OAuth</td>
                <td className="p-2">Connexion via Google (avec consentement)</td>
                <td className="p-2">Session</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">3. Gestion de vos préférences</h2>
          <p>
            Vous pouvez à tout moment modifier vos préférences de cookies en cliquant
            sur le bouton ci-dessous :
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('pout_scent_cookie_consent');
              window.location.reload();
            }}
            className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            🔄 Modifier mes préférences de cookies
          </button>
          <p className="mt-3">
            Vous pouvez également configurer votre navigateur pour accepter ou refuser les cookies.
            Attention : le refus des cookies nécessaires peut empêcher le bon fonctionnement du site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">4. Durée de conservation</h2>
          <p>
            Conformément au Code du numérique béninois, les cookies ont une durée de vie maximale de
            <strong> 13 mois</strong>. Au-delà, votre consentement sera de nouveau sollicité.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">5. Cadre légal</h2>
          <p>
            L'utilisation des cookies sur ce site est régie par le{' '}
            <strong>Livre V du Code du numérique béninois (Loi n° 2017-20)</strong>,
            relatif à la protection des données à caractère personnel.
          </p>
          <p>
            Pour plus d'informations, consultez notre{' '}
            <Link to="/politique-confidentialite" className="text-purple-600 hover:underline">
              Politique de confidentialité
            </Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">6. Contact</h2>
          <p>
            Pour toute question relative aux cookies :{' '}
            <a href="mailto:dpo@poutscent.bj" className="text-purple-600">dpo@poutscent.bj</a>
          </p>
        </section>
      </div>
    </div>
  );
}
