/**
 * ADMIN CATEGORIES — Gestion des catégories
 * Reproduit le Django Admin : Nom, Type, Slug, Description, Image, Is active
 * Pout & Scent
 */
import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Plus, Edit2, Trash2, FolderOpen, Upload, X } from 'lucide-react';
import { apiClient } from '@/api/client';

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { data: categories = [], isLoading } = useCategories();

  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiClient.post('/v1/catalog/categories/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
      setEditingCategory(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      apiClient.patch(`/v1/catalog/categories/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/catalog/categories/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
      setEditingCategory(null);
    },
  });

  const handleSave = (formData: any, imageFile?: File | null) => {
    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) fd.append(key, String(value));
    });
    if (imageFile) fd.append('image', imageFile);

    if (editingCategory?.id) {
      updateMutation.mutate({ id: editingCategory.id, data: fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette catégorie ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Catégories</h1>
          <p className="text-neutral-600">{categories.length} catégories au total</p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setShowForm(true); }}>
          <Plus className="h-5 w-5 mr-2" />Nouvelle catégorie
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {isLoading ? (
          <div className="p-6 text-center text-neutral-500">Chargement...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucune catégorie</h3>
            <Button onClick={() => setShowForm(true)}><Plus className="h-5 w-5 mr-2" />Ajouter</Button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {categories.map((cat: any) => (
              <div key={cat.id} className="p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg overflow-hidden flex-shrink-0">
                      {cat.image
                        ? <img src={cat.image} alt={cat.nom} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><FolderOpen className="h-6 w-6 text-primary-600" /></div>}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{cat.nom}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cat.type === 'PARFUM' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'}`}>
                          {cat.type}
                        </span>
                        <span className="text-xs text-neutral-500">Slug: {cat.slug}</span>
                        {!cat.is_active && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Inactive</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingCategory(cat); setShowForm(true); }}
                      className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit2 className="h-5 w-5" /></button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => { setShowForm(false); setEditingCategory(null); }}
          onSave={handleSave}
          onDelete={handleDelete}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function CategoryFormModal({ category, onClose, onSave, onDelete, isSubmitting }: {
  category: any; onClose: () => void;
  onSave: (data: any, imageFile?: File | null) => void;
  onDelete: (id: string) => void;
  isSubmitting: boolean;
}) {
  const [nom, setNom] = useState(category?.nom || '');
  const [type, setType] = useState(category?.type || 'PARFUM');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [isActive, setIsActive] = useState(category?.is_active !== undefined ? category.is_active : true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nom, type, slug: slug || generateSlug(nom), description, is_active: isActive,
    }, imageFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">
            {category ? 'Modification de Catégorie' : 'Nouvelle catégorie'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Nom *" value={nom} onChange={e => setNom(e.target.value)} required />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Type *</label>
            <select value={type} onChange={e => setType(e.target.value)} required
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option value="PARFUM">Parfum</option>
              <option value="COSMETIQUE">Cosmétique</option>
            </select>
          </div>

          <Input label="Slug" value={slug} onChange={e => setSlug(e.target.value)}
            placeholder={generateSlug(nom || 'auto-généré')} />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500" rows={3} />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Image</label>
            {category?.image && (
              <div className="mb-2">
                <img src={category.image} alt="" className="h-20 rounded-lg border border-neutral-200" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <input type="file" ref={fileRef} accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 text-sm">
                <Upload className="h-4 w-4" /> Choisir un fichier
              </button>
              <span className="text-sm text-neutral-500">{imageFile?.name || 'Aucun fichier sélectionné'}</span>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded" />
            <span className="text-sm text-neutral-700">Est actif</span>
          </label>

          {category?.created_at && (
            <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-100">
              <p>Créé le : {new Date(category.created_at).toLocaleString('fr-FR')}</p>
              <p>Modifié le : {new Date(category.updated_at).toLocaleString('fr-FR')}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            </div>
            {category?.id && (
              <button type="button" onClick={() => { onDelete(category.id); onClose(); }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                Supprimer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
