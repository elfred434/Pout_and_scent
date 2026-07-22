import { Link } from 'react-router-dom';
import { useActivePromotions } from '@/hooks/usePromotions';
import { ArrowRight } from 'lucide-react';

export function PromoBanner() {
  const { data } = useActivePromotions();

  if (!data?.results || data.results.length === 0) return null;

  const now = new Date();
  const activePromos = data.results.filter((p) => {
    const debut = new Date(p.date_debut);
    const fin = new Date(p.date_fin);
    return p.is_active && now >= debut && now <= fin;
  });

  if (activePromos.length === 0) return null;

  const promosToShow = activePromos.slice(0, 3);

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-primary-600 uppercase tracking-wider mb-2">
              Offres limitees
            </p>
            <h2 className="text-display text-neutral-900">En promotion</h2>
          </div>
          <Link 
            to="/promotions" 
            className="link-accent text-sm flex items-center gap-1 group"
          >
            Tout voir
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promosToShow.map((promo) => {
            const fin = new Date(promo.date_fin);
            const diffDays = Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            const valeurDisplay = promo.type === 'POURCENTAGE'
              ? `-${promo.valeur}%`
              : `-${parseInt(promo.valeur).toLocaleString('fr-FR')} FCFA`;

            return (
              <Link
                key={promo.id}
                to="/promotions"
                className="group card p-6 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-primary-600">{valeurDisplay}</span>
                  <span className="text-xs text-neutral-500">
                    {diffDays > 0 ? `${diffDays}j restants` : 'Dernieres heures'}
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
                  {promo.nom}
                </p>
                {promo.code && (
                  <p className="text-xs text-neutral-500 font-mono">Code : {promo.code}</p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
