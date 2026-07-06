from .base import *  # noqa
import environ

env = environ.Env()

# ✅ Base
DEBUG = False
SECRET_KEY = env("SECRET_KEY")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[".onrender.com"])

# ✅ CORS — Frontend Vercel
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["https://pout-scent.vercel.app"],  # ← À remplacer par ton URL Vercel
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# ✅ Sécurité HTTPS
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# ✅ PostgreSQL (Neon)
DATABASES = {
    "default": env.db("DATABASE_URL"),
}
DATABASES["default"]["OPTIONS"] = {"sslmode": "require"}

# ✅ Redis (Upstash)
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

# Celery
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

# ✅ Fichiers statiques — WhiteNoise
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ✅ Médias — Cloudinary
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": env("CLOUDINARY_CLOUD_NAME"),
    "API_KEY": env("CLOUDINARY_API_KEY"),
    "API_SECRET": env("CLOUDINARY_API_SECRET"),
}
MEDIA_URL = "/media/"

# ✅ Emails — Brevo (déjà configuré dans base.py)
# Les variables EMAIL_HOST, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD viennent de l'env

# ✅ JWT — Tokens plus longs en prod
from datetime import timedelta
SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"] = timedelta(hours=2)
SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"] = timedelta(days=7)