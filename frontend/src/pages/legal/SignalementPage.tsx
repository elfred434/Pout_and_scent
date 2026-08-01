/**
 * PAGE SIGNALEMENT — Obligation ABMed (Arrêté du 18/01/2022)
 * Permet aux consommateurs de signaler un effet indésirable d'un produit cosmétique.
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { toast } from '@/components/common/ToastContainer';
import { extractApiError } from '@/hooks/useToast';
import { AlertTriangle, Phone, Shield } from 'lucide-react';

export function SignalementPage() {
  const [formData, setFormData] = useState({
    nom_produit_signale: '',
    email_signalant: '',
    telephone_signalant: '',
    description: '',
    gravite: 'LEGER',
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiClient.post('/v1/catalog/signalement/', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Signalement enregistré avec succès');
      setFormData({
        nom_produit_signale: '',
        email_signalant: '',
        telephone_signalant: '',
        description: '',
        gravite: 'LEGER',
      });
    },
    onError: (error) => {
      toast.error(extractApiError(error));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.description.length < 20) {
      toast.warning('La description doit contenir au moins 20 caractères');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Signaler un effet indésirable</h1>
          <p className="text-neutral-600">Obligation réglementaire ABMed — Arrêté du 18 janvier 2022</p>
        </div>
      </div>

      {/* Alerte ABMed */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-800">Urgence sanitaire ?</p>
          <p className="text-sm text-yellow-700 mt-1">
            En cas de réaction grave, consultez immédiatement un médecin.
            Vous pouvez aussi contacter directement l'ABMed au{' '}
            <a href="tel:0151209815" className="font-bold underline flex items-center gap-1 inline-flex">
              <Phone className="h-3 w-3" /> 01 51 20 98 15
            </a>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="surface space-y-6 p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Produit concerné</h2>
          <Input
            label="Nom du produit *"
            required
            value={formData.nom_produit_signale}
            onChange={(e) => setFormData({ ...formData, nom_produit_signale: e.target.value })}
            placeholder="Ex: Crème éclaircissante XYZ"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Vos coordonnées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              required
              value={formData.email_signalant}
              onChange={(e) => setFormData({ ...formData, email_signalant: e.target.value })}
              placeholder="votre@email.com"
            />
            <Input
              label="Téléphone"
              type="tel"
              value={formData.telephone_signalant}
              onChange={(e) => setFormData({ ...formData, telephone_signalant: e.target.value })}
              placeholder="+229 XX XX XX XX"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Description de l'effet indésirable</h2>
          <Select label="Gravité *" value={formData.gravite} onChange={(e) => setFormData({ ...formData, gravite: e.target.value })}>
            <option value="LEGER">Léger — Rougeurs, démangeaisons mineures</option>
            <option value="MODERE">Modéré — Irritation persistante, gonflement</option>
            <option value="GRAVE">Grave — Brûlures, lésions cutanées</option>
            <option value="TRES_GRAVE">Très grave — Hospitalisation, réaction systémique</option>
          </Select>

          <div className="mt-4">
            <Textarea
              label="Description détaillée * (min. 20 caractères)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              placeholder="Décrivez les symptômes, la date d'apparition, la durée et les circonstances d'utilisation..."
              required
              hint={`${formData.description.length}/20 caractères minimum`}
            />
          </div>
        </div>

        <div className="bg-neutral-50 p-4 rounded-lg text-xs text-neutral-600">
          <p>
            En soumettant ce signalement, vous acceptez que vos données soient transmises
            à l'ABMed (Agence béninoise du Médicament) conformément à l'Arrêté du 18 janvier 2022.
            Vos données seront traitées conformément au Code du numérique béninois (Livre V).
          </p>
        </div>

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Envoi en cours...' : '📋 Soumettre le signalement'}
        </Button>
      </form>
    </div>
  );
}
