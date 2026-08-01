/**
 * POLITIQUE DE CONFIDENTIALITÉ — Conformité Livre V du Code du numérique béninois
 * Articles 379 à 490 — Protection des données à caractère personnel
 */
import { Link } from 'react-router-dom';

export function PolitiqueConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Politique de confidentialité</h1>
      <p className="text-sm text-neutral-500 mb-8">Dernière mise à jour : 19 juillet 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-sm">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900">1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données à caractère personnel est :
          </p>
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p><strong>Pout & Scent</strong></p>
            <p>Cotonou, République du Bénin</p>
            <p>Email : <a href="mailto:dpo@poutscent.bj" className="text-primary-600">dpo@poutscent.bj</a></p>
            <p>Délégué à la Protection des Données (DPO) : [Nom — à compléter]</p>
          </div>
          <p className="mt-2">
            Le traitement des données a fait l'objet d'une déclaration auprès de l'
            <strong>Autorité de Protection des Données Personnelles (APDP)</strong> du Bénin,
            conformément aux articles 379 et suivants du Code du numérique.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">2. Données collectées</h2>
          <p>Nous collectons les données suivantes :</p>
          <table className="w-full border border-neutral-200 text-xs">
            <thead className="bg-neutral-50">
              <tr>
                <th className="p-2 text-left">Donnée</th>
                <th className="p-2 text-left">Base légale</th>
                <th className="p-2 text-left">Durée de conservation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2">Email, nom, prénom</td>
                <td className="p-2">Exécution du contrat</td>
                <td className="p-2">Durée de la relation commerciale + 3 ans</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Adresse de livraison</td>
                <td className="p-2">Exécution du contrat</td>
                <td className="p-2">5 ans maximum</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Téléphone</td>
                <td className="p-2">Exécution du contrat</td>
                <td className="p-2">Durée de la relation commerciale</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Historique de commandes</td>
                <td className="p-2">Obligation légale (comptabilité)</td>
                <td className="p-2">10 ans</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Adresse IP</td>
                <td className="p-2">Sécurité / Intérêt légitime</td>
                <td className="p-2">1 an</td>
              </tr>
              <tr className="border-t">
                <td className="p-2">Cookies</td>
                <td className="p-2">Consentement</td>
                <td className="p-2">13 mois maximum</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">3. Finalités du traitement</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gestion des comptes utilisateurs et authentification</li>
            <li>Traitement et suivi des commandes</li>
            <li>Livraison des produits</li>
            <li>Communication commerciale (avec consentement)</li>
            <li>Amélioration du site et analyse statistique</li>
            <li>Sécurité et prévention de la fraude</li>
            <li>Respect des obligations légales et réglementaires</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">4. Destinataires des données</h2>
          <p>Vos données peuvent être communiquées aux destinataires suivants :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Services internes de Pout & Scent (support client, comptabilité)</li>
            <li>Prestataires de livraison (pour les commandes)</li>
            <li>Hébergeurs cloud (Render, Vercel, Neon, Cloudinary)</li>
            <li>Autorités administratives ou judiciaires si requis par la loi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">5. Transfert de données hors du Bénin</h2>
          <p>
            Certains de nos prestataires (Cloudinary, Vercel, Render, Neon) sont hébergés
            en dehors du territoire béninois. Conformément à l'<strong>article 418 du Code du numérique</strong>,
            ces transferts font l'objet d'une <strong>autorisation préalable de l'APDP</strong> et
            sont encadrés par des clauses contractuelles garantissant un niveau de protection adéquat.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">6. Vos droits</h2>
          <p>
            Conformément au Livre V du Code du numérique béninois, vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
            <li><strong>Droit de suppression :</strong> demander l'effacement de vos données</li>
            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
            <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
            <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:dpo@poutscent.bj" className="text-primary-600">dpo@poutscent.bj</a>{' '}
            ou via votre espace personnel.
          </p>
          <p>
            Vous pouvez également introduire une réclamation auprès de l'
            <strong>APDP</strong> (Autorité de Protection des Données Personnelles).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">7. Sécurité des données</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
            pour protéger vos données contre tout accès non autorisé, perte, altération ou divulgation :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Chiffrement HTTPS sur l'ensemble du site</li>
            <li>Authentification JWT avec rotation des tokens</li>
            <li>Mots de passe hashés (bcrypt)</li>
            <li>Base de données avec connexion SSL</li>
            <li>Accès restreint aux données sensibles</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">8. Violation de données</h2>
          <p>
            En cas de violation de données personnelles, nous nous engageons à :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Notifier l'APDP dans un délai de <strong>72 heures</strong></li>
            <li>Informer les personnes concernées si la violation présente un risque élevé</li>
            <li>Documenter l'incident et les mesures correctives prises</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">9. Cookies</h2>
          <p>
            Pour en savoir plus sur les cookies utilisés sur ce site, consultez notre{' '}
            <Link to="/politique-cookies" className="text-primary-600 hover:underline">
              Politique de cookies
            </Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">10. Contact</h2>
          <p>
            Pour toute question relative à la protection de vos données personnelles :
          </p>
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p><strong>Délégué à la Protection des Données (DPO)</strong></p>
            <p>Email : <a href="mailto:dpo@poutscent.bj" className="text-primary-600">dpo@poutscent.bj</a></p>
            <p>Courrier : Pout & Scent, Cotonou, Bénin</p>
          </div>
        </section>
      </div>
    </div>
  );
}
