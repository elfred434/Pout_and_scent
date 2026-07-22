/**
 * PROMO CARD — Carte de promotion avec produits associés
 * Pout & Scent
 */
import { Link } from 'react-router-dom';
import { Clock, Percent, Banknote, ArrowRight, Tag } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import type { Promotion, Produit, Categorie } from '@/types';

interface PromoCardProps {
  promo: Promotion;
  produits: Produit[];
  categorie?: Categorie;
}

export function PromoCard({ promo, produits, categorie }: PromoCardProps) {
  const now = new Date();
  const fin = new Date(promo.date_fin);
  const debut = new Date(promo.date_debut);

  // Calcul du temps restant
  const diffMs = fin.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  let tempsRestant: string;
  if (diffDays > 1) {
    tempsRestant = `${diffDays} jour${diffDays > 1 ? 's' : ''} restant${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    tempsRestant = `${diffHours} heure${diffHours > 1 ? 's' : ''} restante${diffHours > 1 ? 's' : ''}`;
  } else {
    tempsRestant = 'Dernières heures !';
  }

  const isPourcentage = promo.type === 'POURCENTAGE';
  const valeurDisplay = isPourcentage
    ? `-${promo.valeur}%`
    : `-${parseInt(promo.valeur).toLocaleString('fr-FR')} FCFA`;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Bannière promo */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">Promotion</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">{promo.nom}</h2>
            <p className="text-white/80 text-sm">
              {categorie
                ? `Sur toute la catégorie ${categorie.nom}`
                : promo.produit
                  ? 'Sur le produit sélectionné'
                  : 'Sur les produits sélectionnés'}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            {/* Badge réduction */}
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl text-center">
              <div className="text-3xl md:text-4xl font-black">{valeurDisplay}</div>
              <div className="text-xs opacity-80 mt-1">de réduction</div>
            </div>

            {/* Temps restant */}
            <div className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              <span>{tempsRestant}</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
          <span>
            Du {debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </span>
          <span>→</span>
          <span>
            au {fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          {promo.code && (
            <span className="ml-auto bg-white/20 px-3 py-1 rounded-full font-mono text-white">
              Code : {promo.code}
            </span>
          )}
        </div>
      </div>

      {/* Produits en promo */}
      {produits.length > 0 && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Produits concernés ({produits.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {produits.slice(0, 4).map((produit) => (
              <ProductCard key={produit.id} product={produit} promo={promo} />
            ))}
          </div>
          {produits.length > 4 && (
            <div className="text-center mt-4">
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
              >
                Voir tous les produits
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
