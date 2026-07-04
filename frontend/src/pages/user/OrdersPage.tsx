// ============================================================
// ORDERS PAGE — Historique des commandes (CORRIGÉ)
// ============================================================
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

interface LigneCommande {
  id: string;
  variante?: {
    produit?: { nom: string; marque: string };
    contenance_ml?: number;
  };
  quantite: number;
  prix_unitaire: string;
  sous_total: string;
}

interface Commande {
  id: string;
  statut: 'EN_PREPARATION' | 'EN_LIVRAISON' | 'LIVREE' | 'ANNULEE' | 'EXPIREE';
  montant_total: string;
  created_at: string;
  lignes: LigneCommande[];
}

const statutConfig = {
  EN_PREPARATION: { label: 'En préparation', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  EN_LIVRAISON: { label: 'En livraison', color: 'bg-blue-100 text-blue-700', icon: Truck },
  LIVREE: { label: 'Livrée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  ANNULEE: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: XCircle },
  EXPIREE: { label: 'Expirée', color: 'bg-gray-100 text-gray-700', icon: XCircle },
};

export function OrdersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/orders/');
      // ✅ GESTION DE LA PAGINATION DRF
      return response.data?.results || response.data;
    },
  });

  const orders = (data || []) as Commande[];

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <p className="text-red-600 mb-4">Impossible de charger vos commandes</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes commandes</h2>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statutConfig[order.statut] || statutConfig.EN_PREPARATION;
            const StatusIcon = config.icon;

            return (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Commande #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    {config.label}
                  </span>
                </div>

                {/* ✅ SÉCURITÉ SUR LES LIGNES */}
                {order.lignes && order.lignes.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    {order.lignes.slice(0, 3).map((ligne) => (
                      <div key={ligne.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {ligne.quantite}x {ligne.variante?.produit?.marque || 'Produit'} - {ligne.variante?.produit?.nom || 'Nom inconnu'} ({ligne.variante?.contenance_ml || '?'} ml)
                        </span>
                        <span className="font-medium">
                          {parseFloat(ligne.sous_total).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    ))}
                    {order.lignes.length > 3 && (
                      <p className="text-xs text-gray-500">
                        + {order.lignes.length - 3} autre(s) article(s)
                      </p>
                    )}
                  </div>
                )}

                <div className="border-t mt-3 pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-lg font-bold text-purple-600">
                    {parseFloat(order.montant_total).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Vous n'avez pas encore de commandes</p>
          <Link to="/catalogue">
            <Button>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Découvrir nos produits
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}