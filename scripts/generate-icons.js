import sharp from 'sharp';
import { mkdir, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!existsSync(iconDir)) {
  mkdir(iconDir, { recursive: true }, (err) => {
    if (err) throw err;
  });
}

// Base icon (you'll need to provide a high-res source image)
const sourceIcon = join(__dirname, '../src/assets/app-icon.png');

// Generate icons for each size
sizes.forEach(size => {
  sharp(sourceIcon)
    .resize(size, size)
    .toFile(join(iconDir, `icon-${size}x${size}.png`))
    .then(() => console.log(`Generated ${size}x${size} icon`))
    .catch(err => console.error(`Error generating ${size}x${size} icon:`, err));
});
