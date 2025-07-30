const fs = require('fs');
const path = require('path');

// Create simple SVG placeholder images for the missing files
const missingImages = [
  'house1.jpg',
  'house2.jpg', 
  'apartment1.jpg',
  'apartment2.jpg',
  'rental1.jpg',
  'rental2.jpg'
];

const createPlaceholderSVG = (filename) => {
  const type = filename.includes('house') ? 'Shtëpi' :
               filename.includes('apartment') ? 'Apartament' :
               filename.includes('rental') ? 'Me Qira' : 'Pasuri';
  
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#f8fafc"/>
    <rect x="50" y="50" width="700" height="500" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
    <text x="400" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="#475569">${type}</text>
    <text x="400" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#64748b">Foto Placeholder</text>
    <rect x="320" y="200" width="160" height="120" fill="#3b82f6" opacity="0.1"/>
    <path d="M360 230 L400 210 L440 230 V270 H360 Z" fill="#3b82f6" opacity="0.3"/>
    <rect x="385" y="250" width="30" height="20" fill="#3b82f6" opacity="0.5"/>
  </svg>`;
};

// Create the images in the public/images directory
const imagesDir = path.join(__dirname, 'public', 'images');

missingImages.forEach(filename => {
  const svgContent = createPlaceholderSVG(filename);
  const filePath = path.join(imagesDir, filename);
  
  // Write as SVG content but with .jpg extension (browsers will handle it)
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ Created placeholder: ${filename}`);
});

console.log('🎉 All missing placeholder images created successfully!');
console.log('🔄 Restart your dev server with: npm run dev');