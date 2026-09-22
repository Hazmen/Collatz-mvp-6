import { resetHint, runProcess_Elements } from "./uiElements.js";
import { state } from "../state/state.js";
import { reset_EventTarget } from "../state/eventTargets.js";
import { sendReset_RequestEvent } from "../state/events.js";
import { bindPress } from "./bindKeypressAnimation.js";
import { showToast } from "./toast.js";

// ------ RESET UI: HINT + LONG-PRESS + TOAST (UI ONLY) ------ \\
// Здесь только DOM: как выглядит, как триггерится жест, показ тоста.
// Сам ресет делают resetProcess/hardResetProcess в runProcessControls.js
// по событию 'reset_request'. Сюда прилетает 'reset_done' -> показываем toast.

const resetBtn = runProcess_Elements.resetButton;
const baseTitle = resetBtn?.getAttribute('title') || 'Reset (R)'; /* default tooltip */
const shiftTitle = 'Hard reset (Shift+R / long-press) — clears cache'; /* shift tooltip */
let longPressTimer = null;                                  /* hold timer id */
let longPressTriggered = false;                             /* was hard reset via hold? */
const HOLD_MS = 600;                                        /* hold duration */

const HARD_TOAST_COLOR = '#f59e0b';                         /* amber for hard reset */
const HARD_TOAST_TITLE = 'Hard reset';
const HARD_TOAST_DESC = 'cache cleared';

// ------ helpers: send intent, no controller import ------ \\
function requestSoft(source) {
    sendReset_RequestEvent('soft', reset_EventTarget);
}

function requestHard(source) {
    sendReset_RequestEvent('hard', reset_EventTarget);
}

// ------ DONE -> TOAST (generic toast.js, no #hard-reset-toast div) ------ \\
reset_EventTarget.addEventListener('reset_done', (e) => {
    const type = e?.detail?.type;
    if (type !== 'hard') return;                             /* soft -> silent */
    showToast(HARD_TOAST_TITLE, HARD_TOAST_DESC, HARD_TOAST_COLOR);
});

// ------ RESET BUTTON: CLICK (soft | Shift+click -> hard) ------ \\
resetBtn?.addEventListener('click', (e) => {
    if (longPressTriggered) { longPressTriggered = false; return; } /* consumed by hold */
    if (e.shiftKey) {
        requestHard('click+shift');                         /* Shift+click -> hard */
    } else {
        requestSoft('click');                               /* plain click -> soft */
    }
});

// ------ R KEY (soft) via bindPress ------ \\
if (resetBtn) {
    bindPress(resetBtn, 'KeyR', () => { requestSoft('KeyR'); }, () => !state.isComputing, false);
}

// ------ Shift+R (separate — bindPress ignores modifiers) ------ \\
document.addEventListener('keydown', (e) => {
    if (e.code !== 'KeyR') return;
    if (!e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.repeat) return;
    const el = document.activeElement;
    if (el && (el.matches('input,textarea,[contenteditable]') || el.tagName === 'INPUT')) return;
    if (resetBtn?.classList.contains('locked')) return;
    if (state.isComputing) return;
    e.preventDefault();
    resetBtn?.classList.add('is-pressed'); /* press anim */
    setTimeout(() => resetBtn?.classList.remove('is-pressed'), 120);
    requestHard('Shift+KeyR');
});

// ------ SHIFT VISUAL HINT ------ \\
function setShiftVisual(on) {                                   /* toggle amber hint */
    if (!resetBtn) return;
    resetBtn.classList.toggle('reset-shift-active', on);
    if (resetHint) resetHint.classList.toggle('reset-hint-shift', on);
    resetBtn.setAttribute('title', on ? shiftTitle : baseTitle); /* swap tooltip */
}

// ------ SHIFT KEY LISTENERS ------ \\
document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey) setShiftVisual(true); /* preview on */
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') setShiftVisual(false);               /* preview off */
});
window.addEventListener('blur', () => setShiftVisual(false));   /* lose focus */
document.addEventListener('visibilitychange', () => setShiftVisual(false)); /* tab hidden */

// ------ HOVER HINT ------ \\
resetBtn?.addEventListener('mouseenter', () => {                 /* hover hint */
    if (!resetBtn.classList.contains('reset-shift-active')) {
        if (resetHint) resetHint.style.opacity = '0.85';
    }
});
resetBtn?.addEventListener('mouseleave', () => {
    if (!resetBtn.classList.contains('reset-shift-active')) {
        if (resetHint) resetHint.style.opacity = '';
    }
});

// ------ CANCEL LONG-PRESS ------ \\
function cancelLongPress() {                                    /* abort hold */
    clearTimeout(longPressTimer);
    longPressTimer = null;
    resetBtn?.classList.remove('hold-active');
    if (resetHint) resetHint.classList.remove('reset-hint-holding');
}

// ------ LONG-PRESS (hard) ------ \\
resetBtn?.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (resetBtn.classList.contains('locked')) return;
    if (state.isComputing) return;
    longPressTriggered = false;
    resetBtn.classList.add('hold-active');                      /* start fill anim */
    if (resetHint) resetHint.classList.add('reset-hint-holding');
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
        longPressTriggered = true;
        requestHard('long-press');                              /* 600ms hold -> hard */
        try { navigator.vibrate && navigator.vibrate(30); } catch {}
        setTimeout(cancelLongPress, 260);                       /* fade out */
    }, HOLD_MS);
});
resetBtn?.addEventListener('pointerup', cancelLongPress);      /* abort on release */
resetBtn?.addEventListener('pointerleave', cancelLongPress);   /* abort on leave */
resetBtn?.addEventListener('pointercancel', cancelLongPress);  /* abort on cancel */
resetBtn?.addEventListener('contextmenu', (e) => {
    if (longPressTimer) e.preventDefault();                 /* block menu during hold */
});
