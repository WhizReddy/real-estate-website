
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
//   console.log(`Converted ${svgFile} to PNG`);
// });
