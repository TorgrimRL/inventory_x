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
    "django.contrib.staticfiles",
    # Our apps
    "api.inventory.apps.InventoryConfig",
    "api.user.apps.UserConfig",
    "drf_spectacular",
]
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",  # Manages sessions
    "django.middleware.csrf.CsrfViewMiddleware",
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

STATIC_URL = "static/"

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
}

# Render a tool to easily send requests
if DEBUG:
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ]
SPECTACULAR_SETTINGS = {
    "TITLE": "Inventory API",
    "VERSION": "1.0.0",
    "SWAGGER_UI_SETTINGS": {
        "tryItOutEnabled": True,
        "persistAuthorization": True,
    },
}

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

# CORS CONFIG (Who can talk to the API)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5173",
]

# CSRF CONFIG
CSRF_TRUSTED_ORIGINS = [
    "http://127.0.0.1:5173",
]
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = False

# SESSION CONFIG (Login state & cookies)
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_AGE = 60 * 60

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
