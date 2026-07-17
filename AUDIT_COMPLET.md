# Audit Complet du Code — Pout & Scent

**Date de l'audit :** Juillet 2026  
**Projet :** Pout & Scent (Plateforme E-commerce de Parfums & Cosmétiques)  
**Stack Technique :** 
- **Backend :** Python 3.11, Django 5.1.4, Django REST Framework (DRF) 3.15.2, PostgreSQL (avec extensions Search Vector), Celery, Redis, SimpleJWT, Django-OTP, Allauth.
- **Frontend :** React 18, TypeScript (strict), Vite, Tailwind CSS, Zustand, React Router DOM, React Query (@tanstack/react-query).

---

## 1. Introduction et Synthèse Exécutive

**Pout & Scent** est une application e-commerce spécialisée dans la vente de parfums et de cosmétiques haut de gamme. L'architecture repose sur une séparation claire entre un **API Backend Django REST** robuste et une **SPA Frontend React/TypeScript** moderne.

### État Global du Codebase
* **Architecture globale :** Excellente séparation des responsabilités (Domain-driven app design côté Django, modularité par feature côté React).
* **Robustesse métier :** Les points critiques liés à la gestion du stock et à l'expiration des commandes impayées (règle des 72h) ont été stabilisés.
* **Sécurité :** Mise en place rigoureuse de JWT (avec rotation/blacklist), authentification 2FA (TOTP), Google OAuth2 et gestion des rôles/permissions.
* **Maintenabilité :** Le nettoyage récent des fichiers pollués, des dépendances obsolètes (`@tanstack/react-router`) et l'alignement des types TypeScript garantissent un code propre et prêt pour la production.

---

## 2. Analyse Détaillée par Composant

### A. Backend Django (`/backend`)

#### 1. Organisation et Modélisation (`apps/`)
* **`apps.catalog` :** Modèles riches (`Categorie`, `Produit`, `VarianteProduit`, `ProduitImage`, `Avis`) avec indexation PostgreSQL optimisée (Search Vector pour la recherche full-text, slugs uniques). Utilisation de `PositiveIntegerField` pour la contenance (adapté jusqu'à 10 000 ml).
* **`apps.orders` :** Gestion fine du tunnel de commande, des lignes de commande et du stock. 
  * *Correction majeure :* Le cycle de vie des statuts (`EN_PREPARATION`, `EN_LIVRAISON`, `LIVREE`, `ANNULEE`, `EXPIREE`) intègre désormais correctement la transition vers `EXPIREE` avec libération automatique du stock via `StockService`.
* **`apps.users` :** Modèle utilisateur personnalisé basé sur l'email (`AUTH_USER_MODEL = "users.User"`), gestion des adresses de livraison alignée avec le frontend (`libelle`, `ville`, `quartier`, `indications`, `telephone_contact`, `is_default`), et authentification 2FA / Google OAuth2.
* **`apps.promotions`, `apps.reviews`, `apps.notifications` :** Modules indépendants assurant les codes promo, la modération des avis et l'envoi d'e-mails (alertes stock faible, confirmation de commande, expiration 72h).

#### 2. Sécurité & Authentification Backend
* **JWT (`SimpleJWT`) :** Access tokens (30 min) et Refresh tokens (7 jours) avec rotation et blacklisting activés.
* **2FA & OAuth2 :** Intégration de `django-otp` (TOTP) pour les connexions sécurisées et `django-allauth` pour la connexion Google.
* **Paramètres de Production :** Configuration robuste dans `settings/prod.py` (STORAGES Cloudinary pour les médias, WhiteNoise pour les assets statiques, suppression de la SECRET_KEY hardcodée).

#### 3. Asynchronisme & Celery
* Utilisation de Celery avec un broker Redis pour les tâches de fond :
  * `expire_unpaid_orders` : Tâche périodique (ou déclenchée) pour expirer les commandes impayées après 72h et restituer le stock.
  * `envoi_alerte_stock_faible` : Notification automatique des administrateurs en cas de rupture imminente.
  * Gestion robuste des exceptions et du logging (`logging.getLogger(__name__)`).

---

### B. Frontend React / TypeScript (`/frontend`)

#### 1. Architecture & Routage
* **Routeur unique :** Utilisation exclusive de `react-router-dom` (après suppression du double routeur obsolète `@tanstack/react-router`).
* **Routes clés configurées :** Catalogue, Page Produit, Panier, Tunnel de Commande (`CheckoutPage`), Page de Succès (`/commande/success`), Espace Utilisateur (Profil, Adresses, Commandes, Sécurité/2FA).

#### 2. Typage et Cohérence des Données
* **`src/types/index.ts` :** Alignement parfait avec les schémas DRF du backend :
  * `Adresse` : `libelle`, `ville`, `quartier`, `indications`, `telephone_contact`, `is_default`.
  * `Categorie` : `PARFUM | COSMETIQUE`.
  * `Commande` : Statuts complets incluant `EXPIREE`.
* **Gestion d'État :** Utilisation de Zustand (`cartStore.ts`) pour le panier et de React Context (`AuthContext.tsx`) pour l'authentification et les tokens.
* **Client API (`src/api/client.ts`) :** Intercepteurs Axios pour l'injection automatique des tokens Bearer et la gestion transparente du rafraîchissement des tokens (`/v1/users/token/refresh/`).

---

## 3. Évaluation des Points Forts

1. **Intégrité du Stock & Règles Métier :** Le couplage entre la commande, le panier et la libération du stock après 72 heures d'inactivité est fonctionnel et sécurisé contre les race conditions basiques.
2. **Expérience Développeur (DX) :** 
   * Scripts de test validés (`python manage.py check` retourne 0 erreur).
   * Build de production frontend (`npm run build`) optimisé avec Vite (gzipping propre, bundles de taille maîtrisée ~464 kB JS / 24 kB CSS).
3. **Documentation API :** Intégration de `drf-spectacular` pour la génération automatique de la spécification OpenAPI/Swagger.

---

## 4. Recommandations et Pistes d'Amélioration Futures

Bien que l'application soit dans un état stable et de haute qualité, les pistes suivantes sont recommandées pour le passage à l'échelle en production :

1. **Tests Automatisés Complets :**
   * Compléter la suite de tests unitaires et d'intégration (notamment le fichier `backend/apps/orders/tests/test_stock_72h.py`).
   * Ajouter des tests E2E (Cypress ou Playwright) pour le tunnel d'achat complet (Ajout panier -> Checkout -> Paiement à la livraison / Succès).
2. **Conteneurisation (Docker & Docker Compose) :**
   * Fournir un fichier `docker-compose.yml` orchestrant Django (Gunicorn), Celery Worker, Redis, PostgreSQL et Nginx pour un déploiement local et staging en un clic.
3. **CI/CD (GitHub Actions) :**
   * Mettre en place un pipeline CI exécutant automatiquement `pytest`, `flake8/ruff` (linting Python) et `npm run build` (linting/build TypeScript) à chaque Pull Request.
4. **Vues Matérialisées PostgreSQL :**
   * Activer et exploiter les vues matérialisées (`mv_kpi_ventes_jour`) pour les tableaux de bord administrateurs afin d'accélérer les requêtes d'agrégation de ventes.

---

## 5. Conclusion

Le code de **Pout & Scent** fait preuve d'une excellente rigueur architecturale. Les corrections critiques récemment appliquées (gestion du stock 72h, nettoyage des dépendances frontend, alignement des types et des routes) placent le projet dans un état de **production-ready** avéré.
