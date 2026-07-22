/**
 * MENTIONS LÉGALES — Conformité Code du numérique béninois (Livre IV, art. 326-378)
 */
import { Link } from 'react-router-dom';

export function MentionsLegalesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions légales</h1>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Éditeur du site</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Raison sociale :</strong> Pout & Scent</p>
            <p><strong>Forme juridique :</strong> [SARL / SAS / Entreprise individuelle — à compléter]</p>
            <p><strong>Capital social :</strong> [Montant] FCFA</p>
            <p><strong>Siège social :</strong> Cotonou, République du Bénin</p>
            <p><strong>Registre de Commerce (RCCM) :</strong> [Numéro — à compléter]</p>
            <p><strong>Identifiant Fis Permanent (IFP) :</strong> [Numéro — à compléter]</p>
            <p><strong>Directeur de la publication :</strong> [Nom du dirigeant — à compléter]</p>
            <p><strong>Téléphone :</strong> +229 [XX XX XX XX]</p>
            <p><strong>Email :</strong> contact@poutscent.bj</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Hébergeur</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Backend (API) :</strong> Render.com — [Adresse de l'hébergeur]</p>
            <p><strong>Frontend :</strong> Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
            <p><strong>Base de données :</strong> Neon Inc. — [Adresse]</p>
            <p><strong>Stockage médias :</strong> Cloudinary Ltd. — [Adresse]</p>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ⚠️ Conformément à l'article 379 et suivants du Code du numérique béninois,
            le transfert de données hors du Bénin fait l'objet d'une autorisation préalable de l'APDP.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu de ce site (textes, images, logos, marques, base de données)
            est protégé par le droit d'auteur et le droit de la propriété intellectuelle.
            Toute reproduction, représentation, modification ou adaptation, totale ou partielle,
            est strictement interdite sans l'autorisation écrite préalable de Pout & Scent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Protection des données personnelles</h2>
          <p>
            Conformément au <strong>Livre V du Code du numérique béninois (Loi n° 2017-20)</strong>,
            le traitement des données personnelles collectées sur ce site a fait l'objet d'une
            déclaration auprès de l'<strong>Autorité de Protection des Données Personnelles (APDP)</strong>.
          </p>
          <p>
            Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité
            de vos données. Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:dpo@poutscent.bj" className="text-purple-600 hover:underline">dpo@poutscent.bj</a>.
          </p>
          <p>
            Pour plus d'informations, consultez notre{' '}
            <Link to="/politique-confidentialite" className="text-purple-600 hover:underline">
              Politique de confidentialité
            </Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies</h2>
          <p>
            Ce site utilise des cookies. Pour en savoir plus et gérer vos préférences,
            consultez notre{' '}
            <Link to="/politique-cookies" className="text-purple-600 hover:underline">
              Politique de cookies
            </Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Droit applicable et juridiction</h2>
          <p>
            Les présentes mentions légales sont régies par le droit béninois, et notamment
            la <strong>Loi n° 2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin</strong>.
          </p>
          <p>
            En cas de litige, les tribunaux de Cotonou seront seuls compétents.
            Le consommateur peut également recourir à un médiateur de la consommation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Réglementation cosmétiques</h2>
          <p>
            Les produits cosmétiques vendus sur ce site sont conformes à l'
            <strong>Arrêté ministériel du 18 janvier 2022</strong> portant conditions d'importation,
            de distribution et de vente des produits cosmétiques en République du Bénin.
          </p>
          <p>
            Chaque produit dispose d'une <strong>Autorisation de Mise sur le Marché (AMM)</strong> délivrée
            par l'ABMed (Agence béninoise du Médicament et des autres produits de Santé).
          </p>
          <p>
            Pour signaler un effet indésirable, utilisez notre{' '}
            <Link to="/signalement" className="text-purple-600 hover:underline">
              formulaire de signalement
            </Link>{' '}
            ou contactez directement l'ABMed au <strong>01 51 20 98 15</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
