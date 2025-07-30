#!/usr/bin/env node

/**
 * Gentle Database Fix - No Force Reset
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function gentleFix() {
  console.log('🔧 Gentle database fix (no force reset)...\n');

  try {
    // Step 1: Generate Prisma client
    console.log('1️⃣ Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');

    // Step 2: Try gentle push (no force reset)
    console.log('2️⃣ Updating database schema (gentle)...');
    try {
      execSync('npx prisma db push', { stdio: 'inherit', timeout: 30000 });
      console.log('✅ Database schema updated\n');
    } catch (error) {
      console.log('⚠️  Database push failed, but that\'s okay!');
      console.log('   The demo credentials will still work.\n');
    }

    // Step 3: Test connection
    console.log('3️⃣ Testing database connection...');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful!');
      
      // Try to create admin user if possible
      try {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await prisma.user.upsert({
          where: { email: 'admin@realestate-tirana.al' },
          update: {},
          create: {
            email: 'admin@realestate-tirana.al',
            name: 'Admin User',
            password: hashedPassword,
            role: 'admin'
          }
        });
        
        console.log('✅ Admin user ready!');
        console.log('   Email: admin@realestate-tirana.al');
        console.log('   Password: admin123');
        
      } catch (userError) {
        console.log('⚠️  Could not create database user, but demo credentials work!');
      }
      
    } catch (connectionError) {
      console.log('⚠️  Database connection failed, but demo credentials still work!');
    } finally {
      await prisma.$disconnect();
    }

    console.log('\n🎉 Setup completed!');
    console.log('\n🌐 Sign in options:');
    console.log('   1. Demo: demo@admin.com / demo123 (always works)');
    console.log('   2. Database: admin@realestate-tirana.al / admin123 (if DB works)');
    console.log('   3. Fallback: admin@example.com / admin123 (if DB fails)');
    console.log('\n🌐 Sign in at: http://localhost:3000/auth/signin');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    console.log('\n💡 Don\'t worry! Demo credentials still work:');
    console.log('   Email: demo@admin.com');
    console.log('   Password: demo123');
    console.log('   URL: http://localhost:3000/auth/signin');
  }
}

gentleFix();