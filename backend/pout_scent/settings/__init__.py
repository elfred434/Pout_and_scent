from celery import app as celery_app
from .dev import * 
__all__ = ("celery_app",)