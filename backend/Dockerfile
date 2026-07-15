# Prebuilt PHP+Nginx image — no gcc/extension compile on Coolify VPS
FROM webdevops/php-nginx:8.3-alpine

ENV WEB_DOCUMENT_ROOT=/app/public
ENV WEB_DOCUMENT_INDEX=index.php
ENV PHP_DISPLAY_ERRORS=0
ENV PHP_MEMORY_LIMIT=256M

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .
RUN composer dump-autoload --optimize \
    && mkdir -p \
        storage/app/public \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R application:application storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Run after webdevops php/nginx setup (99-*), never block boot
COPY docker/laravel-init.sh /opt/docker/provision/entrypoint.d/99-laravel.sh
RUN chmod +x /opt/docker/provision/entrypoint.d/99-laravel.sh \
    && apk add --no-cache curl postgresql-client 2>/dev/null || true

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=120s --retries=10 \
  CMD curl -fsS http://127.0.0.1/up || exit 1
