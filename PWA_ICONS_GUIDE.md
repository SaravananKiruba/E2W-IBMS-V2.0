# PWA Icons Setup Guide

## Required Icons for IBMS PWA

The IBMS application requires the following PWA icons to be placed in the `public/icons/` directory:

### Icon Sizes Required:
- `icon-72x72.png` (72x72 pixels)
- `icon-96x96.png` (96x96 pixels)
- `icon-128x128.png` (128x128 pixels)
- `icon-144x144.png` (144x144 pixels)
- `icon-152x152.png` (152x152 pixels)
- `icon-192x192.png` (192x192 pixels)
- `icon-384x384.png` (384x384 pixels)
- `icon-512x512.png` (512x512 pixels)

### Design Guidelines:
1. **Base Design**: Use the IBMS logo or a simplified version
2. **Colors**: Primary blue (#0ea5e9) on white background
3. **Style**: Modern, clean, professional appearance
4. **Maskable Icons**: Ensure icons work with adaptive/maskable requirements
5. **Safe Zone**: Keep important elements within the central 80% of the icon

### Creating Icons:
1. **Design Software**: Use tools like Figma, Adobe Illustrator, or Canva
2. **Online Tools**: Use PWA Icon Generator tools like:
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/
   - https://favicon.io/

### Generation Steps:
1. Create a master icon at 512x512 pixels
2. Use an icon generator to create all required sizes
3. Ensure all icons are PNG format
4. Test with different backgrounds (light/dark)
5. Verify maskable compatibility

### After Adding Icons:
1. Test PWA installation on mobile devices
2. Verify icons appear correctly on home screen
3. Check that splash screen uses correct theme colors
4. Test offline functionality

### Alternative: Use Default Icon
If custom icons are not immediately available, you can use a simple colored square or geometric shape as a placeholder until proper branding icons are created.

### Favicon
Don't forget to also add a `favicon.ico` file to the `public/` directory for browser tab display.
