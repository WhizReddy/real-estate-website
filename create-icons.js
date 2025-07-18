// Simple script to create placeholder PNG icons
const fs = require('fs');
const path = require('path');

// Create a simple base64 encoded PNG for each size
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Simple red square PNG (1x1 pixel) in base64
const redPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

sizes.forEach(size => {
  // Create a simple colored square for each size
  const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#dc2626"/>
    <path d="M${size*0.5} ${size*0.125}L${size*0.1875} ${size*0.375}v${size*0.5}h${size*0.625}V${size*0.375}L${size*0.5} ${size*0.125}z" fill="white"/>
    <rect x="${size*0.375}" y="${size*0.625}" width="${size*0.125}" height="${size*0.25}" fill="#dc2626"/>
    <rect x="${size*0.625}" y="${size*0.5}" width="${size*0.125}" height="${size*0.125}" fill="#dc2626"/>
    <rect x="${size*0.25}" y="${size*0.5}" width="${size*0.125}" height="${size*0.125}" fill="#dc2626"/>
  </svg>`;
  
  fs.writeFileSync(path.join(__dirname, 'public', 'icons', `icon-${size}x${size}.svg`), canvas);
});

console.log('Icons created successfully!');