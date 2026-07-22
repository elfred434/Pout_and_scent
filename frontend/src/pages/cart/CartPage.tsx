import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const { data: productsData } = useProducts({ page: 1 });

  // Cross-sell : produits recommandés
  const recommendedProducts = productsData?.results?.slice(0, 4) || [];

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="text-center space-y-6 px-6">
          <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-title text-neutral-900 dark:text-white">Votre panier est vide</h2>
            <p className="text-body text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              Decouvrez notre collection et trouvez le parfum parfait pour vous
            </p>
          </div>
          <Link to="/catalogue" className="btn-primary inline-flex">
            Voir le catalogue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ═══ Header — fond blanc ═══ */}
      <section className="bg-white dark:bg-neutral-900 py-12 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tiny font-semibold text-primary-600 uppercase tracking-[0.2em] mb-2">
                Panier
              </p>
              <h1 className="text-display text-neutral-900 dark:text-white">
                Votre <span className="text-primary-600">panier</span>
              </h1>
            </div>
            <button
              onClick={clearCart}
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-red-600 transition-colors"
            >
              Vider le panier
            </button>
          </div>
        </div>
      </section>

      {/* ═══ Contenu — fond gris ═══ */}
      <section className="py-12 bg-neutral-150 dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Liste des articles */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.variante_id} className="card-static dark:bg-neutral-900 dark:border-neutral-700 p-6">
                  <div className="flex gap-6">
                    {/* Image avec cadre */}
                    <div className="w-24 h-32 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200 dark:border-neutral-700">
                      <img
                        src={item.image_url || 'https://via.placeholder.com/96x128?text=P%26S'}
                        alt={item.produit_nom}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Infos */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-tiny font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          {item.produit_marque}
                        </p>
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-white mt-1">
                          {item.produit_nom}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {item.contenance_ml} ml
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Sélecteur de quantité premium */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.variante_id, Math.max(1, item.quantite - 1))}
                            className="qty-btn dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                          >
                            -
                          </button>
                          <span className="qty-value dark:text-white">{item.quantite}</span>
                          <button
                            onClick={() => updateQuantity(item.variante_id, item.quantite + 1)}
                            className="qty-btn dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <p className="text-base font-semibold text-neutral-900 dark:text-white">
                            {(item.prix * item.quantite).toLocaleString('fr-FR')} FCFA
                          </p>
                          <button
                            onClick={() => removeItem(item.variante_id)}
                            className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé de la commande — carte distincte */}
            <div className="lg:col-span-1">
              <div className="card-static dark:bg-neutral-900 dark:border-neutral-700 p-6 space-y-6 sticky top-24">
                <h2 className="text-title text-neutral-900 dark:text-white">Resume de la commande</h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Sous-total</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {totalPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <div className="divider dark:border-neutral-700" />

                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Livraison</span>
                    <span className="font-medium text-neutral-900 dark:text-white">A definir</span>
                  </div>

                  <div className="divider dark:border-neutral-700" />

                  <div className="flex justify-between text-base pt-2">
                    <span className="font-semibold text-neutral-900 dark:text-white">Total</span>
                    <span className="font-semibold text-primary-600 text-lg">
                      {totalPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                <Link to="/checkout" className="btn-primary w-full shadow-md">
                  Passer la commande
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                  Paiement a la livraison
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Cross-sell — fond blanc ═══ */}
      <section className="py-12 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-tiny font-semibold text-primary-600 uppercase tracking-[0.2em] mb-2">
              Vous aimerez aussi
            </p>
            <h2 className="text-display text-neutral-900 dark:text-white">
              Produits <span className="text-primary-600">recommandes</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <Link
                key={product.id}
                to={`/produit/${product.id}`}
                className="group block"
              >
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-700 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
                    <img
                      src={product.images?.[0]?.image || 'https://via.placeholder.com/400x500?text=P%26S'}
                      alt={product.nom}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-tiny font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {product.marque}
                    </p>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2">
                      {product.nom}
                    </h3>
                    {product.variantes?.[0] && (
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {parseFloat(product.variantes[0].prix).toLocaleString('fr-FR')} FCFA
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
