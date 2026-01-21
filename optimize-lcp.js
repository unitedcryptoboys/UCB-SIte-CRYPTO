#!/usr/bin/env node
/**
 * Скрипт для автоматической оптимизации LCP (Largest Contentful Paint)
 * Применяет рекомендации из web.dev/articles/optimize-lcp
 */

const fs = require('fs');
const path = require('path');

const INDEX_HTML = 'index.html';

function optimizeLCP() {
  console.log('🚀 Оптимизация LCP (Largest Contentful Paint)...\n');

  let htmlContent = fs.readFileSync(INDEX_HTML, 'utf8');
  let modified = false;

  // 1. Добавить fetchpriority="high" для viewer.css preload
  if (!htmlContent.match(/preload.*viewer\.css.*fetchpriority/)) {
    htmlContent = htmlContent.replace(
      /(<link rel="preload" href="\/UCB-SIte-CRYPTO\/dist\/viewer\.css" as="style"[^>]*>)/,
      '<link rel="preload" href="/UCB-SIte-CRYPTO/dist/viewer.css" as="style" fetchpriority="high"/>'
    );
    console.log('✓ Добавлен fetchpriority="high" для viewer.css preload');
    modified = true;
  }

  // 2. Убедиться, что viewer.js использует type="module" (уже есть)
  if (!htmlContent.includes('viewer.js" type="module"')) {
    htmlContent = htmlContent.replace(
      /(<script src="[^"]*viewer\.js"[^>]*)(?<!type="module")/,
      '$1 type="module"'
    );
    console.log('✓ Убедился, что viewer.js использует type="module"');
    modified = true;
  }

  // 3. Добавить DNS prefetch для внешних ресурсов (если есть)
  const dnsPrefetchDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];

  dnsPrefetchDomains.forEach(domain => {
    const dnsPrefetch = `<link rel="dns-prefetch" href="${domain}"/>`;
    if (!htmlContent.includes(`dns-prefetch" href="${domain}"`)) {
      htmlContent = htmlContent.replace(
        /(<head>)/,
        `$1\n${dnsPrefetch}`
      );
      console.log(`✓ Добавлен DNS prefetch для ${domain}`);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(INDEX_HTML, htmlContent, 'utf8');
    console.log('\n✅ Оптимизация LCP применена!');
  } else {
    console.log('\n✅ Все оптимизации LCP уже применены!');
  }
}

optimizeLCP();
