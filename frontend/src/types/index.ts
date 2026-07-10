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
  libelle: string;
  ville: string;
  quartier: string;
  indications: string;
  telephone_contact: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Categorie {
  id: string;
  nom: string;
  slug: string;
  type: 'PARFUM' | 'COSMETIQUE';
  description?: string;
  image?: string;
  is_active: boolean;
}

export interface VarianteProduit {
  id: string;
  contenance_ml: number;
  prix: string;
  prix_final?: string;
  stock: number;
  sku: string;
  is_active: boolean;
}

export interface ProduitImage {
  id: string;
  image: string;
  url?: string;
  alt_text?: string;
  ordre: number;
  is_primary?: boolean;
}

export interface Produit {
  id: string;
  nom: string;
  marque: string;
  slug?: string;
  description: string;
  categorie: Categorie;
  note_moyenne: number;
  nb_avis: number;
  is_featured: boolean;
  is_active?: boolean;
  variantes: VarianteProduit[];
  images: ProduitImage[];
  prix_min?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  success?: boolean;
  data?: { user?: User; access: string; refresh: string; };
  access?: string;
  refresh?: string;
  user?: User;
  requires_2fa?: boolean;
  temp_token?: string;
}

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface LigneCommande {
  id: string;
  variante: VarianteProduit & { produit: { nom: string; marque: string; id: string } };
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
  statut: 'EN_PREPARATION' | 'EN_LIVRAISON' | 'LIVREE' | 'ANNULEE' | 'EXPIREE';
  date_expiration_stock: string;
  date_livraison?: string | null;
  notes_client?: string;
  lignes: LigneCommande[];
  created_at: string;
  updated_at?: string;
}

export interface CheckoutPayload {
  adresse_id: string;
  lignes: { variante_id: string; quantite: number }[];
  notes_client?: string;
}

export interface CartItem {
  variante_id: string;
  produit_nom: string;
  produit_marque: string;
  produit_id?: string;
  contenance_ml: number;
  prix: number;
  quantite: number;
  image_url?: string;
  sku?: string;
}

export interface Promotion {
  id: string;
  nom: string;
  description?: string;
  type: 'POURCENTAGE' | 'MONTANT_FIXE';
  valeur: string;
  date_debut: string;
  date_fin: string;
  is_active: boolean;
  produit?: string | null;
  categorie?: string | null;
  code?: string | null;
}

export interface Avis {
  id: string;
  user: string;
  produit: string;
  note: number;
  commentaire: string;
  is_visible: boolean;
  created_at: string;
}
