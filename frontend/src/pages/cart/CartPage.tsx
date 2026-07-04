import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/common/Button';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
        <Link
          to="/catalogue"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700"
        >
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Panier</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.variante_id}
              className="bg-white p-4 rounded-lg shadow-sm flex gap-4"
            >
              <img
                src={item.image_url || '/placeholder.png'}
                alt={item.produit_nom}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.produit_nom}</h3>
                <p className="text-sm text-gray-500">
                  {item.produit_marque} • {item.contenance_ml} ml
                </p>
                <p className="mt-2 font-bold text-gray-900">
                  {item.prix.toLocaleString('fr-FR')} FCFA
                </p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.variante_id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Supprimer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() =>
                      updateQuantity(item.variante_id, Math.max(1, item.quantite - 1))
                    }
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 font-medium">{item.quantite}</span>
                  <button
                    onClick={() => updateQuantity(item.variante_id, item.quantite + 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Vider le panier
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-fit sticky top-24">
          <h2 className="font-bold text-lg mb-4">Résumé de la commande</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Livraison</span>
              <span>À définir</span>
            </div>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
          </div>

          <Link to="/checkout">
            <Button className="w-full">Passer la commande</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}