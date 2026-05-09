#!/bin/sh
set -e

echo "→ Running prisma migrate deploy"
npx prisma migrate deploy --schema=./prisma/schema.prisma || true

echo "→ Seeding (idempotent upsert)"
npx tsx prisma/seed.ts || echo "seed skipped"

echo "→ Starting server"
exec "$@"
