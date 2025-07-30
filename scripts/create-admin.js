#!/usr/bin/env node

/**
 * Create Admin User Script
 * 
 * This script creates an admin user for the real estate website
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🔐 Creating admin user...\n');

  const email = 'admin@realestate-tirana.al';
  const password = 'admin123';
  const name = 'Admin User';

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ Admin user already exists with email:', email);
      console.log('   Use the existing credentials to sign in.');
      return;
    }

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
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n🌐 Sign in at: http://localhost:3000/auth/signin');
    console.log('\n⚠️  Remember to change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 'P2002') {
      console.log('   User with this email already exists.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser();