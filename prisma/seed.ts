import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import sampleProperties from '../src/data/sample-properties.json';

// Simple password hashing function
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.inquiry.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@pasuritetiranes.com',
      name: 'Administrator',
      role: 'ADMIN',
      password: adminPassword,
    },
  });

  console.log('👤 Created admin user (email: admin@pasuritetiranes.com, password: admin123)');

  // Create sample agent users
  const agent1Password = await hashPassword('agent123');
  const agent1 = await prisma.user.create({
    data: {
      email: 'agent1@pasuritetiranes.com',
      name: 'Marko Petrovic',
      role: 'AGENT',
      password: agent1Password,
    },
  });

  const agent2Password = await hashPassword('agent123');
  const agent2 = await prisma.user.create({
    data: {
      email: 'agent2@pasuritetiranes.com',
      name: 'Ana Hoxha',
      role: 'AGENT',
      password: agent2Password,
    },
  });

  console.log('👥 Created sample agents:');
  console.log('   - agent1@pasuritetiranes.com (password: agent123) - Marko Petrovic');
  console.log('   - agent2@pasuritetiranes.com (password: agent123) - Ana Hoxha');

  // Seed properties and assign them to agents
  for (let i = 0; i < sampleProperties.length; i++) {
    const property = sampleProperties[i];
    
    // Assign properties to agents in round-robin fashion
    // First property to agent1, second to agent2, third to agent1, etc.
    const assignedAgent = i % 2 === 0 ? agent1 : agent2;
    
    const createdProperty = await prisma.property.create({
      data: {
        title: property.title,
        description: property.description,
        price: property.price,
        street: property.address.street,
        city: property.address.city,
        state: property.address.state,
        zipCode: property.address.zipCode,
        latitude: property.address.coordinates.lat,
        longitude: property.address.coordinates.lng,
        bedrooms: property.details.bedrooms,
        bathrooms: property.details.bathrooms,
        squareFootage: property.details.squareFootage,
        propertyType: property.details.propertyType.toUpperCase() as any,
        yearBuilt: property.details.yearBuilt,
        images: JSON.stringify(property.images),
        features: JSON.stringify(property.features),
        status: property.status.toUpperCase() as string,
        listingType: property.listingType.toUpperCase() as string,
        isPinned: property.isPinned,
        ownerId: assignedAgent.id, // Assign property to agent
      },
    });

    // Create some sample inquiries for each property
    if (property.status === 'active') {
      await prisma.inquiry.create({
        data: {
          name: 'Marko Petrovic',
          email: 'marko@example.com',
          phone: '+355 69 123 4567',
          message: `Jam i interesuar për këtë pasuri: ${property.title}. A mund të më jepni më shumë informacion?`,
          propertyId: createdProperty.id,
          status: 'NEW',
        },
      });
    }
  }

  console.log(`🏠 Created ${sampleProperties.length} properties`);
  console.log('📧 Created sample inquiries');

  const propertyCount = await prisma.property.count();
  const inquiryCount = await prisma.inquiry.count();
  const userCount = await prisma.user.count();

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - ${userCount} users`);
  console.log(`   - ${propertyCount} properties`);
  console.log(`   - ${inquiryCount} inquiries`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });