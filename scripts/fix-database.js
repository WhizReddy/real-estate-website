#!/usr/bin/env node

/**
 * Database Fix Script
 * 
 * This script fixes database schema issues and creates a clean admin user
 */

const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDatabase() {
  console.log('🔧 Fixing database issues...\n');

  try {
    // Step 1: Push the latest schema
    console.log('1️⃣ Updating database schema...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    console.log('✅ Database schema updated\n');

    // Step 2: Create admin user
    console.log('2️⃣ Creating admin user...');
    
    const email = 'admin@realestate-tirana.al';
    const password = 'admin123';
    const name = 'Admin User';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the admin user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

    // Step 3: Seed some sample data
    console.log('3️⃣ Adding sample data...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Sample data added\n');

    console.log('🎉 Database fix completed successfully!');
    console.log('\n🌐 You can now sign in at: http://localhost:3000/auth/signin');
    console.log('📋 Use the credentials above or demo@admin.com / demo123');

  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    
    if (error.code === 'P2002') {
      console.log('   Admin user already exists - that\'s okay!');
      console.log('   Use: admin@realestate-tirana.al / admin123');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixDatabase();