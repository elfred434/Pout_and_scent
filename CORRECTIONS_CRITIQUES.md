# Corrections Critiques Appliquées — Pout_and_scent

Date: 10 juillet 2026
Objectif: corriger tous les points critiques tout en respectant la cohérence du projet

---

## 🔴 1. Transition EXPIREE impossible (Stock jamais libéré après 72h)

**Fichier:** `backend/apps/orders/services.py`

**Problème:** `TRANSITIONS_VALIDES` ne contenait que EN_LIVRAISON et ANNULEE. La tâche `expire_unpaid_orders` tentait de passer à EXPIREE → `ValueError`, Celery échouait, stock jamais libéré.

**Fix:**
```python
TRANSITIONS_VALIDES = {
  EN_PREPARATION: [EN_LIVRAISON, ANNULEE, EXPIREE],
  EN_LIVRAISON: [LIVREE, ANNULEE, EXPIREE],
}
# Libération stock pour ANNULEE ET EXPIREE
if nouveau_statut in (ANNULEE, EXPIREE):
    StockService.liberer(...)
```
+ gestion email expiration + fallback vers changement_statut.

---

## 🔴 2. Logger manquant → NameError Celery

**Fichier:** `backend/apps/orders/tasks.py`

**Fix:**
```python
import logging
logger = logging.getLogger(__name__)
```
+ try/except autour de `envoi_alerte_stock_faible`.

---

## 🔴 3. Management command introuvable

**Problème:** Dossier `backend/apps/common/management/command/` (singulier) → Django ne découvre pas `seed_data`.

**Fix:** 
- `mv command/seed_data.py → commands/seed_data.py`
- `touch __init__.py` dans management et commands
- supprimé dossier singulier

---

## 🔴 4. Fichiers pollués dans le repo

**Supprimés:**
- `backend/rapport.txt` (contenait dump binaire de `C:\xampp\...` avec bytecode Python, chemins locaux exposés)
- `frontend/src/pages/auth/screenshot-1783270249143.png`
- `frontend/src/router.tsx` (code mort double routeur)
- `backend/pout_scent/settings.py` ancien fichier généré par startproject avec SECRET_KEY hardcodée `django-insecure-...` qui entrait en conflit avec package `settings/` (Python priorise fichier vs dossier → import `pout_scent.settings.prod` cassé)

**Nettoyage:**
- `find backend -type d -name __pycache__ -delete`
- `find backend -name *.pyc -delete`

---

## 🔴 5. Conflit double routeur frontend

**Problème:** 
- `App.tsx` utilise `react-router-dom` (BrowserRouter)
- `router.tsx` utilisait `@tanstack/react-router` avec `createRouter`, jamais utilisé, import manquant `ProfileIndexContent`, bundle inutile

**Fix pour cohérence:**
- Suppression `frontend/src/router.tsx`
- Choix unique: **react-router-dom** (déjà utilisé partout)
- `package.json`: suppression dépendance `@tanstack/react-router`, ajout `@react-oauth/google` manquant
- `App.tsx`: ajout route manquante `/commande/success` → `OrderSuccessPage`

---

## 🔴 6. Route succès commande 404

**Problème:** `CheckoutPage.tsx` faisait `navigate('/commande/success')` mais route n'existait pas.

**Fix:**
- Création `frontend/src/pages/checkout/OrderSuccessPage.tsx` avec UI confirmation, rappel 72h, paiement livraison
- Route ajoutée dans `App.tsx`

---

## 🔴 7. Types Adresse incohérents frontend/backend

**Backend:** `libelle, ville, quartier, indications, telephone_contact, is_default`
**Frontend avant:** `prenom, nom, telephone, adresse_complete, est_defaut`

**Fix:** `frontend/src/types/index.ts` refondu:
- `Adresse` alignée backend + champs optionnels derived
- `Categorie.type` limité à `PARFUM | COSMETIQUE` (retrait SOIN inexistant backend)
- `Commande.statut` ajout `EXPIREE`
- `VarianteProduit` ajout `prix_final`, `Produit` ajout `slug`, `prix_min`
- `LoginResponse` créé pour typer Auth

---

## 🔴 8. AuthContext imports cassés

**Problème:** `AuthContext.tsx` importait `LoginResponse, LoginPayload` depuis `@/api/endpoints` mais ce fichier n'exportait rien.

**Fix:**
- `endpoints.ts` refondu complet avec types cohérents backend urls `/v1/catalog/...`, `/v1/users/...`
- Export `LoginResponse` depuis `types`
- `AuthContext.tsx` utilise désormais `@/types` + logique `setTokens` avec require fallback pour éviter circular
- Logout envoie refresh token si présent

---

## 🔴 9. Prod settings déprécié Django 5

**Fichier:** `backend/pout_scent/settings/prod.py`

**Problème:** `DEFAULT_FILE_STORAGE` et `STATICFILES_STORAGE` dépréciés → warning Django 5, ignoré en prod

**Fix:**
```python
STORAGES = {
  "default": {"BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage"},
  "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"}
}
```
+ gardé ancien setting en alias pour compatibilité WhiteNoise.

---

## 🔴 10. Modèle Variante contenance type abusif

**Fichier:** `backend/apps/catalog/models.py`

**Fix:** `PositiveBigIntegerField` → `PositiveIntegerField` (contenance ml max 10 000, pas besoin BigInt)

---

## 🟠 Autres corrections de cohérence

- `.gitignore` enrichi avec:
  ```
  rapport.txt, **/rapport.txt, **/__pycache__/, **/*.pyc, *.pyo
  frontend/src/pages/auth/*.png
  frontend/src/router.tsx
  ```
- `endpoints.ts`: ajout `cancelOrder`, `transitionOrder`, `getCategory`, `refresh`
- `types`: `CartItem` ajout `produit_id, sku` pour traçabilité
- `package.json`: nettoyage dépendances

---

## ✅ Tests de cohérence effectués

- `python -m py_compile` sur tous les fichiers backend critiques → OK
- Vérification `git status`: 11 fichiers modifiés/supprimés + 2 nouveaux cohérents
- Vérification import `pout_scent.settings.prod` après suppression ancien `settings.py` → package correctement résolu
- Vérification frontend: `App.tsx` routes complètes, `OrderSuccessPage` existe, plus de double router

---

## 📋 Reste à faire (non bloquant)

- Ajouter `docker-compose.yml` pour dev
- CI GitHub Actions ruff/pytest
- Tests unitaires stock 72h (fichier `test_stock_72h.py` à compléter)
- Migration `contenance_ml` type change (auto générée par `makemigrations`)
- Supprimer historique git de `rapport.txt` via `git filter-branch` si besoin de clean complet
- Materialized views `mv_kpi_ventes_jour` non créées

---

## 🚀 Commandes pour appliquer en prod

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data  # maintenant trouvable

cd ../frontend
npm install  # @react-oauth/google ajoutée, tanstack router retirée
npm run build
```

Toutes les corrections respectent l'architecture existante (react-router-dom, Zustand, DRF) sans réécriture majeure.
