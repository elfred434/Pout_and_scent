/**
 * ADDRESSES PAGE — Gestion des adresses de livraison
 * Pout & Scent
 *
 * Utilise les hooks TanStack Query centralisés : useAddresses, useCreateAddress, etc.
 */
import { useState } from 'react';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from '@/hooks/useAddresses';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MapPin, Phone, Home, Plus, Edit2, Trash2 } from 'lucide-react';

interface AdresseFormData {
  libelle: string;
  ville: string;
  quartier: string;
  indications: string;
  telephone_contact: string;
  is_default: boolean;
}

const initialForm: AdresseFormData = {
  libelle: '',
  ville: '',
  quartier: '',
  indications: '',
  telephone_contact: '',
  is_default: false,
};

export function AddressesPage() {
  const { data: addresses = [], isLoading } = useAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdresseFormData>(initialForm);

  const handleEdit = (address: any) => {
    setFormData({
      libelle: address.libelle,
      ville: address.ville,
      quartier: address.quartier,
      indications: address.indications,
      telephone_contact: address.telephone_contact,
      is_default: address.is_default,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: formData },
        { onSuccess: () => resetForm() }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: () => resetForm() });
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mes adresses</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une adresse
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-lg">
            {editingId ? "Modifier l'adresse" : 'Nouvelle adresse'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Libellé *"
              required
              value={formData.libelle}
              onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
              placeholder="Maison, Bureau, etc."
            />
            <Input
              label="Ville *"
              required
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
            />
          </div>

          <Input
            label="Quartier *"
            required
            value={formData.quartier}
            onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
          />

          <Input
            label="Téléphone de contact *"
            required
            type="tel"
            value={formData.telephone_contact}
            onChange={(e) => setFormData({ ...formData, telephone_contact: e.target.value })}
            placeholder="+229 XX XX XX XX"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Indications</label>
            <textarea
              value={formData.indications}
              onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={2}
              placeholder="Étage, code porte, repère..."
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="h-4 w-4 text-purple-600 rounded"
            />
            <span className="text-sm">Adresse par défaut</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Enregistrement...'
                : 'Enregistrer'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Annuler
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {addresses.length > 0 ? (
          addresses.map((address: any) => (
            <div
              key={address.id}
              className={`p-4 border-2 rounded-lg transition-colors ${
                address.is_default
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <h3 className="font-semibold">{address.libelle}</h3>
                    {address.is_default && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Défaut
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{address.quartier}, {address.ville}</p>
                  {address.indications && (
                    <p className="text-sm text-gray-500 mt-1 italic">{address.indications}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    {address.telephone_contact}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette adresse ?')) {
                        deleteMutation.mutate(address.id);
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Aucune adresse enregistrée</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter ma première adresse
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
