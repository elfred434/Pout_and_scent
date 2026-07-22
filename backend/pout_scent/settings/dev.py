from .base import *  

DEBUG = True
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "*.loca.lt",  # ✅ Autorise toutes les URLs loca.lt
    "forty-islands-run.loca.lt",  # Ton URL backend
]

INSTALLED_APPS += ["debug_toolbar"]  
MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")  # noqa
INTERNAL_IPS = ["127.0.0.1"]

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://fifty-jeans-teach.loca.lt",  # ✅ Ton URL frontend
]

# CSRF : Autoriser le frontend loca.lt
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "https://forty-islands-run.loca.lt",  # ✅ Ton URL frontend
]
#EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"