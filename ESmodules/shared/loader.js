// ------ SHARED LOADING SCREEN ------ \\
// Behavior (per spec):
//   - Show the overlay until window "load" fires AND everything is ready.
//   - Enforce a minimum on-screen time of 2000ms (measured from module import,
//     which is close to navigation start for a small page).
//   - Rotate Erdős-style quotes every 2000ms while visible.
//   - Fade out (500ms) then remove from the flow.
//
// The overlay markup lives in each HTML file as #loader-overlay.
// This module is a no-op if that element is absent.

import { QUOTES, getLang } from './i18n.js';

const MIN_VISIBLE_MS = 2000;
const FADE_MS = 500;
const QUOTE_INTERVAL_MS = 2000;

const t0 = performance.now();
const overlay = document.getElementById('loader-overlay');

if (overlay) {
  const quoteEl = overlay.querySelector('[data-loader-quote]');
  const authorEl = overlay.querySelector('[data-loader-author]');
  let quoteTimer = null;
  let current = null;

  const pickQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const renderQuote = () => {
    if (!quoteEl || !current) return;
    const lang = getLang() === 'ru' ? 'ru' : 'en';
    const text = lang === 'ru' ? current.ru : current.en;
    const by = lang === 'ru' ? current.byRu : current.byEn;
    quoteEl.textContent = `\u201C${text}\u201D`;
    if (authorEl) {
      authorEl.textContent = by || '';
      authorEl.hidden = !by;
    }
  };

  const showQuote = () => {
    if (!quoteEl) return;
    current = pickQuote();
    renderQuote();
    // retrigger the fade-in animation
    quoteEl.classList.remove('loader-quote-in');
    void quoteEl.offsetWidth;
    quoteEl.classList.add('loader-quote-in');
  };

  showQuote();
  quoteTimer = setInterval(showQuote, QUOTE_INTERVAL_MS);
  window.addEventListener('langchange', renderQuote);

  const dismiss = () => {
    const elapsed = performance.now() - t0;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      if (quoteTimer) clearInterval(quoteTimer);
      overlay.classList.add('loader-hidden');
      const cleanup = () => overlay.remove();
      overlay.addEventListener('transitionend', cleanup, { once: true });
      // safety fallback if transitionend never fires
      setTimeout(cleanup, FADE_MS + 200);
    }, wait);
  };

  // Wait for full page load; if it already fired, dismiss on next tick.
  const onReady = () => {
    // also wait for fonts if the API is available, but don't block forever
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).then(dismiss);
  };

  if (document.readyState === 'complete') {
    onReady();
  } else {
    window.addEventListener('load', onReady, { once: true });
  }
}
