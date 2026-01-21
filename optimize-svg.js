#!/usr/bin/env node
/**
 * Скрипт для оптимизации SVG файлов
 * Использует imagemin-svgo для сжатия и очистки SVG
 */

const imagemin = require('imagemin');
const imageminSvgo = require('imagemin-svgo');
const fs = require('fs');
const path = require('path');

const SVG_PATTERNS = [
  'img/**/*.svg',
  'dist/**/*.svg',
  'snippets/**/*.svg',
  '*.svg'
];

async function optimizeSVG() {
  console.log('🎨 Начало оптимизации SVG файлов...\n');

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let optimizedFiles = 0;

  for (const pattern of SVG_PATTERNS) {
    try {
      const files = await imagemin([pattern], {
        destination: path.dirname(pattern) === '.' ? '.' : pattern.split('/')[0],
        plugins: [
          imageminSvgo({
            multipass: true,
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    // Сохраняем viewBox для правильного масштабирования
                    removeViewBox: false,
                    // Сохраняем viewBox если он больше размеров
                    cleanupIds: true,
                    // Удаляем неиспользуемые ID
                    removeUselessDefs: true,
                    // Удаляем неиспользуемые определения
                    removeEmptyAttrs: true,
                    // Удаляем пустые атрибуты
                    collapseGroups: true,
                    // Объединяем группы
                    convertColors: true,
                    // Конвертируем цвета в короткий формат
                    convertPathData: true,
                    // Оптимизируем пути
                    convertTransform: true,
                    // Оптимизируем трансформации
                    mergePaths: true,
                    // Объединяем пути
                    removeComments: true,
                    // Удаляем комментарии
                    removeDesc: true,
                    // Удаляем описания
                    removeMetadata: true,
                    // Удаляем метаданные
                    removeTitle: false,
                    // Сохраняем title для accessibility
                    removeUnknownsAndDefaults: true,
                    // Удаляем неизвестные и значения по умолчанию
                    removeUnusedNS: true,
                    // Удаляем неиспользуемые пространства имен
                    sortAttrs: true,
                    // Сортируем атрибуты
                    removeHiddenElems: true,
                    // Удаляем скрытые элементы
                    removeEmptyContainers: true,
                    // Удаляем пустые контейнеры
                    cleanupNumericValues: {
                      floatPrecision: 2
                    },
                    // Округляем числа
                    minifyStyles: true,
                    // Минифицируем стили
                  }
                }
              }
            ]
          })
        ]
      });

      for (const file of files) {
        const originalPath = file.sourcePath;
        const optimizedPath = file.destinationPath;

        if (fs.existsSync(originalPath) && fs.existsSync(optimizedPath)) {
          const originalSize = fs.statSync(originalPath).size;
          const optimizedSize = fs.statSync(optimizedPath).size;
          const saved = originalSize - optimizedSize;
          const percent = ((saved / originalSize) * 100).toFixed(1);

          totalOriginalSize += originalSize;
          totalOptimizedSize += optimizedSize;
          optimizedFiles++;

          console.log(`✓ ${path.relative(process.cwd(), originalPath)}`);
          console.log(`  ${originalSize} → ${optimizedSize} bytes (${percent}% экономия)`);

          // Заменяем оригинальный файл оптимизированным
          fs.copyFileSync(optimizedPath, originalPath);
        }
      }
    } catch (error) {
      // Игнорируем ошибки если файлы не найдены
      if (!error.message.includes('No files')) {
        console.warn(`⚠ Предупреждение для ${pattern}: ${error.message}`);
      }
    }
  }

  console.log('\n📊 Итоги:');
  console.log(`  Оптимизировано файлов: ${optimizedFiles}`);
  console.log(`  Общий размер ДО: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
  console.log(`  Общий размер ПОСЛЕ: ${(totalOptimizedSize / 1024).toFixed(2)} KB`);
  console.log(`  Экономия: ${((totalOriginalSize - totalOptimizedSize) / 1024).toFixed(2)} KB (${((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)}%)`);
  console.log('\n✅ Оптимизация SVG завершена!');
}

optimizeSVG().catch(error => {
  console.error('❌ Ошибка при оптимизации SVG:', error);
  process.exit(1);
});
