import { resetHint, runProcess_Elements } from "../uiElements.js";
import { state } from "../../state/state.js";
import { resetProcess, hardResetProcess } from "../runProcessControls.js";
import { bindPress } from "../bindKeypressAnimation.js";

// ------ RESET UI: HINT + LONG-PRESS + TOAST ------ \\
// Контроллер (что делает нажатие) остался в runProcessControls.js:123,132
// Здесь только UI: как выглядит, как триггерится, toast

// ------ CONSTANTS & STATE ------ \\
const resetBtn = runProcess_Elements.resetButton;
const baseTitle = resetBtn.getAttribute('title') || 'Reset (R)'; /* default tooltip */
const shiftTitle = 'Hard reset (Shift+R / long-press) — clears cache'; /* shift tooltip */
let longPressTimer = null;                                  /* hold timer id */
let longPressTriggered = false;                             /* was hard reset via hold? */
const HOLD_MS = 600;                                        /* hold duration */

// ------ HARD-RESET TOAST ------ \\
let toastTimer = null;                                      /* hide timer */
export function showHardToast() {
    const toast = document.getElementById('hard-reset-toast');
    if (!toast) return;                                     /* no DOM element */
    toast.classList.add('show');                            /* reveal */
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1600); /* auto-hide */
}

// ------ RESET BUTTON: CLICK + R ------ \\
runProcess_Elements.resetButton.addEventListener('click', (e) => {
    if (longPressTriggered) { longPressTriggered = false; return; } /* consumed by hold */
    if (e.shiftKey) {
        if (hardResetProcess()) showHardToast();            /* Shift+click → hard */
    } else {
        resetProcess();                                     /* plain click → lazy */
    }
});
bindPress(runProcess_Elements.resetButton, 'KeyR', () => { resetProcess(); }, null, false); /* R key */

// ------ Shift+R (separate — bindPress ignores modifiers) ------ \\
document.addEventListener('keydown', (e) => {
    if (e.code !== 'KeyR') return;
    if (!e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.repeat) return;
    const el = document.activeElement;
    if (el && (el.matches('input,textarea,[contenteditable]') || el.tagName === 'INPUT')) return;
    if (runProcess_Elements.resetButton.classList.contains('locked')) return;
    e.preventDefault();
    runProcess_Elements.resetButton.classList.add('is-pressed'); /* press anim */
    setTimeout(() => runProcess_Elements.resetButton.classList.remove('is-pressed'), 120);
    if (hardResetProcess()) showHardToast();
});

// ------ SHIFT VISUAL HINT ------ \\
function setShiftVisual(on) {                                   /* toggle amber hint */
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
resetBtn.addEventListener('mouseenter', () => {                 /* hover hint */
    if (!resetBtn.classList.contains('reset-shift-active')) {
        if (resetHint) resetHint.style.opacity = '0.85';
    }
});
resetBtn.addEventListener('mouseleave', () => {
    if (!resetBtn.classList.contains('reset-shift-active')) {
        if (resetHint) resetHint.style.opacity = '';
    }
});

// ------ CANCEL LONG-PRESS ------ \\
function cancelLongPress() {                                    /* abort hold */
    clearTimeout(longPressTimer);
    longPressTimer = null;
    resetBtn.classList.remove('hold-active');
    if (resetHint) resetHint.classList.remove('reset-hint-holding');
}

// ------ LONG-PRESS START ------ \\
resetBtn.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (resetBtn.classList.contains('locked')) return;
    if (state.isComputing) return;
    longPressTriggered = false;
    resetBtn.classList.add('hold-active');                      /* start fill anim */
    if (resetHint) resetHint.classList.add('reset-hint-holding');
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
        longPressTriggered = true;
        if (hardResetProcess()) showHardToast();                /* 600ms hold → wipe */
        try { navigator.vibrate && navigator.vibrate(30); } catch {}
        setTimeout(cancelLongPress, 260);                       /* fade out */
    }, HOLD_MS);
});
resetBtn.addEventListener('pointerup', cancelLongPress);      /* abort on release */
resetBtn.addEventListener('pointerleave', cancelLongPress);   /* abort on leave */
resetBtn.addEventListener('pointercancel', cancelLongPress);  /* abort on cancel */
resetBtn.addEventListener('contextmenu', (e) => {
    if (longPressTimer) e.preventDefault();                 /* block menu during hold */
});
