"""
Django settings for backend project.
"""

import sys
from pathlib import Path

import environ

# TODO: PROD CASE:CHECKS:  ENV,  SESSIONS, SMTP

# ==============================================================================
# ENVIRONMENT SETUP
# ==============================================================================
env = environ.Env()
environ.Env.read_env()

BASE_DIR = Path(__file__).resolve().parent.parent
HOST_ENDPOINT = "http://inventoryx.td.org.uit.no"

# ==============================================================================
# CORE & SECURITY
# ==============================================================================
SECRET_KEY = env("SECRET_KEY", default="django-insecure-dev-key-change-me")
DEBUG = env.bool("DEBUG", default=True)

# If DEBUG is True, allow all. Otherwise, read from env.
ALLOWED_HOSTS = ["*"] if DEBUG else env.list("ALLOWED_HOSTS", default=[])

# ==============================================================================
# APPS & MIDDLEWARE
# ==============================================================================
INSTALLED_APPS = [
    # 1. Django Core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # 2. Third-Party
    "corsheaders",
    "rest_framework",
    "drf_spectacular",
    # 3. Local Apps
    "config",
    "api.inventory.apps.InventoryConfig",
    "api.user.apps.UserConfig",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
AUTH_USER_MODEL = "user.User"

# ==============================================================================
# DATABASE & CACHE
# ==============================================================================
DATABASES = {
    "default": env.db(
        "DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
    )
}

# ==============================================================================
# REST FRAMEWORK & SWAGGER
# ==============================================================================
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ]
    + (["rest_framework.renderers.BrowsableAPIRenderer"] if DEBUG else []),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Inventory API",
    "VERSION": "1.0.0",
    "SWAGGER_UI_SETTINGS": {
        "tryItOutEnabled": True,
        "persistAuthorization": True,
    },
}

# ==============================================================================
# CORS, CSRF, & SESSIONS
# ==============================================================================
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = False

SESSION_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_AGE = 60 * 60

# ==============================================================================
# EMAIL CONFIGURATION
# ==============================================================================
if "test" in sys.argv or env.bool("TESTING", default=False):
    EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

EMAIL_HOST = env("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = env("EMAIL_PORT", default="")
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")

# ==============================================================================
# PASSWORD VALIDATION
# ==============================================================================
_VAL_PATH = "django.contrib.auth.password_validation"

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": f"{_VAL_PATH}.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {"NAME": f"{_VAL_PATH}.CommonPasswordValidator"},
    {"NAME": f"{_VAL_PATH}.NumericPasswordValidator"},
]

# ==============================================================================
# INTERNATIONALIZATION & STATIC FILES
# ==============================================================================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ==============================================================================
# LOGGING
# ==============================================================================
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            # Safely combined strings without breaking layout
            "format": (
                "%(levelname)-8s %(asctime)s [%(threadName)-12.12s] "
                "[%(name)-15.15s] %(message)s"
            ),
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
