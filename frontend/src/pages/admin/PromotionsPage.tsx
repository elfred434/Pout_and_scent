/**
 * ADMIN PROMOTIONS — Gestion des promotions
 * Reproduit le Django Admin : Nom, Code, Type, Valeur, Cible, Période
 * Pout & Scent
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActivePromotions } from '@/hooks/usePromotions';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Plus, Edit2, Trash2, Tag, Percent, DollarSign, Calendar, X } from 'lucide-react';
import { apiClient } from '@/api/client';

export function AdminPromotionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);

  const { data: promosData, isLoading } = useActivePromotions();
  const { data: productsData } = useProducts({ page: 1 });
  const { data: categories } = useCategories();

  const promos = promosData?.results || [];
  const products = productsData?.results || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/v1/promotions/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setShowForm(false);
      setEditingPromo(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.patch(`/v1/promotions/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setShowForm(false);
      setEditingPromo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/promotions/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      setShowForm(false);
      setEditingPromo(null);
    },
  });

  const handleSave = (formData: any) => {
    if (editingPromo?.id) {
      updateMutation.mutate({ id: editingPromo.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette promotion ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Promotions</h1>
          <p className="text-neutral-600">{promos.length} promotions actives</p>
        </div>
        <Button onClick={() => { setEditingPromo(null); setShowForm(true); }}>
          <Plus className="h-5 w-5 mr-2" />Nouvelle promotion
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {isLoading ? (
          <div className="p-6 text-center text-neutral-500">Chargement...</div>
        ) : promos.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucune promotion</h3>
            <Button onClick={() => setShowForm(true)}><Plus className="h-5 w-5 mr-2" />Créer</Button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {promos.map((promo: any) => (
              <div key={promo.id} className="p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      promo.type === 'POURCENTAGE' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {promo.type === 'POURCENTAGE'
                        ? <Percent className="h-6 w-6 text-green-600" />
                        : <DollarSign className="h-6 w-6 text-blue-600" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{promo.nom}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-medium text-primary-600">
                          {promo.type === 'POURCENTAGE' ? `-${promo.valeur}%` : `-${parseInt(promo.valeur)} FCFA`}
                        </span>
                        {promo.code && (
                          <span className="text-xs px-2 py-0.5 bg-neutral-100 rounded font-mono">{promo.code}</span>
                        )}
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(promo.date_debut).toLocaleDateString('fr-FR')} → {new Date(promo.date_fin).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingPromo(promo); setShowForm(true); }} className="icon-btn hover:!text-primary-600" aria-label={`Modifier ${promo.nom}`}><Edit2 className="h-5 w-5" /></button>
                    <button onClick={() => handleDelete(promo.id)} className="icon-btn hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40" aria-label={`Supprimer ${promo.nom}`}><Trash2 className="h-5 w-5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <PromoFormModal
          promo={editingPromo}
          products={products}
          categories={categories || []}
          onClose={() => { setShowForm(false); setEditingPromo(null); }}
          onSave={handleSave}
          onDelete={handleDelete}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function PromoFormModal({ promo, products, categories, onClose, onSave, onDelete, isSubmitting }: {
  promo: any; products: any[]; categories: any[];
  onClose: () => void; onSave: (data: any) => void; onDelete: (id: string) => void;
  isSubmitting: boolean;
}) {
  const [nom, setNom] = useState(promo?.nom || '');
  const [type, setType] = useState(promo?.type || 'POURCENTAGE');
  const [valeur, setValeur] = useState(promo?.valeur || '');
  const [code, setCode] = useState(promo?.code || '');
  const [produit, setProduit] = useState(promo?.produit || '');
  const [categorie, setCategorie] = useState(promo?.categorie || '');
  const [dateDebut, setDateDebut] = useState(promo?.date_debut?.slice(0, 16) || new Date().toISOString().slice(0, 16));
  const [dateFin, setDateFin] = useState(promo?.date_fin?.slice(0, 16) || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { nom, type, valeur, date_debut: dateDebut, date_fin: dateFin };
    if (code) data.code = code;
    if (produit) data.produit = produit;
    if (categorie) data.categorie = categorie;
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">
            {promo ? 'Modification de Promotion' : 'Nouvelle promotion'}
          </h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Fermer la fenêtre"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="form-grid">
            <Input label="Nom *" value={nom} onChange={e => setNom(e.target.value)} required />
            <Input label="Code promo" value={code} onChange={e => setCode(e.target.value)} placeholder="SOLDE20" />
          </div>

          <div className="form-grid">
            <Select label="Type *" value={type} onChange={e => setType(e.target.value)}>
              <option value="POURCENTAGE">Pourcentage (%)</option>
              <option value="MONTANT_FIXE">Montant fixe (FCFA)</option>
            </Select>
            <Input label={type === 'POURCENTAGE' ? 'Pourcentage *' : 'Montant (FCFA) *'}
              type="number" value={valeur} onChange={e => setValeur(e.target.value)} required />
          </div>

          <Select label="Produit (optionnel)" value={produit} onChange={e => { setProduit(e.target.value); setCategorie(''); }}>
            <option value="">Aucun</option>
            {products.map((p: any) => <option key={p.id} value={p.id}>{p.marque} - {p.nom}</option>)}
          </Select>

          <Select label="Catégorie (optionnel)" value={categorie} onChange={e => { setCategorie(e.target.value); setProduit(''); }}>
            <option value="">Aucune</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </Select>

          <div className="form-grid">
            <Input label="Date début *" type="datetime-local" value={dateDebut}
              onChange={e => setDateDebut(e.target.value)} required />
            <Input label="Date fin *" type="datetime-local" value={dateFin}
              onChange={e => setDateFin(e.target.value)} required />
          </div>

          {promo?.created_at && (
            <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-100">
              <p>Créé le : {new Date(promo.created_at).toLocaleString('fr-FR')}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="form-actions !pt-0 sm:flex-row">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            </div>
            {promo?.id && (
              <button type="button" onClick={() => { onDelete(promo.id); onClose(); }} className="btn-base w-full bg-red-600 text-white hover:bg-red-700 sm:w-auto">
                Supprimer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
