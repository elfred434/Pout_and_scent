#!/bin/bash
# ============================================================
# Pout & Scent — Script de démarrage local
# Usage : chmod +x start.sh && ./start.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════╗"
echo "║   🌸 Pout & Scent — Démarrage local         ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── Vérifier les prérequis ────────────────────────────────
echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

command -v python3 >/dev/null 2>&1 || { echo -e "${RED}❌ Python 3 requis. Installez-le.${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js requis. Installez-le.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm requis.${NC}"; exit 1; }

echo -e "${GREEN}  ✅ Python $(python3 --version 2>&1)${NC}"
echo -e "${GREEN}  ✅ Node $(node --version)${NC}"
echo -e "${GREEN}  ✅ npm $(npm --version)${NC}"

# ─── Backend ────────────────────────────────────────────────
echo -e "\n${YELLOW}🔧 Configuration du backend...${NC}"
cd backend

# Créer l'environnement virtuel s'il n'existe pas
if [ ! -d "venv" ]; then
    echo -e "  Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Installer les dépendances
echo -e "  Installation des dépendances Python..."
pip install -r requirements/base.txt -q 2>/dev/null
pip install google-auth -q 2>/dev/null

# Créer le .env s'il n'existe pas
if [ ! -f ".env" ]; then
    echo -e "  Création du fichier .env..."
    cat > .env << 'EOF'
SECRET_KEY=dev-secret-key-change-me-in-production-abc123xyz789longenough
DEBUG=True
DJANGO_ENV=dev
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
EMAIL_HOST=localhost
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_FROM=noreply@poutscent.bj
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EOF
    echo -e "${GREEN}  ✅ .env créé${NC}"
fi

# Créer le dossier logs
mkdir -p logs

# Appliquer les migrations
echo -e "  Application des migrations..."
python manage.py migrate --run-syncdb 2>/dev/null

# Créer le superuser par défaut
echo -e "  Création du superuser admin..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@poutscent.bj').exists():
    User.objects.create_superuser(email='admin@poutscent.bj', password='Admin1234!')
    print('  ✅ Superuser créé : admin@poutscent.bj / Admin1234!')
else:
    print('  ✅ Superuser existe déjà')
" 2>/dev/null

# Charger la liste noire ABMed
echo -e "  Chargement de la liste noire ABMed..."
python manage.py shell -c "
from apps.catalog.seed_produits_interdits import seed
seed()
" 2>/dev/null

cd ..

# ─── Frontend ───────────────────────────────────────────────
echo -e "\n${YELLOW}🎨 Configuration du frontend...${NC}"
cd frontend

# Installer les dépendances
echo -e "  Installation des dépendances npm..."
npm install --silent 2>/dev/null

cd ..

# ─── Résumé ─────────────────────────────────────────────────
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Configuration terminée !                            ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║                                                          ║"
echo "║  Pour lancer le projet, ouvrez 3 terminaux :             ║"
echo "║                                                          ║"
echo "║  📟 Terminal 1 — Backend Django :                        ║"
echo "║     cd backend                                           ║"
echo "║     source venv/bin/activate                             ║"
echo "║     python manage.py runserver                           ║"
echo "║     → http://localhost:8000                              ║"
echo "║     → API docs : http://localhost:8000/api/docs/         ║"
echo "║                                                          ║"
echo "║  📟 Terminal 2 — Frontend React :                        ║"
echo "║     cd frontend                                          ║"
echo "║     npm run dev                                          ║"
echo "║     → http://localhost:5173                              ║"
echo "║                                                          ║"
echo "║  📟 Terminal 3 — Celery (optionnel) :                    ║"
echo "║     cd backend                                           ║"
echo "║     source venv/bin/activate                             ║"
echo "║     celery -A pout_scent worker --loglevel=info          ║"
echo "║                                                          ║"
echo "║  🔑 Compte admin :                                       ║"
echo "║     Email : admin@poutscent.bj                           ║"
echo "║     Mot de passe : Admin1234!                            ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
