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

  /* ---- Hero swatch stack ----------------------------------------------
     One single animation loop drives every swatch's transform:
       1) a slow sinusoidal "idle float" so the stack always feels alive
       2) a gentle parallax offset that follows the mouse
     Nothing else touches .swatch's transform, so there's no fighting
     between CSS :hover rules and JS anymore — motion stays smooth and
     continuous instead of "jumping" at a hover boundary. ------------------ */
  const stack = document.querySelector('.swatch-stack');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (stack && !prefersReducedMotion) {
    const swatchEls = Array.from(stack.querySelectorAll('.swatch'));

    // base rotation (deg) + idle float amplitude/speed/phase per swatch
    const config = [
      { rot: -16, floatAmp: 9,  speed: 0.00034, phase: 0.0 },
      { rot: -6,  floatAmp: 7,  speed: 0.00041, phase: 1.3 },
      { rot: 4,   floatAmp: 8,  speed: 0.00038, phase: 2.6 },
      { rot: 13,  floatAmp: 10, speed: 0.00037, phase: 4.0 },
    ];

    let targetX = 0, targetY = 0;   // where the mouse wants the stack to lean
    let currentX = 0, currentY = 0; // smoothed (eased) current lean

    stack.addEventListener('mousemove', (e) => {
      const rect = stack.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;   // -1..1
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;   // -1..1
    });
    stack.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

    function tick(time) {
      // ease the current lean toward the target — this is what makes the
      // mouse-follow feel "creamy" instead of snapping to the cursor
      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;

      swatchEls.forEach((el, i) => {
        const c = config[i];
        const depth = (i + 1) * 6;               // farther swatches move a touch more
        const floatY = Math.sin(time * c.speed + c.phase) * c.floatAmp;
        const px = currentX * depth;
        const py = currentY * depth * 0.6 + floatY;
        el.style.transform = `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px) rotate(${c.rot}deg)`;
      });

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---- Current year in footer ---- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
