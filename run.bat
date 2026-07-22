@echo off
REM ============================================================
REM Pout & Scent — Lancement Windows 11 (backend + frontend)
REM Usage : Double-cliquez pour lancer
REM ============================================================

echo.
echo ==========================================
echo   Pout ^& Scent — Lancement...
echo ==========================================
echo.

REM Verifier que le setup a ete fait
if not exist "backend\venv" (
    echo [ERREUR] Lancez d'abord start.bat
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [ERREUR] Lancez d'abord start.bat
    pause
    exit /b 1
)

REM Verifier Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ATTENTION] Docker Desktop n'est pas lance.
    echo Lancez Docker Desktop et attendez qu'il soit "Running".
    pause
    exit /b 1
)

REM S'assurer que PostgreSQL et Redis tournent
echo [1/3] Verification de PostgreSQL et Redis...
docker compose up -d db redis 2>nul
timeout /t 3 /nobreak >nul

REM Lancer le backend dans une nouvelle fenetre
echo [2/3] Lancement du backend Django...
start "Pout&Scent - Backend (http://localhost:8000)" cmd /k "cd backend && venv\Scripts\activate.bat && echo. && echo Backend Django lance sur http://localhost:8000 && echo API Docs : http://localhost:8000/api/docs/ && echo Admin : http://localhost:8000/admin/ && echo. && python manage.py runserver 0.0.0.0:8000"

REM Attendre que le backend demarre
echo       Attente du demarrage du backend...
timeout /t 5 /nobreak >nul

REM Lancer le frontend dans une nouvelle fenetre
echo [3/3] Lancement du frontend React...
start "Pout&Scent - Frontend (http://localhost:5173)" cmd /k "cd frontend && echo. && echo Frontend React lance sur http://localhost:5173 && echo. && npm run dev"

echo.
echo ==========================================
echo   [OK] Pout ^& Scent est en ligne !
echo ==========================================
echo.
echo   Frontend :  http://localhost:5173
echo   Backend :   http://localhost:8000
echo   API Docs :  http://localhost:8000/api/docs/
echo   Admin :     http://localhost:8000/admin/
echo.
echo   Compte admin :
echo     Email :    admin@poutscent.bj
echo     Password : Admin1234!
echo.
echo   Deux fenetres CMD ont ete ouvertes.
echo   Fermez-les pour arreter le projet.
echo.
echo   Pour arreter PostgreSQL/Redis :
echo     docker compose down
echo.
pause
