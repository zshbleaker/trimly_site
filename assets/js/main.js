// window.T is loaded globally from translations.js

const EMAIL = 'hi@zshbleaker.me';
const SCREENSHOT_DIR = 'assets/screenshots/';
const SHOT_WIDTHS = [960, 1440, 2160];
const SHOT_META = {
    'hero-editor-light': { width: 2880, height: 1800 },
    'hero-editor-dark': { width: 2880, height: 1800 },
    'source-file-clips': { width: 6000, height: 4500 },
    'photos-metadata-export': { width: 2732, height: 2048 },
    'cross-device-editing': { width: 6000, height: 4500 },
    'device-workspaces': { width: 2880, height: 1800 },
    'pro-media-pipeline': { width: 2880, height: 1800 },
};

let currentLang = 'en';
let animObserver = null;

function detectLanguage() {
    if (window.__TRIMLY_INITIAL_LANG__) {
        return window.__TRIMLY_INITIAL_LANG__;
    }
    if (typeof window.trimlyDetectLanguage === 'function') {
        return window.trimlyDetectLanguage();
    }
    return 'en';
}

function themedShotPaths(name) {
    return {
        light: `${SCREENSHOT_DIR}${name}-light.webp`,
        dark: `${SCREENSHOT_DIR}${name}-dark.webp`,
    };
}

function shotPath(name) {
    return `${SCREENSHOT_DIR}${name}.webp`;
}

function shotSrcset(name) {
    const meta = SHOT_META[name];
    const responsive = SHOT_WIDTHS
        .filter(width => !meta || width < meta.width)
        .map(width => `${SCREENSHOT_DIR}${name}-${width}w.webp ${width}w`);
    const originalWidth = meta?.width || 2880;
    return [...responsive, `${shotPath(name)} ${originalWidth}w`].join(', ');
}

function shotDimensions(name) {
    const meta = SHOT_META[name] || { width: 2880, height: 1800 };
    return `width="${meta.width}" height="${meta.height}"`;
}

function escapeAttr(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[char]);
}

function renderShot(name, alt, themeMode = 'single', options = {}) {
    const loading = options.loading || 'lazy';
    const fetchPriority = options.fetchPriority || (loading === 'eager' ? 'high' : 'auto');
    const sizes = options.sizes || '(min-width: 900px) 58vw, calc(100vw - 48px)';
    const escapedAlt = escapeAttr(alt);

    if (themeMode === 'adaptive') {
        const paths = themedShotPaths(name);
        const lightName = `${name}-light`;
        const darkName = `${name}-dark`;
        return `
            <picture>
                <source media="(prefers-color-scheme: dark)" srcset="${shotSrcset(darkName)}" sizes="${sizes}">
                <img class="shot-img" src="${SCREENSHOT_DIR}${lightName}-1440w.webp" srcset="${shotSrcset(lightName)}" sizes="${sizes}" ${shotDimensions(lightName)} alt="${escapedAlt}" loading="${loading}" fetchpriority="${fetchPriority}" decoding="async">
            </picture>
            <div class="shot-missing" aria-hidden="true">
                <span>${paths.light}</span>
                <span>${paths.dark}</span>
            </div>
        `;
    }

    const path = shotPath(name);
    return `
        <img class="shot-img" src="${SCREENSHOT_DIR}${name}-1440w.webp" srcset="${shotSrcset(name)}" sizes="${sizes}" ${shotDimensions(name)} alt="${escapedAlt}" loading="${loading}" fetchpriority="${fetchPriority}" decoding="async">
        <div class="shot-missing" aria-hidden="true">
            <span>${path}</span>
        </div>
    `;
}

function hydrateShotFrames() {
    document.querySelectorAll('.shot-frame[data-shot]').forEach(frame => {
        if (!frame.querySelector('.shot-img')) {
            const isHero = frame.classList.contains('hero-shot');
            frame.innerHTML = renderShot(
                frame.dataset.shot,
                frame.dataset.shotAlt || frame.dataset.shot || '',
                frame.dataset.shotTheme || 'single',
                {
                    loading: isHero ? 'eager' : 'lazy',
                    fetchPriority: isHero ? 'high' : 'auto',
                    sizes: isHero
                        ? '(min-width: 980px) 58vw, calc(100vw - 56px)'
                        : '(min-width: 900px) 58vw, calc(100vw - 48px)',
                }
            );
        }

        const img = frame.querySelector('img');
        if (!img || img.dataset.shotBound === 'true') {
            return;
        }

        img.dataset.shotBound = 'true';
        img.addEventListener('load', () => {
            frame.classList.remove('is-missing');
            frame.classList.add('has-shot');
        });
        img.addEventListener('error', () => {
            frame.classList.add('is-missing');
            frame.classList.remove('has-shot');
        });

        if (img.complete && img.naturalWidth > 0) {
            frame.classList.add('has-shot');
        }
    });
}

