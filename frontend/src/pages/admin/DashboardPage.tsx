/**
 * ADMIN DASHBOARD — Tableau de bord administrateur
 * Pout & Scent
 */
import { useQuery } from '@tanstack/react-query';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useActivePromotions } from '@/hooks/usePromotions';
import { useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Tag, 
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Play
} from 'lucide-react';
import { testAllApis } from '@/utils/apiTest';

export function DashboardPage() {
  const { data: productsData } = useProducts({ page: 1 });
  const { data: ordersData } = useOrders();
  const { data: promosData } = useActivePromotions();
  const [testing, setTesting] = useState(false);

  const handleTestApis = async () => {
    setTesting(true);
    try {
      await testAllApis();
    } finally {
      setTesting(false);
    }
  };

  const products = productsData?.results || [];
  const orders = ordersData?.results || [];
  const promos = promosData?.results || [];

  // Statistiques
  const totalProducts = productsData?.count || 0;
  const totalOrders = ordersData?.count || 0;
  const activePromos = promos.length;

  // Calculer le chiffre d'affaires
  const revenue = orders
    .filter(o => o.statut === 'LIVREE')
    .reduce((sum, order) => sum + parseFloat(order.montant_reduit || order.montant_total), 0);

  // Commandes par statut
  const ordersByStatus = {
    EN_PREPARATION: orders.filter(o => o.statut === 'EN_PREPARATION').length,
    EN_LIVRAISON: orders.filter(o => o.statut === 'EN_LIVRAISON').length,
    LIVREE: orders.filter(o => o.statut === 'LIVREE').length,
    ANNULEE: orders.filter(o => o.statut === 'ANNULEE').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Tableau de bord</h1>
          <p className="text-neutral-600">Vue d'ensemble de votre activité</p>
        </div>
        <button
          onClick={handleTestApis}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          title="Tester tous les endpoints API"
        >
          <Play className="h-4 w-4" />
          {testing ? 'Test en cours...' : 'Tester les API'}
        </button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Produits */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-primary-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-sm text-neutral-600 mb-1">Produits actifs</p>
          <p className="text-3xl font-bold text-neutral-900">{totalProducts}</p>
        </div>

        {/* Commandes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-sm text-neutral-600 mb-1">Total commandes</p>
          <p className="text-3xl font-bold text-neutral-900">{totalOrders}</p>
        </div>

        {/* Chiffre d'affaires */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-sm text-neutral-600 mb-1">Chiffre d'affaires</p>
          <p className="text-3xl font-bold text-neutral-900">
            {revenue.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
          </p>
        </div>

        {/* Promotions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-sm text-neutral-600 mb-1">Promotions actives</p>
          <p className="text-3xl font-bold text-neutral-900">{activePromos}</p>
        </div>
      </div>

      {/* Commandes par statut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistiques commandes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Commandes par statut</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-neutral-700">En préparation</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{ordersByStatus.EN_PREPARATION}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-neutral-700">En livraison</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{ordersByStatus.EN_LIVRAISON}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-neutral-700">Livrées</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{ordersByStatus.LIVREE}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-red-600">✕</span>
                <span className="text-sm text-neutral-700">Annulées</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{ordersByStatus.ANNULEE}</span>
            </div>
          </div>
        </div>

        {/* Dernières commandes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Dernières commandes</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">
                    {parseFloat(order.montant_reduit || order.montant_total).toLocaleString('fr-FR')} FCFA
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.statut === 'LIVREE' ? 'bg-green-100 text-green-700' :
                    order.statut === 'EN_LIVRAISON' ? 'bg-blue-100 text-blue-700' :
                    order.statut === 'EN_PREPARATION' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.statut.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
