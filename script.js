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

  /* ---- Scroll reveal ----
     threshold is low and rootMargin is small on purpose: we want the
     animation to start the moment a section starts entering the viewport,
     so the slow unfold plays out WHILE you scroll — not fire late and
     look like it's popping in already-visible. */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });
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

  /* ---- Scroll progress bar ---- */
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressBar.style.width = pct + '%';
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  /* ---- Button ripple effect ---- */
  // Purely decorative, self-cleaning: the span removes itself after the
  // animation ends, so it never piles up or interferes with .btn's own
  // hover transition (that one still runs on the button itself).
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255,255,255,0.35)';
      ripple.style.pointerEvents = 'none';
      ripple.style.animation = 'btn-ripple 0.7s ease-out';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ---- Soft fade when leaving to another page of the group ----
     Only intercepts real same-site page navigations — explicitly leaves
     #anchors, external http(s) links, target="_blank", mailto: and tel:
     links alone, so WhatsApp/Instagram/Facebook/phone/email links keep
     working normally. */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    const isInternalPage = href
      && !href.startsWith('#')
      && !href.startsWith('http')
      && !href.startsWith('mailto:')
      && !href.startsWith('tel:')
      && link.target !== '_blank';

    if (!isInternalPage) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.style.transition = 'opacity .35s ease';
      document.body.style.opacity = '0.85';
      setTimeout(() => { window.location.href = href; }, 180);
    });
  });

});
