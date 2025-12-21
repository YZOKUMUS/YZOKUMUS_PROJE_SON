# Hasene Arapça Dersi - Otomatik Yedekleme Scripti
# PowerShell script - Kritik dosyaları yedekler

$backupDir = "$env:USERPROFILE\Desktop\HASENE_BACKUP_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
$projectDir = $PSScriptRoot

Write-Host "🔄 Yedekleme başlatılıyor..." -ForegroundColor Cyan

# Yedekleme klasörü oluştur
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Kritik dosyalar ve klasörler
$criticalItems = @(
    "index.html",
    "style.css",
    "manifest.json",
    "sw.js",
    "firestore.rules",
    "README.md",
    "LICENSE",
    "js",
    "data",
    "ASSETS"
)

Write-Host "📁 Kritik dosyalar kopyalanıyor..." -ForegroundColor Yellow

foreach ($item in $criticalItems) {
    $sourcePath = Join-Path $projectDir $item
    $destPath = Join-Path $backupDir $item
    
    if (Test-Path $sourcePath) {
        if (Test-Path $sourcePath -PathType Container) {
            # Klasör kopyala
            Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
            Write-Host "  ✅ $item (klasör)" -ForegroundColor Green
        } else {
            # Dosya kopyala
            Copy-Item -Path $sourcePath -Destination $destPath -Force
            Write-Host "  ✅ $item" -ForegroundColor Green
        }
    } else {
        Write-Host "  ⚠️  $item bulunamadı" -ForegroundColor Yellow
    }
}

# Git durumu bilgisi
$gitInfo = "$backupDir\GIT_INFO.txt"
$gitStatus = git log --oneline -1 2>&1
$gitBranch = git branch --show-current 2>&1
$gitRemote = git remote -v 2>&1

@"
Hasene Arapça Dersi - Yedekleme Bilgileri
==========================================
Yedekleme Tarihi: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Proje Dizini: $projectDir
Yedek Dizini: $backupDir

Git Durumu:
-----------
Branch: $gitBranch
Son Commit: $gitStatus
Remote: $gitRemote

Kritik Dosyalar:
----------------
$(($criticalItems | ForEach-Object { "  - $_" }) -join "`n")
"@ | Out-File -FilePath $gitInfo -Encoding UTF8

Write-Host "`n✅ Yedekleme tamamlandı!" -ForegroundColor Green
Write-Host "📂 Yedek konumu: $backupDir" -ForegroundColor Cyan
Write-Host "`n💡 Bu yedeği güvenli bir yere kopyalayın (USB, Cloud, vb.)" -ForegroundColor Yellow