function getTranslation() {
    const T = window.T || {};
    return T[currentLang] || T.en || {};
}

function buildUseCases(t) {
    return t.useCases || [];
}

function buildProofSections(t) {
    return t.proofSections || [];
}

function renderUseCases() {
    const el = document.getElementById('useCaseGrid');
    if (!el) {
        return;
    }

    const cases = buildUseCases(getTranslation());
    el.innerHTML = cases.map((item, index) => `
        <article class="use-case-row fade-in" style="animation-delay:${(index * 0.05).toFixed(2)}s">
            <span class="case-index">${String(index + 1).padStart(2, '0')}</span>
            <div class="case-copy">
                <h3>${item.title}</h3>
                <p>${item.body}</p>
            </div>
        </article>
    `).join('');
}

function renderProofs() {
    const el = document.getElementById('features');
    if (!el) {
        return;
    }

    const sections = buildProofSections(getTranslation());
    el.innerHTML = sections.map((sec, index) => {
        const points = (sec.points || []).map(point => `<span>${point}</span>`).join('');
        const reverse = index % 2 === 1 ? ' reverse' : '';
        const shot = sec.shot || 'timeline-iphone';
        return `
            <article class="proof-block${reverse} fade-in">
                <div class="proof-shot-wrap liquid-glass">
                    <div class="shot-frame proof-shot" data-shot="${shot}" data-shot-alt="${sec.shotAlt || sec.title}"></div>
                </div>
                <div class="proof-copy">
                    <p class="proof-number">${String(index + 1).padStart(2, '0')}</p>
                    <h2>${sec.title}</h2>
                    <p>${sec.body}</p>
                    ${points ? `<div class="proof-lines">${points}</div>` : ''}
                </div>
            </article>
        `;
    }).join('');

    hydrateShotFrames();
}

function renderSections() {
    const el = document.getElementById('sections');
    const contactEl = document.getElementById('contact');
    if (!el) {
        return;
    }

    const t = getTranslation();
    el.innerHTML = (t.legal?.sections || []).map(s =>
        `<div class="legal-section"><h2>${s.h}</h2><p>${s.p}</p></div>`
    ).join('');

    if (contactEl && t.legal) {
        contactEl.innerHTML = `${t.legal.contactLabel} <a href="mailto:${EMAIL}">${EMAIL}</a>.`;
    }
}

function applyStaticTranslations() {
    const t = getTranslation();
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const keyAttr = el.getAttribute('data-i18n');
        const path = keyAttr.split('.');
        let val = t;
        for (const k of path) {
            val = val?.[k];
        }
        if (typeof val !== 'string') {
            return;
        }

        if (el.tagName === 'H1' || el.tagName === 'H2') {
            el.innerHTML = val.replace(/\n/g, '<br>');
        } else {
            el.textContent = val;
        }
    });

    const isIndex = document.getElementById('features') !== null;
    if (isIndex && t.indexTitle) {
        document.title = t.indexTitle;
    } else if (!isIndex && t.privacyTitle) {
        document.title = t.privacyTitle;
    }
}

function setLanguage(lang) {
    currentLang = lang;
    try {
        localStorage.setItem('trimly-lang', lang);
    } catch (e) {}

    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.classList.add('i18n-ready');
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = document.documentElement.dir;

    applyStaticTranslations();
    renderUseCases();
    renderProofs();
    renderSections();
    hydrateShotFrames();

    document.querySelectorAll('trimly-header, trimly-footer').forEach(el => {
        el.setAttribute('lang', lang);
    });

    initAnimations();
}

function applyAppStoreLinks() {
    const url = typeof window.getAppStoreUrl === 'function'
        ? window.getAppStoreUrl()
        : null;
    if (!url) {
        return;
    }
    document.querySelectorAll('.app-store-link').forEach(link => {
        link.href = url;
    });
}

function initAnimations() {
    if (!animObserver) {
        animObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    animObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    }
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => animObserver.observe(el));
}

document.addEventListener('lang-change', e => {
    setLanguage(e.detail.lang);
});

(function boot() {
    applyAppStoreLinks();
    currentLang = detectLanguage();
    setLanguage(currentLang);
})();
