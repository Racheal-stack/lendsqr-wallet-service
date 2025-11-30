#!/bin/sh
set -e

echo "🔍 Checking environment variables..."
echo "NODE_ENV: ${NODE_ENV}"
echo "PORT: ${PORT}"
echo "DB_HOST: ${DB_HOST:-not set}"

# Only run migrations if database is configured
if [ -n "${DB_HOST}" ] && [ -n "${DB_USER}" ] && [ -n "${DB_PASSWORD}" ]; then
  echo "⏳ Waiting for database to be ready..."
  max_attempts=30
  attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if node -e "require('mysql2').createConnection({host:'${DB_HOST}',port:${DB_PORT}',user:'${DB_USER}',password:'${DB_PASSWORD}'}).connect(e=>{if(e)process.exit(1);process.exit(0)})" 2>/dev/null; then
      echo "✅ Database is ready!"
      break
    fi
    attempt=$((attempt + 1))
    echo "Database not ready yet... (attempt $attempt/$max_attempts)"
    sleep 2
  done

  if [ $attempt -eq $max_attempts ]; then
    echo "❌ Database connection failed after $max_attempts attempts"
    echo "DB_HOST: ${DB_HOST}"
    echo "DB_PORT: ${DB_PORT}"
    echo "DB_USER: ${DB_USER}"
    exit 1
  fi

  echo "🔄 Running database migrations..."
  npx knex migrate:latest --knexfile dist/database/knexfile.js || {
    echo "⚠️  Migration failed, but continuing..."
  }
else
  echo "⚠️  Database not configured - skipping migrations"
fi

echo "🚀 Starting server..."
exec node dist/index.js
