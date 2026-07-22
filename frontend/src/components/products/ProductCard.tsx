// ============================================================
// PRODUCT CARD — Carte produit réutilisable
// ============================================================
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import type { Produit } from '@/types';

interface ProductCardProps {
  product: Produit;
}

export function ProductCard({ product }: ProductCardProps) {
  // ✅ VÉRIFICATIONS DE SÉCURITÉ
  const variantes = product.variantes || [];
  const images = product.images || [];

  // Prix minimum parmi les variantes (affichage "à partir de")
  const prixMin = variantes.length > 0
    ? Math.min(...variantes.map((v) => parseFloat(v.prix)))
    : 0;

  // Première image ou placeholder
  const imageUrl = images[0]?.image || images[0]?.url || 'https://via.placeholder.com/400x400?text=Pout+%26+Scent';

  // Vérifier si au moins une variante est en stock
  const isAvailable = variantes.some((v) => v.stock > 0 && v.is_active);

  return (
    <Link
      to={`/produit/${product.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* IMAGE */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.nom}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_featured && (
            <span className="bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded">
              Populaire
            </span>
          )}
          {!isAvailable && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Rupture
            </span>
          )}
        </div>

        {/* Bouton favori (placeholder) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Ajouter aux favoris
          }}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
        </button>
      </div>

      {/* INFOS */}
      <div className="p-4">
        {/* Marque */}
        <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide">
          {product.marque}
        </p>

        {/* Nom */}
        <h3 className="font-medium text-gray-900 mt-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.nom}
        </h3>

        {/* Note moyenne */}
        {product.nb_avis > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(Number(product.note_moyenne))
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.nb_avis})
            </span>
          </div>
        )}

        {/* Prix */}
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            {prixMin > 0 ? (
              <>
                <p className="text-xs text-gray-500">À partir de</p>
                <p className="text-lg font-bold text-gray-900">
                  {prixMin.toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span>
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-gray-500">Prix non disponible</p>
            )}
          </div>

          {/* Indicateur de stock */}
          {isAvailable && (
            <span className="text-xs text-green-600 font-medium">
              En stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}