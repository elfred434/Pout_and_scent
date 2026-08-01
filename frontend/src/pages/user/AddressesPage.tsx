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
import { Textarea } from '@/components/common/Textarea';
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
    <div className="surface p-4 sm:p-6">
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Mes adresses</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une adresse
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/60 sm:p-5">
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

          <Textarea
            label="Indications"
            value={formData.indications}
            onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
            rows={3}
            placeholder="Étage, code porte, repère..."
          />

          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="check-control"
            />
            <span className="text-sm">Adresse par défaut</span>
          </label>

          <div className="form-actions pt-2">
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
              className={`rounded-xl border p-4 transition-colors ${
                address.is_default
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-neutral-200 hover:border-primary-300'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-4 w-4 text-neutral-500" />
                    <h3 className="font-semibold">{address.libelle}</h3>
                    {address.is_default && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Défaut
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600">{address.quartier}, {address.ville}</p>
                  {address.indications && (
                    <p className="text-sm text-neutral-500 mt-1 italic">{address.indications}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-sm text-neutral-600">
                    <Phone className="h-3 w-3" />
                    {address.telephone_contact}
                  </div>
                </div>
                <div className="flex gap-2 sm:ml-4">
                  <button
                    onClick={() => handleEdit(address)}
                    className="icon-btn hover:!text-primary-600"
                    aria-label={`Modifier l’adresse ${address.libelle}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette adresse ?')) {
                        deleteMutation.mutate(address.id);
                      }
                    }}
                    className="icon-btn hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40"
                    aria-label={`Supprimer l’adresse ${address.libelle}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 mb-4">Aucune adresse enregistrée</p>
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
