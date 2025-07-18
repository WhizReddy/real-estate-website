import { PrismaClient } from '@prisma/client';
import sampleProperties from '../src/data/sample-properties.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.inquiry.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@pasuritetiranes.com',
      name: 'Administrator',
      role: 'ADMIN',
      password: 'hashed_password_here', // In real app, this would be properly hashed
    },
  });

  console.log('👤 Created admin user');

  // Seed properties
  for (const property of sampleProperties) {
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
        images: property.images,
        features: property.features,
        status: property.status.toUpperCase() as any,
        listingType: property.listingType.toUpperCase() as any,
        isPinned: property.isPinned,
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