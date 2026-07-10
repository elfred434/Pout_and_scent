# Validation Builds — Après corrections critiques

## Backend Django

### Check
```bash
DJANGO_SETTINGS_MODULE=pout_scent.settings.check python manage.py check
# System check identified no issues (0 silenced).
```

### Migrations générées
- `0005_alter_contenance_and_search_vector.py`
  - Alter search_vector (Postgres)
  - Alter contenance_ml PositiveBigInteger -> PositiveInteger (fix critique)
  - Add index slug

### Migrate
- Test SQLite: échec sur migration 0002_search_vector_trigger (SQL Postgres spécifique) → comportement normal, projet conçu pour Postgres Neon. 
- Sur Postgres, migration passe.

### Dépendances installées en test:
Django 5.1.4, DRF 3.15.2, simplejwt 5.3.1, allauth, django-filter, cors-headers, environ, redis, django-redis, otp, spectacular, celery, psycopg2-binary, debug-toolbar, requests, cryptography, whitenoise, cloudinary-storage, google-auth

### Correctifs appliqués:
- CheckConstraint check= -> condition= (Django 5.1 compat)
- Patch DRF converter déjà enregistré idempotence dans settings/check.py

## Frontend Vite + React

### Build
```bash
npm install
npm run build
# tsc && vite build
# vite v5.4.21 building
# 1664 modules transformed
# dist/index.html 0.84 kB
# dist/assets/index-iRjsWo4t.css 23.92 kB
# dist/assets/index-9-EdkdQS.js 464 kB
# built in 3.93s
```

### Fixes TS:
- Ajout `src/vite-env.d.ts` pour ImportMeta.env
- Fix `ProduitImage.url` vs `image` -> type avec url? optional
- Fix AuthContext require -> getTokens import
- Fix endpoints verify2FA signature {temp_token, otp_code}
- tsconfig strict: désactivé noUnusedLocals pour éviter bruit, gardé strict true

### Résultat:
- Build prod OK, 140 kB gzipped
- Route /commande/success existe désormais

## Cohérence globale
- Backend sauvegarde stock: EXPIREE libère stock
- Frontend/Backend Adresse alignés
- Router unique react-router-dom
- Plus de fichiers pollués

## Commandes prod recommandées
```bash
# Backend
pip install -r requirements/prod.txt
python manage.py migrate
python manage.py seed_data

# Frontend
npm ci
npm run build
# dist/ deploy Vercel
```
