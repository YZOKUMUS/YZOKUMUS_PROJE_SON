/**
 * Hasene — PWA ana ekrana ekleme
 * Not: Tarayıcı güvenliği nedeniyle kullanıcı onayı olmadan otomatik eklenemez.
 * Android'de tek dokunuş, iPhone'da adım adım rehber gösterilir.
 */

const INSTALL_DISMISS_KEY = 'hasene_install_dismissed_at';
const INSTALL_DISMISS_DAYS = 3;

let deferredInstallPrompt = null;

function isAppInstalled() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }
    if (typeof window.navigator.standalone === 'boolean' && window.navigator.standalone) {
        return true;
    }
    return false;
}

function isMobileDevice() {
    const ua = navigator.userAgent || '';
    if (/Android|iPhone|iPad|iPod/i.test(ua)) {
        return true;
    }
    return navigator.maxTouchPoints > 1 && window.innerWidth < 1024;
}

function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
}

function isAndroid() {
    return /Android/i.test(navigator.userAgent || '');
}

function isInAppBrowser() {
    const ua = navigator.userAgent || '';
    return /FBAN|FBAV|Instagram|Line\/|Twitter|WhatsApp|LinkedInApp|wv\)/i.test(ua);
}

function wasInstallDismissedRecently() {
    try {
        const dismissedAt = localStorage.getItem(INSTALL_DISMISS_KEY);
        if (!dismissedAt) {
            return false;
        }
        const elapsed = Date.now() - Number(dismissedAt);
        return elapsed < INSTALL_DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch (err) {
        return false;
    }
}

function safeCloseModal(modalId) {
    if (typeof closeModal === 'function') {
        closeModal(modalId);
        return;
    }
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function dismissInstallPrompt() {
    try {
        localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
    } catch (err) {
        // ignore
    }
    hideInstallBanner();
    safeCloseModal('pwa-install-modal');
}

function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.classList.add('hidden');
    }
}

function showInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (!banner) {
        return;
    }

    const desc = document.querySelector('.install-banner-desc');
    if (desc) {
        if (isInAppBrowser()) {
            desc.textContent = 'Önce Safari veya Chrome\'da açın, sonra ekleyin';
        } else if (isIOS()) {
            desc.textContent = 'Tek seferlik kurulum — sonra uygulama gibi açılır';
        } else if (deferredInstallPrompt) {
            desc.textContent = 'Tek dokunuşla ana ekrana ekleyin';
        } else {
            desc.textContent = 'Uygulamayı ana ekranınıza ekleyerek daha hızlı erişin';
        }
    }

    banner.classList.remove('hidden');
}

function updateInstallModalContent() {
    const titleEl = document.getElementById('pwa-install-title');
    const stepsEl = document.getElementById('pwa-install-steps');
    const noteEl = document.getElementById('pwa-install-note');
    if (!stepsEl) {
        return;
    }

    if (isInAppBrowser()) {
        if (titleEl) {
            titleEl.textContent = 'Önce tarayıcıda açın';
        }
        stepsEl.innerHTML = isIOS()
            ? `
                <li>Sağ üstteki <strong>⋯</strong> veya <strong>Paylaş</strong> simgesine dokunun</li>
                <li><strong>Safari'de Aç</strong> seçin</li>
                <li>Safari'de alttaki <strong>Paylaş ⬆️</strong> → <strong>Ana Ekrana Ekle</strong></li>
            `
            : `
                <li>Sağ üstteki <strong>⋮</strong> menüsüne dokunun</li>
                <li><strong>Chrome'da aç</strong> veya <strong>Tarayıcıda aç</strong> seçin</li>
                <li>Chrome'da <strong>Ana ekrana ekle</strong> bildirimine dokunun</li>
            `;
        if (noteEl) {
            noteEl.textContent = 'WhatsApp ve Instagram içinden doğrudan eklenemez. Önce Safari/Chrome gerekir.';
        }
        return;
    }

    if (titleEl) {
        titleEl.textContent = isIOS() ? 'iPhone\'a nasıl eklenir?' : 'Ana ekrana nasıl eklenir?';
    }

    if (isIOS()) {
        stepsEl.innerHTML = `
            <li>Alttaki <strong>Paylaş ⬆️</strong> simgesine dokunun</li>
            <li>Aşağı kaydırın → <strong>Ana Ekrana Ekle ➕</strong></li>
            <li>Sağ üstte <strong>Ekle</strong> deyin</li>
        `;
        if (noteEl) {
            noteEl.textContent = 'Safari ile açtıysanız 3 adım yeterli. Uygulama ikonu ana ekranda görünür.';
        }
        return;
    }

    stepsEl.innerHTML = deferredInstallPrompt
        ? `
            <li>Aşağıdaki <strong>Şimdi Ekle</strong> butonuna dokunun</li>
            <li>Çıkan pencerede <strong>Ekle</strong> deyin</li>
            <li>Ana ekranda Hasene ikonu belirir</li>
        `
        : `
            <li>Chrome sağ üstteki <strong>⋮</strong> menüsüne dokunun</li>
            <li><strong>Ana ekrana ekle</strong> veya <strong>Uygulamayı yükle</strong> seçin</li>
            <li><strong>Yükle</strong> / <strong>Ekle</strong> deyin</li>
        `;
    if (noteEl) {
        noteEl.textContent = 'Tek seferlik kurulum. Sonra link aramadan ikondan açarsınız.';
    }
}

