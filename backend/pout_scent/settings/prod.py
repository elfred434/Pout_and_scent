"""
Configuration de production.
Usage : DJANGO_ENV=prod
"""
from datetime import timedelta
from .base import *  # noqa: F401,F403

import environ

env = environ.Env()

# ============================================================
# CORE
# ============================================================
DEBUG = False
SECRET_KEY = env("SECRET_KEY")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[".onrender.com"])

# ============================================================
# CORS — Frontend Vercel / Custom domain
# ============================================================
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["https://pout-scent.vercel.app"],
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# ============================================================
# SÉCURITÉ HTTPS
# ============================================================
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
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
# DATABASE (PostgreSQL avec SSL)
# ============================================================
DATABASES = {
    "default": env.db("DATABASE_URL"),
}
DATABASES["default"]["OPTIONS"] = {"sslmode": "require"}
DATABASES["default"]["CONN_MAX_AGE"] = 600

# ============================================================
# CACHE (Redis avec SSL — Upstash)
# ============================================================
REDIS_URL = env("REDIS_URL")
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SSL_CERT_REQS": None,
        },
    }
}

# ============================================================
# CELERY
# ============================================================
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

# ============================================================
# STOCKAGE — WhiteNoise (static) + Cloudinary (media)
# ============================================================
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

STATIC_ROOT = BASE_DIR / "staticfiles"  # noqa: F405
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": env("CLOUDINARY_CLOUD_NAME"),
    "CLOUDINARY_API_KEY": env("CLOUDINARY_API_KEY"),
    "CLOUDINARY_API_SECRET": env("CLOUDINARY_API_SECRET"),
}
MEDIA_URL = "/media/"

# ============================================================
# JWT — Tokens adaptés à la production
# ============================================================
SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"] = timedelta(hours=2)  # noqa: F405
SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"] = timedelta(days=7)  # noqa: F405

# ============================================================
# LOGGING — Plus structuré en production
# ============================================================
LOGGING["handlers"]["console"]["formatter"] = "simple"  # noqa: F405
LOGGING["loggers"]["apps"]["level"] = "WARNING"  # noqa: F405
LOGGING["loggers"]["django"]["level"] = "WARNING"  # noqa: F405
LOGGING["loggers"]["django.request"]["level"] = "ERROR"  # noqa: F405
