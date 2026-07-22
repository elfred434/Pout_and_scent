import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { calculerPrixPromo } from '@/hooks/usePromotions';
import type { Produit, Promotion } from '@/types';

interface ProductCardProps {
  product: Produit;
  promo?: Promotion | null;
}

export function ProductCard({ product, promo }: ProductCardProps) {
  const variantes = product.variantes || [];
  const images = product.images || [];

  const prixMin = variantes.length > 0
    ? Math.min(...variantes.map((v) => parseFloat(v.prix)))
    : 0;

  const prixPromo = calculerPrixPromo(prixMin, promo || null);
  const imageUrl = images[0]?.image || images[0]?.url || 'https://via.placeholder.com/400x500?text=P%26S';
  const isAvailable = variantes.some((v) => v.stock > 0 && v.is_active);

  return (
    <Link to={`/produit/${product.id}`} className="group block">
      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-700 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        {/* Image container - ratio 4:5 constant */}
        <div className="relative aspect-[4/5] bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.nom}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges en coin haut-gauche */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {prixPromo && (
              <span className="badge-promo shadow-sm">
                -{prixPromo.pourcentageReduction}%
              </span>
            )}
            {!isAvailable && (
              <span className="badge-neutral shadow-sm">
                Rupture
              </span>
            )}
            {product.is_featured && !prixPromo && isAvailable && (
              <span className="badge-premium shadow-sm">
                Premium
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-sm"
          >
            <Heart className="h-4 w-4 text-neutral-600" />
          </button>

          {/* Bouton "Ajouter au panier" en overlay au hover */}
          {isAvailable && (
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="w-full btn-primary py-2.5 text-xs shadow-lg"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Ajouter au panier
              </button>
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="p-4 space-y-2">
          {/* Marque */}
          <p className="text-tiny font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            {product.marque}
          </p>

          {/* Nom */}
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
            {product.nom}
          </h3>

          {/* Rating */}
          {product.nb_avis > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(Number(product.note_moyenne))
                        ? 'text-accent-500 fill-current'
                        : 'text-neutral-200 fill-current'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">({product.nb_avis})</span>
            </div>
          )}

          {/* Prix */}
          {prixMin > 0 && (
            <div className="flex items-baseline gap-2 pt-1">
              {prixPromo ? (
                <>
                  <span className="text-base font-semibold text-primary-600">
                    {prixPromo.prixFinal.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through">
                    {prixMin.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">FCFA</span>
                </>
              ) : (
                <>
                  <span className="text-base font-semibold text-neutral-900">
                    {prixMin.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">FCFA</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
