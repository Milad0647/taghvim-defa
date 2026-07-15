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

echo "[laravel-init] Running migrations..."
if php artisan migrate --force; then
  echo "[laravel-init] Migrations OK"
else
  echo "[laravel-init] ERROR: migrate failed (exit $?)" >&2
fi

echo "[laravel-init] Seeding (optional)..."
php artisan db:seed --force || echo "[laravel-init] WARNING: seed failed (exit $?)" >&2
php artisan storage:link 2>/dev/null || true

true
