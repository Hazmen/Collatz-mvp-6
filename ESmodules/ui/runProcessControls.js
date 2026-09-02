import { runProcess_Elements, mainInputField } from "./uiElements.js";
import { getSpecificState, setStateValue } from "../state/stateManager.js";
import { workerManager_Recieve } from "../workers/workerManager.js";
import { setRunButtonMode } from "./playButtonSVG.js";
import { state, SBSconfig } from "../state/state.js";
import { pauseSBS, resumeSBS, skipSBS, SBSeventTarget, startSBS, addOneBatchSBS, removeOneBatchSBS } from "../core/SBSoutputManager.js";
import { resetOutputOnly, resetSession } from "../core/resetManager.js";
import { guard } from "./runProcessControls_guard.js";

// -------------- ENTRY POINT: WIRE UP ALL RUN/SKIP/RESET CONTROLS -------------- \\
export function RunSequenceCalc() {

    // ===================================================================== \\
    //  GUARDS (pre-cached checks for startRunProcess)                       \\
    // ===================================================================== \\
    // All guards come from runProcessControls_guard.js — single source
    // of truth for "can pause / resume / replay". Inside startRunProcess
    // they are cached at the top to avoid re-calling guard on every branch.

    // ===================================================================== \\
    //  CORE PROCESS FUNCTIONS (run / skip / reset / manual batch)           \\
    // ===================================================================== \\

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
            const hasPending = state.workerResult.length > 0 && !SBSconfig.doneRunning && SBSconfig.currentStepIndex < state.workerResult.length;
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
            setRunButtonMode(true);
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
        setRunButtonMode(false);
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

    // ------ RESET PROCESS ------ \\
    function resetProcess() {
        if (state.isComputing) return;                          /* don't reset while counting */
        setRunButtonMode(false);
        resetSession();                                         /* clear output and result */
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
    //  EVENT LISTENERS (all wiring in one place, after the functions)       \\
    // ===================================================================== \\

    // ------ RUN BUTTON + SPACE ------ \\
    runProcess_Elements.runButton.addEventListener('click', () => {
        startRunProcess();
    });
    document.addEventListener('keydown', (e) => {
        if (state.outputMode === 'manual') return;              /* manual ignores global Run */
        if (e.code === 'Space' && !e.repeat) { 
            e.preventDefault(); 
            startRunProcess(); 
        }
    });

    // ------ AUTO-RETURN BUTTON WHEN OUTPUT FINISHES ------ \\
    SBSeventTarget.addEventListener('sbs_done', () => {
        setRunButtonMode(false);                                /* back to "Run" when done */
    });

    // ------ SKIP BUTTON + F ------ \\
    runProcess_Elements.skipButton.addEventListener('click', () => {
        if (state.outputMode === 'instant') return;              /* manual ignores global Run */
        skipProcess();
    });
    document.addEventListener('keydown', (e) => {
        if (state.outputMode === 'instant') return;              /* manual ignores global Run */
        if (e.code === 'KeyF' && !e.repeat) skipProcess();
    });

    // ------ RESET BUTTON + R ------ \\
    runProcess_Elements.resetButton.addEventListener('click', resetProcess);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyR' && !e.repeat) resetProcess();
    });

    // ------ MANUAL: NEXT BATCH (+) + Z ------ \\
    runProcess_Elements.nextButton.addEventListener('click', startManualAddProcess);
    document.addEventListener('keydown', (e) => {
        if (state.outputMode !== 'manual') return;
        if (e.code === 'KeyZ' && !e.repeat) startManualAddProcess();
    });

    // ------ MANUAL: BACK BATCH (-) + X ------ \\
    runProcess_Elements.backButton.addEventListener('click', removeOneBatchProcess);
    document.addEventListener('keydown', (e) => {
        if (state.outputMode !== 'manual') return;
        if (e.code === 'KeyX' && !e.repeat) removeOneBatchProcess();
    });
}