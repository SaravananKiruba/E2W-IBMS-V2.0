const sharp = require('sharp');

// Check if sharp is available, if not create a simple text file
try {
  const svg = Buffer.from(`
    <svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
      <rect width="144" height="144" fill="#1e40af" rx="18"/>
      <text x="50%" y="50%" font-family="Arial" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">IBMS</text>
    </svg>
  `);

  sharp(svg)
    .png()
    .toFile('public/icons/icon-144x144.png')
    .then(() => console.log('Icon created successfully'))
    .catch(() => {
      // Fallback: create a simple data URI
      console.log('Sharp not available, creating fallback');
      require('fs').writeFileSync('public/icons/icon-144x144.txt', 'Placeholder for IBMS icon 144x144');
    });
} catch (error) {
  console.log('Creating simple placeholder');
  require('fs').writeFileSync('public/icons/icon-144x144.txt', 'Placeholder for IBMS icon 144x144');
}
