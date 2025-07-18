# Real Estate Website Setup Guide

## Quick Setup

Run these commands in order:

```bash
# 1. Install dependencies
npm install

# 2. Set up database
npm run db:generate
npm run db:push
npm run db:seed

# 3. Start development server
npm run dev
```

## What This Does

1. **npm install**: Installs all dependencies including `react-dropzone`
2. **npm run db:generate**: Generates Prisma client
3. **npm run db:push**: Creates SQLite database with schema
4. **npm run db:seed**: Populates database with sample properties
5. **npm run dev**: Starts the development server

## Verification

After setup, you should be able to:
- ✅ View properties (from database, not mock data)
- ✅ Create new properties
- ✅ Edit existing properties
- ✅ Delete properties
- ✅ Upload images (ImageUploader component works)
- ✅ Submit inquiries

## Database Location

The SQLite database will be created at:
```
real-estate-website/prisma/dev.db
```

## Troubleshooting

### If you get "Module not found: react-dropzone"
```bash
npm install react-dropzone
```

### If database operations fail
```bash
npm run db:reset  # This will reset and reseed the database
```

### If you want to view the database
```bash
npm run db:studio  # Opens Prisma Studio in browser
```

## Environment Variables

The `.env.local` file is already configured for SQLite development:
```
DATABASE_URL="file:./prisma/dev.db"
```

For production, you would change this to PostgreSQL.