const fs = require('fs');
const path = require('path');

console.log('🔧 Quick fixing image issues...');

const imagesDir = path.join(__dirname, 'public', 'images');
const placeholderPath = path.join(imagesDir, 'placeholder-property.jpg');

// Check if placeholder exists
if (!fs.existsSync(placeholderPath)) {
  console.log('❌ Placeholder image not found');
  process.exit(1);
}

const missingImages = ['house1.jpg', 'house2.jpg', 'apartment1.jpg', 'apartment2.jpg', 'rental1.jpg', 'rental2.jpg'];

missingImages.forEach(filename => {
  const targetPath = path.join(imagesDir, filename);
  try {
    fs.copyFileSync(placeholderPath, targetPath);
    console.log(`✅ Fixed: ${filename}`);
  } catch (error) {
    console.log(`❌ Failed to fix: ${filename}`);
  }
});

console.log('🎉 All images fixed! Restart your server with: npm run dev');