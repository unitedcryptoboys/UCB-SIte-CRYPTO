# Скрипт для оптимизации изображений в WebP
# Требует установки libwebp (https://developers.google.com/speed/webp/download)

param(
    [string]$Quality = "80",
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Continue"

Write-Host "🖼️  Скрипт оптимизации изображений в WebP" -ForegroundColor Cyan
Write-Host ""

# Проверяем наличие cwebp
$cwebpPath = Get-Command cwebp -ErrorAction SilentlyContinue
if (-not $cwebpPath) {
    Write-Host "❌ Ошибка: cwebp не найден в PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите libwebp:" -ForegroundColor Yellow
    Write-Host "  Windows: Скачайте с https://developers.google.com/speed/webp/download" -ForegroundColor Yellow
    Write-Host "  Или используйте: choco install webp" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Альтернатива: Используйте онлайн-сервисы:" -ForegroundColor Yellow
    Write-Host "  - https://squoosh.app/" -ForegroundColor Yellow
    Write-Host "  - https://tinypng.com/" -ForegroundColor Yellow
    exit 1
}

$imageExtensions = @("*.jpg", "*.jpeg", "*.png")
$basePath = "img"
$convertedCount = 0
$skippedCount = 0
$errorCount = 0

function Convert-ToWebP {
    param(
        [string]$InputFile,
        [string]$Quality,
        [bool]$DryRun
    )
    
    $outputFile = [System.IO.Path]::ChangeExtension($InputFile, ".webp")
    
    # Пропускаем, если WebP уже существует
    if (Test-Path $outputFile) {
        Write-Host "  ⏭️  Пропущено (WebP уже существует): $InputFile" -ForegroundColor Gray
        return "skipped"
    }
    
    if ($DryRun) {
        Write-Host "  🔍 [DRY RUN] Конвертация: $InputFile -> $outputFile" -ForegroundColor Cyan
        return "dryrun"
    }
    
    try {
        $process = Start-Process -FilePath "cwebp" -ArgumentList @(
            "-q", $Quality,
            $InputFile,
            "-o", $outputFile
        ) -Wait -NoNewWindow -PassThru -RedirectStandardError "nul" -RedirectStandardOutput "nul"
        
        if ($process.ExitCode -eq 0) {
            $originalSize = (Get-Item $InputFile).Length
            $newSize = (Get-Item $outputFile).Length
            $savings = [math]::Round((1 - ($newSize / $originalSize)) * 100, 2)
            
            Write-Host "  ✅ Конвертировано: $InputFile" -ForegroundColor Green
            Write-Host "     Размер: $([math]::Round($originalSize/1KB, 2)) KB -> $([math]::Round($newSize/1KB, 2)) KB ($savings% экономии)" -ForegroundColor Gray
            return "success"
        } else {
            Write-Host "  ❌ Ошибка конвертации: $InputFile" -ForegroundColor Red
            return "error"
        }
    } catch {
        Write-Host "  ❌ Исключение при конвертации: $InputFile - $($_.Exception.Message)" -ForegroundColor Red
        return "error"
    }
}

# Поиск всех изображений
Write-Host "🔍 Поиск изображений в $basePath..." -ForegroundColor Cyan

$imageFiles = Get-ChildItem -Path $basePath -Include $imageExtensions -Recurse -File

if ($imageFiles.Count -eq 0) {
    Write-Host "❌ Изображения не найдены" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Найдено изображений: $($imageFiles.Count)" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 РЕЖИМ ПРОВЕРКИ (Dry Run) - изменения не будут сохранены" -ForegroundColor Yellow
    Write-Host ""
}

# Конвертация
foreach ($file in $imageFiles) {
    $result = Convert-ToWebP -InputFile $file.FullName -Quality $Quality -DryRun $DryRun
    
    switch ($result) {
        "success" { $convertedCount++ }
        "skipped" { $skippedCount++ }
        "error" { $errorCount++ }
        "dryrun" { $convertedCount++ }
    }
}

Write-Host ""
Write-Host "📊 Результаты:" -ForegroundColor Cyan
Write-Host "  ✅ Конвертировано: $convertedCount" -ForegroundColor Green
Write-Host "  ⏭️  Пропущено: $skippedCount" -ForegroundColor Yellow
if ($errorCount -gt 0) {
    Write-Host "  ❌ Ошибок: $errorCount" -ForegroundColor Red
}

if (-not $DryRun -and $convertedCount -gt 0) {
    Write-Host ""
    Write-Host "✅ Конвертация завершена!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  ВАЖНО: После конвертации нужно обновить пути к изображениям в коде" -ForegroundColor Yellow
    Write-Host "   Найдите и замените .jpg/.png на .webp в HTML/CSS/JS файлах" -ForegroundColor Yellow
}
