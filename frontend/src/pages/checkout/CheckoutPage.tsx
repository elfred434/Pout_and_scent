/**
 * CHECKOUT PAGE — Finalisation de commande
 * Pout & Scent
 *
 * Utilise les hooks TanStack Query centralisés : useAddresses, useCheckout
 */
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAddresses } from '@/hooks/useAddresses';
import { useCheckout } from '@/hooks/useOrders';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/Textarea';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MapPin, Phone, Home, Plus, AlertCircle } from 'lucide-react';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { data: addresses = [], isLoading: isLoadingAddresses } = useAddresses();
  const checkoutMutation = useCheckout();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptCGV, setAcceptCGV] = useState(false);

  // Initialiser l'adresse par défaut
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a: any) => a.is_default) || addresses[0];
      setSelectedAddressId((defaultAddress as any).id);
    }
  }, [addresses, selectedAddressId]);

  const total = items.reduce((sum, item) => sum + item.prix * item.quantite, 0);

  const handleCheckout = () => {
    checkoutMutation.mutate(
      {
        adresse_id: selectedAddressId,
        lignes: items.map((item) => ({
          variante_id: item.variante_id,
          quantite: item.quantite,
        })),
        notes_client: notes,
      },
      {
        onSuccess: () => {
          clearCart();
          navigate('/commande/success');
        },
      }
    );
  };

  if (isLoadingAddresses) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <MapPin className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Panier vide</h2>
        <p className="text-neutral-600 mb-6">Ajoutez des produits à votre panier avant de passer commande.</p>
        <Link to="/catalogue">
          <Button>Voir le catalogue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

      {/* Articles du panier */}
      <div className="surface mb-6 p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4">Articles ({items.length})</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.variante_id} className="flex flex-col gap-2 border-b border-neutral-200 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">{item.produit_nom}</p>
                <p className="text-sm text-neutral-600">{item.contenance_ml} ml × {item.quantite}</p>
              </div>
              <p className="flex-shrink-0 font-semibold text-neutral-900">
                {(item.prix * item.quantite).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between items-center">
          <p className="text-xl font-bold">Total</p>
          <p className="text-2xl font-bold text-primary-600">{total.toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>

      {/* Adresse de livraison */}
      <div className="surface mb-6 p-4 sm:p-6">
        <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Adresse de livraison</h2>
          <Link to="/profil/adresses" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Gérer mes adresses
          </Link>
        </div>

        {addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address: any) => (
              <label
                key={address.id}
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedAddressId === address.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-200 hover:border-primary-300'
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={selectedAddressId === address.id}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="check-control mt-0.5 rounded-full"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-neutral-500" />
                    <p className="font-medium">{address.libelle}</p>
                    {address.is_default && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Défaut</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{address.quartier}, {address.ville}</p>
                  {address.indications && (
                    <p className="text-sm text-neutral-500 mt-1 italic">{address.indications}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-sm text-neutral-600">
                    <Phone className="h-3 w-3" />
                    {address.telephone_contact}
                  </div>
                </div>
              </label>
            ))}

            <Link
              to="/profil/adresses"
              className="block w-full py-3 border-2 border-dashed border-neutral-300 rounded-lg text-center text-neutral-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Ajouter une nouvelle adresse
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 mb-4">Vous n'avez pas encore d'adresse enregistrée</p>
            <Link to="/profil/adresses">
              <Button><Plus className="h-4 w-4 mr-2" />Ajouter une adresse</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="surface mb-6 p-4 sm:p-6">
        <h2 className="mb-4 text-xl font-semibold">Notes (optionnel)</h2>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Instructions de livraison (étage, code porte, repère...)"
          rows={3}
          maxLength={500}
          hint={`${notes.length}/500 caractères`}
        />
      </div>

      {/* Acceptation CGV — Obligation légale Code du numérique béninois (Livre IV) */}
      <div className="surface mb-6 p-4 sm:p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptCGV}
            onChange={(e) => setAcceptCGV(e.target.checked)}
            className="check-control mt-0.5"
            required
          />
          <span className="text-sm text-neutral-700">
            J'ai lu et j'accepte les{' '}
            <Link to="/cgv" target="_blank" className="text-primary-600 hover:underline font-medium">
              Conditions Générales de Vente
            </Link>{' '}
            et la{' '}
            <Link to="/politique-confidentialite" target="_blank" className="text-primary-600 hover:underline font-medium">
              Politique de confidentialité
            </Link>.
            Je confirme avoir pris connaissance du droit de rétractation de 7 jours
            (conformément au Code du numérique béninois, Loi n° 2017-20, Livre IV).
          </span>
        </label>
      </div>

      {/* Bouton de confirmation — Double confirmation (Code du numérique) */}
      <Button
        onClick={handleCheckout}
        disabled={!selectedAddressId || !acceptCGV || checkoutMutation.isPending || addresses.length === 0}
        className="w-full flex-col gap-0.5 py-3"
      >
        {checkoutMutation.isPending ? (
          'Traitement en cours...'
        ) : (
          <>
            <span>Confirmer la commande</span>
            <span className="text-xs font-medium opacity-80">Paiement à la livraison · {total.toLocaleString('fr-FR')} FCFA</span>
          </>
        )}
      </Button>

      <p className="text-xs text-neutral-500 text-center mt-4">
        Conformément au <strong>Code du numérique béninois (Loi n° 2017-20, Livre IV)</strong>,
        cette commande constitue un contrat électronique ayant la même valeur juridique qu'un contrat écrit.
        Paiement en espèces à la livraison.
      </p>
    </div>
  );
}
