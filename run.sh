#!/bin/bash
# ============================================================
# Pout & Scent — Lancement rapide (backend + frontend)
# Usage : chmod +x run.sh && ./run.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌸 Pout & Scent — Lancement...${NC}\n"

# Vérifier que le setup a été fait
if [ ! -d "backend/venv" ]; then
    echo -e "${RED}❌ Environnement virtuel introuvable. Lancez d'abord : ./start.sh${NC}"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${RED}❌ node_modules introuvable. Lancez d'abord : ./start.sh${NC}"
    exit 1
fi

# Fonction de nettoyage
cleanup() {
    echo -e "\n${YELLOW}🛑 Arrêt des services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID 2>/dev/null
    wait $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Arrêté.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# ─── Lancer le backend ──────────────────────────────────────
echo -e "${YELLOW}🚀 Démarrage du backend Django...${NC}"
cd backend
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
sleep 3

# ─── Lancer le frontend ────────────────────────────────────
echo -e "${YELLOW}🎨 Démarrage du frontend React...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Attendre que le frontend démarre
sleep 3

# ─── Résumé ─────────────────────────────────────────────────
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🌸 Pout & Scent est en ligne !                        ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║                                                          ║"
echo "║  🌐 Frontend :  http://localhost:5173                    ║"
echo "║  🔌 Backend :   http://localhost:8000                    ║"
echo "║  📚 API Docs :  http://localhost:8000/api/docs/          ║"
echo "║  📋 Admin :     http://localhost:8000/admin/             ║"
echo "║                                                          ║"
echo "║  🔑 Admin : admin@poutscent.bj / Admin1234!             ║"
echo "║                                                          ║"
echo "║  Appuyez sur Ctrl+C pour arrêter                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Attendre que les processus se terminent
wait
