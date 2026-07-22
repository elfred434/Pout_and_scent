@echo off
REM ============================================================
REM Pout & Scent — Arret complet Windows 11
REM ============================================================

echo.
echo ==========================================
echo   Pout ^& Scent — Arret...
echo ==========================================
echo.

REM Arreter les serveurs Django et Vite
echo [1/2] Arret des serveurs...
taskkill /f /im "node.exe" /fi "WINDOWTITLE eq Pout*" >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq Pout*" >nul 2>&1

REM Arreter Docker
echo [2/2] Arret de PostgreSQL et Redis...
docker compose down 2>nul

echo.
echo [OK] Tout est arrete.
echo.
pause
