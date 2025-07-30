const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for the PWA
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.1}"/>
  <g transform="translate(${size * 0.15}, ${size * 0.15})">
    <!-- House icon -->
    <path d="M${size * 0.35} ${size * 0.25} L${size * 0.5} ${size * 0.15} L${size * 0.65} ${size * 0.25} L${size * 0.65} ${size * 0.6} L${size * 0.35} ${size * 0.6} Z" 
          fill="white" stroke="white" stroke-width="2"/>
    <!-- Door -->
    <rect x="${size * 0.45}" y="${size * 0.45}" width="${size * 0.1}" height="${size * 0.15}" fill="#2563eb"/>
    <!-- Window -->
    <rect x="${size * 0.4}" y="${size * 0.35}" width="${size * 0.08}" height="${size * 0.08}" fill="#2563eb"/>
    <rect x="${size * 0.52}" y="${size * 0.35}" width="${size * 0.08}" height="${size * 0.08}" fill="#2563eb"/>
  </g>
</svg>
`;

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate SVG icons for each size
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent.trim());
  console.log(`Created ${filename}`);
});

// Create favicon
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), faviconSVG.trim());
console.log('Created favicon.svg');

// Create a simple badge icon
const badgeSVG = `
<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
  <circle cx="36" cy="36" r="36" fill="#2563eb"/>
  <text x="36" y="45" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">RE</text>
</svg>
`;

fs.writeFileSync(path.join(iconsDir, 'badge-72x72.svg'), badgeSVG.trim());
console.log('Created badge-72x72.svg');

// Create action icons for notifications
const createActionIcon = (iconType, size = 96) => {
  const icons = {
    explore: `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#10b981" rx="${size * 0.1}"/>
        <g transform="translate(${size * 0.2}, ${size * 0.2})">
          <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.25}" fill="none" stroke="white" stroke-width="4"/>
          <path d="M${size * 0.5} ${size * 0.5} L${size * 0.6} ${size * 0.6}" stroke="white" stroke-width="4" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    close: `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#ef4444" rx="${size * 0.1}"/>
        <g transform="translate(${size * 0.25}, ${size * 0.25})">
          <path d="M0 0 L${size * 0.5} ${size * 0.5}" stroke="white" stroke-width="4" stroke-linecap="round"/>
          <path d="M${size * 0.5} 0 L0 ${size * 0.5}" stroke="white" stroke-width="4" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    search: `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#8b5cf6" rx="${size * 0.1}"/>
        <g transform="translate(${size * 0.2}, ${size * 0.2})">
          <circle cx="${size * 0.25}" cy="${size * 0.25}" r="${size * 0.2}" fill="none" stroke="white" stroke-width="3"/>
          <path d="M${size * 0.4} ${size * 0.4} L${size * 0.5} ${size * 0.5}" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    map: `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#f59e0b" rx="${size * 0.1}"/>
        <g transform="translate(${size * 0.15}, ${size * 0.15})">
          <path d="M0 ${size * 0.5} L${size * 0.23} ${size * 0.3} L${size * 0.46} ${size * 0.5} L${size * 0.7} ${size * 0.2} L${size * 0.7} ${size * 0.6} L${size * 0.46} ${size * 0.8} L${size * 0.23} ${size * 0.6} L0 ${size * 0.8} Z" 
                fill="white"/>
        </g>
      </svg>
    `,
    heart: `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#ec4899" rx="${size * 0.1}"/>
        <g transform="translate(${size * 0.2}, ${size * 0.25})">
          <path d="M${size * 0.3} ${size * 0.45} C${size * 0.3} ${size * 0.25} ${size * 0.1} ${size * 0.25} ${size * 0.1} ${size * 0.35} C${size * 0.1} ${size * 0.25} ${size * 0.3} ${size * 0.25} ${size * 0.3} ${size * 0.45} C${size * 0.3} ${size * 0.25} ${size * 0.5} ${size * 0.25} ${size * 0.5} ${size * 0.35} C${size * 0.5} ${size * 0.25} ${size * 0.3} ${size * 0.25} ${size * 0.3} ${size * 0.45} Z" 
                fill="white"/>
        </g>
      </svg>
    `
  };
  
  return icons[iconType] || icons.explore;
};

// Create action icons
['explore', 'close', 'search', 'map', 'heart'].forEach(iconType => {
  const svgContent = createActionIcon(iconType);
  const filename = `${iconType}-action.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent.trim());
  console.log(`Created ${filename}`);
});

console.log('\\nPWA icons created successfully!');
console.log('Note: For production, consider converting SVG icons to PNG format for better browser compatibility.');
console.log('You can use tools like sharp or imagemagick to convert SVG to PNG.');

// Create a conversion script suggestion
const conversionScript = `
// To convert SVG to PNG, you can use sharp:
// npm install sharp
// 
// const sharp = require('sharp');
// const fs = require('fs');
// const path = require('path');
// 
// const iconsDir = path.join(__dirname, 'public', 'icons');
// const svgFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));
// 
// svgFiles.forEach(async (svgFile) => {
//   const svgPath = path.join(iconsDir, svgFile);
//   const pngPath = path.join(iconsDir, svgFile.replace('.svg', '.png'));
//   
//   await sharp(svgPath)
//     .png()
//     .toFile(pngPath);
//   
//   console.log(\`Converted \${svgFile} to PNG\`);
// });
`;

fs.writeFileSync(path.join(__dirname, 'convert-icons-to-png.js'), conversionScript);
console.log('Created convert-icons-to-png.js for PNG conversion');