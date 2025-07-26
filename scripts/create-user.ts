#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function createUser() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('Usage: npx tsx scripts/create-user.ts <email> <name> <role> <password>');
    console.log('Roles: ADMIN, AGENT');
    console.log('Example: npx tsx scripts/create-user.ts john@example.com "John Doe" AGENT mypassword123');
    process.exit(1);
  }

  const [email, name, role, password] = args;

  if (!['ADMIN', 'AGENT'].includes(role.toUpperCase())) {
    console.error('❌ Role must be either ADMIN or AGENT');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      console.error(`❌ User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role: role.toUpperCase() as 'ADMIN' | 'AGENT',
        password: hashedPassword,
      },
    });

    console.log('✅ User created successfully!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🔑 Role: ${user.role}`);
    console.log(`🔒 Password: ${password} (save this securely)`);

  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();