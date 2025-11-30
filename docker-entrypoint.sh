#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx knex migrate:latest --knexfile dist/database/knexfile.js

echo "🚀 Starting server..."
exec node dist/index.js
