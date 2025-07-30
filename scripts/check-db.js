#!/usr/bin/env node

/**
 * Database Connection Check
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');

  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Check if tables exist
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Users table exists (${userCount} users)`);
    } catch (error) {
      console.log('❌ Users table missing or has issues');
    }

    try {
      const propertyCount = await prisma.property.count();
      console.log(`✅ Properties table exists (${propertyCount} properties)`);
    } catch (error) {
      console.log('❌ Properties table missing or has issues');
      console.log('   Error:', error.message);
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Possible solutions:');
    console.log('   1. Check your DATABASE_URL in .env.local');
    console.log('   2. Make sure your database is running');
    console.log('   3. Check network connectivity');
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();