#!/bin/sh
set -e

cd /app

mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R application:application storage bootstrap/cache || true

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

php artisan migrate --force || true
php artisan db:seed --force || true
php artisan storage:link || true

php artisan config:cache || true
php artisan route:cache || true
