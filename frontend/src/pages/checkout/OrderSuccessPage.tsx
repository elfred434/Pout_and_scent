// ============================================================
// ORDER SUCCESS PAGE — Confirmation après checkout
// ============================================================
import { Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button';

export function OrderSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Commande confirmée !
      </h1>
      <p className="text-lg text-gray-600 mb-2">
        Merci pour votre confiance. Votre commande a été enregistrée avec succès.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Vous avez 72h avant expiration automatique du stock réservé. 
        Paiement à la livraison.
      </p>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Package className="h-5 w-5" /> Prochaines étapes
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Vous recevrez un email de confirmation sous peu</li>
          <li>Notre équipe prépare votre colis (statut: En préparation)</li>
          <li>Livraison à domicile à Cotonou et environs</li>
          <li>Paiement en espèces ou Mobile Money à la réception</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/profil/commandes">
          <Button className="w-full sm:w-auto gap-2">
            Voir mes commandes <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/catalogue">
          <Button variant="outline" className="w-full sm:w-auto">
            Continuer vos achats
          </Button>
        </Link>
      </div>
    </div>
  );
}
