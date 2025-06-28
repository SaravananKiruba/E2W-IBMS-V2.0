const fs = require('fs');
const path = require('path');

// Create a simple SVG icon that can be converted to PNG
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#1e40af" rx="64"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">IBMS</text>
</svg>`;

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Save the SVG file
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgIcon);

console.log('SVG icon created at public/icons/icon.svg');
console.log('You can use an online SVG to PNG converter to create the required PNG files:');
console.log('- icon-72x72.png');
console.log('- icon-96x96.png');
console.log('- icon-128x128.png');
console.log('- icon-144x144.png');
console.log('- icon-152x152.png');
console.log('- icon-192x192.png');
console.log('- icon-384x384.png');
console.log('- icon-512x512.png');
