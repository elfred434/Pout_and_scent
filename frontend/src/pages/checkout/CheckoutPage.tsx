// ============================================================
// CHECKOUT PAGE — Finalisation de commande
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MapPin, Phone, Home, Plus, AlertCircle } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================
interface Adresse {
  id: string;
  libelle: string;
  ville: string;
  quartier: string;
  indications: string;
  telephone_contact: string;
  is_default: boolean;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, clearCart } = useCart();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // ============================================================
  // RÉCUPÉRER LES ADRESSES (gestion pagination DRF)
  // ============================================================
  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    isError: isErrorAddresses,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/users/addresses/');
      // ✅ Gérer la pagination DRF
      return response.data?.results || response.data;
    },
  });

  const addresses = (addressesData || []) as Adresse[];

  // ============================================================
  // INITIALISER L'ADRESSE PAR DÉFAUT
  // ============================================================
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  // ============================================================
  // MUTATION CHECKOUT
  // ============================================================
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/v1/orders/checkout/', {
        adresse_id: selectedAddressId,
        lignes: items.map((item) => ({
          variante_id: item.variante_id,
          quantite: item.quantite,
        })),
        notes_client: notes,
      });
      return response.data;
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/commande/success');
    },
    onError: (err: any) => {
      console.error('Erreur checkout:', err.response?.data);
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          'Erreur lors de la validation de la commande'
      );
    },
  });

  // ============================================================
  // CALCUL DU TOTAL
  // ============================================================
  const total = items.reduce((sum, item) => sum + item.prix * item.quantite, 0);

  // ============================================================
  // ÉTATS DE CHARGEMENT / ERREUR
  // ============================================================
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
        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Panier vide</h2>
        <p className="text-gray-600 mb-6">
          Ajoutez des produits à votre panier avant de passer commande.
        </p>
        <Link to="/catalogue">
          <Button>Voir le catalogue</Button>
        </Link>
      </div>
    );
  }

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

      {/* Message d'erreur global */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* ============================================================
          SECTION 1 — ARTICLES DU PANIER
          ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Articles ({items.length})
        </h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.variante_id}
              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="font-medium text-gray-900">{item.produit_nom}</p>
                <p className="text-sm text-gray-600">
                  {item.contenance_ml} ml × {item.quantite}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {(item.prix * item.quantite).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between items-center">
          <p className="text-xl font-bold">Total</p>
          <p className="text-2xl font-bold text-purple-600">
            {total.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
      </div>

      {/* ============================================================
          SECTION 2 — ADRESSE DE LIVRAISON
          ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Adresse de livraison</h2>
          <Link
            to="/profil/adresses"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Gérer mes adresses
          </Link>
        </div>

        {addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address) => (
              <label
                key={address.id}
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedAddressId === address.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={selectedAddressId === address.id}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="mt-1 h-4 w-4 text-purple-600"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <p className="font-medium">{address.libelle}</p>
                    {address.is_default && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Défaut
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {address.quartier}, {address.ville}
                  </p>
                  {address.indications && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      {address.indications}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    {address.telephone_contact}
                  </div>
                </div>
              </label>
            ))}

            <Link
              to="/profil/adresses"
              className="block w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Ajouter une nouvelle adresse
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore d'adresse enregistrée
            </p>
            <Link to="/profil/adresses">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une adresse
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* ============================================================
          SECTION 3 — NOTES
          ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Notes (optionnel)</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Instructions de livraison (étage, code porte, repère...)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {notes.length}/500 caractères
        </p>
      </div>

      {/* ============================================================
          SECTION 4 — BOUTON DE CONFIRMATION
          ============================================================ */}
      <Button
        onClick={() => checkoutMutation.mutate()}
        disabled={
          !selectedAddressId ||
          checkoutMutation.isPending ||
          addresses.length === 0
        }
        className="w-full py-4 text-lg"
      >
        {checkoutMutation.isPending ? (
          'Traitement en cours...'
        ) : (
          <>
            Confirmer la commande (Paiement à la livraison) —{' '}
            <strong>{total.toLocaleString('fr-FR')} FCFA</strong>
          </>
        )}
      </Button>

      {/* Mention légale */}
      <p className="text-xs text-gray-500 text-center mt-4">
        En confirmant, vous acceptez nos conditions générales de vente.
        Paiement en espèces à la livraison.
      </p>
    </div>
  );
}