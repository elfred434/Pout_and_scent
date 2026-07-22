/**
 * usePromotions — Hook TanStack Query pour les promotions
 * Pout & Scent
 */
import { useQuery } from '@tanstack/react-query';
import { promotionEndpoints } from '@/api/endpoints';
import { queryKeys } from '@/lib/queryKeys';
import type { Promotion } from '@/types';

/** Récupère toutes les promotions actives */
export function useActivePromotions() {
  return useQuery({
    queryKey: queryKeys.promotions.list({ is_active: true }),
    queryFn: () =>
      promotionEndpoints.getActivePromotions().then((res) => res.data),
    staleTime: 2 * 60 * 1000, // 2 min
    refetchInterval: 5 * 60 * 1000, // Re-fetch toutes les 5 min
  });
}

/** Récupère une promotion par ID */
export function usePromotion(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.promotions.detail(id || ''),
    queryFn: () =>
      promotionEndpoints.getPromotion(id!).then((res) => res.data),
    enabled: Boolean(id),
  });
}

/**
 * Hook utilitaire : retourne la promotion active pour un produit donné.
 * Cherche d'abord une promo produit, puis une promo catégorie.
 */
export function useProductPromotion(
  produitId: string | undefined,
  categorieId: string | undefined,
) {
  const { data } = useActivePromotions();

  if (!data?.results) return null;

  // 1. Promo spécifique au produit
  const produitPromo = data.results.find(
    (p) => p.produit === produitId && p.is_active,
  );
  if (produitPromo) return produitPromo;

  // 2. Promo sur la catégorie
  const categoriePromo = data.results.find(
    (p) => p.categorie === categorieId && p.is_active,
  );
  return categoriePromo || null;
}

/**
 * Calcule le prix promotionnel côté client.
 * Retourne { prixFinal, reduction, pourcentageReduction } ou null si pas de promo.
 */
export function calculerPrixPromo(
  prixOriginal: number,
  promo: Promotion | null,
): { prixFinal: number; reduction: number; pourcentageReduction: number } | null {
  if (!promo || !promo.is_active) return null;

  // Vérifier les dates
  const now = new Date();
  const debut = new Date(promo.date_debut);
  const fin = new Date(promo.date_fin);
  if (now < debut || now > fin) return null;

  let prixFinal: number;
  let reduction: number;
  let pourcentageReduction: number;

  if (promo.type === 'POURCENTAGE') {
    const pct = parseFloat(promo.valeur);
    reduction = prixOriginal * (pct / 100);
    prixFinal = prixOriginal - reduction;
    pourcentageReduction = pct;
  } else {
    reduction = parseFloat(promo.valeur);
    prixFinal = Math.max(0, prixOriginal - reduction);
    pourcentageReduction = prixOriginal > 0
      ? Math.round((reduction / prixOriginal) * 100)
      : 0;
  }

  return {
    prixFinal: Math.round(prixFinal),
    reduction: Math.round(reduction),
    pourcentageReduction,
  };
}
