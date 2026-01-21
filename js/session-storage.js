(function() {
    // Функция для безопасного доступа к document.body
    function updateBodyClass(className, remove) {
        if (document.body) {
            if (remove) {
                document.body.classList.remove(className);
            } else {
                document.body.classList.add(className);
            }
        } else {
            // Если body еще не доступен, ждем DOMContentLoaded
            document.addEventListener('DOMContentLoaded', function() {
                if (remove) {
                    document.body.classList.remove(className);
                } else {
                    document.body.classList.add(className);
                }
            });
        }
    }
    
    // Проверяем, происходит ли навигация внутри SPA (по хэшам #)
    // Используем современный API вместо устаревшего performance.navigation.type
    const isPageRefresh = !window.location.hash || 
        (performance.getEntriesByType && 
         performance.getEntriesByType('navigation')[0]?.type === 'reload') ||
        (performance.navigationType === 1);
    
    // Если это обновление страницы (F5) - разрешаем анимации
    if (isPageRefresh) {
        window.rmOnLoadAnimationsEnabled = true;
        updateBodyClass('rm-animations-disabled', true);
        console.log('✅ Page refresh detected - animations ENABLED');
        return;
    }
    
    // Если это переход по хэшу (#page2) - отключаем повтор анимаций
    window.rmOnLoadAnimationsEnabled = false;
    updateBodyClass('rm-animations-disabled', false);
    
    // Сбрасываем состояние анимаций для уже показанных элементов
    document.addEventListener('DOMContentLoaded', function() {
        const animatedElements = document.querySelectorAll('[data-rm-animation], .rm-animation, [class*="rm-"]');
        animatedElements.forEach(el => {
            el.classList.remove('rm-animate-on-load', 'rm-playing');
            el.style.animationPlayState = 'paused';
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    });
    
    // Блокируем анимации при смене хэша
    let hashHistory = [window.location.hash];
    const MAX_HISTORY_SIZE = 50; // Ограничение для предотвращения утечки памяти
    window.addEventListener('hashchange', function() {
        const currentHash = window.location.hash;
        if (!hashHistory.includes(currentHash)) {
            updateBodyClass('rm-animations-disabled', false);
        }
        hashHistory.push(currentHash);
        // Ограничиваем размер массива для предотвращения утечки памяти
        if (hashHistory.length > MAX_HISTORY_SIZE) {
            hashHistory = hashHistory.slice(-MAX_HISTORY_SIZE);
        }
    });
})();
