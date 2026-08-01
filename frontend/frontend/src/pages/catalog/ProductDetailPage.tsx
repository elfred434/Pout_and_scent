// ============================================================
// PRODUCT DETAIL PAGE — Page détail produit avec support promo
// ============================================================
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useProductPromotion, calculerPrixPromo } from '@/hooks/usePromotions';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { ShoppingCart, Check, Star, ArrowLeft, Tag, Clock } from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useProduct(id || '');
  const { addItem } = useCart();

  const [selectedVariante, setSelectedVariante] = useState<string>('');
  const [quantite, setQuantite] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const variantes = product?.variantes || [];
  const images = product?.images || [];

  const variante = variantes.find((v) => v.id === selectedVariante) || variantes[0];

  // Promotion active pour ce produit
  const promo = useProductPromotion(product?.id, product?.categorie?.id);
  const prixVariante = variante ? parseFloat(variante.prix) : 0;
  const prixPromo = calculerPrixPromo(prixVariante, promo);

  const handleAddToCart = () => {
    if (!product || !variante) return;

    // Utiliser le prix promo si disponible
    const prixFinal = prixPromo ? prixPromo.prixFinal : parseFloat(variante.prix);

    addItem({
      variante_id: variante.id,
      produit_nom: product.nom,
      produit_marque: product.marque,
      contenance_ml: variante.contenance_ml,
      prix: prixFinal,
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
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Produit introuvable</h2>
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
              <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden mb-4">
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
            <div className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center">
              <span className="text-neutral-400">Aucune image</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-primary-600 font-semibold uppercase tracking-wide">
            {product.marque}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-neutral-900">
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
                      i < Math.round(Number(product.note_moyenne)) ? 'fill-current' : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-neutral-700 font-medium">
                {Number(product.note_moyenne).toFixed(1)}
              </span>
              <span className="text-neutral-500">({product.nb_avis} avis)</span>
            </div>
          )}

          {/* Category */}
          {product.categorie && (
            <span className="inline-block mt-3 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              {product.categorie.nom}
            </span>
          )}

          {/* Description */}
          <p className="text-neutral-700 mt-6 whitespace-pre-line leading-relaxed">
            {product.description}
          </p>

          {/* Variantes */}
          {variantes.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-neutral-900 mb-3">Contenance</h3>
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
                          ? 'border-neutral-200 text-neutral-400 cursor-not-allowed opacity-50'
                          : 'border-neutral-300 hover:border-primary-400'
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
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
              {/* Bannière promo */}
              {prixPromo && promo && (
                <div className="mb-3 bg-gradient-to-r from-accent-500 to-primary-600 text-white px-4 py-3 rounded-xl flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span className="font-bold">
                      {promo.type === 'POURCENTAGE'
                        ? `-${promo.valeur}%`
                        : `-${parseInt(promo.valeur).toLocaleString('fr-FR')} FCFA`}
                    </span>
                    <span className="text-sm opacity-90">{promo.nom}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs opacity-80">
                    <Clock className="h-3 w-3" />
                    <span>
                      Jusqu'au {new Date(promo.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-baseline gap-3">
                {prixPromo ? (
                  <>
                    <span className="text-3xl font-bold text-accent-600">
                      {prixPromo.prixFinal.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-neutral-600">FCFA</span>
                    <span className="text-lg text-neutral-400 line-through">
                      {prixVariante.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span className="bg-accent-100 text-accent-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      Économisez {prixPromo.reduction.toLocaleString('fr-FR')} FCFA
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-neutral-900">
                      {prixVariante.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-neutral-600">FCFA</span>
                  </>
                )}
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Stock: {variante.stock} unité(s)
              </p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {variante && variante.stock > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border-2 border-neutral-300 rounded-lg">
                <button
                  onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-neutral-100 text-lg font-bold"
                >
                  −
                </button>
                <span className="px-6 font-semibold min-w-[3rem] text-center">
                  {quantite}
                </span>
                <button
                  onClick={() => setQuantite((q) => Math.min(variante.stock, q + 1))}
                  className="px-4 py-3 hover:bg-neutral-100 text-lg font-bold"
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

      {/* ─── SECTION RÉGLEMENTAIRE ABMed (Arrêté du 18/01/2022) ─── */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">
          📋 Informations réglementaires
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-neutral-50 p-4 rounded-lg">
            <h3 className="font-medium text-neutral-900 mb-3">Conformité ABMed</h3>
            <dl className="space-y-2 text-sm">
              {product.amm_number ? (
                <div className="flex justify-between">
                  <dt className="text-neutral-600">N° AMM :</dt>
                  <dd className="font-medium text-green-700">✅ {product.amm_number}</dd>
                </div>
              ) : (
                <div className="flex justify-between">
                  <dt className="text-neutral-600">N° AMM :</dt>
                  <dd className="text-yellow-700">⚠️ Non renseigné</dd>
                </div>
              )}
              {product.pays_origine && (
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Pays d'origine :</dt>
                  <dd className="font-medium">{product.pays_origine}</dd>
                </div>
              )}
              {product.numero_lot && (
                <div className="flex justify-between">
                  <dt className="text-neutral-600">N° de lot :</dt>
                  <dd className="font-medium">{product.numero_lot}</dd>
                </div>
              )}
              {product.date_peremption && (
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Date de péremption :</dt>
                  <dd className="font-medium">
                    {new Date(product.date_peremption).toLocaleDateString('fr-FR', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {product.liste_inci && (
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="font-medium text-neutral-900 mb-3">
                Ingrédients (INCI)
              </h3>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {product.liste_inci}
              </p>
            </div>
          )}
        </div>

        {/* Signalement */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Effet indésirable ?</strong> Signalez-le conformément à la réglementation ABMed.
          </p>
          <Link
            to="/signalement"
            className="text-sm font-medium text-yellow-900 bg-yellow-100 px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Signaler
          </Link>
        </div>
      </div>
    </div>
  );
}
