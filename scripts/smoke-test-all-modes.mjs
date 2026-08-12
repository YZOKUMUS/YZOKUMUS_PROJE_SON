/**
 * Smoke test: all game modes + JSON data files
 * Usage: node scripts/smoke-test-all-modes.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://127.0.0.1:8765';
const WAIT_MS = 3500;

const DATA_FILES = [
  { file: 'kelimebul.json', min: 1000 },
  { file: 'ayetoku.json', min: 1000 },
  { file: 'duaet.json', min: 10 },
  { file: 'hadisoku.json', min: 1000 },
  { file: 'harf.json', min: 20 },
  { file: 'ustn.json', min: 20 },
  { file: 'esre.json', min: 20 },
  { file: 'otre.json', min: 20 },
  { file: 'tenvin.json', min: 20 },
  { file: 'uc_harfli_kelimeler.json', min: 100 },
  { file: 'sedde.json', min: 10 },
  { file: 'cezm.json', min: 10 },
  { file: 'uzatma_med.json', min: 10 }
];

const results = [];

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const mark = ok ? 'OK' : 'FAIL';
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ''}`);
}

async function fetchDataFiles() {
  for (const { file, min } of DATA_FILES) {
    try {
      const res = await fetch(`${BASE}/data/${file}`);
      if (!res.ok) {
        record(`data/${file}`, false, `HTTP ${res.status}`);
        continue;
      }
      const json = await res.json();
      const count = Array.isArray(json)
        ? json.length
        : (json.harfler?.length || json.kelimeler?.length || 0);
      record(`data/${file}`, count >= min, `${count} kayıt`);
    } catch (err) {
      record(`data/${file}`, false, err.message);
    }
  }
}

async function preparePage(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('hasene_onboarding_complete', '1');
    localStorage.setItem('hasene_pwa_install_dismissed', '1');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => typeof preloadAllData === 'function' && typeof startGame === 'function',
    { timeout: 15000 }
  );
  await page.evaluate(async () => {
    if (typeof preloadAllData === 'function') {
      await preloadAllData();
    }
  });
  await page.waitForTimeout(1500);
}

async function errorToast(page) {
  return page.evaluate(() => {
    const toast = document.querySelector('.toast-error');
    return toast?.textContent?.trim() || null;
  });
}

async function screenVisible(page, id) {
  return page.evaluate((screenId) => {
    const el = document.getElementById(screenId);
    return !!(el && !el.classList.contains('hidden'));
  }, id);
}

async function resetToMenu(page) {
  await page.evaluate(() => {
    if (typeof goToMainMenu === 'function') {
      goToMainMenu(true);
    }
  });
  await page.waitForTimeout(400);
}

async function startAndCheck(page, name, runInPage, expectedScreens) {
  await resetToMenu(page);
  await runInPage(page);
  await page.waitForTimeout(WAIT_MS);
  const toast = await errorToast(page);
  const visible = [];
  for (const id of expectedScreens) {
    if (await screenVisible(page, id)) {
      visible.push(id);
    }
  }
  const loadErrors = ['yüklenemedi', 'yuklenemedi', 'Veri yüklenemedi'];
  const badToast = toast && loadErrors.some((k) => toast.toLowerCase().includes(k.toLowerCase()));
  const ok = visible.length > 0 && !badToast;
  record(name, ok, ok ? `ekran: ${visible.join(', ')}` : `toast=${toast || 'yok'}, ekran=${visible.join(',') || 'yok'}`);
}

async function runBrowserTests(page) {
  await startAndCheck(page, 'Kelime Çevir (klasik)', async (p) => {
    await p.evaluate(async () => {
      await startGame('kelime-cevir');
      await startKelimeCevirGame('classic');
    });
  }, ['kelime-cevir-screen']);

  await startAndCheck(page, 'Dinle Bul', async (p) => {
    await p.evaluate(async () => startGame('dinle-bul'));
  }, ['dinle-bul-screen']);

  await startAndCheck(page, 'Boşluk Doldur', async (p) => {
    await p.evaluate(async () => startGame('bosluk-doldur'));
  }, ['bosluk-doldur-screen']);

  await startAndCheck(page, 'Talim Et (Karma)', async (p) => {
    await p.evaluate(async () => startGame('karma'));
  }, ['karma-game-screen']);

  await startAndCheck(page, 'Ayet Oku', async (p) => {
    await p.evaluate(async () => startGame('ayet-oku'));
  }, ['ayet-oku-screen']);

  await startAndCheck(page, 'Dua Et', async (p) => {
    await p.evaluate(async () => startGame('dua-et'));
  }, ['dua-et-screen']);

  await startAndCheck(page, 'Hadis Oku', async (p) => {
    await p.evaluate(async () => startGame('hadis-oku'));
  }, ['hadis-oku-screen']);

  await startAndCheck(page, 'Günlük Okumalar', async (p) => {
    await p.evaluate(async () => startGame('kuran-okuma'));
  }, ['ayet-oku-screen', 'dua-et-screen', 'hadis-oku-screen']);

  await startAndCheck(page, 'Kart Modu', async (p) => {
    await p.evaluate(() => startGame('flashcards'));
  }, ['flashcard-screen']);

  await startAndCheck(page, 'Cüz Yolculuğu', async (p) => {
    await p.evaluate(async () => startGame('juz-yolculugu'));
  }, ['juz-journey-screen']);

  const elifSubmodes = [
    'harekeler',
    'fetha',
    'esre',
    'otre',
    'sedde',
    'cezm',
    'tenvin',
    'uc-harfli-kelimeler',
    'uzatma-med'
  ];

  for (const sub of elifSubmodes) {
    await startAndCheck(page, `Elif Ba: ${sub}`, async (p) => {
      await p.evaluate(async (submode) => {
        await startGame('elif-ba');
        await startElifBaGame(submode);
      }, sub);
    }, ['elif-ba-screen']);
  }

  await resetToMenu(page);
  await page.evaluate(async () => {
    await startGame('elif-ba');
    await showHarfTablosu();
  });
  await page.waitForTimeout(1500);
  const tabloOk = await page.evaluate(() => {
    const toast = document.querySelector('.toast-error');
    const grid = document.getElementById('harf-grid');
    return !toast && grid && grid.children.length > 0;
  });
  record('Elif Ba: Harf Tablosu', tabloOk, tabloOk ? 'harf-grid dolu' : 'tablo boş veya hata');

  await resetToMenu(page);
  const status = await page.evaluate(async () => {
    if (typeof preloadAllData === 'function') {
      await preloadAllData();
    }
    return typeof getDataStatus === 'function' ? getDataStatus() : null;
  });
  if (status) {
    for (const [key, val] of Object.entries(status)) {
      record(`preload:${key}`, val.loaded && val.count > 0, `${val.count} kayıt`);
    }
  }
}

async function main() {
  console.log(`\n=== Hasene smoke test — ${BASE} ===\n`);

  console.log('--- JSON veri dosyaları ---');
  await fetchDataFiles();

  console.log('\n--- Oyun modları (tarayıcı) ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await preparePage(page);
    await runBrowserTests(page);
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log('\n=== Özet ===');
  console.log(`Toplam: ${results.length}, Başarılı: ${results.length - failed.length}, Başarısız: ${failed.length}`);
  if (failed.length) {
    console.log('\nBaşarısız testler:');
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
    process.exit(1);
  }
  console.log('\nTüm testler geçti.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
