
// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Header shadow on scroll
const header = document.querySelector('.site-header');
const onScroll = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 8);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
navToggle.addEventListener('click', () => {
  const isOpen = header.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    header.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Menu tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.menu-panel');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabButtons.forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected', 'true');

    panels.forEach(panel => {
      const isTarget = panel.id === `panel-${target}`;
      panel.hidden = !isTarget;
      panel.classList.toggle('is-active', isTarget);
    });
  });
});

// Scroll-reveal for sections
const revealTargets = document.querySelectorAll(
  '.about-inner, .feature-item, .section-title, .section-lede, .carousel, .menu-tabs, .menu-panel, .delivery-inner, .visit-grid'
);
revealTargets.forEach(el => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('is-visible'));
}

// ---------- Carousel ----------
(function initCarousel() {
  const track = document.getElementById('carTrack');
  const viewport = track ? track.parentElement : null;
  const prevBtn = document.getElementById('carPrev');
  const nextBtn = document.getElementById('carNext');
  const dotsWrap = document.getElementById('carDots');
  if (!track || !viewport) return;

  const cards = Array.from(track.children);
  let cardsPerView = 3;
  let index = 0;
  let autoplayId = null;

  function getCardsPerView() {
    const w = window.innerWidth;
    if (w <= 640) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - cardsPerView);
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const dotCount = maxIndex() + 1;
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        index = i;
        update();
        restartAutoplay();
      });
      dotsWrap.appendChild(dot);
    }
  }

  function update() {
    index = Math.min(Math.max(index, 0), maxIndex());
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap || 0);
    const offset = index * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    Array.from(dotsWrap.children).forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === maxIndex();
  }

  function next() {
    index = index >= maxIndex() ? 0 : index + 1;
    update();
  }

  function prev() {
    index = index <= 0 ? maxIndex() : index - 1;
    update();
  }

  function restartAutoplay() {
    clearInterval(autoplayId);
    autoplayId = setInterval(next, 4200);
  }

  nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });

  viewport.addEventListener('mouseenter', () => clearInterval(autoplayId));
  viewport.addEventListener('mouseleave', restartAutoplay);
  viewport.addEventListener('focusin', () => clearInterval(autoplayId));
  viewport.addEventListener('focusout', restartAutoplay);

  // Touch / swipe support
  let startX = 0;
  let deltaX = 0;
  let dragging = false;

  track.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    clearInterval(autoplayId);
    track.style.transition = 'none';
  });
  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    deltaX = e.clientX - startX;
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    if (deltaX > 50) prev();
    else if (deltaX < -50) next();
    else update();
    deltaX = 0;
    restartAutoplay();
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointerleave', endDrag);

  // Keyboard support
  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); restartAutoplay(); }
    if (e.key === 'ArrowLeft') { prev(); restartAutoplay(); }
  });

  function handleResize() {
    const newCardsPerView = getCardsPerView();
    if (newCardsPerView !== cardsPerView) {
      cardsPerView = newCardsPerView;
      buildDots();
      index = 0;
    }
    update();
  }

  cardsPerView = getCardsPerView();
  buildDots();
  update();
  restartAutoplay();
  window.addEventListener('resize', handleResize);
})();
