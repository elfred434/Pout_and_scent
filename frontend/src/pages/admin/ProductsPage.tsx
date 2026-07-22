/**
 * ADMIN PRODUCTS — Gestion complète des produits
 * Reproduit le Django Admin : infos, ABMed, variantes, images
 * Pout & Scent
 */
import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { 
  Plus, Search, Edit2, Trash2, Package, Upload, X, Image as ImageIcon,
  Droplets, Shield, Eye, FileText, Star
} from 'lucide-react';
import { apiClient } from '@/api/client';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: productsData, isLoading } = useProducts({ page: 1, search: search || undefined });
  const { data: categoriesData } = useCategories();

  const products = productsData?.results || [];
  const categories = categoriesData || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/v1/catalog/products/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setEditingProduct(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.patch(`/v1/catalog/products/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/catalog/products/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setEditingProduct(null);
    },
  });

  const handleSubmit = (formData: any) => {
    if (editingProduct?.id) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Produits</h1>
          <p className="text-neutral-600">{productsData?.count || 0} produits</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setShowForm(true); }}>
          <Plus className="h-5 w-5 mr-2" />Nouveau produit
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-neutral-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input type="text" placeholder="Rechercher..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {isLoading ? (
          <div className="p-6 text-center text-neutral-500">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucun produit</h3>
            <Button onClick={() => setShowForm(true)}><Plus className="h-5 w-5 mr-2" />Ajouter</Button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {products.map((p: any) => (
              <div key={p.id} className="p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                    {p.images?.[0]?.image
                      ? <img src={p.images[0].image} alt={p.nom} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="h-6 w-6 text-neutral-400" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900">{p.marque} — {p.nom}</h3>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className="text-xs px-2 py-0.5 bg-neutral-100 rounded-full">{p.categorie?.nom || '—'}</span>
                      <span className="text-xs text-neutral-500">{p.variantes?.length || 0} variante(s)</span>
                      <span className="text-xs text-neutral-500">{p.images?.length || 0} image(s)</span>
                      {p.variantes?.map((v: any) => (
                        <span key={v.id} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                          {v.contenance_ml}ml — {parseFloat(v.prix).toLocaleString('fr-FR')} FCFA (stock: {v.stock})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingProduct(p); setShowForm(true); }}
                      className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit2 className="h-5 w-5" /></button>
                    <button onClick={() => { if (confirm('Supprimer ?')) deleteMutation.mutate(p.id); }}
                      className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSubmit={handleSubmit}
          onDelete={(id) => deleteMutation.mutate(id)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCreated={(p) => setEditingProduct(p)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FORMULAIRE PRODUIT COMPLET (reproduit le Django Admin)
// ═══════════════════════════════════════════════════════════════
function ProductFormModal({ product, categories, onClose, onSubmit, onDelete, isSubmitting, onCreated }: {
  product: any; categories: any[]; onClose: () => void;
  onSubmit: (data: any) => void; onDelete: (id: string) => void;
  isSubmitting: boolean; onCreated: (p: any) => void;
}) {
  const queryClient = useQueryClient();

  // ─── State produit ───
  const [nom, setNom] = useState(product?.nom || '');
  const [marque, setMarque] = useState(product?.marque || '');
  const [description, setDescription] = useState(product?.description || '');
  const [categorieId, setCategorieId] = useState(product?.categorie?.id || '');
  const [isFeatured, setIsFeatured] = useState(product?.is_featured || false);
  const [isActive, setIsActive] = useState(product?.is_active !== undefined ? product.is_active : true);

  // ─── State ABMed ───
  const [ammNumber, setAmmNumber] = useState(product?.amm_number || '');
  const [listeInci, setListeInci] = useState(product?.liste_inci || '');
  const [paysOrigine, setPaysOrigine] = useState(product?.pays_origine || '');
  const [datePeremption, setDatePeremption] = useState(product?.date_peremption || '');
  const [numeroLot, setNumeroLot] = useState(product?.numero_lot || '');

  // ─── State variantes ───
  const [variantes, setVariantes] = useState(
    product?.variantes?.map((v: any) => ({
      id: v.id, contenance_ml: v.contenance_ml, prix: v.prix, stock: v.stock, sku: v.sku || '', is_active: v.is_active,
    })) || [{ id: null, contenance_ml: '', prix: '', stock: 0, sku: '', is_active: true }]
  );

  // ─── State images ───
  const [images, setImages] = useState(product?.images || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Upload image ───
  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('produit', product?.id || '');
      formData.append('ordre', String(images.length));
      formData.append('is_primary', String(images.length === 0));
      return apiClient.post('/v1/catalog/images/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Refresh product images
      if (product?.id) {
        apiClient.get(`/v1/catalog/products/${product.id}/`)
          .then(res => { setImages(res.data.images || []); })
          .catch(() => { /* ignore 404 */ });
      }
    },
  });

  const deleteImage = useMutation({
    mutationFn: (imageId: string) => apiClient.delete(`/v1/catalog/images/${imageId}/`),
    onSuccess: () => {
      setImages(images.filter((img: any) => img.id !== imageId));
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && product?.id) {
      uploadImage.mutate(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Variantes ───
  const addVariante = () => setVariantes([...variantes, { id: null, contenance_ml: '', prix: '', stock: 0, sku: '', is_active: true }]);
  const removeVariante = (i: number) => { if (variantes.length > 1) setVariantes(variantes.filter((_, idx) => idx !== i)); };
  const updateVariante = (i: number, field: string, value: any) => {
    const u = [...variantes]; u[i] = { ...u[i], [field]: value }; setVariantes(u);
  };

  // ─── Submit ───
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVariantes = variantes.filter(v => v.contenance_ml && v.prix).map(v => ({
      contenance_ml: parseInt(String(v.contenance_ml)),
      prix: parseFloat(String(v.prix)),
      stock: parseInt(String(v.stock)) || 0,
    }));
    onSubmit({
      nom, marque, description, categorie_id: categorieId,
      is_featured: isFeatured, is_active: isActive,
      amm_number: ammNumber, liste_inci: listeInci, pays_origine: paysOrigine,
      date_peremption: datePeremption || null, numero_lot: numeroLot,
      variantes: cleanVariantes,
    });
  };

  const isEditing = !!product?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-neutral-900/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {isEditing ? `Modification de Produit` : 'Nouveau produit'}
            </h2>
            {isEditing && <p className="text-sm text-neutral-500">{marque} — {nom}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" form="product-form" disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium">
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <form id="product-form" onSubmit={handleSave} className="p-6 space-y-8">
          {/* ═══ INFORMATIONS PRINCIPALES ═══ */}
          <section>
            <h3 className="text-lg font-semibold text-primary-700 border-b border-primary-200 pb-2 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" /> Informations principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nom *" value={nom} onChange={e => setNom(e.target.value)} required />
              <Input label="Marque *" value={marque} onChange={e => setMarque(e.target.value)} required />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Catégorie *</label>
              <select value={categorieId} onChange={e => setCategorieId(e.target.value)} required
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="">Sélectionner</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.nom} ({c.type})</option>)}
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500" rows={4} />
            </div>
            {product?.slug && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-500 mb-1">Slug (auto)</label>
                <input type="text" value={product.slug} readOnly
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-500" />
              </div>
            )}
          </section>

          {/* ═══ RÉGLEMENTATION ABMed ═══ */}
          <section>
            <h3 className="text-lg font-semibold text-primary-700 border-b border-primary-200 pb-2 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" /> Réglementation ABMed
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-800">
                ⚠️ Conformité Arrêté du 18 janvier 2022 : Tout produit cosmétique doit avoir une AMM avant d'être vendu au Bénin.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="N° AMM" value={ammNumber} onChange={e => setAmmNumber(e.target.value)} placeholder="001-2024-B-TEST" />
              <Input label="Pays d'origine" value={paysOrigine} onChange={e => setPaysOrigine(e.target.value)} />
              <Input label="Date de péremption" type="date" value={datePeremption} onChange={e => setDatePeremption(e.target.value)} />
              <Input label="Numéro de lot" value={numeroLot} onChange={e => setNumeroLot(e.target.value)} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Liste INCI</label>
              <textarea value={listeInci} onChange={e => setListeInci(e.target.value)} placeholder="Liste complète des ingrédients (nomenclature INCI)"
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm" rows={3} />
            </div>
          </section>

          {/* ═══ VISIBILITÉ ═══ */}
          <section>
            <h3 className="text-lg font-semibold text-primary-700 border-b border-primary-200 pb-2 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" /> Visibilité
            </h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm text-neutral-700 flex items-center gap-1"><Star className="h-4 w-4" /> Mis en avant</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm text-neutral-700">Est actif</span>
              </label>
            </div>
          </section>

          {/* ═══ VARIANTES ═══ */}
          <section>
            <div className="flex items-center justify-between border-b border-primary-200 pb-2 mb-4">
              <h3 className="text-lg font-semibold text-primary-700 flex items-center gap-2">
                <Droplets className="h-5 w-5" /> Variantes
              </h3>
              <button type="button" onClick={addVariante}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100">
                <Plus className="h-4 w-4" /> Ajouter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="text-left px-3 py-2 font-medium text-neutral-600">Contenance (ml)</th>
                    <th className="text-left px-3 py-2 font-medium text-neutral-600">Prix (FCFA)</th>
                    <th className="text-left px-3 py-2 font-medium text-neutral-600">Stock</th>
                    <th className="text-left px-3 py-2 font-medium text-neutral-600">SKU</th>
                    <th className="text-center px-3 py-2 font-medium text-neutral-600">Actif</th>
                    <th className="text-center px-3 py-2 font-medium text-neutral-600">Suppr.</th>
                  </tr>
                </thead>
                <tbody>
                  {variantes.map((v, i) => (
                    <tr key={i} className="border-t border-neutral-100">
                      <td className="px-3 py-2">
                        <input type="number" value={v.contenance_ml} onChange={e => updateVariante(i, 'contenance_ml', e.target.value)}
                          className="w-24 px-2 py-1 border border-neutral-200 rounded text-sm" placeholder="100" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={v.prix} onChange={e => updateVariante(i, 'prix', e.target.value)}
                          className="w-28 px-2 py-1 border border-neutral-200 rounded text-sm" placeholder="15000" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={v.stock} onChange={e => updateVariante(i, 'stock', e.target.value)}
                          className="w-20 px-2 py-1 border border-neutral-200 rounded text-sm" placeholder="0" />
                      </td>
                      <td className="px-3 py-2 text-neutral-500 text-xs font-mono">{v.sku || '—'}</td>
                      <td className="px-3 py-2 text-center">
                        <input type="checkbox" checked={v.is_active} onChange={e => updateVariante(i, 'is_active', e.target.checked)}
                          className="w-4 h-4 text-primary-600 rounded" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => removeVariante(i)} disabled={variantes.length <= 1}
                          className="text-red-400 hover:text-red-600 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ═══ IMAGES ═══ */}
          {isEditing && (
            <section>
              <h3 className="text-lg font-semibold text-primary-700 border-b border-primary-200 pb-2 mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" /> Images du produit
              </h3>
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {images.map((img: any) => (
                    <div key={img.id} className="relative group border border-neutral-200 rounded-lg overflow-hidden">
                      <img src={img.image} alt="" className="w-full h-32 object-cover" />
                      {img.is_primary && (
                        <span className="absolute top-1 left-1 text-xs bg-primary-600 text-white px-2 py-0.5 rounded">Principal</span>
                      )}
                      <button type="button" onClick={() => deleteImage.mutate(img.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                      <div className="p-2 text-xs text-neutral-500">Ordre: {img.ordre}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 text-sm">
                  <Upload className="h-4 w-4" /> Choisir un fichier
                </button>
                {uploadImage.isPending && <span className="text-sm text-neutral-500">Upload en cours...</span>}
              </div>
            </section>
          )}

          {/* ═══ ACTIONS ═══ */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            </div>
            {isEditing && (
              <button type="button" onClick={() => { if (confirm('Supprimer ce produit ?')) { onDelete(product.id); onClose(); } }}
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
