import { runProcess_Elements, mainInputField } from "./uiElements.js";
import { getSpecificState, setStateValue } from "../state/stateManager.js";
import { workerManager_Recieve } from "../workers/workerManager.js";
import { setRunButtonMode, setRunLoading } from "./playButtonSVG.js";
import { state, SBSconfig } from "../state/state.js";
import { pauseSBS, resumeSBS, skipSBS, SBSeventTarget, startSBS, addOneBatchSBS, removeOneBatchSBS } from "../core/SBSoutputManager.js";
import { resetOutputOnly, resetSession } from "../core/resetManager.js";
import { guard } from "./runProcessControls_guard.js";
import { bindPress } from "./bindKeypressAnimation.js";

// -------------- ENTRY POINT: WIRE UP ALL RUN/SKIP/RESET CONTROLS -------------- \\
export function RunSequenceCalc() {

    // ===================================================================== \\
    //  GUARDS (pre-cached checks for startRunProcess)                        ||
    // ===================================================================== //
    // All guards come from runProcessControls_guard.js — single source
    // of truth for "can pause / resume / replay". Inside startRunProcess
    // they are cached at the top to avoid re-calling guard on every branch.

    // ===================================================================== \\
    //  CORE PROCESS FUNCTIONS (run / skip / reset / manual batch)            ||
    // ===================================================================== //

    // ------ MAIN RUN PROCESS (auto/instant) ------ \\
    function startRunProcess() {

        // ------ CACHE GUARDS ------ \\
        const inputMatchesActive = guard.getInputMatchesActive();
        const is_ValidInput = guard.validateInput();
        const isNewInput_AfterDone = guard.isNewInput_AfterDone();

        const canReplay_SameInput = guard.canReplay_SameInput();
        const can_Pause = guard.sbsAuto_canPause();
        const can_Resume = guard.sbsAuto_canResume();

        if (state.outputMode === 'manual') return;              /* manual is driven by +/-, not Run */

        // ------ PRE-CHECK: VALIDATE INPUT ------ \\
        if (!is_ValidInput) {
            alert('Error! Your input must contain only numbers and cannot be empty!');
            /* ErrorWindowAppend(); <-- For the future */
            return;
        }

        // ------ GUARD: WORKER BUSY ------ \\
        if (state.isComputing) return;                          /* don't act while worker is busy */

        // ------ INSTANT: Run doubles as Skip when output is active ------ \\
        // In instant the only visible run control is Run. If a computation
        // is staged (running or paused with pending batches) Run must flush it.
        if (state.outputMode === 'instant') {
            const hasPending = state.workerResult.length > 0 
                && !SBSconfig.doneRunning 
                && SBSconfig.currentStepIndex < state.workerResult.length;

            if (SBSconfig.isRunning || hasPending) {
                skipSBS();
                setRunButtonMode(false);
                return;
            }
            if (canReplay_SameInput) {
                resetOutputOnly();
                skipSBS();
                setRunButtonMode(false);
                return;
            }
            if (can_Resume) {
                skipSBS();
                setRunButtonMode(false);
                return;
            }
        }

        // ------ TOGGLE OFF: PAUSE (auto only; instant handled above) ------ \\
        if (can_Pause) {
            pauseSBS();                                         /* pause the SBS output */
            setRunButtonMode(false);
            return;
        }

        // ------ REPLAY SAME NUMBER / NEW NUMBER AFTER DONE ------ \\
        if (canReplay_SameInput) {
            resetOutputOnly();                                  /* clear output, keep result */
            setRunButtonMode(true);
            startSBS();
            return;
        }

        if (isNewInput_AfterDone) {
            resetSession();
            setStateValue('activeInputValue', BigInt(mainInputField.value));
            workerManager_Recieve(getSpecificState('activeInputValue'));
            setRunLoading();
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

    // ------ RESET PROCESS (lazy session reset) ------ \\
    // Reset clears only SBS output (SBSconfig + DOM via sbs_clear).
    // workerResult / activeInputValue / hasResult stay alive so the
    // same number can be replayed instantly via resumeSBS/skipSBS.
    // Full session wipe (resetState) is deferred until the next Run
    // with a DIFFERENT number — the startRunProcess/startManualAddProcess
    // branches that already call resetSession() before workerManager_Recieve().
    function resetProcess() {
        if (state.isComputing) return;                          /* don't reset while counting */
        setRunButtonMode(false);
        resetOutputOnly();                                      /* clear output only, keep workerResult */
    }

    // ------ HARD RESET (Shift+R) — full session wipe ------ \\
    // Escape hatch for corrupted cache / worker error / forced recompute
    // of the SAME number. Also clears stuck isComputing from error path.
    function hardResetProcess() {
        if (state.isComputing) return;                          /* still don't abort mid-compute */
        setRunButtonMode(false);
        resetSession();                                         /* clear output + workerResult/errorCause */
    }

    // ------ MANUAL: ADD ONE BATCH (doubles as Run in manual) ------ \\
    function startManualAddProcess() {
        if (state.outputMode !== 'manual') return;
        if (state.isComputing) return;

        if (!guard.validateInput()) {
            alert('Error! Your input must contain only numbers and cannot be empty!');
            return;
        }

        const inputMatchesActive = guard.getInputMatchesActive();
        const hasResult = state.workerResult.length > 0;

        // ------ START BRAND-NEW CALCULATION ------ \\
        if (!hasResult || !inputMatchesActive) {
            resetSession();
            setStateValue('activeInputValue', BigInt(mainInputField.value));
            workerManager_Recieve(getSpecificState('activeInputValue'));
            setRunLoading();
            return;
        }

        // ------ REPLAY AFTER FINISH: CLEAR OUTPUT THEN SHOW FIRST BATCH ------ \\
        if (SBSconfig.doneRunning) {
            resetOutputOnly();
        }

        addOneBatchSBS();                                       /* show next batch manually */
    }

    // ------ MANUAL: REMOVE ONE BATCH ------ \\
    function removeOneBatchProcess() {
        if (state.outputMode !== 'manual') return;
        removeOneBatchSBS();                                    /* hide last shown batch */
    }

    // ===================================================================== \\
    //  EVENT LISTENERS (all wiring in one place, after the functions)        ||
    // ===================================================================== //

    // ------ RUN BUTTON + SPACE ------ \\
    runProcess_Elements.runButton.addEventListener('click', () => {
        startRunProcess();
    });
    bindPress(runProcess_Elements.runButton, 'Space', startRunProcess, () => state.outputMode !== 'manual', false);

    // ------ AUTO-RETURN BUTTON WHEN OUTPUT FINISHES ------ \\
    SBSeventTarget.addEventListener('sbs_done', () => {
        setRunButtonMode(false);                                /* back to "Run" when done */
    });

    // ------ SKIP BUTTON + F ------ \\
    runProcess_Elements.skipButton.addEventListener('click', () => {
        if (state.outputMode === 'instant') return;
        skipProcess();
    });
    bindPress(runProcess_Elements.skipButton, 'KeyF', skipProcess, () => state.outputMode !== 'instant', false);

    // ------ RESET BUTTON + R / Shift+R ------ \\
    // Click: soft reset; Shift+click: hard reset (full session)
    runProcess_Elements.resetButton.addEventListener('click', (e) => {
        if (e.shiftKey) hardResetProcess();
        else resetProcess();
    });
    bindPress(runProcess_Elements.resetButton, 'KeyR', resetProcess, null, false);
    // Shift+R is ignored by bindPress (it bails on any modifier, see bindKeypressAnimation.js:29),
    // so we wire it separately. No holdRepeat — one-shot hard wipe.
    document.addEventListener('keydown', (e) => {
        if (e.code !== 'KeyR') return;
        if (!e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
        if (e.repeat) return;
        const el = document.activeElement;
        if (el && (el.matches('input,textarea,[contenteditable]') || el.tagName === 'INPUT')) return;
        if (runProcess_Elements.resetButton.classList.contains('locked')) return;
        e.preventDefault();
        // tiny press animation parity with bindPress
        runProcess_Elements.resetButton.classList.add('is-pressed');
        setTimeout(() => runProcess_Elements.resetButton.classList.remove('is-pressed'), 120);
        hardResetProcess();
    });

    // ------ MANUAL: NEXT BATCH (+) + Z ------ \\
    runProcess_Elements.nextButton.addEventListener('click', startManualAddProcess);
    bindPress(runProcess_Elements.nextButton, 'KeyZ', startManualAddProcess, () => state.outputMode === 'manual', true);

    // ------ MANUAL: BACK BATCH (-) + X ------ \\
    runProcess_Elements.backButton.addEventListener('click', removeOneBatchProcess);
    bindPress(runProcess_Elements.backButton, 'KeyX', removeOneBatchProcess, () => state.outputMode === 'manual', true);
}