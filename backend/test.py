import psycopg2
import os

# Forcer l'encodage avant la connexion
os.environ['PGCLIENTENCODING'] = 'UTF8'

print("🔍 Test 1 : superuser 'postgres'")
try:
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="1234",  # Ton mot de passe postgres
        port=5432,
        client_encoding="UTF8"  # Forcer UTF-8
    )
    print("✅ Connexion superuser OK")
    conn.close()
except Exception as e:
    print(f"❌ Erreur superuser : {e}")

print()

print("🔍 Test 2 : utilisateur 'pout_scent_user'")
try:
    conn = psycopg2.connect(
        host="localhost",
        database="pout_scent_db",
        user="pout_scent_user",
        password="MotDePasseFort2026!",
        port=5432,
        client_encoding="UTF8"
    )
    print("✅ Connexion pout_scent_user OK")
    conn.close()
except Exception as e:
    print(f"❌ Erreur pout_scent_user : {e}")