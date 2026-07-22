import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, Shield, Heart, Settings } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useActivePromotions } from '@/hooks/usePromotions';
import { useAuth } from '@/contexts/AuthContext';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';

export function HomePage() {
  const { data: productsData, isLoading } = useProducts({ page: 1 });
  const { data: promosData } = useActivePromotions();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  const products = productsData?.results?.slice(0, 4) || [];
  const hasPromos = promosData?.results && promosData.results.length > 0;

  return (
    <div className="animate-fade-in">
      {/* ═══ Bandeau Admin (visible uniquement pour les admins) ═══ */}
      {isAdmin && (
        <div className="bg-primary-600 text-white py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Settings className="h-4 w-4" />
            <Link 
              to="/admin" 
              className="text-sm font-medium hover:text-primary-100 transition-colors flex items-center gap-2"
            >
              Accéder au tableau de bord administrateur
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ═══ Hero - Editorial avec dégradé + texture ═══ */}
      <section className="relative bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-900 overflow-hidden">
        {/* Texture grain subtile */}
        <div className="absolute inset-0 texture-grain pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-tiny font-semibold text-primary-600 uppercase tracking-[0.2em]">
                  Nouvelle collection
                </p>
                <h1 className="text-display-lg md:text-display-xl text-neutral-900 text-balance">
                  L'art du parfum,{' '}
                  <span className="text-primary-600">redefini.</span>
                </h1>
                <p className="text-subtitle text-neutral-600 max-w-lg leading-relaxed">
                  Decouvrez notre selection exclusive de parfums et cosmetiques de qualite, 
                  livres partout au Benin.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/catalogue" className="btn-primary group">
                  Explorer la collection
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                {hasPromos && (
                  <Link to="/promotions" className="btn-secondary">
                    Voir les promotions
                  </Link>
                )}
              </div>

              {/* Trust indicators avec accent doré */}
              <div className="flex flex-wrap gap-6 pt-4">
                {[
                  { icon: Shield, text: '100% Authentique' },
                  { icon: Truck, text: 'Livraison 72h' },
                  { icon: Heart, text: '+500 clientes' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                    <item.icon className="h-4 w-4 text-accent-500" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero card avec dégradé + ombre + filigrane */}
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-hero">
                {/* Dégradé violet → doré */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-primary-200 to-accent-100" />
                
                {/* Filigrane flacon */}
                <div className="absolute inset-0 watermark-flacon" />
                
                {/* Texture grain */}
                <div className="absolute inset-0 texture-grain" />

                {/* Composition décorative */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Flacon principal */}
                    <div className="w-32 h-48 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/40 shadow-xl flex items-center justify-center">
                      <Sparkles className="h-12 w-12 text-primary-600/60" />
                    </div>
                    {/* Flacon secondaire */}
                    <div className="absolute -bottom-4 -right-8 w-20 h-28 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg flex items-center justify-center rotate-6">
                      <Sparkles className="h-6 w-6 text-accent-500/60" />
                    </div>
                    {/* Petit flacon */}
                    <div className="absolute -top-2 -left-6 w-14 h-20 bg-white/25 backdrop-blur-sm rounded-lg border border-white/30 shadow-md flex items-center justify-center -rotate-12">
                      <Sparkles className="h-4 w-4 text-primary-500/60" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Bannière promos ═══ */}
      {hasPromos && (
        <section className="bg-primary-600 py-4">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Link 
              to="/promotions"
              className="flex items-center justify-center gap-2 text-white text-sm font-medium hover:text-primary-100 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Promotions en cours - Jusqu'a -{promosData.results[0].valeur}%</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ═══ Produits vedettes — fond gris ═══ */}
      <section className="py-20 lg:py-24 bg-neutral-150 dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-tiny font-semibold text-primary-600 uppercase tracking-[0.2em] mb-2">
                Selection
              </p>
              <h2 className="text-display text-neutral-900">
                Nos <span className="text-primary-600">coups de coeur</span>
              </h2>
            </div>
            <Link 
              to="/catalogue" 
              className="link-accent text-sm flex items-center gap-1 group"
            >
              Tout voir
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
              : products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
            }
          </div>
        </div>
      </section>

      {/* ═══ Section éditoriale — fond blanc ═══ */}
      <section className="py-20 lg:py-24 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl" />
            
            <div className="space-y-6">
              <p className="text-tiny font-semibold text-primary-600 uppercase tracking-[0.2em]">
                Notre promesse
              </p>
              <h2 className="text-display text-neutral-900 text-balance">
                Qualite <span className="text-primary-600">sans compromis</span>
              </h2>
              <p className="text-body text-neutral-600 leading-relaxed">
                Chaque produit de notre collection est soigneusement selectionne pour sa qualite 
                exceptionnelle. Nous travaillons exclusivement avec des marques reconnues et des 
                produits certifies conformes aux normes beninoises.
              </p>
              <ul className="space-y-3">
                {[
                  'Produits 100% originaux et certifies',
                  'Livraison rapide dans tout le Benin',
                  'Service client disponible 7j/7',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-500" />
                    <span className="text-sm text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/catalogue" className="btn-secondary inline-flex">
                Decouvrir nos produits
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Temoignages — fond gris ═══ */}
      <section className="py-20 lg:py-24 bg-neutral-150 dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-tiny font-semibold text-primary-600 uppercase tracking-[0.2em] mb-2">
              Temoignages
            </p>
            <h2 className="text-display text-neutral-900">
              Ce qu'elles <span className="text-primary-600">en disent</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                text: "Parfums authentiques, livraison rapide. Je recommande vivement.",
                name: 'Amina K.',
              },
              {
                text: "Qualite irreprochable et service attentionne. Ma boutique preferee.",
                name: 'Grace M.',
              },
              {
                text: "Produits de qualite et prix tres corrects. Je suis conquise.",
                name: 'Deborah A.',
              },
            ].map((testimonial, i) => (
              <div key={i} className="card-static p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-accent-500 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="avatar text-xs">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="text-sm font-medium text-neutral-900">
                    {testimonial.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Newsletter — fond noir ═══ */}
      <section className="py-20 lg:py-24 bg-neutral-900 text-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center space-y-6">
          <p className="text-tiny font-semibold text-accent-400 uppercase tracking-[0.2em]">
            Newsletter
          </p>
          <h2 className="text-display text-white">
            Restez <span className="text-accent-400">informee</span>
          </h2>
          <p className="text-body text-neutral-400">
            Inscrivez-vous pour recevoir nos offres exclusives et nos dernieres nouveautes.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="votre@email.com"
              className="input flex-1 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:ring-primary-500"
            />
            <button type="submit" className="btn-accent whitespace-nowrap">
              S'inscrire
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
