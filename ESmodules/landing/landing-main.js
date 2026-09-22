// ------ LANDING PAGE ------ \\
// Vanilla port of Astra_Collatz/src/pages/HomePage.tsx, restyled to MVP6.
// - Number input with digit-only validation (up to 10^100).
// - Start -> stashes value in sessionStorage 'collatz-start' -> go to simulation.html
// - How it works / About -> guide.html (with View Transitions when available).
// - RU/EN toggle (shared i18n).

import { getLang, setLang, t } from '../shared/i18n.js';

const MAX_LEN = 101; // 10^100 has 101 digits

// ---- Starfield ----
function buildStars(count = 90) {
  const bg = document.querySelector('.clz-bg');
  if (!bg) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'clz-star';
    const size = Math.random() * 2 + 1;
    s.style.top = `${Math.random() * 100}%`;
    s.style.left = `${Math.random() * 100}%`;
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
    s.style.setProperty('--delay', `${Math.random() * 4}s`);
    s.style.setProperty('--dur', `${2.5 + Math.random() * 3}s`);
    frag.appendChild(s);
  }
  bg.appendChild(frag);
}

// ---- Entrance animation ----
function reveal() {
  const nodes = document.querySelectorAll('.reveal');
  const hasAnime = typeof window.anime === 'function';
  if (hasAnime) {
    window.anime({
      targets: '.reveal',
      opacity: [0, 1],
      translateY: [20, 0],
      easing: 'easeOutCubic',
      duration: 550,
      delay: window.anime.stagger(120, { start: 100 }),
    });
    nodes.forEach((n) => { n.style.opacity = ''; n.style.transform = ''; });
  } else {
    nodes.forEach((n, i) => setTimeout(() => n.classList.add('reveal-in'), 100 + i * 120));
  }
}

// ---- Input handling ----
function initInput() {
  const input = document.getElementById('landing-input');
  const errorEl = document.getElementById('landing-error');
  const startBtn = document.getElementById('landing-start');
  if (!input || !startBtn) return;

  const clean = (raw) =>
    raw.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '').slice(0, MAX_LEN);

  const setError = (msg) => {
    errorEl.textContent = msg || '';
    input.classList.toggle('is-error', Boolean(msg));
  };

  input.addEventListener('input', () => {
    const c = clean(input.value);
    if (c !== input.value) input.value = c;
    setError('');
  });

  const start = () => {
    const value = input.value;
    if (!value) { setError(t('error.empty')); return; }
    if (!/^\d+$/.test(value) || value === '0') { setError(t('error.invalid')); return; }
    try { sessionStorage.setItem('collatz-start', value); } catch { /* ignore */ }
    navigate('simulation.html');
  };

  startBtn.addEventListener('click', start);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
}

// ---- Cross-document navigation with View Transitions when available ----
function navigate(href) {
  // If the browser supports the cross-document View Transition API, the
  // @view-transition rule in HTML handles it automatically on normal nav.
  // We just navigate; startViewTransition covers same-document only, so a
  // plain assignment is the correct trigger for MPA transitions.
  if (document.startViewTransition && !supportsMPAViewTransitions()) {
    document.startViewTransition(() => { window.location.href = href; });
  } else {
    window.location.href = href;
  }
}
function supportsMPAViewTransitions() {
  // Feature-detect the CSS @view-transition (cross-document) support.
  try { return CSS.supports('view-transition-name: none'); } catch { return false; }
}

// ---- Language toggle ----
function initLang() {
  const btn = document.getElementById('landing-lang');
  if (!btn) return;
  const paint = () => { btn.textContent = getLang().toUpperCase(); };
  paint();
  btn.addEventListener('click', () => {
    setLang(getLang() === 'ru' ? 'en' : 'ru');
    paint();
  });
  // second/third links also react via [data-i18n] + applyTranslations in setLang
}

function init() {
  buildStars();
  initInput();
  initLang();
  reveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
