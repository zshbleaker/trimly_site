// window.T is loaded globally from translations.js

const EMAIL = 'hi@zshbleaker.me';

const ICONS = {
    import: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'
        + '<polyline points="9 14 12 11 15 14"/>'
        + '<line x1="12" y1="11" x2="12" y2="18"/>'
        + '</svg>',
    export: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'
        + '</svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<circle cx="12" cy="12" r="10"/>'
        + '<polyline points="12 6 12 12 16 14"/>'
        + '</svg>',
    color: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<circle cx="12" cy="12" r="3"/>'
        + '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06'
        + 'a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09'
        + 'a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83'
        + 'l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09'
        + 'a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83'
        + 'l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09'
        + 'a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83'
        + 'l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09'
        + 'a1.65 1.65 0 0 0-1.51 1.08z"/>'
        + '</svg>',
    capture: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4'
        + 'a2 2 0 0 1 2 2z"/>'
        + '<circle cx="12" cy="13" r="4"/>'
        + '</svg>',
    audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<line x1="3" y1="12" x2="3" y2="12"/>'
        + '<path d="M5 10v4M9 6v12M13 8v8M17 4v16M21 10v4"/>'
        + '</svg>',
    keyboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<rect x="2" y="5" width="20" height="14" rx="2"/>'
        + '<path d="M6 9h0M10 9h0M14 9h0M18 9h0M6 13h0M18 13h0M9 13h6"/>'
        + '</svg>',
    ipad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<rect x="4" y="2" width="16" height="20" rx="2"/>'
        + '<line x1="12" y1="18" x2="12" y2="18"/>'
        + '</svg>',
    rtl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<line x1="21" y1="6" x2="3" y2="6"/>'
        + '<line x1="21" y1="12" x2="9" y2="12"/>'
        + '<line x1="21" y1="18" x2="3" y2="18"/>'
        + '<polyline points="6 15 3 12 6 9"/>'
        + '</svg>',
    hdr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<circle cx="12" cy="12" r="5"/>'
        + '<line x1="12" y1="1" x2="12" y2="3"/>'
        + '<line x1="12" y1="21" x2="12" y2="23"/>'
        + '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>'
        + '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>'
        + '<line x1="1" y1="12" x2="3" y2="12"/>'
        + '<line x1="21" y1="12" x2="23" y2="12"/>'
        + '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>'
        + '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
        + '</svg>',
};

const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" '
    + 'stroke-linecap="round" stroke-linejoin="round">'
    + '<polyline points="20 6 9 17 4 12"/>'
    + '</svg>';

const SECTION_META = [
    { key: 'import', accent: 'blue', icon: 'import', visual: '→ Photos · → Files' },
    { key: 'order', accent: 'orange', icon: 'clock', visual: 'Photos timeline' },
    { key: 'capture', accent: 'green', icon: 'capture', visual: 'Frame & Live Photo' },
    { key: 'export', accent: 'purple', icon: 'export', visual: 'Passthrough export' },
    { key: 'hdr', accent: 'cyan', icon: 'hdr', visual: 'Video · Still · Live Photo · HDR' },
    { key: 'lut', accent: 'yellow', icon: 'color', visual: 'Apple Log 2 · DJI · Insta360' },
    { key: 'audio', accent: 'pink', icon: 'audio', visual: 'Waveform timeline' },
    { key: 'keys', accent: 'indigo', icon: 'keyboard', visual: 'Keyboard shortcuts' },
    { key: 'ipad', accent: 'red', icon: 'ipad', visual: 'iPad · resizable windows' },
    { key: 'rtl', accent: 'teal', icon: 'rtl', visual: 'RTL · يمين إلى يسار' },
];

let currentLang = 'en';

function detectLanguage() {
    try {
        const saved = localStorage.getItem('trimly-lang');
        const T = window.T || {};
        if (saved && T[saved]) {
            return saved;
        }
    } catch (e) {}

    const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    if (lang.startsWith('zh')) {
        return 'zh';
    }
    if (lang.startsWith('ja')) {
        return 'ja';
    }
    if (lang.startsWith('ko')) {
        return 'ko';
    }
    if (lang.startsWith('ar')) {
        return 'ar';
    }
    if (lang.startsWith('es')) {
        return 'es';
    }
    return 'en';
}

function renderFeatures() {
    const el = document.getElementById('features');
    if (!el) {
        return;
    }

    const T = window.T || {};
    const t = T[currentLang];
    if (!t) {
        return;
    }
    el.innerHTML = t.features.map((sec, i) => {
        const meta = SECTION_META[i];
        if (!meta) {
            return '';
        }
        const reverse = i % 2 === 1 ? ' reverse' : '';
        const points = sec.points.map(p =>
            `<li><span style="display:inline-flex">${CHECK}</span><span>${p}</span></li>`
        ).join('');

        const accentColor = `accent-${meta.accent}`;

        return `<div class="feature-block${reverse} fade-in">
            <div class="feature-text">
                <span class="feature-eyebrow ${meta.accent}">${ICONS[meta.icon]}${sec.eyebrow}</span>
                <h2>${sec.title}</h2>
                <p>${sec.desc}</p>
                <ul class="feature-points ${meta.accent}">${points}</ul>
            </div>
            <div class="feature-visual ${meta.accent}">
                <div class="fv-window">
                    <div class="fv-bar"><span></span><span></span><span></span></div>
                    <div class="fv-body">
                        <div class="fv-badge ${meta.accent}" style="color:var(--${accentColor})">
                            ${ICONS[meta.icon]}
                        </div>
                        <div class="fv-lines"><i></i><i></i></div>
                    </div>
                </div>
                <span class="vlabel">${meta.visual}</span>
            </div>
        </div>`;
    }).join('');
}

function renderSections() {
    const el = document.getElementById('sections');
    const contactEl = document.getElementById('contact');
    if (!el) {
        return;
    }

    const T = window.T || {};
    const t = T[currentLang];
    if (!t) {
        return;
    }
    el.innerHTML = t.legal.sections.map(s =>
        `<div class="legal-section"><h2>${s.h}</h2><p>${s.p}</p></div>`
    ).join('');

    if (contactEl) {
        contactEl.innerHTML = `${t.legal.contactLabel} <a href="mailto:${EMAIL}">${EMAIL}</a>.`;
    }
}

function applyStaticTranslations() {
    const T = window.T || {};
    const t = T[currentLang];
    if (!t) {
        return;
    }
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const keyAttr = el.getAttribute('data-i18n');
        const path = keyAttr.split('.');
        let val = t;
        for (const k of path) {
            val = val?.[k];
        }
        if (typeof val === 'string') {
            if (el.tagName === 'H1' || el.tagName === 'H2') {
                el.innerHTML = val.replace(/\n/g, '<br>');
            } else {
                el.textContent = val;
            }
        }
    });

    const heroMeta = document.querySelector('.hero-meta');
    if (heroMeta) {
        const hasContent = t.hero?.meta1 || t.hero?.meta2 || t.hero?.meta3;
        heroMeta.style.display = hasContent ? '' : 'none';
    }

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
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';

    applyStaticTranslations();

    if (document.getElementById('features')) {
        renderFeatures();
    }
    if (document.getElementById('sections')) {
        renderSections();
    }

    document.querySelectorAll('trimly-header, trimly-footer').forEach(el => {
        el.setAttribute('lang', lang);
    });

    initAnimations();
}

let animObserver = null;
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

document.addEventListener('DOMContentLoaded', () => {
    currentLang = detectLanguage();
    setLanguage(currentLang);
});
