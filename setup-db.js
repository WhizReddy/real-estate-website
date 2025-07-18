const { execSync } = require('child_process');

console.log('Setting up database...');

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push database schema
  console.log('Creating database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Seed database with sample data
  console.log('Seeding database...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  
  console.log('✅ Database setup complete!');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
}