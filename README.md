# Pout & Scent 🌿✨

Plateforme e-commerce haut de gamme spécialisée dans la revente de parfums et de cosmétiques.

## 🏛️ Architecture Technique

Le projet est une application web moderne découplée (Decoupled Architecture) :
* **Backend :** Python 3.11, Django 5.1.4, Django REST Framework (DRF), PostgreSQL (avec recherche full-text Search Vector), Celery & Redis (pour la gestion asynchrone et l'expiration des commandes de 72h), SimpleJWT, Django-OTP (2FA), Allauth (Google OAuth2).
* **Frontend :** React 18, TypeScript (strict), Vite, Tailwind CSS, Zustand, React Router DOM, React Query.

---

## 🚀 Démarrage Rapide avec Docker Compose (Recommandé)

Pour lancer l'ensemble de la stack (PostgreSQL, Redis, Django Backend, Celery Worker, Frontend Vite) en un seul clic :

```bash
docker-compose up --build
```

* **Frontend :** `http://localhost:5173`
* **API Backend :** `http://localhost:8000/api/v1/`
* **Documentation Swagger :** `http://localhost:8000/api/docs/`
* **Admin Django :** `http://localhost:8000/admin/`

---

## 🛠️ Installation Manuelle (Développement local)

### 1. Backend Django
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/dev.txt

# Configurer le fichier .env
cp .env.example .env  # ou créer un .env avec SECRET_KEY, DATABASE_URL, etc.

python manage.py migrate
python manage.py seed_data  # Crée l'admin et les données de démo
python manage.py runserver
```

### 2. Frontend React
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Données de Démo (Seed)
Le script `python manage.py seed_data` génère :
* **Admin :** `admin@poutscent.bj` / `Admin123456!`
* **Clients :** `client1@demo.bj`, `client2@demo.bj`, `client3@demo.bj` / `Client123456!`
* **Catalogue :** Parfums (Dior, Chanel, YSL, Lancôme) & Cosmétiques (CeraVe, The Ordinary) avec variantes de contenance (30ml, 50ml, 100ml) et stocks.

---

## 📦 Tests & Build de Validation
* **Backend Check :** `python manage.py check`
* **Frontend Build :** `npm run build` (génère `dist/`)

---

## 📄 Documentation Complète
Consultez **`AUDIT_COMPLET.md`** pour une analyse technique détaillée, l'audit de sécurité, et les recommandations de mise en production.
