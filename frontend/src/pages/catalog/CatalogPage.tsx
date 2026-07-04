import { useState } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Filter, SlidersHorizontal } from 'lucide-react';

export function CatalogPage() {
  const [page, setPage] = useState(1);
  const [categorie, setCategorie] = useState<string>('');
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useProducts({
    page,
    categorie: categorie || undefined,
    search: search || undefined,
    ordering,
  });

  const { data: categories } = useCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Notre Catalogue</h1>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </button>

          {/* Category Filter */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <select
              value={categorie}
              onChange={(e) => {
                setCategorie(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Toutes catégories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="-created_at">Plus récents</option>
              <option value="prix">Prix croissant</option>
              <option value="-prix">Prix décroissant</option>
              <option value="-note_moyenne">Meilleures notes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : data && data.results.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {data.count > 12 && (
            <div className="flex justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.previous}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} sur {Math.ceil(data.count / 12)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.next}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Aucun produit trouvé.</p>
        </div>
      )}
    </div>
  );
}