import { Link } from 'react-router-dom';
import { Tag, Clock, ArrowRight, Gift } from 'lucide-react';
import { useActivePromotions } from '@/hooks/usePromotions';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';

export function PromotionsPage() {
  const { data: promosData, isLoading: isLoadingPromos } = useActivePromotions();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ page: 1 });

  const promos = promosData?.results || [];
  const products = productsData?.results || [];

  const now = new Date();
  const activePromos = promos.filter((p) => {
    const debut = new Date(p.date_debut);
    const fin = new Date(p.date_fin);
    return p.is_active && now >= debut && now <= fin;
  });

  const isLoading = isLoadingPromos || isLoadingProducts;

  return (
    <div className="min-h-screen">
      {/* ═══ Header — fond blanc ═══ */}
      <section className="bg-white dark:bg-neutral-900 py-12 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-3">
            <p className="text-tiny font-semibold text-primary-600 uppercase tracking-[0.2em]">
              Offres speciales
            </p>
            <h1 className="text-display-lg text-neutral-900 dark:text-white">
              <span className="text-primary-600">Promotions</span> en cours
            </h1>
            <p className="text-body text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Profitez de nos offres exceptionnelles sur une selection de parfums et cosmetiques
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Liste des promotions — fond gris ═══ */}
      <section className="py-12 bg-neutral-150 dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-static dark:bg-neutral-900 dark:border-neutral-700 p-6 space-y-3">
                  <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-shimmer" />
                  <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded animate-shimmer" />
                  <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded animate-shimmer" />
                </div>
              ))}
            </div>
          ) : activePromos.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {activePromos.map((promo) => {
                const fin = new Date(promo.date_fin);
                const diffDays = Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                const valeurDisplay = promo.type === 'POURCENTAGE'
                  ? `-${promo.valeur}%`
                  : `-${parseInt(promo.valeur).toLocaleString('fr-FR')} FCFA`;

                return (
                  <div key={promo.id} className="card-static dark:bg-neutral-900 dark:border-neutral-700 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Tag className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">{valeurDisplay}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {diffDays > 0 ? `${diffDays}j restants` : 'Dernieres heures'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{promo.nom}</p>
                      {promo.code && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-1">Code : {promo.code}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ═══ État vide amélioré ═══ */
            <div className="text-center py-20 space-y-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center mx-auto">
                  <Gift className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                </div>
                {/* Particules décoratives */}
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent-300 dark:bg-accent-700 animate-pulse" />
                <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-primary-300 dark:bg-primary-700 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="space-y-2">
                <h3 className="text-title text-neutral-900 dark:text-white">Aucune promotion en cours</h3>
                <p className="text-body text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                  Revenez bientot pour decouvrir nos prochaines offres exceptionnelles !
                </p>
              </div>
              <Link to="/catalogue" className="btn-primary inline-flex shadow-md">
                Voir le catalogue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══ Produits en promotion — fond blanc ═══ */}
      {activePromos.length > 0 && (
        <section className="py-12 bg-white dark:bg-neutral-900">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-tiny font-semibold text-primary-600 uppercase tracking-[0.2em] mb-2">
                  Selection
                </p>
                <h2 className="text-display text-neutral-900 dark:text-white">
                  Produits <span className="text-primary-600">en promotion</span>
                </h2>
              </div>
            </div>

            {isLoadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.slice(0, 8).map((product) => {
                  const promo = activePromos.find(
                    (p) => p.produit === product.id || p.categorie === product.categorie?.id
                  );
                  return promo ? (
                    <ProductCard key={product.id} product={product} promo={promo} />
                  ) : null;
                }).filter(Boolean)}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