function showInstallModal() {
    updateInstallModalContent();

    const primaryBtn = document.getElementById('pwa-install-primary-btn');
    if (primaryBtn) {
        if (isInAppBrowser()) {
            primaryBtn.textContent = 'Anladım';
        } else if (isIOS()) {
            primaryBtn.textContent = 'Anladım, deneyeceğim';
        } else if (deferredInstallPrompt) {
            primaryBtn.textContent = 'Şimdi Ekle';
        } else {
            primaryBtn.textContent = 'Anladım';
        }
    }

    if (typeof openModal === 'function') {
        openModal('pwa-install-modal');
    } else {
        const modal = document.getElementById('pwa-install-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
}

async function triggerInstall() {
    if (isAppInstalled()) {
        if (typeof showToast === 'function') {
            showToast('Uygulama zaten ana ekranda kurulu', 'info', 2500);
        }
        hideInstallBanner();
        return;
    }

    if (isInAppBrowser()) {
        showInstallModal();
        return;
    }

    if (deferredInstallPrompt) {
        try {
            deferredInstallPrompt.prompt();
            const choice = await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            hideInstallBanner();

            if (choice.outcome === 'accepted') {
                if (typeof showToast === 'function') {
                    showToast('Ana ekrana eklendi! İkonu kontrol edin.', 'success', 4000);
                }
            }
        } catch (err) {
            debugWarn('PWA install prompt failed:', err);
            showInstallModal();
        }
        return;
    }

    showInstallModal();
}

function shouldOfferInstall() {
    if (!isMobileDevice() || isAppInstalled() || wasInstallDismissedRecently()) {
        return false;
    }
    return true;
}

function scheduleInstallPrompt(delayMs = 2500) {
    if (!shouldOfferInstall()) {
        return;
    }

    window.setTimeout(() => {
        if (!shouldOfferInstall()) {
            return;
        }

        showInstallBanner();

        if (isIOS() || isInAppBrowser() || !deferredInstallPrompt) {
            window.setTimeout(() => {
                if (shouldOfferInstall()) {
                    showInstallModal();
                }
            }, 800);
        }
    }, delayMs);
}

function initPwaInstall() {
    if (isAppInstalled()) {
        hideInstallBanner();
        return;
    }

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        if (shouldOfferInstall()) {
            showInstallBanner();
        }
    });

    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        hideInstallBanner();
        safeCloseModal('pwa-install-modal');
        if (typeof showToast === 'function') {
            showToast('Hasene ana ekrana eklendi!', 'success', 3500);
        }
    });

    const installBtn = document.getElementById('install-btn');
    const dismissBtn = document.getElementById('install-dismiss');
    const modalPrimaryBtn = document.getElementById('pwa-install-primary-btn');
    const modalDismissBtn = document.getElementById('pwa-install-dismiss-btn');

    if (installBtn) {
        installBtn.addEventListener('click', triggerInstall);
    }
    if (dismissBtn) {
        dismissBtn.addEventListener('click', dismissInstallPrompt);
    }
    if (modalPrimaryBtn) {
        modalPrimaryBtn.addEventListener('click', () => {
            if (!isInAppBrowser() && !isIOS() && deferredInstallPrompt) {
                triggerInstall();
                return;
            }
            safeCloseModal('pwa-install-modal');
        });
    }
    if (modalDismissBtn) {
        modalDismissBtn.addEventListener('click', dismissInstallPrompt);
    }

    try {
        if (localStorage.getItem('hasene_onboarding_complete')) {
            scheduleInstallPrompt(3000);
        }
    } catch (err) {
        scheduleInstallPrompt(3000);
    }
}

if (typeof window !== 'undefined') {
    window.initPwaInstall = initPwaInstall;
    window.scheduleInstallPrompt = scheduleInstallPrompt;
    window.triggerInstall = triggerInstall;
    window.showInstallModal = showInstallModal;
    window.isAppInstalled = isAppInstalled;
}
