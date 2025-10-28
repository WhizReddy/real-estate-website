#!/bin/bash

# Vercel Production Database Setup Script
# Run this AFTER connecting Postgres in Vercel

echo "🔄 Pulling Vercel environment variables..."
npx vercel env pull .env.production

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database with sample data..."
npx prisma db seed

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard"
echo "2. Navigate to Deployments tab"
echo "3. Click '...' on latest deployment"
echo "4. Click 'Redeploy'"
echo ""
echo "Or run: npx vercel --prod"
