// Usage scenarios section — loaded before main.js; reads window.T from translations.js

const SCENARIO_ICONS = {
    travel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'
        + '</svg>',
    party: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M20 12v10H4V12"/>'
        + '<path d="M22 7H2v5h20V7z"/>'
        + '<path d="M12 22V7"/>'
        + '<path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>'
        + '<path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>'
        + '</svg>',
    concert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M9 18V5l12-2v13"/>'
        + '<circle cx="6" cy="18" r="3"/>'
        + '<circle cx="18" cy="16" r="3"/>'
        + '</svg>',
    action: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>'
        + '</svg>',
    interview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
        + 'stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>'
        + '<path d="M19 10v2a7 7 0 0 1-14 0v-2"/>'
        + '<line x1="12" y1="19" x2="12" y2="22"/>'
        + '</svg>',
};

const SCENARIO_ACCENTS = {
    travel: 'cyan',
    party: 'orange',
    concert: 'purple',
    action: 'green',
    interview: 'indigo',
};

function renderScenarioCard(item, index) {
    const accent = SCENARIO_ACCENTS[item.id] || 'teal';
    const icon = SCENARIO_ICONS[item.id] || SCENARIO_ICONS.travel;
    const delay = (index * 0.07).toFixed(2);

    return `<article class="scenario-card ${accent} fade-in" style="animation-delay:${delay}s">`
        + `<div class="scenario-card-icon">${icon}</div>`
        + `<h3 class="scenario-card-title">${item.title}</h3>`
        + `<p class="scenario-card-desc">${item.desc}</p>`
        + '</article>';
}

function renderScenarios(lang) {
    const el = document.getElementById('scenarios');
    if (!el) {
        return;
    }

    const T = window.T || {};
    const items = T[lang]?.scenarios?.items;
    if (!items?.length) {
        return;
    }

    el.innerHTML = `<div class="scenario-grid">${items.map(renderScenarioCard).join('')}</div>`;
}
