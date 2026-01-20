import mongoengine
import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR.parent / '.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'replace-this-with-your-own-secret-key')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'rest_framework',
        'corsheaders',
    'core',
]


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
        'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

# CORS Settings
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,https://logi-shift-inky.vercel.app,https://logishift.onrender.com'
).split(',')

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]


ROOT_URLCONF = 'logistics.urls'
WSGI_APPLICATION = 'logistics.wsgi.application'
ASGI_APPLICATION = 'logistics.asgi.application'

# MongoDB Connection
MONGODB_URI = os.getenv('MONGODB_URI')
MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'logistics_db')

mongoengine.connect(
    db=MONGODB_DB_NAME,
    host=MONGODB_URI
)

# Django REST Framework + JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'core.authentication.MongoJWTAuthentication',
    )
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME', '3600'))),
    'REFRESH_TOKEN_LIFETIME': timedelta(seconds=int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME', '604800'))),
}

STATIC_URL = 'static/'

# OpenRouteService API Configuration (primary for distance/geocoding)
OPENROUTE_API_KEY = os.getenv('OPENROUTE_API_KEY', '')

# Google Maps API Configuration (optional fallback)
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '')

# Pricing Configuration
PRICE_BASE_RATE = float(os.getenv('PRICE_BASE_RATE', '50'))
PRICE_PER_KM_RATE = float(os.getenv('PRICE_PER_KM_RATE', '5'))
PRICE_PER_KG_RATE = float(os.getenv('PRICE_PER_KG_RATE', '10'))

# Package Type Surcharges
PACKAGE_SURCHARGES = {
    'Small': 0,
    'Medium': 20,
    'Large': 50,
    'Fragile': 70,
    'Electronics': 100,
}

# Channels (WebSocket) - in-memory layer for development
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'prathamdowork@gmail.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'xrvx ifxb weco tfva')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'LogiShift <prathamdowork@gmail.com>')
EMAIL_SUBJECT_PREFIX = '[LogiShift] '

# Frontend URL Configuration
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://logi-shift-inky.vercel.app')
