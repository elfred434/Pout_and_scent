/**
 * CONDITIONS GÉNÉRALES DE VENTE — Conformité Code du numérique béninois (Livre IV)
 */
import { Link } from 'react-router-dom';

export function CGVPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales de Vente</h1>
      <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 19 juillet 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-sm">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 1 — Objet et champ d'application</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles
            entre <strong>Pout & Scent</strong> (ci-après « le Vendeur ») et toute personne physique
            ou morale souhaitant effectuer un achat sur le site <strong>poutscent.bj</strong> (ci-après « le Client »).
          </p>
          <p>
            Conformément au <strong>Livre IV du Code du numérique béninois (Loi n° 2017-20)</strong>,
            les présentes CGV s'appliquent à toute commande, contrat ou transaction conclu en ligne.
          </p>
          <p>
            Le fait de passer une commande implique l'acceptation sans réserve des présentes CGV.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 2 — Identification du Vendeur</h2>
          <ul className="list-none space-y-1">
            <li><strong>Raison sociale :</strong> Pout & Scent</li>
            <li><strong>Siège social :</strong> Cotonou, République du Bénin</li>
            <li><strong>RCCM :</strong> [à compléter]</li>
            <li><strong>IFP :</strong> [à compléter]</li>
            <li><strong>Email :</strong> contact@poutscent.bj</li>
            <li><strong>Téléphone :</strong> +229 [XX XX XX XX]</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 3 — Produits</h2>
          <p>
            Les produits proposés à la vente sont des parfums et cosmétiques.
            Chaque produit est décrit avec ses caractéristiques essentielles : composition (liste INCI),
            pays d'origine, contenance, prix TTC en FCFA, disponibilité.
          </p>
          <p>
            Conformément à l'<strong>Arrêté du 18 janvier 2022</strong>, tous les produits cosmétiques
            vendus sur ce site disposent d'une <strong>Autorisation de Mise sur le Marché (AMM)</strong>
            délivrée par l'ABMed.
          </p>
          <p>
            Les photographies des produits sont fournies à titre indicatif et ne sont pas contractuelles.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 4 — Prix</h2>
          <p>
            Les prix sont indiqués en <strong>Francs CFA (XOF)</strong>, toutes taxes comprises (TTC).
            Le Vendeur se réserve le droit de modifier ses prix à tout moment, étant entendu que
            le prix applicable est celui en vigueur au jour de la commande.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 5 — Commande (Double confirmation)</h2>
          <p>
            Conformément au principe du « double clic » prévu par le Code du numérique béninois :
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Le Client sélectionne les produits et les ajoute à son panier.</li>
            <li>Le Client vérifie le détail de sa commande (produits, quantités, prix total).</li>
            <li>Le Client choisit son adresse de livraison et confirme en cochant la case d'acceptation des CGV.</li>
            <li>Le Client clique sur « Confirmer la commande » pour valider définitivement.</li>
          </ol>
          <p>
            La validation de la commande vaut acceptation expresse des présentes CGV.
            Un <strong>accusé de réception</strong> est envoyé par email au Client sans délai injustifié.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 6 — Paiement</h2>
          <p>
            Le paiement s'effectue <strong>en espèces à la livraison</strong>.
            Aucun paiement en ligne n'est requis au moment de la commande.
          </p>
          <p>
            Le Client s'engage à régler le montant exact de la commande au livreur,
            en Francs CFA (XOF).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 7 — Livraison</h2>
          <p>
            Les livraisons sont effectuées à l'adresse indiquée par le Client lors de la commande,
            dans la zone de couverture du Vendeur (République du Bénin).
          </p>
          <p>
            Le délai de livraison est de <strong>72 heures maximum</strong> à compter de la validation
            de la commande, sauf cas de force majeure.
          </p>
          <p>
            En cas d'absence du Client, le livreur tentera de le contacter par téléphone.
            Après 3 tentatives, la commande sera annulée et le stock libéré.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 8 — Droit de rétractation</h2>
          <p>
            Conformément au Code du numérique béninois, le Client dispose d'un délai de
            <strong> 7 jours ouvrables</strong> à compter de la réception du produit pour exercer
            son droit de rétractation, sans avoir à justifier de motif ni à payer de pénalité.
          </p>
          <p>
            Le produit doit être retourné dans son emballage d'origine, non ouvert et en parfait état.
            Le remboursement sera effectué dans un délai de 14 jours à compter de la réception du retour.
          </p>
          <p>
            <strong>Exceptions :</strong> Les produits cosmétiques ouverts ou descellés ne peuvent être
            retournés pour des raisons d'hygiène et de santé publique.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 9 — Garantie légale de conformité</h2>
          <p>
            Le Vendeur garantit la conformité des produits aux descriptions fournies sur le site.
            En cas de défaut de conformité, le Client peut demander le remplacement ou le remboursement
            du produit dans un délai de <strong>2 ans</strong> à compter de la livraison.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 10 — Annulation et expiration</h2>
          <p>
            Les commandes non confirmées par le Client (stock réservé mais non livré) expirent
            automatiquement après <strong>72 heures</strong>. Le stock est alors libéré.
          </p>
          <p>
            Le Client peut annuler sa commande à tout moment avant l'expédition, sans frais.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 11 — Signalement d'effets indésirables</h2>
          <p>
            Conformément à la réglementation ABMed, tout effet indésirable lié à l'utilisation
            d'un produit cosmétique doit être signalé via notre{' '}
            <Link to="/signalement" className="text-purple-600 hover:underline">formulaire de signalement</Link>{' '}
            ou directement à l'ABMed au <strong>01 51 20 98 15</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 12 — Protection des données personnelles</h2>
          <p>
            Les données personnelles collectées sont traitées conformément au{' '}
            <strong>Livre V du Code du numérique béninois</strong>. Pour plus d'informations,
            consultez notre{' '}
            <Link to="/politique-confidentialite" className="text-purple-600 hover:underline">
              Politique de confidentialité
            </Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 13 — Médiation et litiges</h2>
          <p>
            En cas de litige, le Client peut recourir gratuitement à un médiateur de la consommation.
            Les coordonnées du médiateur seront communiquées sur demande.
          </p>
          <p>
            À défaut d'accord amiable, le litige sera porté devant les tribunaux compétents de Cotonou.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Article 14 — Droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit béninois, et notamment à la{' '}
            <strong>Loi n° 2017-20 du 20 avril 2018 portant Code du numérique</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
