/**
 * Squelette de chargement pour une carte produit
 * Affiché pendant le chargement des données
 */
export function ProductSkeleton() {
  return (
    <div className="bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-100">
      {/* Image placeholder */}
      <div className="aspect-[4/5] bg-neutral-200 animate-shimmer" />
      
      {/* Infos */}
      <div className="p-4 space-y-3">
        {/* Marque */}
        <div className="h-3 w-16 bg-neutral-200 rounded animate-shimmer" />
        
        {/* Nom */}
        <div className="h-4 w-3/4 bg-neutral-200 rounded animate-shimmer" />
        
        {/* Rating */}
        <div className="flex gap-1">
          <div className="h-3 w-3 bg-neutral-200 rounded-full animate-shimmer" />
          <div className="h-3 w-3 bg-neutral-200 rounded-full animate-shimmer" />
          <div className="h-3 w-3 bg-neutral-200 rounded-full animate-shimmer" />
          <div className="h-3 w-3 bg-neutral-200 rounded-full animate-shimmer" />
          <div className="h-3 w-3 bg-neutral-200 rounded-full animate-shimmer" />
        </div>
        
        {/* Prix */}
        <div className="h-5 w-24 bg-neutral-200 rounded animate-shimmer" />
      </div>
    </div>
  );
}
