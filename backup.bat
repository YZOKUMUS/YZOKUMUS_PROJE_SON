@echo off
REM Hasene Arapça Dersi - Hızlı Yedekleme (Windows Batch)
echo 🔄 Yedekleme başlatılıyor...

set BACKUP_DIR=%USERPROFILE%\Desktop\HASENE_BACKUP_%date:~-4,4%-%date:~-7,2%-%date:~-10,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

mkdir "%BACKUP_DIR%" 2>nul

echo 📁 Dosyalar kopyalanıyor...
xcopy /E /I /Y "index.html" "%BACKUP_DIR%\"
xcopy /E /I /Y "style.css" "%BACKUP_DIR%\"
xcopy /E /I /Y "manifest.json" "%BACKUP_DIR%\"
xcopy /E /I /Y "sw.js" "%BACKUP_DIR%\"
xcopy /E /I /Y "js" "%BACKUP_DIR%\js\"
xcopy /E /I /Y "data" "%BACKUP_DIR%\data\"
xcopy /E /I /Y "ASSETS" "%BACKUP_DIR%\ASSETS\"

echo.
echo ✅ Yedekleme tamamlandı!
echo 📂 Yedek konumu: %BACKUP_DIR%
pause

