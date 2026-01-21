"""
Django settings for backend project.
"""

import os
from pathlib import Path

import environ

# Define BASE_DIR first (Project Root)
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environ
env = environ.Env()

# Explicitly point to the .env file in the Project Root
ENV_FILE = os.path.join(BASE_DIR, ".env")
if os.path.exists(ENV_FILE):
    environ.Env.read_env(ENV_FILE)
else:
    raise FileNotFoundError(f" Ensure .env is located in: {ENV_FILE}")

# Security & Core Config
SECRET_KEY = env("SECRET_KEY", default="django-insecure-dev-key-change-me")
DEBUG = env.bool("DEBUG", default=True)
# If DEBUG is True, allow all. Otherwise, read from env.
ALLOWED_HOSTS = ["*"] if DEBUG else env.list("ALLOWED_HOSTS", default=[])


# Application definition
INSTALLED_APPS = [
    "corsheaders",
    # Our apps
    "api.inventory.apps.InventoryConfig",
    "api.user.apps.UserConfig",
]
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# Database
DATABASES = {"default": env.db("DATABASE_URL")}

# Internationalization & Time
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
