// Hero: a playhead scrubs one long recording, marks three clips, and each clip
// lifts off the timeline and lands on the desk as a print.

(() => {
    const hero = document.querySelector('.hero');
    if (!hero) {
        return;
    }

    const DURATION_S = 4368; // 1:12:48
    const STRIP_FRAMES = 18;
    const WAVE_BARS = 150;
    const END_P = 0.965;
    const SPEED_IDLE = 0.17; // timeline fraction per second outside a clip
    const SPEED_MARKING = 0.085; // slower while a clip is being marked
    const HOLD_AFTER_MARK_MS = 260;

    const recorder = hero.querySelector('.recorder');
    const track = hero.querySelector('[data-track]');
    const strip = hero.querySelector('[data-strip]');
    const wave = hero.querySelector('[data-wave]');
    const playhead = hero.querySelector('[data-playhead]');
    const tc = hero.querySelector('[data-tc]');
    const pill = hero.querySelector('[data-pill]');
    const count = hero.querySelector('[data-count]');
    const replay = hero.querySelector('[data-replay]');
    const ranges = [...hero.querySelectorAll('[data-range]')].map(el => ({
        el,
        a: parseFloat(el.style.getPropertyValue('--a')),
        b: parseFloat(el.style.getPropertyValue('--b')),
    }));
    const prints = [...hero.querySelectorAll('.print')];

    // Pill labels come from the page so each language can supply its own.
    const label = {
        scrubbing: recorder.dataset.tScrubbing,
        markStart: recorder.dataset.tMarkStart,
        markEnd: recorder.dataset.tMarkEnd,
        saved: recorder.dataset.tSaved,
    };

    prints.forEach(p => p.style.setProperty('--r', p.dataset.r || '0'));

    // Film strip
    for (let i = 1; i <= STRIP_FRAMES; i++) {
        const img = document.createElement('img');
        img.src = `${strip.dataset.base || 'img/'}strip-${String(i).padStart(2, '0')}.webp`;
        img.alt = '';
        img.decoding = 'async';
        strip.appendChild(img);
    }

    // Waveform: quiet room tone, louder where the moments are
    let seed = 7;
    const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    };
    const centers = ranges.map(r => (r.a + r.b) / 2);
    for (let i = 0; i < WAVE_BARS; i++) {
        const x = i / (WAVE_BARS - 1);
        let h = 0.12 + rand() * 0.28;
        for (const c of centers) {
            h += 0.7 * Math.exp(-((x - c) ** 2) / 0.0012) * (0.75 + rand() * 0.25);
        }
        const bar = document.createElement('i');
        bar.style.setProperty('--h', Math.min(1, h).toFixed(3));
        wave.appendChild(bar);
    }

    const formatTimecode = p => {
        const total = p * DURATION_S;
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = Math.floor(total % 60);
        const cs = Math.floor((total * 100) % 100);
        const pad = n => String(n).padStart(2, '0');
        return `${h}:${pad(m)}:${pad(s)}.${pad(cs)}`;
    };

    const setPlayhead = p => {
        playhead.style.setProperty('--p', p.toFixed(4));
        tc.textContent = formatTimecode(p);
    };

    const setPill = (text, state) => {
        pill.textContent = text;
        pill.classList.toggle('is-marking', state === 'marking');
        pill.classList.toggle('is-saved', state === 'saved');
    };

    const showFinalState = () => {
        ranges.forEach(r => {
            r.el.style.setProperty('--e', r.b);
            r.el.classList.remove('is-marking');
            r.el.classList.add('is-marked');
        });
        prints.forEach(p => p.classList.add('is-landed'));
        setPlayhead(END_P);
        count.textContent = String(ranges.length);
        setPill(label.saved, 'saved');
    };

    // Lift a print from the film above its clip band to its slot on the desk (FLIP).
    const land = index => {
        const print = prints[index];
        const band = ranges[index].el.getBoundingClientRect();
        const film = strip.getBoundingClientRect();
        const from = { left: band.left, width: band.width, top: film.top, height: film.height };
        print.style.transform = 'none';
        const to = print.getBoundingClientRect();
        print.style.transform = '';
        const dx = from.left + from.width / 2 - (to.left + to.width / 2);
        const dy = from.top + from.height / 2 - (to.top + to.height / 2);
        const s = Math.max(0.12, from.width / to.width);
        const r = `${print.dataset.r || 0}deg`;

        print.classList.add('is-landed');
        print.animate(
            [
                { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(0deg)`, opacity: 0.4 },
                { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 40}px) scale(1.04) rotate(${r})`, opacity: 1, offset: 0.62 },
                { transform: `translate(0, 0) scale(1) rotate(${r})`, opacity: 1 },
            ],
            { duration: 1050, easing: 'cubic-bezier(.2,.8,.2,1)' },
        );
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    const run = () => {
        cancelAnimationFrame(raf);
        replay.hidden = true;
        ranges.forEach(r => {
            r.el.classList.remove('is-marking', 'is-marked');
            r.el.style.removeProperty('--e');
        });
        prints.forEach(p => {
            p.getAnimations().forEach(a => a.cancel());
            p.classList.remove('is-landed');
        });
        count.textContent = '0';
        setPill(label.scrubbing, null);

        let p = 0;
        let last = performance.now();
        let holdUntil = 0;
        let landed = 0;

        const tick = now => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;

            if (now >= holdUntil) {
                const active = ranges.find(r => p >= r.a && p < r.b);
                p = Math.min(END_P, p + dt * (active ? SPEED_MARKING : SPEED_IDLE));
            }
            setPlayhead(p);

            ranges.forEach((r, i) => {
                if (p >= r.a && !r.el.classList.contains('is-marking') && !r.el.classList.contains('is-marked')) {
                    r.el.classList.add('is-marking');
                    setPill(label.markStart, 'marking');
                }
                if (r.el.classList.contains('is-marking')) {
                    r.el.style.setProperty('--e', Math.min(p, r.b).toFixed(4));
                }
                if (p >= r.b && i === landed) {
                    r.el.classList.remove('is-marking');
                    r.el.classList.add('is-marked');
                    landed += 1;
                    count.textContent = String(landed);
                    setPill(label.markEnd, 'marking');
                    holdUntil = now + HOLD_AFTER_MARK_MS;
                    land(i);
                    setTimeout(() => {
                        if (landed === i + 1 && p < END_P) {
                            setPill(label.scrubbing, null);
                        }
                    }, 700);
                }
            });

            if (p < END_P) {
                raf = requestAnimationFrame(tick);
            } else {
                setPill(label.saved, 'saved');
                replay.hidden = false;
            }
        };
        raf = requestAnimationFrame(tick);
    };

    replay.addEventListener('click', run);

    if (reducedMotion.matches) {
        showFinalState();
        return;
    }

    hero.classList.add('hero-armed');
    setPlayhead(0);

    const start = () => setTimeout(run, 300);
    const io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
            io.disconnect();
            start();
        }
    }, { threshold: 0.35 });
    io.observe(track);
})();
