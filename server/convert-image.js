const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'images', 'no-image.svg');
const jpgPath = path.join(__dirname, 'public', 'images', 'no-image.jpg');

sharp(svgPath)
  .jpeg({ quality: 90 })
  .toFile(jpgPath)
  .then(() => {
    console.log('Изображение успешно сконвертировано');
  })
  .catch(err => {
    console.error('Ошибка при конвертации:', err);
  }); 