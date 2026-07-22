// ============================================================
// PRODUCT DETAIL PAGE — Page détail produit
// ============================================================
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { ShoppingCart, Check, Star, ArrowLeft } from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useProduct(id || '');
  const { addItem } = useCart();

  const [selectedVariante, setSelectedVariante] = useState<string>('');
  const [quantite, setQuantite] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  // ✅ VÉRIFICATIONS DE SÉCURITÉ
  const variantes = product?.variantes || [];
  const images = product?.images || [];

  const variante = variantes.find((v) => v.id === selectedVariante) || variantes[0];

  const handleAddToCart = () => {
    if (!product || !variante) return;

    addItem({
      variante_id: variante.id,
      produit_nom: product.nom,
      produit_marque: product.marque,
      contenance_ml: variante.contenance_ml,
      prix: parseFloat(variante.prix),
      quantite,
      image_url: images[0]?.image || images[0]?.url,
    });

    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Produit introuvable</h2>
        <Link to="/catalogue" className="text-primary-600 hover:text-primary-700">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Link
        to="/catalogue"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour au catalogue
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={images[imageIndex]?.image || images[imageIndex]?.url || '/placeholder.png'}
                  alt={product.nom}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setImageIndex(idx)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                        idx === imageIndex
                          ? 'border-primary-600'
                          : 'border-transparent hover:border-primary-300'
                      }`}
                    >
                      <img
                        src={img.image || img.url}
                        alt={img.alt_text || product.nom}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Aucune image</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-primary-600 font-semibold uppercase tracking-wide">
            {product.marque}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900">
            {product.nom}
          </h1>

          {/* Rating */}
          {product.nb_avis > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(Number(product.note_moyenne)) ? 'fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-700 font-medium">
                {Number(product.note_moyenne).toFixed(1)}
              </span>
              <span className="text-gray-500">({product.nb_avis} avis)</span>
            </div>
          )}

          {/* Category */}
          {product.categorie && (
            <span className="inline-block mt-3 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              {product.categorie.nom}
            </span>
          )}

          {/* Description */}
          <p className="text-gray-700 mt-6 whitespace-pre-line leading-relaxed">
            {product.description}
          </p>

          {/* Variantes */}
          {variantes.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-3">Contenance</h3>
              <div className="flex flex-wrap gap-3">
                {variantes.map((v) => {
                  const isSelected = v.id === variante?.id;
                  const isOut = v.stock === 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => !isOut && setSelectedVariante(v.id)}
                      disabled={isOut}
                      className={`px-5 py-3 border-2 rounded-lg font-medium transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : isOut
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                          : 'border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {v.contenance_ml} ml
                      {isOut && <span className="block text-xs text-red-500">Rupture</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price & Stock */}
          {variante && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {parseFloat(variante.prix).toLocaleString('fr-FR')}
                </span>
                <span className="text-gray-600">FCFA</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Stock: {variante.stock} unité(s)
              </p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {variante && variante.stock > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-gray-100 text-lg font-bold"
                >
                  −
                </button>
                <span className="px-6 font-semibold min-w-[3rem] text-center">
                  {quantite}
                </span>
                <button
                  onClick={() => setQuantite((q) => Math.min(variante.stock, q + 1))}
                  className="px-4 py-3 hover:bg-gray-100 text-lg font-bold"
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={addedFeedback}
                className={`flex-1 py-3 ${
                  addedFeedback ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Ajouté au panier
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Ajouter au panier
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}