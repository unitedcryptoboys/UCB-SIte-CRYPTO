#!/usr/bin/env node
/**
 * Build script для объединения JS чанков в один bundle
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const C_DIR = path.join(DIST_DIR, 'c');
const OUTPUT_BUNDLE = path.join(DIST_DIR, 'bundle.min.js');

console.log('🔨 Начало сборки bundle...');

// Считываем viewer.js
const viewerJsPath = path.join(DIST_DIR, 'viewer.js');
if (!fs.existsSync(viewerJsPath)) {
  console.error('❌ viewer.js не найден!');
  process.exit(1);
}

let viewerJsContent = fs.readFileSync(viewerJsPath, 'utf8');

// Считываем все JS файлы из dist/c/
const jsFiles = fs.readdirSync(C_DIR)
  .filter(file => file.endsWith('.js'))
  .map(file => ({
    name: file,
    path: path.join(C_DIR, file),
    content: fs.readFileSync(path.join(C_DIR, file), 'utf8')
  }));

console.log(`📦 Найдено ${jsFiles.length} JS файлов для объединения`);

// Объединяем все файлы
let bundleContent = viewerJsContent + '\n\n';
jsFiles.forEach(file => {
  bundleContent += `\n// ${file.name}\n${file.content}\n`;
});

// Минифицируем (базовая минификация - удаление комментариев и лишних пробелов)
bundleContent = bundleContent
  .replace(/\/\*[\s\S]*?\*\//g, '') // Удаляем многострочные комментарии
  .replace(/\/\/.*$/gm, '') // Удаляем однострочные комментарии
  .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
  .replace(/\s*([{}();,=+\-*/])\s*/g, '$1') // Удаляем пробелы вокруг операторов
  .trim();

fs.writeFileSync(OUTPUT_BUNDLE, bundleContent, 'utf8');

const bundleSize = fs.statSync(OUTPUT_BUNDLE).size;
console.log(`✅ Bundle создан: ${(bundleSize / 1024).toFixed(2)} KB`);
console.log(`📊 Экономия: ${jsFiles.length} файлов → 1 файл`);
