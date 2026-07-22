feat(admin): interface d'administration complète avec gestion produits, variantes et images

## 🎯 Résumé

Mise en place d'une interface d'administration React complète reproduisant les
fonctionnalités du Django Admin, avec une UX moderne (Tailwind CSS, Lucide Icons)
et une API REST fully functional.

## ✨ Nouvelles fonctionnalités

### Frontend — 8 pages admin (`/admin/*`)
- **Dashboard** : statistiques temps réel (produits, commandes, CA, promotions)
- **Produits** : CRUD complet avec sections ABMed, variantes (contenance/prix/stock/SKU),
  upload d'images avec preview, gestion is_featured/is_active
- **Catégories** : CRUD avec upload d'image, type Parfum/Cosmétique, slug auto-généré
- **Commandes** : liste avec statuts colorés, détail complet, transitions de statut
  (En préparation → En livraison → Livrée)
- **Promotions** : CRUD pourcentage/montant fixe, ciblage produit/catégorie, code promo
- **Avis clients** : modération (masquer/afficher/supprimer), notation étoiles
- **Conversations** : chat support temps réel, assignation agent, résolution, fermeture
- **Utilisateurs** : liste avec recherche/filtres, activation/désactivation de comptes

### Backend — Nouveaux endpoints API
- `GET/POST` `/api/v1/catalog/variantes/` — CRUD variantes de produits
- `GET/POST` `/api/v1/catalog/images/` — Upload d'images produit (multipart/form-data)
- `DELETE` `/api/v1/catalog/images/{id}/` — Suppression d'image
- `GET` `/api/v1/users/` — Liste des utilisateurs (admin, avec recherche/filtres)
- `GET/PATCH` `/api/v1/users/{id}/` — Détail et modification utilisateur

### Lien admin sur la page d'accueil
- Bandeau violet visible uniquement pour les utilisateurs avec `role=ADMIN`

## 🐛 Bugs corrigés

### Backend
- **ProtectedError sur modification produit** : les variantes liées à des commandes
  (LigneCommande.variante, on_delete=PROTECT) ne sont plus supprimées mais mises à jour
  par contenance et désactivées si retirées de la liste
- **404 sur PATCH/DELETE après soft delete** : `get_queryset()` retourne maintenant
  tous les objets pour les actions admin (retrieve/update/destroy), le filtre
  `is_active=True` ne s'applique qu'au `list` public
- **Cache Django incompatible avec Daphne (ASGI)** : suppression de `cache_page` et
  `cache.clear()`, le cache est géré par TanStack Query côté frontend
- **custom_exception_handler** : capture maintenant les `DjangoValidationError`
  (soulevées par `Model.full_clean()`) et les convertit en réponses 400 au lieu de 500
- **ProduitWriteSerializer** : ajout du champ `categorie_id` (PrimaryKeyRelatedField)
  pour la création de produits via l'API
- **CommandeListSerializer** : ajout de `user_email` et `user_nom` pour l'affichage
  admin des commandes
- **PromotionSerializer** : validation des dates (date_fin >= date_debut) et de la cible
  (produit ou catégorie requis)
- **IsOwnerOrAdmin** : ajout de `has_permission` pour vérifier l'authentification

### Frontend
- **Routes admin** : fusion des deux blocs `<Routes>` en un seul (React Router v6)
- **Navigate pendant le render** : déplacement dans `useEffect()` avec loader
- **Mutations cassées** : ajout de `updateMutation` (PATCH) séparée de `createMutation`
  (POST) dans toutes les pages CRUD
- **Champs serializer vs frontend** : alignement des noms de champs
  (`user_email`, `adresse_libelle`, `produit_nom`, `contenance_ml`)
- **Imports inutilisés** : nettoyage TypeScript strict

## 📁 Fichiers modifiés

### Backend (Django REST Framework)
```
apps/catalog/views.py          — 5 ViewSets (Categorie, Produit, Variante, Image, Signalement)
apps/catalog/serializers.py    — ProduitWriteSerializer avec gestion variantes
apps/catalog/urls.py           — Routes variantes + images
apps/catalog/models.py         — clean() défensif (try/except sur ProduitInterdit)
apps/promotions/views.py       — get_queryset() admin/public
apps/promotions/serializers.py — validate() dates + cible
apps/reviews/views.py          — get_queryset() admin/public
apps/orders/serializers.py     — user_email + user_nom dans CommandeListSerializer
apps/users/views.py            — UserListAPIView + UserDetailAPIView
apps/users/urls.py             — Routes /v1/users/
apps/users/serializers_user.py — NEW: serializers admin users
apps/users/permissions.py      — has_permission dans IsOwnerOrAdmin
apps/common/exceptions.py      — Capture DjangoValidationError → 400
```

### Frontend (React + TypeScript + Tailwind)
```
App.tsx                         — Routes admin complètes (8 pages)
pages/HomePage.tsx              — Bandeau admin selon rôle
pages/admin/DashboardPage.tsx   — Statistiques + bouton test API
pages/admin/ProductsPage.tsx    — CRUD + variantes + images + ABMed
pages/admin/CategoriesPage.tsx  — CRUD + upload image + is_active
pages/admin/OrdersPage.tsx      — Liste + détail + transitions
pages/admin/PromotionsPage.tsx  — CRUD complet
pages/admin/ReviewsPage.tsx     — Modération
pages/admin/ConversationsPage.tsx — Chat support
pages/admin/UsersPage.tsx       — Liste + activation/désactivation
pages/admin/AdminLoginPage.tsx  — Connexion admin
components/admin/AdminLayout.tsx — Sidebar responsive
utils/apiTest.ts                — Suite de test API (16 endpoints)
```

## 🧪 Tests API

Tous les endpoints ont été testés via la suite intégrée (`apiTest.ts`) :
- ✅ 16/16 tests passent (GET, POST, PATCH, DELETE)
- Bouton "Tester les API" disponible sur le Dashboard admin

## 🔧 Installation

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

Accès admin : `http://localhost:5173/admin/login`

## ⚠️ Notes pour les collaborateurs

- Le serveur backend utilise **Daphne (ASGI)** et non le serveur WSGI standard
- La base de données est **PostgreSQL** (avec extensions `pg_trgm`, `unaccent`)
- Le cache serveur a été **volontairement supprimé** car incompatible avec
  l'architecture ASGI multi-workers. Le cache est géré côté frontend par
  TanStack Query (staleTime + invalidateQueries)
- Les suppressions sont des **soft deletes** (is_active=False) pour préserver
  l'intégrité des commandes existantes
- Les champs réglementaires **ABMed** (AMM, INCI, pays d'origine, péremption, lot)
  sont conformes à l'Arrêté du 18 janvier 2022 du Bénin
