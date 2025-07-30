#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating build configuration...');

// Check required files
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  '.env.example',
  'public/manifest.json',
  'public/sw.js',
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(process.cwd(), file)));

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:');
  missingFiles.forEach(file => console.error(`  - ${file}`));
  process.exit(1);
}

// Check package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Validate required dependencies
const requiredDeps = [
  'next',
  'react',
  'react-dom',
  '@prisma/client',
  'next-auth',
];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length > 0) {
  console.error('❌ Missing required dependencies:');
  missingDeps.forEach(dep => console.error(`  - ${dep}`));
  process.exit(1);
}

// Check environment variables
const envExample = fs.readFileSync('.env.example', 'utf8');
const requiredEnvVars = envExample
  .split('\n')
  .filter(line => line.includes('=') && !line.startsWith('#'))
  .map(line => line.split('=')[0]);

console.log('📋 Required environment variables:');
requiredEnvVars.forEach(envVar => {
  console.log(`  - ${envVar}`);
});

// Check TypeScript configuration
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (!tsConfig.compilerOptions || !tsConfig.compilerOptions.strict) {
    console.warn('⚠️  TypeScript strict mode is not enabled');
  }
} catch (error) {
  console.error('❌ Invalid tsconfig.json');
  process.exit(1);
}

// Check Next.js configuration
try {
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  if (fs.existsSync(nextConfigPath)) {
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    if (!nextConfigContent.includes('export default')) {
      console.error('❌ next.config.ts must have a default export');
      process.exit(1);
    }
    console.log('✅ next.config.ts found and appears valid');
  } else {
    console.error('❌ next.config.ts not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error reading next.config.ts');
  console.error(error.message);
  process.exit(1);
}

// Check for common issues
const srcDir = path.join(process.cwd(), 'src');
if (!fs.existsSync(srcDir)) {
  console.error('❌ src directory not found');
  process.exit(1);
}

// Check for unused dependencies (basic check)
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
const unusedDeps = [];

// This is a basic check - in a real scenario, you'd use tools like depcheck
Object.keys(allDeps).forEach(dep => {
  // Skip checking certain packages that might not be directly imported
  const skipCheck = [
    '@types/',
    'eslint',
    'prettier',
    'tailwindcss',
    'postcss',
    'autoprefixer',
  ];
  
  if (skipCheck.some(skip => dep.includes(skip))) {
    return;
  }
  
  // Basic file search for dependency usage
  const hasUsage = searchForDependencyUsage(dep, srcDir);
  if (!hasUsage) {
    unusedDeps.push(dep);
  }
});

if (unusedDeps.length > 0) {
  console.warn('⚠️  Potentially unused dependencies:');
  unusedDeps.forEach(dep => console.warn(`  - ${dep}`));
}

// Check bundle size (if .next exists)
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('📦 Checking bundle size...');
  // This would require a more sophisticated analysis
  console.log('✅ Bundle analysis would go here');
}

console.log('✅ Build validation completed successfully!');

function searchForDependencyUsage(dep, dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (searchForDependencyUsage(dep, filePath)) {
          return true;
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(`from '${dep}'`) || content.includes(`require('${dep}')`)) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}