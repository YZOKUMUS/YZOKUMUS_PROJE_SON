# 404 Error Fix Guide

## Common Causes of 404 Errors

### 1. **Service Worker Cache Issues**
If you recently changed file paths or added new files, the service worker might be serving old cached versions.

**Solution:**
1. Open browser DevTools (F12)
2. Go to Application tab → Service Workers
3. Click "Unregister" for all service workers
4. Go to Application tab → Storage → Clear site data
5. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### 2. **Case Sensitivity Issues**
On Linux servers, file paths are case-sensitive. Windows is case-insensitive, so this might not show up during local development.

**Check:**
- `ASSETS` vs `assets` vs `Assets`
- File names with Turkish characters (ü, ö, ş, ğ, ı, ç)

**Solution:**
- Ensure all paths in code match the exact case of directories/files
- Use `ASSETS` (uppercase) consistently as in your code

### 3. **Missing Files**
Some files might be referenced but not exist.

**Check using the diagnostic tool:**
- Open `check-404-issues.html` in your browser
- Click "Run Full Diagnostic"
- Review the list of failed resources

### 4. **Incorrect Base Path**
If running from a subdirectory, relative paths might be incorrect.

**Solution:**
- Use absolute paths from root: `/ASSETS/...` instead of `ASSETS/...`
- Or use `<base href="/">` tag in HTML head

### 5. **Turkish Character Encoding**
Files with Turkish characters in names (like `üstün-icon.png`) might cause issues on some servers.

**Current file:** `ASSETS/elifba-cover/üstün-icon.png`

**Solution:**
- Consider renaming to `ustun-icon.png` (without special characters)
- Update references in `index.html` and `js/game-core.js`

## Quick Fixes

### Fix 1: Clear Service Worker Cache
```javascript
// Run in browser console:
caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
});
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
});
location.reload();
```

### Fix 2: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red 404 errors
4. Note the exact file path that's failing

### Fix 3: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Filter by "Failed" or look for red entries
5. Check the "Request URL" column for the failing resource

## Files to Verify

### Critical Files (Must Exist):
- ✅ `index.html`
- ✅ `style.css`
- ✅ `manifest.json`
- ✅ `sw.js`
- ✅ All files in `js/` directory
- ✅ `ASSETS/badges/icon-512.png`
- ✅ All `ASSETS/badges/rozet*.png` (1-42)
- ✅ All `ASSETS/game-icons/*.png`
- ✅ All `ASSETS/elifba-cover/*.png`
- ✅ All `data/*.json` files

### Audio Files (185 total):
- Check `ASSETS/audio/` subdirectories:
  - `cezm/` (20 files)
  - `esre/` (28 files)
  - `okuma/` (27 files)
  - `otre/` (28 files)
  - `sedde/` (20 files)
  - `tenvin/` (28 files)
  - `ustun_ses_dosyalari/` (28 files)

## Diagnostic Steps

1. **Run the diagnostic tool:**
   - Open `check-404-issues.html` in your browser
   - Click "Run Full Diagnostic"
   - Review failed resources

2. **Check browser console:**
   - Look for specific 404 error messages
   - Note the exact URL that's failing

3. **Verify file exists:**
   - Check if the file exists in the file system
   - Verify the path matches exactly (case-sensitive)

4. **Check service worker:**
   - Use the "Check Service Worker" button in diagnostic tool
   - Clear cache if needed

## Most Likely Issues

Based on your project structure, the most common 404 errors are:

1. **Service Worker serving old cached files** - Clear cache
2. **Case sensitivity** - Ensure `ASSETS` (uppercase) is used consistently
3. **Turkish character in filename** - `üstün-icon.png` might cause issues
4. **Missing audio files** - Some audio files might not exist
5. **Dynamic badge loading** - Badge images loaded dynamically might fail

## Need More Help?

If you can provide:
1. The exact error message from browser console
2. The URL that's returning 404
3. When the error occurs (on page load, during gameplay, etc.)

I can provide a more specific fix!

