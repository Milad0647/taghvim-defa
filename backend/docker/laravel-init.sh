#!/bin/bash
# Sourced by webdevops entrypoint (includeScriptDir uses `. file`).
# Never use `exit` here — it would kill the whole container boot before supervisord.

cd /app || true

mkdir -p \
  storage/app/public \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache \
  || true

chown -R application:application storage bootstrap/cache 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

if [ ! -f .env ]; then
  if [ -f .env.docker ]; then
    cp .env.docker .env || true
  elif [ -f .env.example ]; then
    cp .env.example .env || true
  fi
fi

php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan migrate --force 2>/dev/null || true
php artisan db:seed --force 2>/dev/null || true
php artisan storage:link 2>/dev/null || true

true
