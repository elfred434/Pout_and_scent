@echo off
REM ============================================================
REM Pout & Scent — Script de démarrage Windows 11
REM Usage : Double-cliquez ou lancez dans CMD/PowerShell
REM ============================================================

echo.
echo ==========================================
echo   Pout ^& Scent — Configuration Windows 11
echo ==========================================
echo.

REM --- Vérifier Python ---
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installé.
    echo Installez Python 3.11+ depuis https://python.org
    echo IMPORTANT : Cochez "Add Python to PATH" lors de l'installation !
    pause
    exit /b 1
)

REM --- Vérifier Node.js ---
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installé.
    echo Installez Node.js 18+ depuis https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Python detecte
echo [OK] Node.js detecte
echo.

REM --- Backend ---
echo [1/4] Configuration du backend...
cd backend

REM Creer l'environnement virtuel
if not exist "venv" (
    echo       Creation de l'environnement virtuel...
    python -m venv venv
)

REM Activer l'environnement virtuel
call venv\Scripts\activate.bat

REM Installer les dependances
echo       Installation des dependances Python...
pip install -r requirements\base.txt -q
pip install google-auth -q

REM Creer le .env avec PostgreSQL
if not exist ".env" (
    echo       Creation du fichier .env...
    (
        echo SECRET_KEY=dev-secret-key-change-me-in-production-abc123xyz789longenough
        echo DEBUG=True
        echo DJANGO_ENV=dev
        echo DATABASE_URL=postgres://pout_user:pout_password@localhost:5432/pout_scent
        echo REDIS_URL=redis://localhost:6379/0
        echo EMAIL_HOST=localhost
        echo EMAIL_PORT=587
        echo EMAIL_HOST_USER=
        echo EMAIL_HOST_PASSWORD=
        echo EMAIL_FROM=noreply@poutscent.bj
        echo FRONTEND_URL=http://localhost:5173
        echo GOOGLE_CLIENT_ID=
        echo GOOGLE_CLIENT_SECRET=
    ) > .env
    echo [OK] .env cree avec PostgreSQL
)

REM Creer le dossier logs
if not exist "logs" mkdir logs

cd ..

REM --- Frontend ---
echo [2/4] Configuration du frontend...
cd frontend

if not exist "node_modules" (
    echo       Installation des dependances npm...
    call npm install
)

cd ..

echo.
echo [3/4] Demarrage de PostgreSQL et Redis via Docker...
echo.

REM Verifier Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ATTENTION] Docker Desktop n'est pas installe.
    echo.
    echo Deux options :
    echo.
    echo OPTION A - Docker Desktop (recommande) :
    echo   1. Installez Docker Desktop depuis https://docker.com/products/docker-desktop
    echo   2. Lancez Docker Desktop et attendez qu'il soit "Running"
    echo   3. Relancez ce script
    echo.
    echo OPTION B - PostgreSQL natif :
    echo   1. Installez PostgreSQL 16 depuis https://postgresql.org/download/windows
    echo   2. Creez la base : CREATE DATABASE pout_scent;
    echo   3. Creez l'utilisateur : CREATE USER pout_user WITH PASSWORD 'pout_password';
    echo   4. GRANT ALL PRIVILEGES ON DATABASE pout_scent TO pout_user;
    echo   5. Installez Redis depuis https://github.com/microsoftarchive/redis/releases
    echo   6. Modifiez backend\.env avec vos identifiants PostgreSQL
    echo.
    pause
    exit /b 1
)

REM Lancer uniquement PostgreSQL et Redis
echo       Lancement de PostgreSQL 16 et Redis 7...
docker compose up -d db redis

REM Attendre que les services soient prets
echo       Attente du demarrage des services...
timeout /t 8 /nobreak >nul

echo [4/4] Application des migrations...
cd backend
call venv\Scripts\activate.bat
python manage.py migrate

REM Creer le superuser
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser(email='admin@poutscent.bj', password='Admin1234!') if not User.objects.filter(email='admin@poutscent.bj').exists() else None; print('[OK] Superuser: admin@poutscent.bj / Admin1234!')" 2>nul

REM Charger la liste noire ABMed
python manage.py shell -c "from apps.catalog.seed_produits_interdits import seed; seed()" 2>nul

cd ..

echo.
echo ==========================================
echo   [OK] Configuration terminee !
echo ==========================================
echo.
echo   Lancez run.bat pour demarrer le projet
echo.
pause
