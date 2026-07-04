import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProductCard } from '@/components/products/ProductCard';

export function HomePage() {
  const { data: featuredProducts, isLoading } = useProducts({ page: 1 });

  const features = [
    {
      icon: Truck,
      title: 'Livraison Rapide',
      description: 'Livraison sous 72h partout au Bénin',
    },
    {
      icon: Shield,
      title: 'Produits Authentiques',
      description: '100% originaux et certifiés',
    },
    {
      icon: RefreshCw,
      title: 'Retours Faciles',
      description: 'Retour gratuit sous 7 jours',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Découvrez l'Excellence du Parfum
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Une sélection exclusive de parfums et cosmétiques de luxe pour sublimer votre beauté
            </p>
            <Link
              to="/catalogue"
              className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Explorer le Catalogue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <feature.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Produits Populaires</h2>
            <Link
              to="/catalogue"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              Voir tout
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner size="lg" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.results.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Ce que disent nos clients
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Excellente qualité de service et produits authentiques. Je recommande vivement !"
                </p>
                <p className="font-semibold text-gray-900">Client Satisfait</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}