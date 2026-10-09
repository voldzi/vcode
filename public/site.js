const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-navigation');
const mobileNavigation = window.matchMedia('(max-width: 900px)');
const syncNavigation = () => {
  if (!header || !menu || !navigation) return;
  const closed = mobileNavigation.matches && menu.getAttribute('aria-expanded') !== 'true';
  navigation.inert = closed;
  if (closed) navigation.setAttribute('aria-hidden', 'true');
  else navigation.removeAttribute('aria-hidden');
  menu.setAttribute('aria-label', menu.getAttribute('aria-expanded') === 'true' ? menu.dataset.closeLabel : menu.dataset.openLabel);
};
const closeMenu = () => {
  menu?.setAttribute('aria-expanded', 'false');
  header?.classList.remove('menu-open');
  syncNavigation();
};
if (header && menu && navigation) {
  header.classList.add('navigation-enhanced');
  syncNavigation();
  mobileNavigation.addEventListener('change', () => {
    if (mobileNavigation.matches && navigation.contains(document.activeElement)) menu.focus();
    closeMenu();
  });
}

menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  header?.classList.toggle('menu-open', open);
  syncNavigation();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});

navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('pointerdown', event => {
  if (mobileNavigation.matches && menu?.getAttribute('aria-expanded') === 'true' && event.target instanceof Node && !header?.contains(event.target)) closeMenu();
});

const reveal = document.querySelectorAll('.hero > :not(.hero-signal), .principles > *, .section-heading > *, .product-card, .trust-band > *, .support-cta > *, .product-detail > *, .support-page > *, .guide > *');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  reveal.forEach((element, index) => {
    element.classList.add('reveal');
    if (element instanceof HTMLElement) element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
  });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: .08, rootMargin: '0px 0px -24px' });
  reveal.forEach(element => observer.observe(element));
}

