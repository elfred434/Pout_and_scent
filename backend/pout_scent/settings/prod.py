"""
Configuration de production — 100% GRATUITE (Render + Vercel)
Usage : DJANGO_ENV=prod

Variables d'environnement requises sur Render :
  - SECRET_KEY (auto-généré par Render)
  - DATABASE_URL (auto-fourni par Render PostgreSQL)
  - ALLOWED_HOSTS (ex: .onrender.com)
  - FRONTEND_URL (ex: https://pout-scent.vercel.app)
"""
from datetime import timedelta
from .base import *  # noqa: F401,F403

import os

# ============================================================
# CORE
# ============================================================
DEBUG = False
SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", ".onrender.com").split(",")

# ============================================================
# CORS — Frontend Vercel
# ============================================================
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://pout-scent.vercel.app")

CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "https://pout-scent.vercel.app",
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# ============================================================
# SÉCURITÉ HTTPS
# ============================================================
SECURE_SSL_REDIRECT = False  # Render gère le SSL au niveau du proxy
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

# ============================================================
# DATABASE (PostgreSQL Render — gratuit 90 jours)
# ============================================================
DATABASE_URL = os.environ.get("DATABASE_URL", "")
if DATABASE_URL:
    import dj_database_url
    DATABASES = {
        "default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
    DATABASES["default"]["OPTIONS"] = {"sslmode": "require"}

# ============================================================
# CACHE — LocMemCache (gratuit, pas de Redis nécessaire)
# ============================================================
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "pout-scent-cache",
    }
}

# ============================================================
# CELERY — Désactivé en mode gratuit (pas de Redis)
# Les tâches async seront exécutées de manière synchrone
# ============================================================
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# ============================================================
# STOCKAGE — WhiteNoise (static) + FileSystem (media)
# Pas de Cloudinary nécessaire — les images sont servies par Django
# ============================================================
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

STATIC_ROOT = BASE_DIR / "staticfiles"  # noqa: F405
MEDIA_ROOT = BASE_DIR / "media"  # noqa: F405
MEDIA_URL = "/media/"

# ============================================================
# JWT — Tokens adaptés à la production
# ============================================================
SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"] = timedelta(hours=2)  # noqa: F405
SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"] = timedelta(days=7)  # noqa: F405

# ============================================================
# LOGGING — Moins verbose en production
# ============================================================
LOGGING["handlers"]["console"]["formatter"] = "simple"  # noqa: F405
LOGGING["loggers"]["apps"]["level"] = "WARNING"  # noqa: F405
LOGGING["loggers"]["django"]["level"] = "WARNING"  # noqa: F405
LOGGING["loggers"]["django.request"]["level"] = "ERROR"  # noqa: F405

# ============================================================
# FRONTEND URL
# ============================================================
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://pout-scent.vercel.app")
