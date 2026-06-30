// window.T is loaded globally from translations.js

const EMAIL = 'hi@zshbleaker.me';
const SCREENSHOT_DIR = 'assets/screenshots/';

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

function shotPaths(name) {
    return {
        light: `${SCREENSHOT_DIR}${name}-light.webp`,
        dark: `${SCREENSHOT_DIR}${name}-dark.webp`,
    };
}

function renderShot(name, alt) {
    const paths = shotPaths(name);
    return `
        <picture>
            <source media="(prefers-color-scheme: dark)" srcset="${paths.dark}">
            <img class="shot-img" src="${paths.light}" alt="${alt || ''}" loading="lazy">
        </picture>
        <div class="shot-missing" aria-hidden="true">
            <span>${paths.light}</span>
            <span>${paths.dark}</span>
        </div>
    `;
}

function hydrateShotFrames() {
    document.querySelectorAll('.shot-frame[data-shot]').forEach(frame => {
        if (!frame.querySelector('picture')) {
            frame.innerHTML = renderShot(
                frame.dataset.shot,
                frame.dataset.shotAlt || frame.dataset.shot || ''
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
    if (t.useCases?.length) {
        return t.useCases;
    }

    return (t.scenarios?.items || []).slice(0, 5).map(item => ({
        label: item.title,
        title: item.title,
        body: item.desc,
    }));
}

function buildProofSections(t) {
    if (t.proofSections?.length) {
        return t.proofSections;
    }

    const shots = ['timeline-iphone', 'photos-result-iphone', 'ipad-workspace', 'audio-waveform-mac'];
    const picks = [0, 1, 3, 6];
    return picks.map((featureIndex, i) => {
        const feature = t.features?.[featureIndex] || t.features?.[i];
        if (!feature) {
            return null;
        }
        return {
            eyebrow: feature.eyebrow,
            title: feature.title,
            body: feature.desc,
            points: feature.points?.slice(0, 3) || [],
            shot: shots[i],
            shotAlt: feature.title,
        };
    }).filter(Boolean);
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

function renderPrivacyTags() {
    // Privacy is now a compact statement rather than a keyword cluster.
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
        if (typeof val !== 'string' && keyAttr === 'hero.purchaseNote') {
            val = t.bottomCta?.subtitle;
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
    renderPrivacyTags();
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
