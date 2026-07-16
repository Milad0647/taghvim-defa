#!/bin/sh
set -e

cd /var/www/html

mkdir -p storage/app/public storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true

if [ ! -f .env ]; then
  if [ -f .env.docker ]; then
    cp .env.docker .env
  elif [ -f .env.example ]; then
    cp .env.example .env
  fi
fi

php artisan config:clear || true
php artisan route:clear || true

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
  php artisan key:generate --force || true
fi

php artisan migrate --force
php artisan db:seed --force || true
php artisan app:ensure-admin --username=admin --password='Admin@12345' || true
php artisan app:seed-conflict-media || true
php artisan storage:link || true

php artisan config:cache || true
php artisan route:cache || true

exec "$@"
