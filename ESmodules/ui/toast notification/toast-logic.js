import { getToastContainer, getToastTemplate, toastRoot } from '../uiElements.js';

// ------ CONSTANTS ------ \\
const MAX_VISIBLE = 5;               /* max toasts on screen */
const EXIT_MS = 300;                 /* fade-out duration */
const COLLAPSE_MS = 270;             /* collapse height duration */
const DEFAULT_LIFETIME = 5000;       /* default auto-dismiss */
const MIN_LIFETIME = 1000;           /* clamp lower bound */

// ------ REDUCED MOTION + REGISTRY ------ \\
const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)') /* respect OS setting */
        : { matches: false };

const byId = new Map();              /* id → element registry */
let seq = 0;                         /* incremental id */

// ------ RESOLVE COLOR ------ \\
function resolveColor(raw) {
    let c = (raw ?? '').trim();                 /* normalize */
    if (c && !c.startsWith('#')) c = '#' + c;   /* allow without hash */

    const ok = /^#[0-9A-F]{6}$/i.test(c);       /* strict hex */
    if (ok) return c;

    const fallback = getComputedStyle(toastRoot).getPropertyValue('--toast-color').trim(); /* CSS fallback */
    return fallback || '#ef4444';
}

// ------ RESOLVE LIFETIME ------ \\
function resolveLifetime(raw) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return DEFAULT_LIFETIME; /* not a number → default */
    return Math.max(MIN_LIFETIME, Math.round(n));      /* clamp */
}

// ------ BUILD FALLBACK TOAST DOM ------ \\
function buildFallbackToast() {
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');          /* a11y */
    el.innerHTML =
        '<span class="toast-dot" aria-hidden="true"></span>' +
        '<div class="toast-text">' +
            '<span class="toast-label"></span>' +
            '<span class="toast-desc"></span>' +
        '</div>' +
        '<button type="button" class="toast-close" aria-label="Dismiss notification">×</button>' +
        '<span class="toast-progress" aria-hidden="true">' +
            '<span class="toast-progress-fill"></span>' +
        '</span>';
    return el;
}

// ------ SHOW TOAST ------ \\
export function showToast(toastLabel, toastDesc, toastColor, toastLifetime = DEFAULT_LIFETIME) {
    // ------ RESOLVE INPUTS ------ \\
    const container = getToastContainer();
    const tpl = getToastTemplate();
    const duration = resolveLifetime(toastLifetime);
    const accent = resolveColor(toastColor);
    const id = 'toast-' + (++seq);              /* unique id */

    // ------ CREATE ELEMENT ------ \\
    let toastEl = null;
    if (tpl && tpl.content && tpl.content.querySelector('.toast')) {
        toastEl = tpl.content.querySelector('.toast').cloneNode(true); /* clone template */
    } else {
        toastEl = buildFallbackToast();         /* no template → builds manually */
    }

    toastEl.dataset.toastId = id;
    toastEl.querySelector('.toast-label').textContent = toastLabel ?? '';

    const descEl = toastEl.querySelector('.toast-desc');
    if (descEl) {
        descEl.textContent = toastDesc ?? '';
        descEl.style.display = toastDesc ? '' : 'none'; /* hide if empty */
    }

    toastEl.style.setProperty('--toast-color', accent);

    const fill = toastEl.querySelector('.toast-progress-fill');

    // ------ TIMER STATE ------ \\
    toastEl._duration = duration;
    toastEl._remaining = duration;
    toastEl._timer = null;
    toastEl._raf = null;

    // ------ PROGRESS TICK ------ \\
    function tick() {
        const remain = Math.max(0, toastEl._remaining - (performance.now() - toastEl._startedAt));

        if (fill) {
            fill.style.transform = 'scaleX(' + (remain / toastEl._duration) + ')'; /* shrink bar */
        }

        if (remain <= 0) {
            dismissToast(id);                   /* time up */
            return;
        }

        toastEl._raf = requestAnimationFrame(tick);
    }

    // ------ START TIMER ------ \\
    function start() {
        if (toastEl.dataset.leaving) return;    /* already dismissing */

        toastEl._startedAt = performance.now();
        clearTimeout(toastEl._timer);
        toastEl._timer = setTimeout(() => dismissToast(id), toastEl._remaining);
        cancelAnimationFrame(toastEl._raf);

        if (fill) {
            toastEl._raf = requestAnimationFrame(tick);
        }
    }

    // ------ PAUSE TIMER ------ \\
    function pause() {
        if (toastEl.dataset.leaving) return;

        clearTimeout(toastEl._timer);
        cancelAnimationFrame(toastEl._raf);
        toastEl._remaining = Math.max(0, toastEl._remaining - (performance.now() - toastEl._startedAt)); /* freeze remaining */

        if (fill) {
            fill.style.transform = 'scaleX(' + (toastEl._remaining / toastEl._duration) + ')';
        }
    }

    // ------ CLOSE BUTTON + HOVER PAUSE ------ \\
    const closeBtn = toastEl.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => dismissToast(id));
    }

    toastEl.addEventListener('mouseenter', pause);
    toastEl.addEventListener('mouseleave', start);

    // ------ ANIMATE EXISTING TOASTS DOWN ------ \\
    const prev = reduceMotion.matches
        ? null
        : Array.from(container.children).map(el => ({
            el,
            top: el.getBoundingClientRect().top, /* snapshot positions */
        }));

    container.prepend(toastEl);                 /* insert on top */
    byId.set(id, toastEl);

    if (prev && prev.length) {
        prev.forEach(({ el, top }) => {
            const dy = top - el.getBoundingClientRect().top;
            if (!dy) return;

            el.style.transition = 'none';
            el.style.transform = 'translateY(' + dy + 'px)'; /* invert */
            void el.offsetHeight;               /* reflow */

            el.style.transition = 'transform 320ms cubic-bezier(0.25, 0.1, 0.25, 1)';
            el.style.transform = '';            /* play to 0 */
            el.addEventListener('transitionend', () => {
                el.style.transition = '';
            }, { once: true });
        });
    }

    // ------ ENFORCE MAX VISIBLE ------ \\
    Array.from(container.children)
        .slice(MAX_VISIBLE)
        .forEach(el => dismissToast(el.dataset.toastId)); /* dismiss oldest */

    // ------ REVEAL WITH DOUBLE RAF ------ \\
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toastEl.classList.add('show');
            start();                            /* start countdown */
        });
    });

    return id;
}

// ------ DISMISS TOAST ------ \\
export function dismissToast(id) {
    const el = byId.get(id);
    if (!el || el.dataset.leaving) return false;

    el.dataset.leaving = '1';
    clearTimeout(el._timer);
    cancelAnimationFrame(el._raf);
    byId.delete(id);

    if (reduceMotion.matches) {
        el.remove();                            /* no animation */
        return true;
    }

    el.classList.remove('show');
    el.classList.add('leaving');

    setTimeout(() => {
        if (!el.isConnected) return;

        el.style.height = el.offsetHeight + 'px';
        void el.offsetHeight;                   /* reflow */

        el.classList.add('collapsing');
        el.style.height = '0px';
        el.style.minHeight = '0';
        el.style.paddingTop = '0px';
        el.style.paddingBottom = '0px';
        el.style.marginBottom = '-10px';
        el.style.opacity = '0';                 /* collapse */

        setTimeout(() => el.remove(), COLLAPSE_MS);
    }, EXIT_MS);

    return true;
}

// ------ GLOBAL EXPOSE FOR DEBUG ------ \\
if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.toast = {
        show: (o = {}) => showToast(o.title, o.message, o.color, o.duration),
        dismiss: dismissToast,
    };
}
