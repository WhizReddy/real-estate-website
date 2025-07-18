const fs = require('fs');
const path = require('path');

// Create placeholder images for all referenced property images
const imageFiles = [
  'apartment-1-main.jpg',
  'apartment-1-living.jpg', 
  'apartment-1-kitchen.jpg',
  'apartment-1-bedroom.jpg',
  'house-1-main.jpg',
  'house-1-living.jpg',
  'house-1-kitchen.jpg',
  'house-1-garden.jpg',
  'villa-1-main.jpg',
  'villa-1-living.jpg',
  'villa-1-garden.jpg',
  'villa-1-terrace.jpg',
  'studio-1-main.jpg',
  'studio-1-kitchen.jpg',
  'studio-1-bathroom.jpg',
  'penthouse-1-main.jpg',
  'penthouse-1-living.jpg',
  'penthouse-1-terrace.jpg',
  'penthouse-1-view.jpg'
];

// Simple SVG template for placeholder images
const createPlaceholderSVG = (filename) => {
  const type = filename.includes('apartment') ? 'Apartament' :
               filename.includes('house') ? 'Shtëpi' :
               filename.includes('villa') ? 'Vila' :
               filename.includes('studio') ? 'Studio' :
               filename.includes('penthouse') ? 'Penthouse' : 'Pasuri';
  
  const room = filename.includes('living') ? 'Dhoma e Ndenjjes' :
               filename.includes('kitchen') ? 'Kuzhinë' :
               filename.includes('bedroom') ? 'Dhoma e Gjumit' :
               filename.includes('bathroom') ? 'Banjo' :
               filename.includes('garden') ? 'Kopsht' :
               filename.includes('terrace') ? 'Terrasa' :
               filename.includes('view') ? 'Pamje' : 'Kryesore';

  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#f3f4f6"/>
    <rect x="50" y="50" width="700" height="500" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
    <text x="400" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="#6b7280">${type}</text>
    <text x="400" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af">${room}</text>
    <rect x="300" y="200" width="200" height="150" fill="#dc2626" opacity="0.1"/>
    <path d="M350 225 L400 200 L450 225 V275 H350 Z" fill="#dc2626" opacity="0.3"/>
    <rect x="375" y="250" width="50" height="25" fill="#dc2626" opacity="0.5"/>
  </svg>`;
};

// Create the images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images', 'properties');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create placeholder SVG files (we'll name them as .jpg but they're SVG for simplicity)
imageFiles.forEach(filename => {
  const svgContent = createPlaceholderSVG(filename);
  const svgFilename = filename.replace('.jpg', '.svg');
  fs.writeFileSync(path.join(imagesDir, svgFilename), svgContent);
  console.log(`Created placeholder: ${svgFilename}`);
});

console.log('All placeholder images created successfully!');