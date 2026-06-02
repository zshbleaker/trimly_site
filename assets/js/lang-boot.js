(function () {
    const SUPPORTED = { en: 1, zh: 1, ja: 1, ko: 1, es: 1, ar: 1 };

    function detectLanguage() {
        try {
            const saved = localStorage.getItem('trimly-lang');
            if (saved && SUPPORTED[saved]) {
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

    const lang = detectLanguage();
    window.__TRIMLY_INITIAL_LANG__ = lang;
    window.trimlyDetectLanguage = detectLanguage;

    const root = document.documentElement;
    root.setAttribute('data-lang', lang);
    root.lang = lang === 'zh' ? 'zh-Hans' : lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
})();
