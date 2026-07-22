# ============================================================
# Dockerfile — Backend Django Pout & Scent
# ============================================================
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_ENV=prod

WORKDIR /app

# Dépendances système
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Dépendances Python
COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/prod.txt

# Code applicatif
COPY . .

# Créer le dossier de logs
RUN mkdir -p logs

# Collecter les fichiers statiques
RUN python manage.py collectstatic --noinput --settings=pout_scent.settings.prod 2>/dev/null || true

# Utilisateur non-root
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/schema/ || exit 1

# Utiliser daphne (ASGI) pour supporter HTTP + WebSocket
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "pout_scent.asgi:application"]
