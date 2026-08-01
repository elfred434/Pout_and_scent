/**
 * ADMIN ORDERS — Gestion des commandes
 * Reproduit le Django Admin : détail complet, statut, notes, lignes de commande
 * Pout & Scent
 */
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/common/Button';
import { ShoppingCart, Clock, Truck, CheckCircle, XCircle, Eye, X, FileText } from 'lucide-react';
import { apiClient } from '@/api/client';

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: ordersData, isLoading } = useOrders();
  const orders = ordersData?.results || [];

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['order-detail', selectedOrderId],
    queryFn: () => apiClient.get(`/v1/orders/${selectedOrderId}/`).then(r => r.data),
    enabled: !!selectedOrderId,
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      apiClient.post(`/v1/orders/${id}/transition/`, { statut }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
    },
  });

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'EN_PREPARATION': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'EN_LIVRAISON': return <Truck className="h-5 w-5 text-blue-600" />;
      case 'LIVREE': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'EN_PREPARATION': return 'bg-yellow-100 text-yellow-700';
      case 'EN_LIVRAISON': return 'bg-blue-100 text-blue-700';
      case 'LIVREE': return 'bg-green-100 text-green-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  const nextStatus: Record<string, { label: string; statut: string; icon: any; color: string }> = {
    EN_PREPARATION: { label: 'Marquer en livraison', statut: 'EN_LIVRAISON', icon: Truck, color: 'bg-blue-600 hover:bg-blue-700' },
    EN_LIVRAISON: { label: 'Marquer livrée', statut: 'LIVREE', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Commandes</h1>
        <p className="text-neutral-600">{ordersData?.count || 0} commandes au total</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {isLoading ? (
          <div className="p-6 text-center text-neutral-500">Chargement...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900">Aucune commande</h3>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {orders.map((o: any) => (
              <div key={o.id} className="p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">{getStatusIcon(o.statut)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-900">#{o.id.slice(0, 8).toUpperCase()}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(o.statut)}`}>{o.statut.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm text-neutral-600">{o.user_email || o.user_nom || 'Client'} • {new Date(o.created_at).toLocaleDateString('fr-FR')}</p>
                      <p className="text-sm text-neutral-500">{o.nb_articles || 0} article(s)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-900">{parseFloat(o.montant_reduit || o.montant_total).toLocaleString('fr-FR')} FCFA</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => setSelectedOrderId(o.id)}
                        className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Eye className="h-5 w-5" /></button>
                      {nextStatus[o.statut] && (
                        <button onClick={() => transitionMutation.mutate({ id: o.id, statut: nextStatus[o.statut].statut })}
                          className={`p-2 text-white rounded-lg ${nextStatus[o.statut].color}`} title={nextStatus[o.statut].label}>
                          {(() => { const Icon = nextStatus[o.statut].icon; return <Icon className="h-5 w-5" />; })()}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {detail && (
        <OrderDetailModal order={detail} onClose={() => setSelectedOrderId(null)} onTransition={(statut) => transitionMutation.mutate({ id: detail.id, statut })} />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onTransition }: {
  order: any; onClose: () => void; onTransition: (statut: string) => void;
}) {
  const nextStatus: Record<string, { label: string; statut: string }> = {
    EN_PREPARATION: { label: '→ En livraison', statut: 'EN_LIVRAISON' },
    EN_LIVRAISON: { label: '→ Livrée', statut: 'LIVREE' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-neutral-900/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full my-8" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Modification de Commande</h2>
            <p className="text-sm text-neutral-500">Commande {order.id} — {order.user_email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Statut & Paiement */}
          <section>
            <h3 className="text-lg font-semibold text-primary-700 border-b border-primary-200 pb-2 mb-4">Statut & Paiement</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Statut</label>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    order.statut === 'EN_PREPARATION' ? 'bg-yellow-100 text-yellow-800' :
                    order.statut === 'EN_LIVRAISON' ? 'bg-blue-100 text-blue-800' :
                    order.statut === 'LIVREE' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>{order.statut.replace('_', ' ')}</span>
                  {nextStatus[order.statut] && (
                    <button onClick={() => onTransition(nextStatus[order.statut].statut)}
                      className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                      {nextStatus[order.statut].label}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Méthode de paiement</label>
                <p className="px-3 py-1.5 bg-neutral-50 rounded-lg text-sm">{order.methode_paiement}</p>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <h3 className="text-lg font-semibold text-primary-700 border-b border-primary-200 pb-2 mb-4">Notes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Notes client</label>
                <p className="px-3 py-2 bg-neutral-50 rounded-lg text-sm min-h-[60px]">{order.notes_client || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Notes admin</label>
                <p className="px-3 py-2 bg-neutral-50 rounded-lg text-sm min-h-[60px]">{order.notes_admin || '—'}</p>
              </div>
            </div>
          </section>

          {/* Informations */}
          <section>
            <h3 className="text-lg font-semibold text-primary-700 border-b border-primary-200 pb-2 mb-4">Informations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <InfoRow label="ID" value={order.id.slice(0, 8).toUpperCase()} />
              <InfoRow label="Client" value={order.user_email} />
              <InfoRow label="Adresse" value={order.adresse_libelle || order.adresse_complete || '—'} />
              <InfoRow label="Montant total" value={`${parseFloat(order.montant_total).toLocaleString('fr-FR')} FCFA`} />
              <InfoRow label="Montant réduit" value={`${parseFloat(order.montant_reduit).toLocaleString('fr-FR')} FCFA`} />
              <InfoRow label="Créée le" value={new Date(order.created_at).toLocaleString('fr-FR')} />
              {order.date_expiration_stock && <InfoRow label="Expiration stock" value={new Date(order.date_expiration_stock).toLocaleString('fr-FR')} />}
              {order.date_livraison && <InfoRow label="Date livraison" value={new Date(order.date_livraison).toLocaleString('fr-FR')} />}
            </div>
          </section>

          {/* Lignes de commande */}
          <section>
            <h3 className="text-lg font-semibold text-primary-700 border-b border-primary-200 pb-2 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" /> Lignes de commande
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="text-left px-3 py-2 font-medium text-neutral-600">Variante</th>
                  <th className="text-left px-3 py-2 font-medium text-neutral-600">Produit</th>
                  <th className="text-center px-3 py-2 font-medium text-neutral-600">Qté</th>
                  <th className="text-right px-3 py-2 font-medium text-neutral-600">Prix unitaire</th>
                  <th className="text-right px-3 py-2 font-medium text-neutral-600">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {order.lignes?.map((l: any) => (
                  <tr key={l.id} className="border-t border-neutral-100">
                    <td className="px-3 py-2">{l.contenance_ml}ml ({l.sku || '—'})</td>
                    <td className="px-3 py-2">{l.produit_nom || l.marque || '—'}</td>
                    <td className="px-3 py-2 text-center">{l.quantite}</td>
                    <td className="px-3 py-2 text-right">{parseFloat(l.prix_unitaire).toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-3 py-2 text-right font-medium">{parseFloat(l.sous_total).toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-300">
                  <td colSpan={4} className="px-3 py-3 text-right font-semibold">Total</td>
                  <td className="px-3 py-3 text-right font-bold text-primary-600 text-lg">
                    {parseFloat(order.montant_reduit || order.montant_total).toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>
        </div>

        <div className="p-6 border-t border-neutral-200">
          <Button onClick={onClose} className="w-full">Fermer</Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="font-medium text-neutral-900 truncate">{value}</p>
    </div>
  );
}
