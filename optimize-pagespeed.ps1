# PowerShell скрипт для оптимизации PageSpeed
# Автоматически исправляет критические проблемы из аудита

$ErrorActionPreference = "Stop"

Write-Host "🚀 PageSpeed Optimization Script" -ForegroundColor Cyan
Write-Host ""

# 1. Оптимизация session-storage.js
Write-Host "1. Оптимизация session-storage.js..." -ForegroundColor Yellow
$sessionStoragePath = "js/session-storage.js"
if (Test-Path $sessionStoragePath) {
    $content = Get-Content $sessionStoragePath -Raw
    # Минификация: удаление комментариев, лишних пробелов
    $minified = $content -replace '(?m)^\s*//.*$', '' `
                        -replace '(?s)/\*.*?\*/', '' `
                        -replace '\s+', ' ' `
                        -replace '\s*([{}();,=+\-*/])\s*', '$1' `
                        -replace ';\s*;+', ';' `
                        -replace '\s*{\s*', '{' `
                        -replace '\s*}\s*', '}' `
                        -replace '\s*\(\s*', '(' `
                        -replace '\s*\)\s*', ')'
    
    $minifiedPath = "js/session-storage.min.js"
    [System.IO.File]::WriteAllText($minifiedPath, $minified.Trim(), [System.Text.Encoding]::UTF8)
    
    $originalSize = (Get-Item $sessionStoragePath).Length
    $minifiedSize = (Get-Item $minifiedPath).Length
    $saved = $originalSize - $minifiedSize
    
    Write-Host "   ✓ Минифицирован: $originalSize → $minifiedSize bytes (экономия: $saved bytes)" -ForegroundColor Green
} else {
    Write-Host "   ⚠ session-storage.js не найден" -ForegroundColor Yellow
}

# 2. Добавление preload для критических ресурсов в index.html
Write-Host ""
Write-Host "2. Добавление preload/prefetch..." -ForegroundColor Yellow

$indexPath = "index.html"
$htmlContent = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)

# Проверяем, есть ли уже preload для viewer.css
if ($htmlContent -notmatch 'rel="preload".*viewer\.css') {
    # Добавляем preload после dns-prefetch
    $preloadCSS = '<link rel="preload" href="/UCB-SIte-CRYPTO/dist/viewer.css" as="style"/>'
    $htmlContent = $htmlContent -replace '(</head>)', "$preloadCSS`n`$1"
    Write-Host "   ✓ Добавлен preload для viewer.css" -ForegroundColor Green
}

# Проверяем, есть ли preload для viewer.js
if ($htmlContent -notmatch 'rel="preload".*viewer\.js') {
    $preloadJS = '<link rel="preload" href="/UCB-SIte-CRYPTO/dist/viewer.js" as="script" crossorigin/>'
    $htmlContent = $htmlContent -replace '(</head>)', "$preloadJS`n`$1"
    Write-Host "   ✓ Добавлен preload для viewer.js" -ForegroundColor Green
}

# Обновляем session-storage.js на минифицированную версию
if (Test-Path "js/session-storage.min.js") {
    $htmlContent = $htmlContent -replace 'js/session-storage\.js', 'js/session-storage.min.js'
    Write-Host "   ✓ Обновлен путь к session-storage.min.js" -ForegroundColor Green
}

[System.IO.File]::WriteAllText($indexPath, $htmlContent, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "✅ Оптимизация завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. npm install (если еще не установлено)" -ForegroundColor White
Write-Host "2. npm run build" -ForegroundColor White
Write-Host "3. git add . && git commit -m 'PageSpeed optimization' && git push" -ForegroundColor White
