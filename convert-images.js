const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'products');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

(async () => {
  for (const file of files) {
    const input = path.join(dir, file);
    const output = path.join(dir, file.replace('.png', '.webp'));
    await sharp(input)
      .resize(600, 600, { fit: 'cover' })
      .webp({ quality: 72 })
      .toFile(output);
    const origSize = (fs.statSync(input).size / 1024).toFixed(0);
    const newSize = (fs.statSync(output).size / 1024).toFixed(0);
    console.log(`${file}: ${origSize}KB -> ${newSize}KB`);
    fs.unlinkSync(input); // remove PNG
  }
  console.log('Done!');
})();
