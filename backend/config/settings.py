"""
Django settings for backend project.
"""

from pathlib import Path

import environ

# Environment Setup
env = environ.Env()
environ.Env.read_env()

BASE_DIR = Path(__file__).resolve().parent.parent

# Security & Core Config
SECRET_KEY = env("SECRET_KEY", default="django-insecure-dev-key-change-me")
DEBUG = env.bool("DEBUG", default=True)
# If DEBUG is True, allow all. Otherwise, read from env.
# TODO: For prod double check all `DEBUG` and env settings
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
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
            ],
        },
    },
]

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ]
}

# Render a tool to easily send requests
if DEBUG:
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
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
SESSION_COOKIE_AGE = 60 * 60 * 2  # 2H
SESSION_COOKIE_HTTPONLY = True  # Hides cookie from document.cookie
SESSION_COOKIE_SECURE = not DEBUG  # Only sends cookie over https://

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
        "api": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}
