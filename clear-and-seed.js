const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function clearAndSeed() {
  try {
    console.log('🧹 Clearing all data...');
    
    // Clear all data in correct order (respecting foreign key constraints)
    await prisma.inquiry.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ All data cleared successfully');
    
    console.log('🌱 Creating fresh sample data...');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@pasuritetiranes.com',
        name: 'Administrator',
        role: 'ADMIN',
        password: adminPassword,
      },
    });
    
    // Create sample agent
    const agentPassword = await bcrypt.hash('agent123', 12);
    const agent = await prisma.user.create({
      data: {
        email: 'agent@pasuritetiranes.com',
        name: 'Marko Petrovic',
        role: 'AGENT',
        password: agentPassword,
      },
    });
    
    console.log('👤 Created users:');
    console.log('   Admin: admin@pasuritetiranes.com / admin123');
    console.log('   Agent: agent@pasuritetiranes.com / agent123');
    
    // Create sample properties
    const sampleProperties = [
      {
        title: 'Apartament Modern në Qendër të Tiranës',
        description: 'Apartament i bukur me 2 dhoma gjumi në zemër të qytetit. Renovuar plotësisht me pajisje moderne.',
        price: 150000,
        street: 'Rruga Durrësit 45',
        city: 'Tiranë',
        state: 'Tiranë',
        zipCode: '1001',
        latitude: 41.3275,
        longitude: 19.8187,
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 85,
        propertyType: 'apartment',
        yearBuilt: 2020,
        images: JSON.stringify(['/images/apartment1.jpg', '/images/apartment2.jpg']),
        features: JSON.stringify(['Parking', 'Ballkon', 'Ngrohje Qendrore', 'Internet']),
        status: 'ACTIVE',
        listingType: 'SALE',
        ownerId: agent.id,
      },
      {
        title: 'Shtëpi Familjare në Durrës',
        description: 'Shtëpi e madhe familjare me oborr të bukur, ideale për familje të mëdha.',
        price: 280000,
        street: 'Rruga Taulantia 123',
        city: 'Durrës',
        state: 'Durrës',
        zipCode: '2001',
        latitude: 41.3236,
        longitude: 19.4436,
        bedrooms: 4,
        bathrooms: 3,
        squareFootage: 180,
        propertyType: 'house',
        yearBuilt: 2018,
        images: JSON.stringify(['/images/house1.jpg', '/images/house2.jpg']),
        features: JSON.stringify(['Oborr', 'Garazh', 'Kuzhinë e Madhe', 'Dhomë Lojërash']),
        status: 'ACTIVE',
        listingType: 'SALE',
        ownerId: agent.id,
      },
      {
        title: 'Apartament me Qira në Bllok',
        description: 'Apartament modern me qira në zonën e Bllokut, i mobiluar plotësisht.',
        price: 800,
        street: 'Rruga Ibrahim Rugova 67',
        city: 'Tiranë',
        state: 'Tiranë',
        zipCode: '1001',
        latitude: 41.3193,
        longitude: 19.8225,
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: 65,
        propertyType: 'apartment',
        yearBuilt: 2019,
        images: JSON.stringify(['/images/rental1.jpg', '/images/rental2.jpg']),
        features: JSON.stringify(['I Mobiluar', 'Klimatizim', 'Ballkon', 'Parking']),
        status: 'ACTIVE',
        listingType: 'RENT',
        ownerId: adminUser.id,
      }
    ];
    
    for (const propertyData of sampleProperties) {
      await prisma.property.create({ data: propertyData });
    }
    
    console.log('🏠 Created 3 sample properties');
    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('🎯 You can now:');
    console.log('   1. Visit http://localhost:3001 to see the properties');
    console.log('   2. Login to admin at http://localhost:3001/admin/login');
    console.log('   3. Use the credentials above to access the system');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAndSeed();