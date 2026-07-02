// window.T is loaded globally from translations.js
const APP_STORE_ID = '6773276396';
const APP_STORE_WEB_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;

function getAppStoreUrl() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isMac = /Macintosh|Mac OS X/.test(ua) && !isIOS;

    if (isMac) {
        return `macappstore://apps.apple.com/app/id${APP_STORE_ID}`;
    }
    if (isIOS) {
        return `itms-apps://apps.apple.com/app/id${APP_STORE_ID}`;
    }
    return APP_STORE_WEB_URL;
}

window.getAppStoreUrl = getAppStoreUrl;
const SUPPORT_MAILTO = 'mailto:hi@zshbleaker.me?subject='
    + encodeURIComponent('Trimly App Support from Website');

const LANG_BADGES = {
    en: { glyph: 'EN', className: '' },
    zh: { glyph: '简', className: 'lang-badge-zh' },
    ja: { glyph: 'あ', className: 'lang-badge-ja' },
    ko: { glyph: '한', className: 'lang-badge-ko' },
    es: { glyph: 'ES', className: '' },
    ar: { glyph: 'ع', className: 'lang-badge-ar' },
};

const LANG_OPTIONS = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '简体中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'es', label: 'Español' },
    { code: 'ar', label: 'العربية' },
];

function renderLangFlag(code) {
    const badge = LANG_BADGES[code] || LANG_BADGES.en;
    const extraClass = badge.className ? ` ${badge.className}` : '';
    return `<span class="lang-badge${extraClass}" aria-hidden="true">${badge.glyph}</span>`;
}

function getPageLang(el) {
    return el.getAttribute('lang')
        || document.documentElement.getAttribute('data-lang')
        || window.__TRIMLY_INITIAL_LANG__
        || 'en';
}

function escapeComponentAttr(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[char]);
}

function renderLangOptions() {
    return LANG_OPTIONS.map(({ code, label }) => `
        <button class="lang-option" type="button" data-lang="${code}">
            <span class="lang-option-main">
                ${renderLangFlag(code)}
                <span class="lang-option-label">${label}</span>
            </span>
            <span class="check">&#10003;</span>
        </button>
    `).join('');
}

class TrimlyHeader extends HTMLElement {
    static get observedAttributes() {
        return ['lang'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'lang' && oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const lang = getPageLang(this);
        const T = window.T || {};
        const t = T[lang] || T.en || {
            nav: {
                features: 'Features',
                download: 'Download',
            },
        };

        const currentLangLabel = LANG_OPTIONS.find(o => o.code === lang)?.label || LANG_OPTIONS[0].label;

        const isIndex = window.location.pathname.endsWith('index.html')
            || window.location.pathname === '/'
            || window.location.pathname.endsWith('/');

        const brandHref = isIndex ? '#' : 'index.html';
        const featuresHref = isIndex ? '#features' : 'index.html#features';
        const currentFlag = renderLangFlag(lang);

        this.innerHTML = `
            <nav>
                <div class="nav-inner">
                    <a class="nav-brand" href="${brandHref}">
                        <picture aria-hidden="true">
                            <source srcset="assets/icon/original_dark.png" media="(prefers-color-scheme: dark)">
                            <img src="assets/icon/original_light.png" width="32" height="32" alt="" decoding="async">
                        </picture>
                        <span>Trimly</span>
                    </a>

                    <div class="nav-right">
                        <a class="nav-link" href="${featuresHref}">${t.nav.features}</a>
                        <a class="nav-link app-store-link" href="${getAppStoreUrl()}" target="_blank" rel="noopener">${t.nav.download}</a>
                        <div class="lang-switcher">
                            <button class="lang-btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Language: ${escapeComponentAttr(currentLangLabel)}">
                                ${currentFlag}
                                <span class="lang-current">${currentLangLabel}</span>
                            </button>
                            <div class="lang-dropdown" id="langDropdown" role="listbox" aria-label="Language">
                                ${renderLangOptions()}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const switcher = this.querySelector('.lang-switcher');
        if (!switcher) {
            return;
        }

        const btn = switcher.querySelector('.lang-btn');
        const dropdown = switcher.querySelector('.lang-dropdown');

        btn.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = dropdown.classList.toggle('open');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        const closeDropdown = () => {
            dropdown.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        };

        document.addEventListener('click', closeDropdown);

        const activeLang = getPageLang(this);
        const options = dropdown.querySelectorAll('.lang-option');
        options.forEach(opt => {
            const isCurrent = opt.dataset.lang === activeLang;
            opt.classList.toggle('active', isCurrent);
            opt.setAttribute('role', 'option');
            opt.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
            opt.addEventListener('click', e => {
                e.stopPropagation();
                const selectedLang = opt.dataset.lang;
                this.dispatchEvent(new CustomEvent('lang-change', {
                    bubbles: true,
                    composed: true,
                    detail: { lang: selectedLang },
                }));
                closeDropdown();
            });
        });
    }
}

class TrimlyFooter extends HTMLElement {
    static get observedAttributes() {
        return ['lang'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'lang' && oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const lang = getPageLang(this);
        const T = window.T || {};
        const t = T[lang] || T.en || {
            footer: {
                home: 'Home',
                support: 'Support',
                privacy: 'Privacy Policy',
                disclaimer: '',
            },
        };

        const isIndex = window.location.pathname.endsWith('index.html')
            || window.location.pathname === '/'
            || window.location.pathname.endsWith('/');

        const homeHref = isIndex ? '#' : 'index.html';

        const disclaimer = t.footer.disclaimer
            ? `<p class="footer-disclaimer" id="lut-disclaimer">${t.footer.disclaimer}</p>`
            : '';

        this.innerHTML = `
            <footer>
                <div class="footer-links">
                    <a href="${homeHref}">${t.footer.home}</a>
                    <a href="${SUPPORT_MAILTO}">${t.footer.support}</a>
                    <a href="privacy.html">${t.footer.privacy}</a>
                </div>
                ${disclaimer}
                <p class="footer-copy">&copy; 2026 Trimly · Crafted by <a href="https://zshbleaker.me" target="_blank" rel="noopener noreferrer">@zshbleaker</a></p>
            </footer>
        `;
    }
}

customElements.define('trimly-header', TrimlyHeader);
customElements.define('trimly-footer', TrimlyFooter);
