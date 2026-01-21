(function() {
    // Проверяем, происходит ли навигация внутри SPA (по хэшам #)
    const isPageRefresh = !window.location.hash || performance.navigation.type === 1;
    
    // Если это обновление страницы (F5) - разрешаем анимации
    if (isPageRefresh) {
        window.rmOnLoadAnimationsEnabled = true;
        document.body.classList.remove('rm-animations-disabled');
        console.log('✅ Page refresh detected - animations ENABLED');
        return;
    }
    
    // Если это переход по хэшу (#page2) - отключаем повтор анимаций
    window.rmOnLoadAnimationsEnabled = false;
    document.body.classList.add('rm-animations-disabled');
    
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
    window.addEventListener('hashchange', function() {
        const currentHash = window.location.hash;
        if (!hashHistory.includes(currentHash)) {
            document.body.classList.add('rm-animations-disabled');
        }
        hashHistory.push(currentHash);
    });
})();
