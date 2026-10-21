// Structure-draft demos below the hero.

(() => {
    // 06 Shoot Log: grade the Photos grid once it scrolls into view.
    const library = document.querySelector('[data-grade]');
    if (!library) {
        return;
    }
    const io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
            io.disconnect();
            library.classList.add('is-graded');
        }
    }, { threshold: 0.5 });
    io.observe(library);
})();
