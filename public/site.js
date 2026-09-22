const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-navigation');
const closeMenu = () => {
  menu?.setAttribute('aria-expanded', 'false');
  header?.classList.remove('menu-open');
};

menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  header?.classList.toggle('menu-open', open);
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

const reveal = document.querySelectorAll('.hero > *, .principles > *, .section-heading > *, .product-card, .trust-band > *, .support-cta > *, .product-detail > *, .support-page > *, .guide > *');
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

