const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-site-navigation]');
const year = document.querySelector('[data-current-year]');

function closeNavigation() {
    if (!menuToggle || !navigation) return;

    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelector('.sr-only').textContent = 'Open navigation';
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
}

if (menuToggle && navigation) {
    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
        menuToggle.querySelector('.sr-only').textContent = isOpen ? 'Open navigation' : 'Close navigation';
        navigation.classList.toggle('is-open', !isOpen);
        document.body.classList.toggle('menu-open', !isOpen);
    });

    navigation.addEventListener('click', (event) => {
        if (event.target.closest('a')) closeNavigation();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 760) closeNavigation();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeNavigation();
    });
}

if (year) year.textContent = String(new Date().getFullYear());

const carousel = document.querySelector('[data-initiative-carousel]');

if (carousel) {
    const track = carousel.querySelector('[data-carousel-track]');
    const cards = Array.from(track.querySelectorAll('.initiative-card'));
    const playButton = carousel.querySelector('[data-carousel-play]');
    const count = carousel.querySelector('[data-carousel-count]');
    const dots = carousel.querySelector('[data-carousel-dots]');
    const announcement = carousel.querySelector('[data-carousel-announcement]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const interval = 6500;
    let index = 0;
    let visibleCards = 3;
    let lastIndex = 1;
    let paused = reducedMotion.matches;
    let hovering = false;
    let inViewport = false;
    let timer;
    let scrollTimer;

    carousel.classList.add('is-enhanced');
    carousel.querySelectorAll('[data-carousel-controls]').forEach((control) => {
        control.hidden = false;
    });
    cards.forEach((card, position) => {
        card.setAttribute('role', 'group');
        card.setAttribute('aria-roledescription', 'slide');
        card.setAttribute('aria-label', `${position + 1} of ${cards.length}: ${card.querySelector('h3').textContent}`);
    });

    function rangeLabel(position) {
        const first = position + 1;
        const last = Math.min(position + visibleCards, cards.length);
        return `${first === last ? first : `${first}–${last}`} of ${cards.length} initiatives`;
    }

    function updateControls() {
        count.textContent = rangeLabel(index);
        playButton.textContent = paused ? 'Play sliding' : 'Pause sliding';
        playButton.setAttribute('aria-label', paused ? 'Start automatic sliding' : 'Pause automatic sliding');
        carousel.dataset.rotation = paused ? 'paused' : 'playing';
        dots.querySelectorAll('button').forEach((button, position) => {
            button.setAttribute('aria-current', position === index ? 'true' : 'false');
        });
    }

    function schedule() {
        window.clearTimeout(timer);
        if (paused || hovering || !inViewport || document.hidden || lastIndex === 0) return;
        timer = window.setTimeout(() => {
            show(index === lastIndex ? 0 : index + 1);
        }, interval);
    }

    function pause() {
        paused = true;
        updateControls();
        schedule();
    }

    function show(position, manual = false, instant = false) {
        index = Math.max(0, Math.min(position, lastIndex));
        if (manual) paused = true;
        const left = cards[index].offsetLeft - cards[0].offsetLeft;
        track.scrollTo({ left, behavior: instant || reducedMotion.matches ? 'instant' : 'smooth' });
        updateControls();
        if (manual) announcement.textContent = `Showing ${rangeLabel(index)}.`;
        schedule();
    }

    function measure() {
        visibleCards = Number.parseInt(getComputedStyle(carousel).getPropertyValue('--cards-per-view'), 10) || 1;
        lastIndex = Math.max(0, cards.length - visibleCards);
        dots.replaceChildren();
        for (let position = 0; position <= lastIndex; position += 1) {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-label', `Show ${rangeLabel(position)}`);
            button.setAttribute('aria-controls', 'initiative-track');
            button.addEventListener('click', () => show(position, true));
            dots.append(button);
        }
        show(index, false, true);
    }

    carousel.querySelector('[data-carousel-previous]').addEventListener('click', () => {
        show(index === 0 ? lastIndex : index - 1, true);
    });
    carousel.querySelector('[data-carousel-next]').addEventListener('click', () => {
        show(index === lastIndex ? 0 : index + 1, true);
    });
    playButton.addEventListener('click', () => {
        paused = !paused;
        updateControls();
        schedule();
    });
    carousel.addEventListener('mouseenter', () => { hovering = true; schedule(); });
    carousel.addEventListener('mouseleave', () => { hovering = false; schedule(); });
    carousel.addEventListener('focusin', (event) => {
        // Keyboard readers keep control. Only an explicit Play action restarts rotation.
        if (event.target !== playButton) pause();
    });
    track.addEventListener('pointerdown', pause, { passive: true });
    track.addEventListener('wheel', (event) => {
        if (Math.abs(event.deltaX) > 0) pause();
    }, { passive: true });
    track.addEventListener('scroll', () => {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => {
            const step = cards[1].offsetLeft - cards[0].offsetLeft;
            index = Math.min(lastIndex, Math.max(0, Math.round(track.scrollLeft / step)));
            updateControls();
        }, 160);
    }, { passive: true });
    carousel.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home') show(0, true);
        else if (event.key === 'End') show(lastIndex, true);
        else if (event.key === 'ArrowRight') show(index === lastIndex ? 0 : index + 1, true);
        else show(index === 0 ? lastIndex : index - 1, true);
    });
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) pause();
    });
    new IntersectionObserver((entries) => {
        inViewport = entries[0].isIntersecting;
        schedule();
    }, { threshold: 0.2 }).observe(carousel);
    new ResizeObserver(measure).observe(track);
    measure();
}
