/**
 * ADMIN REVIEWS — Gestion des avis clients
 * Pout & Scent
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Star, 
  Eye, 
  EyeOff, 
  Trash2, 
  MessageSquare,
  Search
} from 'lucide-react';
import { apiClient } from '@/api/client';

export function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['admin-reviews', search],
    queryFn: () => apiClient.get('/v1/reviews/', { params: { search: search || undefined, page_size: 50 } }).then(r => r.data),
  });

  const reviews = reviewsData?.results || [];

  const toggleVisibility = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      apiClient.patch(`/v1/reviews/${id}/`, { is_visible: visible }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  const deleteReview = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/reviews/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  const renderStars = (note: number) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-4 w-4 ${i <= note ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Avis clients</h1>
        <p className="text-neutral-600">{reviewsData?.count || reviews.length} avis au total</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-neutral-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input type="text" placeholder="Rechercher un avis..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {isLoading ? (
          <div className="p-6 text-center text-neutral-500">Chargement...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aucun avis</h3>
            <p className="text-neutral-600">Les avis clients apparaîtront ici</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {reviews.map((review: any) => (
              <div key={review.id} className={`p-4 hover:bg-neutral-50 transition-colors ${!review.is_visible ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(review.note)}
                      <span className="text-sm font-medium text-neutral-900">{review.user?.email}</span>
                      {!review.is_visible && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Masqué</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-700 mb-2">{review.commentaire || '— Pas de commentaire —'}</p>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span>Produit: {review.produit?.nom || review.produit}</span>
                      <span>{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleVisibility.mutate({ id: review.id, visible: !review.is_visible })}
                      className={`p-2 rounded-lg transition-colors ${review.is_visible ? 'text-neutral-600 hover:text-orange-600 hover:bg-orange-50' : 'text-neutral-400 hover:text-green-600 hover:bg-green-50'}`}
                      title={review.is_visible ? 'Masquer' : 'Afficher'}
                    >
                      {review.is_visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => { if (confirm('Supprimer cet avis ?')) deleteReview.mutate(review.id); }}
                      className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
