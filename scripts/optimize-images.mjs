import sharp from 'sharp';
import { stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const IMG_DIR = './public/img';
const QUALITY = 80;
const MAX_WIDTH = 1920;

const IMAGES_TO_CONVERT = [
  'hero.jpg',
  'flota1.jpg',
  'flota2.jpg',
  'flota3.jpg',
  'acopio.jpg',
  'distribuicion.jpg',
  'transporte1.jpg',
  'og-image.jpg'
];

async function getFileSize(filePath) {
  const stats = await stat(filePath);
  return stats.size;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function convertToWebP(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  const resizeOptions = metadata.width > MAX_WIDTH 
    ? { width: MAX_WIDTH, withoutEnlargement: true }
    : {};
  
  await image
    .resize(resizeOptions)
    .webp({ quality: QUALITY })
    .toFile(outputPath);
}

async function main() {
  console.log('Image Optimization Script\n');
  console.log('='.repeat(60));
  
  let totalBefore = 0;
  let totalAfter = 0;
  
  for (const filename of IMAGES_TO_CONVERT) {
    const inputPath = join(IMG_DIR, filename);
    const outputFilename = basename(filename, extname(filename)) + '.webp';
    const outputPath = join(IMG_DIR, outputFilename);
    
    try {
      const beforeSize = await getFileSize(inputPath);
      totalBefore += beforeSize;
      
      await convertToWebP(inputPath, outputPath);
      
      const afterSize = await getFileSize(outputPath);
      totalAfter += afterSize;
      
      const savings = ((1 - afterSize / beforeSize) * 100).toFixed(1);
      
      console.log(`OK ${filename}`);
      console.log(`   ${formatSize(beforeSize)} -> ${formatSize(afterSize)} (${savings}% saved)`);
    } catch (error) {
      console.log(`ERROR ${filename}: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${formatSize(totalBefore)} -> ${formatSize(totalAfter)}`);
  console.log(`Saved: ${formatSize(totalBefore - totalAfter)} (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`);
}

main().catch(console.error);
