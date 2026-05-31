// window.T is loaded globally from translations.js
const SUPPORT_MAILTO = 'mailto:hi@zshbleaker.me?subject='
    + encodeURIComponent('Trimly App Support from Website');

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
        const lang = this.getAttribute('lang') || 'en';
        const T = window.T || {};
        const t = T[lang] || T.en || {
            langLabel: 'EN',
            nav: {
                features: 'Features',
                download: 'Download',
            },
        };

        const isIndex = window.location.pathname.endsWith('index.html')
            || window.location.pathname === '/'
            || window.location.pathname.endsWith('/');

        const brandHref = isIndex ? '#' : 'index.html';
        const featuresHref = isIndex ? '#features' : 'index.html#features';

        this.innerHTML = `
            <nav>
                <div class="nav-inner">
                    <a class="nav-brand" href="${brandHref}">
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="n-track" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#1C1C1E"/>
                                    <stop offset="100%" stop-color="#2C2C2E"/>
                                </linearGradient>
                                <linearGradient id="n-clip" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#32ADE6"/>
                                    <stop offset="100%" stop-color="#007AFF"/>
                                </linearGradient>
                                <mask id="n-holes">
                                    <rect width="1024" height="1024" fill="white"/>
                                    <line x1="230" y1="400" x2="794" y2="400" stroke="black" stroke-width="24" stroke-dasharray="24 36"/>
                                    <line x1="230" y1="624" x2="794" y2="624" stroke="black" stroke-width="24" stroke-dasharray="24 36"/>
                                </mask>
                            </defs>
                            <g mask="url(#n-holes)">
                                <rect x="162" y="362" width="700" height="300" rx="24" fill="url(#n-track)"/>
                                <rect x="300" y="362" width="220" height="300" fill="url(#n-clip)"/>
                                <rect x="600" y="362" width="160" height="300" fill="url(#n-clip)"/>
                                <path d="M180,502 v20 M210,482 v60 M240,462 v100 M270,492 v40 M300,432 v160 M330,472 v80 M360,497 v30 M390,442 v140 M420,472 v80 M450,412 v200 M480,452 v120 M510,482 v60 M540,462 v100 M570,492 v40 M600,472 v80 M630,452 v120 M660,432 v160 M690,482 v60 M720,462 v100 M750,492 v40 M780,442 v140 M810,472 v80 M840,497 v30" stroke="#fff" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.4"/>
                            </g>
                            <rect x="162" y="362" width="700" height="300" rx="24" fill="none" stroke="#555" stroke-width="4" opacity="0.5"/>
                            <polygon points="276,266 324,266 300,311" fill="#30D158" stroke="#30D158" stroke-width="8" stroke-linejoin="round"/>
                            <rect x="296" y="306" width="8" height="390" rx="4" fill="#30D158"/>
                        </svg>
                        <span>Trimly</span>
                    </a>

                    <div class="nav-right">
                        <a class="nav-link" href="${featuresHref}">${t.nav.features}</a>
                        <a class="nav-link" href="https://apps.apple.com/app/trimly" target="_blank" rel="noopener">${t.nav.download}</a>
                        <div class="lang-switcher">
                            <button class="lang-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M2 12h20"/>
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/>
                                </svg>
                                <span class="lang-current">${t.langLabel}</span>
                            </button>
                            <div class="lang-dropdown" id="langDropdown">
                                <button class="lang-option" data-lang="en">English <span class="check">&#10003;</span></button>
                                <button class="lang-option" data-lang="zh">简体中文 <span class="check">&#10003;</span></button>
                                <button class="lang-option" data-lang="ja">日本語 <span class="check">&#10003;</span></button>
                                <button class="lang-option" data-lang="ar">العربية <span class="check">&#10003;</span></button>
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
            dropdown.classList.toggle('open');
        });

        const closeDropdown = () => {
            dropdown.classList.remove('open');
        };

        document.addEventListener('click', closeDropdown);

        const activeLang = this.getAttribute('lang') || 'en';
        const options = dropdown.querySelectorAll('.lang-option');
        options.forEach(opt => {
            const isCurrent = opt.dataset.lang === activeLang;
            opt.classList.toggle('active', isCurrent);
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
        const lang = this.getAttribute('lang') || 'en';
        const T = window.T || {};
        const t = T[lang] || T.en || {
            footer: {
                home: 'Home',
                support: 'Support',
                privacy: 'Privacy Policy',
            },
        };

        const isIndex = window.location.pathname.endsWith('index.html')
            || window.location.pathname === '/'
            || window.location.pathname.endsWith('/');

        const homeHref = isIndex ? '#' : 'index.html';

        this.innerHTML = `
            <footer>
                <div class="footer-links">
                    <a href="${homeHref}">${t.footer.home}</a>
                    <a href="${SUPPORT_MAILTO}">${t.footer.support}</a>
                    <a href="privacy.html">${t.footer.privacy}</a>
                </div>
                <p class="footer-copy">&copy; 2026 Trimly</p>
            </footer>
        `;
    }
}

customElements.define('trimly-header', TrimlyHeader);
customElements.define('trimly-footer', TrimlyFooter);
