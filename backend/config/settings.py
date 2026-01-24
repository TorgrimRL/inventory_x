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
elif os.environ.get("GITHUB_ACTIONS") == "true":
    pass  # If on GitHub, we don't need the file;
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
    "rest_framework",
    "django.contrib.auth",  # Required for AUTH_USER_MODEL
    "django.contrib.contenttypes",  # Required for permissions
    "django.contrib.sessions",  # Required for login state
    # Our apps
    "api.inventory.apps.InventoryConfig",
    "api.user.apps.UserConfig",
]
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",  # Manages sessions
    "django.contrib.auth.middleware.AuthenticationMiddleware",  # Link usermodel
    "django.middleware.security.SecurityMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# Database
DATABASES = {
    "default": env.db(
        "DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
    )
}

AUTH_USER_MODEL = "user.User"

# Internationalization & Time
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# CORS Configuration
CORS_ALLOW_CREDENTIALS = True  # Allows cookies to be sent/received
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

# COOKIES SESSOIN
SESSION_EXPIRE_AT_BROWSER_CLOSE = True  # Closing the browser kills the session

# LOGGING STREAM. USE TO DEBUG LIVE ACTIONS
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "%(levelname)-8s %(asctime)s [%(threadName)-12.12s] \
            [%(name)-15.15s] %(message)s",
            "style": "%",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,  # prevent double logging
        },
        "login": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}
