#!/bin/bash
set -e

echo "=== Deploying Rifle Club Backend ==="

cd /home/user/rifleclub-backend

echo "1. Pulling latest code..."
git pull origin main

echo "2. Installing dependencies..."
npm ci --omit=dev

echo "3. Running database migrations..."
npx prisma migrate deploy

echo "4. Generating Prisma client..."
npx prisma generate

echo "5. Building TypeScript..."
npm run build

echo "6. Restarting PM2..."
pm2 restart rifleclub-api --update-env

echo "=== Deploy complete ==="
pm2 status
