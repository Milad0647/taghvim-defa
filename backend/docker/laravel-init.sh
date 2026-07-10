#!/bin/sh
# Runs after webdevops php/nginx provisioning. Must never fail the container boot.

cd /app || exit 0

mkdir -p \
  storage/app/public \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

chown -R application:application storage bootstrap/cache 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

if [ ! -f .env ]; then
  if [ -f .env.docker ]; then
    cp .env.docker .env
  elif [ -f .env.example ]; then
    cp .env.example .env
  fi
fi

php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan migrate --force 2>/dev/null || true
php artisan db:seed --force 2>/dev/null || true
php artisan storage:link 2>/dev/null || true

exit 0
