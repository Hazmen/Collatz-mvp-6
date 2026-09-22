import { runProcess_Elements, mainInputField } from "./uiElements.js";
import { getSpecificState, setStateValue } from "../state/stateManager.js";
import { workerManager_Recieve } from "../workers/workerManager.js";
import { setRunButtonMode, setRunLoading, clearRunLoading } from "./playButtonSVG.js";
import { state, SBSconfig } from "../state/state.js";
import { toogle_Controllers_Visibility } from "./outputModeController_Logic.js";
import { pauseSBS, resumeSBS, skipSBS, startSBS, addOneBatchSBS, removeOneBatchSBS } from "../core/SBSoutputManager.js";
import { SBSeventTarget } from "../state/eventTargets.js";
import { resetOutputOnly, resetSession } from "../core/resetManager.js";
import { guard } from "./runProcessControls_guard.js";
import { bindPress } from "./bindKeypressAnimation.js";
import { reset_EventTarget } from "../state/eventTargets.js";
import { sendReset_DoneEvent } from "../state/events.js";

// ------ MODULE: WIRE UP ALL RUN/SKIP/RESET CONTROLS ------ \\

// ------ CORE PROCESS FUNCTIONS ------ \\

// ------ MAIN RUN PROCESS (auto/instant) ------ \\
function startRunProcess() {
    
    // ------ CACHE GUARDS ------ \\
    const is_ValidInput = guard.validateInput();                 /* empty / non-digits -> invalid */
    const isNewInput_AfterDone = guard.isNewInput_AfterDone();  /* different number after done */

    const canReplay_SameInput = guard.canReplay_SameInput();     /* same number, already done */
    const can_Pause = guard.sbsAuto_canPause();                  /* SBS is ticking */
    const can_Resume = guard.sbsAuto_canResume();                /* paused with remainder */

    if (state.outputMode === 'manual') {
        // ------ MANUAL S0 -> S1: Run starts the computation ------ \\
        if (state.isComputing) return;                          /* S1: ignore while busy */
        if (state.workerResult.length > 0) return;              /* S2: hidden Run ignored */
        if (!is_ValidInput) {
            alert('Error! Your input must contain only numbers and cannot be empty!');
            return;
        }
        resetSession();                                         /* wipe previous data/DOM */
        setStateValue('activeInputValue', BigInt(mainInputField.value));
        workerManager_Recieve(getSpecificState('activeInputValue'));
        setRunLoading();                                        /* S1: ring-resize.svg + disabled */
        return;
    }              /* manual is otherwise driven by +/-, not Run */

    // ------ PRE-CHECK: VALIDATE INPUT ------ \\
    if (!is_ValidInput) {
        alert('Error! Your input must contain only numbers and cannot be empty!');
        /* ErrorWindowAppend(); <-- For the future */
        return;
    }

    // ------ GUARD: WORKER BUSY ------ \\
    if (state.isComputing) return;                          /* don't act while worker is busy */

    // ------ INSTANT: RUN DOUBLES AS SKIP ------ \\
    /* in instant only Run is visible — flush staged batches */
    if (state.outputMode === 'instant') {
        const hasPending = state.workerResult.length > 0 
            && !SBSconfig.doneRunning 
            && SBSconfig.currentStepIndex < state.workerResult.length;

        if (SBSconfig.isRunning || hasPending) {
            skipSBS();                                          /* flush running / pending batches */
            setRunButtonMode(false);
            return;
        }
        if (canReplay_SameInput) {
            resetOutputOnly();                                  /* clear stale output */
            skipSBS();                                          /* replay same number instantly */
            setRunButtonMode(false);
            return;
        }
        if (can_Resume) {
            skipSBS();                                          /* resume then flush */
            setRunButtonMode(false);
            return;
        }
    }

    // ------ TOGGLE OFF: PAUSE (auto only; instant handled above) ------ \\
    if (can_Pause) {
        pauseSBS();
        setRunButtonMode(false);
        return;
    }

    // ------ REPLAY SAME NUMBER / NEW NUMBER AFTER DONE ------ \\
    if (canReplay_SameInput) {
        resetOutputOnly();
        setRunButtonMode(true);
        startSBS();
        return;
    }

    if (isNewInput_AfterDone) {
        resetSession();                                         /* wipe old result for new number */
        setStateValue('activeInputValue', BigInt(mainInputField.value));
        workerManager_Recieve(getSpecificState('activeInputValue'));
        setRunLoading();                                        /* show computing state */
        return;
    }

    // ------ RESUME FROM PAUSE ------ \\
    if (can_Resume) {
        resumeSBS();                                        /* continue from last index */
        setRunButtonMode(true);
        return;
    }

    // ------ START NEW CALCULATION ------ \\
    resetSession();                                         /* wipe previous data/DOM */
    setStateValue('activeInputValue', BigInt(mainInputField.value)); /* store as BigInt */
    workerManager_Recieve(getSpecificState('activeInputValue'));     /* send to worker */
    setRunLoading();
}

// ------ SKIP PROCESS ------ \\
function skipProcess() {
    if (state.isComputing) return;                          /* don't skip while worker is busy */
    /* nothing to skip: never started, nothing shown, no data */
    if (!SBSconfig.isRunning && SBSconfig.currentStepIndex === 0 && !SBSconfig.doneRunning && state.workerResult.length === 0) return;

    if (state.outputMode === 'instant' && guard.canReplay_SameInput()) {
        resetOutputOnly();                                  /* clear output for replay */
        skipSBS();                                          /* show all at once */
        setRunButtonMode(false);
        return;
    }

    skipSBS();                                              /* show all remaining items at once */
    setRunButtonMode(false);
}

