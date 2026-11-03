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
