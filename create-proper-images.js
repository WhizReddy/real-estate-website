const fs = require('fs');
const path = require('path');

// Create proper base64 encoded placeholder images
const missingImages = [
  'house1.jpg',
  'house2.jpg', 
  'apartment1.jpg',
  'apartment2.jpg',
  'rental1.jpg',
  'rental2.jpg'
];

// Create a simple base64 encoded SVG that browsers will accept as an image
const createBase64Image = (filename) => {
  const type = filename.includes('house') ? 'Shtëpi' :
               filename.includes('apartment') ? 'Apartament' :
               filename.includes('rental') ? 'Me Qira' : 'Pasuri';
  
  const svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#f1f5f9"/>
    <rect x="20" y="20" width="360" height="260" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
    <text x="200" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#475569">${type}</text>
    <text x="200" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#64748b">Foto Placeholder</text>
    <rect x="160" y="100" width="80" height="60" fill="#3b82f6" opacity="0.2"/>
    <path d="M180 120 L200 110 L220 120 V140 H180 Z" fill="#3b82f6" opacity="0.4"/>
    <rect x="195" y="130" width="10" height="8" fill="#3b82f6" opacity="0.6"/>
  </svg>`;
  
  // Convert SVG to base64 data URL
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

// Create the images in the public/images directory
const imagesDir = path.join(__dirname, 'public', 'images');

missingImages.forEach(filename => {
  const dataUrl = createBase64Image(filename);
  const filePath = path.join(imagesDir, filename);
  
  // Write as data URL - browsers will handle this correctly
  fs.writeFileSync(filePath, dataUrl);
  console.log(`✅ Created proper image: ${filename}`);
});

console.log('🎉 All proper placeholder images created successfully!');
console.log('🔄 Restart your dev server with: npm run dev');