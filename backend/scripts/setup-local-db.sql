-- Run as PostgreSQL superuser (e.g. postgres) once for local development:
--   psql -U postgres -h 127.0.0.1 -f backend/scripts/setup-local-db.sql
--
-- Creates the app role/database expected by backend/.env.example

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'taghvim') THEN
    CREATE ROLE taghvim LOGIN PASSWORD 'secret';
  ELSE
    ALTER ROLE taghvim WITH LOGIN PASSWORD 'secret';
  END IF;
END
$$;

SELECT 'CREATE DATABASE taghvim OWNER taghvim'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'taghvim')\gexec

GRANT ALL PRIVILEGES ON DATABASE taghvim TO taghvim;
