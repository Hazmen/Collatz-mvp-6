export function bindPress(button, code, action, guard=null, holdRepeat=false) {
    if (!button) return;
    let delayTimer = null;
    let repeatInterval = null;
    const scaleClass = button.matches('.clear-inp,.save-inp,.rand-inp') ? 'is-pressed-sm' : 'is-pressed';
    const isInputFocused = () => {
        const el = document.activeElement;
        return el && (el.matches('input,textarea,[contenteditable]') || el.tagName === 'INPUT');
    };

    function stopPress() {
        clearTimeout(delayTimer);
        clearInterval(repeatInterval);
        delayTimer = null;
        repeatInterval = null;
    }

    document.addEventListener('keydown', e=>{
        // NEVER touch keys that are not ours — otherwise typing digits gets blocked.
        if (e.code !== code) return;

        // Space: suppress page scroll FIRST, even for autorepeat,
        // even if guard/locked will abort below. Skip when typing in a field.
        if (code === 'Space' && !isInputFocused()) e.preventDefault();

        // No native autorepeat: single-shot keys ignore repeats,
        // holdRepeat keys use their own interval below.
        if (e.repeat) return;
        if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;

        // if input focus, abort
        if (isInputFocused()) return;
        if (guard && !guard()) return;
        if (button.classList.contains('locked')) return;

        button.classList.add(scaleClass);

        action(e);

        // Hold-to-repeat ONLY for manual +/- (KeyZ/KeyX).
        // Run/Skip/Reset are toggles / one-shots — repeating them
        // toggles pause/resume rapidly and desyncs the runButton SVG.
        if (!holdRepeat) return;

        delayTimer = setTimeout(() => {
            repeatInterval = setInterval(() => {
                if (guard && !guard()) { stopPress(); return; }
                if (button.classList.contains('locked')) { stopPress(); return; }
                action(e);
            }, 50);
        }, 500);
    });

    document.addEventListener('keyup', e=>{
        if(e.code!==code) return;
        button.classList.remove(scaleClass);
        stopPress();
    });

    window.addEventListener('blur', ()=>{ button.classList.remove(scaleClass); stopPress(); });
    document.addEventListener('visibilitychange', ()=>{ button.classList.remove(scaleClass); stopPress(); });
}

