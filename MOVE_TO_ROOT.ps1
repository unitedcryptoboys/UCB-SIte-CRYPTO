# Скрипт для перемещения файлов в корень репозитория
# Запустите этот скрипт из корня репозитория

Write-Host "=== Перемещение файлов в корень репозитория ===" -ForegroundColor Green
Write-Host ""

$sourcePath = "Readymag - UCB\u1179532223\5339356"
$rootPath = "."

if (-not (Test-Path $sourcePath)) {
    Write-Host "ОШИБКА: Папка '$sourcePath' не найдена!" -ForegroundColor Red
    Write-Host "Убедитесь, что вы запускаете скрипт из корня репозитория." -ForegroundColor Yellow
    exit 1
}

Write-Host "Источник: $sourcePath" -ForegroundColor Cyan
Write-Host "Назначение: корень репозитория" -ForegroundColor Cyan
Write-Host ""

# Проверить, есть ли уже файлы в корне
if (Test-Path "$rootPath\index.html") {
    Write-Host "ВНИМАНИЕ: index.html уже существует в корне!" -ForegroundColor Yellow
    $overwrite = Read-Host "Перезаписать? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Отменено." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Перемещение файлов..." -ForegroundColor Yellow

try {
    # Переместить все файлы и папки
    Get-ChildItem $sourcePath | ForEach-Object {
        $destPath = Join-Path $rootPath $_.Name
        if (Test-Path $destPath) {
            Write-Host "  Пропущено: $($_.Name) (уже существует)" -ForegroundColor Gray
        } else {
            Move-Item $_.FullName -Destination $destPath -Force
            Write-Host "  Перемещено: $($_.Name)" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "=== Готово! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Проверка файлов в корне:" -ForegroundColor Cyan
    $filesToCheck = @("index.html", "404.html", ".nojekyll", "dist", "sw.js")
    foreach ($file in $filesToCheck) {
        if (Test-Path "$rootPath\$file") {
            Write-Host "  ✓ $file" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $file (не найден)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Проверьте файлы в Git: git status" -ForegroundColor White
    Write-Host "2. Добавьте изменения: git add ." -ForegroundColor White
    Write-Host "3. Закоммитьте: git commit -m 'Move files to root for GitHub Pages'" -ForegroundColor White
    Write-Host "4. Запушьте: git push" -ForegroundColor White
    Write-Host ""
    
    # Предложить удалить пустые папки
    Write-Host "Удалить пустые папки 'Readymag - UCB'? (y/n)" -ForegroundColor Yellow
    $delete = Read-Host
    if ($delete -eq "y") {
        Remove-Item "Readymag - UCB" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Пустые папки удалены." -ForegroundColor Green
    }
    
} catch {
    Write-Host ""
    Write-Host "ОШИБКА: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
