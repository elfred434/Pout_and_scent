from .base import *  # noqa

# Patch DRF converter registration to be idempotent (Django 5 + DRF 3.15 issue)
import django.urls.converters
_orig_register = django.urls.converters.register_converter

def _safe_register(converter, type_name):
    try:
        _orig_register(converter, type_name)
    except ValueError as e:
        if "already registered" in str(e):
            return
        raise

django.urls.converters.register_converter = _safe_register

# Also patch the reference already imported by DRF
try:
    import rest_framework.urlpatterns
    rest_framework.urlpatterns.register_converter = _safe_register
except Exception:
    pass

DEBUG = False
ALLOWED_HOSTS = ["*"]
INSTALLED_APPS = [a for a in INSTALLED_APPS if a != "debug_toolbar"]
MIDDLEWARE = [m for m in MIDDLEWARE if "debug_toolbar" not in m]
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
