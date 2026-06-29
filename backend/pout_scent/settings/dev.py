from .base import *  

DEBUG = True
ALLOWED_HOSTS = ["*"]
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

#EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"