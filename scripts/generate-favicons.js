const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'favicon.png': 32,
  'apple-touch-icon.png': 180
};

async function generateFavicons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'));
  
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '../public', filename));
    
    console.log(`Generated ${filename}`);
  }
}

generateFavicons().catch(console.error); 