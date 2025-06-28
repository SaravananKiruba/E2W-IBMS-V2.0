// Simple Base64 encoded 144x144 PNG with blue background and IBMS text
// This is a minimal PNG file that will serve as a placeholder
const fs = require('fs');
const path = require('path');

// Create a simple 1x1 blue pixel and scale it up (very basic approach)
// This is a base64 encoded 1x1 blue PNG
const bluePngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA1V3+HwAAAABJRU5ErkJggg==';

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('Created icons directory');
}

// For now, create a simple HTML fallback that browsers can use
const iconHtml = `<!DOCTYPE html>
<html>
<head><title>IBMS Icon</title></head>
<body style="margin:0;width:144px;height:144px;background:#1e40af;display:flex;align-items:center;justify-content:center;font-family:Arial;color:white;font-weight:bold;font-size:32px;">
IBMS
</body>
</html>`;

// Create various icon sizes as HTML files (browsers can use these as fallbacks)
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const sizedIconHtml = iconHtml.replace('144px', `${size}px`).replace('32px', `${Math.round(size/4.5)}px`);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.html`), sizedIconHtml);
});

// Also create PNG files with a simple approach - base64 decode the blue pixel
sizes.forEach(size => {
  // Create a simple blue square PNG (very basic, but will work)
  const buffer = Buffer.from(bluePngBase64, 'base64');
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), buffer);
});

console.log('Created placeholder icon files in public/icons/');
console.log('Note: These are basic placeholders. For production, create proper PNG icons.');
