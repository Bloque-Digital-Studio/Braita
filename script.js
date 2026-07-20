// ============================================================
// BRAITA GROUP — hub interactions (vanilla JS, no dependencies)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Sticky header state ---- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---- Hero swatch stack: subtle mousemove parallax (desktop only) ---- */
  const stack = document.querySelector('.swatch-stack');
  if (stack && window.matchMedia('(min-width: 900px)').matches) {
    const swatches = stack.querySelectorAll('.swatch');
    stack.addEventListener('mousemove', (e) => {
      const rect = stack.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      swatches.forEach((s, i) => {
        const depth = (i + 1) * 4;
        s.style.setProperty('--mx', `${x * depth}px`);
        s.style.setProperty('--my', `${y * depth}px`);
        s.style.marginLeft = `${x * depth}px`;
        s.style.marginTop = `${y * depth}px`;
      });
    });
    stack.addEventListener('mouseleave', () => {
      swatches.forEach(s => { s.style.marginLeft = ''; s.style.marginTop = ''; });
    });
  }

  /* ---- Current year in footer ---- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
