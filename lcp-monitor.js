/**
 * Скрипт для мониторинга LCP (Largest Contentful Paint)
 * Интегрирует web-vitals для отслеживания LCP метрик
 * 
 * Использование: добавьте в index.html перед закрывающим тегом </body>
 */

(function() {
  'use strict';

  // Загружаем web-vitals библиотеку (можно использовать CDN)
  if (!window.webVitals) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.attribution.js';
    script.async = true;
    document.head.appendChild(script);
  }

  // Функция для отправки метрик в аналитику
  function sendToAnalytics(metric) {
    // Отправка в Google Analytics 4 (пример)
    if (window.gtag) {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
        // Отправка breakdown данных для LCP
        ...(metric.entries && metric.entries[0] ? {
          'lcp_element': metric.entries[0].element ? metric.entries[0].element.tagName : 'unknown',
          'lcp_url': metric.entries[0].url || '',
          'lcp_renderTime': metric.entries[0].renderTime || 0,
          'lcp_loadTime': metric.entries[0].loadTime || 0,
          'lcp_size': metric.entries[0].size || 0
        } : {})
      });
    }

    // Логирование в консоль для отладки
    console.log('[Web Vitals]', metric.name, {
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType
    });

    // Отправка на сервер (если нужно)
    // fetch('/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    //   headers: { 'Content-Type': 'application/json' }
    // });
  }

  // Инициализация после загрузки web-vitals
  function initWebVitals() {
    if (typeof onLCP !== 'undefined') {
      onLCP(sendToAnalytics);
      onFID(sendToAnalytics);
      onCLS(sendToAnalytics);
      onFCP(sendToAnalytics);
      onINP(sendToAnalytics);
    } else {
      // Если web-vitals еще не загружен, ждем
      setTimeout(initWebVitals, 100);
    }
  }

  // Запуск после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebVitals);
  } else {
    initWebVitals();
  }
})();