// ------ RESET PROCESS (LAZY) ------ \\
/* clears SBS output only; workerResult stays for instant replay — controller only, no UI */
export function resetProcess() {
    if (state.isComputing) return false;                    /* don't reset while counting */
    setRunButtonMode(false);
    resetOutputOnly();                                      /* clear output only, keep workerResult */
    return true;
}

// ------ HARD RESET (Shift+R) ------ \\
/* full wipe incl. workerResult — escape hatch — controller only, UI lives in hard-reset.js */
export function hardResetProcess() {
    if (state.isComputing) return false;                    /* still don't abort mid-compute */
    setRunButtonMode(false);
    resetSession();                                         /* clear output + workerResult/errorCause */
    if (state.outputMode === 'manual') {
        // ------ S2 -> S0: only HardReset returns Run ------ \\
        clearRunLoading();                                  /* drop spinner state, re-enable */
        setRunButtonMode(false);                            /* Play icon */
        toogle_Controllers_Visibility(true, false, false);  /* S0: only Run */
        if (runProcess_Elements.runButton) runProcess_Elements.runButton.disabled = false;
    }
    return true;
}

// ------ MANUAL: ADD ONE BATCH (doubles as Run in manual) ------ \\
function startManualAddProcess() {
    if (state.outputMode !== 'manual') return;                  /* manual only */
    if (state.isComputing || state.workerResult.length === 0) return; /* S0/S1: +/- ignored */

    if (!guard.validateInput()) {                               /* bad input -> abort */
        alert('Error! Your input must contain only numbers and cannot be empty!');
        return;
    }

    const inputMatchesActive = guard.getInputMatchesActive();   /* same number as last run? */
    const hasResult = state.workerResult.length > 0;            /* any computed result */

    // ------ START BRAND-NEW CALCULATION ------ \\
    if (!hasResult || !inputMatchesActive) {                    /* new number or first run */
        resetSession();                                         /* wipe old data */
        setStateValue('activeInputValue', BigInt(mainInputField.value));
        workerManager_Recieve(getSpecificState('activeInputValue'));
        toogle_Controllers_Visibility(true, false, false);      /* S1: only Run visible */
        setRunLoading();
        return;
    }

    // ------ REPLAY AFTER FINISH ------ \\
    if (SBSconfig.doneRunning) {
        resetOutputOnly();                                      /* clear output, keep result */
    }

    addOneBatchSBS();                                       /* show next batch manually */
}

// ------ MANUAL: REMOVE ONE BATCH ------ \\
function removeOneBatchProcess() {
    if (state.outputMode !== 'manual') return;                  /* manual only */
    if (state.isComputing || state.workerResult.length === 0) return; /* S0/S1: +/- ignored */
    removeOneBatchSBS();                                        /* hide last shown batch */
}

// ------ EVENT LISTENERS ------ \\

// ------ RUN BUTTON + SPACE ------ \\
runProcess_Elements.runButton.addEventListener('click', () => {
    startRunProcess();                                      /* click → main flow */
});
bindPress(runProcess_Elements.runButton, 'Space', startRunProcess, () => {
    if (state.outputMode !== 'manual') return true;             /* auto/instant: as before */
    return !state.isComputing && state.workerResult.length === 0; /* manual: Space only in S0 */
}, false); /* keyboard mirror */

// ------ AUTO-RETURN BUTTON WHEN OUTPUT FINISHES ------ \\
SBSeventTarget.addEventListener('sbs_done', () => {
    setRunButtonMode(false);                                /* back to "Run" when done */
});

// ------ SKIP BUTTON + F ------ \\
runProcess_Elements.skipButton.addEventListener('click', () => {
    if (state.outputMode === 'instant') return;             /* instant has no Skip */
    skipProcess();
});
bindPress(runProcess_Elements.skipButton, 'KeyF', skipProcess, () => state.outputMode !== 'instant', false);

// ------ RESET BUS: UI --request--> rPC --done--> UI ------ \\
/* hard-reset.js шлёт intent, здесь только исполнение + done. Кнопок тут нет. */
reset_EventTarget.addEventListener('reset_request', (e) => {
    const type = e?.detail?.type === 'hard' ? 'hard' : 'soft';
    const ok = type === 'hard' ? hardResetProcess() : resetProcess();
    if (ok) sendReset_DoneEvent(type, reset_EventTarget); /* toast только при успехе */
});

// ------ MANUAL: NEXT BATCH (+) + Z ------ \\
runProcess_Elements.nextButton.addEventListener('click', startManualAddProcess); /* + button */
bindPress(runProcess_Elements.nextButton, 'KeyZ', startManualAddProcess, () => state.outputMode === 'manual' && !state.isComputing && state.workerResult.length > 0, true); /* Z key */

// ------ MANUAL: BACK BATCH (-) + X ------ \\
runProcess_Elements.backButton.addEventListener('click', removeOneBatchProcess); /* - button */
bindPress(runProcess_Elements.backButton, 'KeyX', removeOneBatchProcess, () => state.outputMode === 'manual' && !state.isComputing && state.workerResult.length > 0, true); /* X key */