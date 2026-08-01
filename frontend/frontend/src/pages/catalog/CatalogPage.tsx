import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useActivePromotions } from '@/hooks/usePromotions';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';

export function CatalogPage() {
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);

  const { data: productsData, isLoading } = useProducts({
    page,
    search: search || undefined,
    categorie: categorie || undefined,
    ordering,
  });

  const { data: categories } = useCategories();
  const { data: promosData } = useActivePromotions();

  const products = productsData?.results || [];
  const totalProducts = productsData?.count || 0;
  const totalPages = Math.ceil(totalProducts / 12);

  // Map des promos
  const promoMap = useMemo(() => {
    const map = new Map<string, any>();
    if (!promosData?.results) return map;
    const now = new Date();
    for (const promo of promosData.results) {
      const debut = new Date(promo.date_debut);
      const fin = new Date(promo.date_fin);
      if (promo.is_active && now >= debut && now <= fin) {
        if (promo.produit) map.set(`product:${promo.produit}`, promo);
        if (promo.categorie) map.set(`category:${promo.categorie}`, promo);
      }
    }
    return map;
  }, [promosData]);

  const getPromoForProduct = (product: any) => {
    return promoMap.get(`product:${product.id}`) ||
           promoMap.get(`category:${product.categorie?.id}`) ||
           null;
  };

  return (
    <div className="min-h-screen">
      {/* ═══ Header de page — fond blanc ═══ */}
      <section className="bg-white dark:bg-neutral-900 py-12 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-3">
            <p className="text-tiny font-semibold text-primary-600 uppercase tracking-[0.2em]">
              Boutique
            </p>
            <h1 className="text-display-lg text-neutral-900 dark:text-white">
              Notre <span className="text-primary-600">Catalogue</span>
            </h1>
            <p className="text-body text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Explorez notre collection de parfums et cosmétiques de qualité
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Filtres — fond gris ═══ */}
      <section className="bg-neutral-150 dark:bg-neutral-800 py-6 sticky top-16 z-40 border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche avec icône */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-search dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:placeholder-neutral-500"
              />
            </div>

            {/* Filtres avec style soigné */}
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:w-auto">
              <select
                value={categorie}
                onChange={(e) => { setCategorie(e.target.value); setPage(1); }}
                className="select w-full md:w-48 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              >
                <option value="">Toutes catégories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>

              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="select w-full md:w-48 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              >
                <option value="-created_at">Plus récents</option>
                <option value="prix">Prix croissant</option>
                <option value="-prix">Prix decroissant</option>
                <option value="-note_moyenne">Meilleures notes</option>
              </select>
            </div>
          </div>

          {/* Compteur de résultats */}
          {!isLoading && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
              {totalProducts} produit{totalProducts > 1 ? 's' : ''} trouvé{totalProducts > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* ═══ Grille produits — fond blanc ═══ */}
      <section className="py-12 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    promo={getPromoForProduct(product)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                  >
                    Précédent
                  </button>
                  <span className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">
                    Page {page} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 space-y-4">
              <SlidersHorizontal className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto" />
              <h3 className="text-title text-neutral-900 dark:text-white">Aucun produit trouvé</h3>
              <p className="text-body text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.
              </p>
              <button
                onClick={() => { setSearch(''); setCategorie(''); setOrdering('-created_at'); }}
                className="btn-secondary dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
