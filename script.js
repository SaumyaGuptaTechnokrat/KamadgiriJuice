// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Top nav shadow on scroll
const topnav = document.querySelector('.topnav');
const onScroll = () => {
  topnav.classList.toggle('is-scrolled', window.scrollY > 8);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
navToggle.addEventListener('click', () => {
  const isOpen = topnav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    topnav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Menu tabs (also switchable from category cards via data-goto-tab)
const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.menu-panel');

function activateTab(target) {
  tabButtons.forEach(b => {
    const match = b.dataset.tab === target;
    b.classList.toggle('is-active', match);
    b.setAttribute('aria-selected', String(match));
  });
  panels.forEach(panel => {
    const isTarget = panel.id === `panel-${target}`;
    panel.hidden = !isTarget;
    panel.classList.toggle('is-active', isTarget);
  });
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

document.querySelectorAll('[data-goto-tab]').forEach(el => {
  el.addEventListener('click', (e) => {
    const target = el.dataset.gotoTab;
    activateTab(target);
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      e.preventDefault();
      menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Scroll-reveal for sections
const revealTargets = document.querySelectorAll(
  '.split, .trust-item, .section-head, .cat-card, .carousel, .menu-tabs, .menu-panel, .delivery-inner, .visit-card, .cta-band'
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
  }, { threshold: 0.12 });
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

  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let dragging = false;
  let axisLocked = null;
  let baseOffset = 0;

  function currentOffsetPx() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap || 0);
    return index * (cardWidth + gap);
  }

  track.addEventListener('pointerdown', (e) => {
    dragging = true;
    axisLocked = null;
    startX = e.clientX;
    startY = e.clientY;
    baseOffset = currentOffsetPx();
    clearInterval(autoplayId);
    track.style.transition = 'none';
    try { track.setPointerCapture(e.pointerId); } catch (err) { /* no-op */ }
  });

  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (!axisLocked) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        axisLocked = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
      }
    }

    if (axisLocked === 'x') {
      e.preventDefault();
      track.style.transform = `translateX(${-baseOffset + deltaX}px)`;
    }
  }, { passive: false });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    if (axisLocked === 'x') {
      if (deltaX > 50) prev();
      else if (deltaX < -50) next();
      else update();
    }
    deltaX = 0;
    axisLocked = null;
    restartAutoplay();
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('pointerleave', (e) => {
    if (dragging && e.pointerType === 'mouse') endDrag();
  });

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

// ---------- Bottom nav active-section highlighting ----------
(function bottomNavSpy() {
  const links = document.querySelectorAll('.bottomnav a[data-section]');
  if (!links.length) return;
  const sections = Array.from(links)
    .map(l => document.getElementById(l.dataset.section))
    .filter(Boolean);

  if (!('IntersectionObserver' in window) || !sections.length) return;

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => l.classList.toggle('is-active', l.dataset.section === id));
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(s => spy.observe(s));
})();
