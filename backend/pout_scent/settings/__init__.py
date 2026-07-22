"""
Package settings — charge automatiquement dev ou prod selon DJANGO_ENV.
Usage :
    export DJANGO_SETTINGS_MODULE=pout_scent.settings
    export DJANGO_ENV=prod  # ou 'dev' (défaut)
"""
import os

_env = os.environ.get("DJANGO_ENV", "dev").lower()

if _env == "prod" or _env == "production":
    from .prod import *  # noqa: F401,F403
else:
    from .dev import *  # noqa: F401,F403
