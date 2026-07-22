
// Utilisateurs
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'CLIENT' | 'ADMIN';
  is_2fa_enabled: boolean;
  created_at: string;
}

export interface Adresse {
  id: string;
  user: string;
  prenom: string;
  nom: string;
  telephone: string;
  ville: string;
  quartier: string;
  adresse_complete: string;
  est_defaut: boolean;
}

// Catalogue
export interface Categorie {
  id: string;
  nom: string;
  slug: string;
  type: 'PARFUM' | 'COSMETIQUE' | 'SOIN';
  description?: string;
  is_active: boolean;
}

export interface VarianteProduit {
  id: string;
  contenance_ml: number;
  prix: string;
  stock: number;
  sku: string;
  is_active: boolean;
}

export interface ProduitImage {
  id: string;
  image: string;
  alt_text?: string;
  ordre: number;
}

export interface Produit {
  id: string;
  nom: string;
  marque: string;
  description: string;
  categorie: Categorie;
  note_moyenne: number;
  nb_avis: number;
  is_featured: boolean;
  variantes: VarianteProduit[];
  images: ProduitImage[];
  created_at: string;
  updated_at: string;
}

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Authentification
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

// Commandes
export interface LigneCommande {
  id: string;
  variante: VarianteProduit & { produit: { nom: string; marque: string } };
  quantite: number;
  prix_unitaire: string;
  sous_total: string;
}

export interface Commande {
  id: string;
  user: string;
  adresse: Adresse;
  montant_total: string;
  montant_reduit: string;
  methode_paiement: 'LIVRAISON';
  statut: 'EN_PREPARATION' | 'EN_LIVRAISON' | 'LIVREE' | 'ANNULEE';
  date_expiration_stock: string;
  lignes: LigneCommande[];
  created_at: string;
}

export interface CheckoutPayload {
  adresse_id: string;
  lignes: { variante_id: string; quantite: number }[];
  notes_client?: string;
}

// Panier
export interface CartItem {
  variante_id: string;
  produit_nom: string;
  produit_marque: string;
  contenance_ml: number;
  prix: number;
  quantite: number;
  image_url?: string;
}

// Promotions
export interface Promotion {
  id: string;
  nom: string;
  description: string;
  type: 'POURCENTAGE' | 'MONTANT_FIXE';
  valeur: string;
  date_debut: string;
  date_fin: string;
  is_active: boolean;
  produits?: string[];
  categories?: string[];
}

// Avis
export interface Avis {
  id: string;
  user: string;
  produit: string;
  note: number;
  commentaire: string;
  is_visible: boolean;
  created_at: string;
}