import { outputMode_EventTarget } from "../state/eventTargets.js";
import { runProcess_Elements, manualBtns_container } from "./uiElements.js";
import { state, SBSconfig } from "../state/state.js";
import { skipSBS, pauseSBS, resumeSBS } from "../core/SBSoutputManager.js";
import { setRunButtonMode } from "./playButtonSVG.js";

export function toogle_Controllers_Visibility(runButton_isVisible, skipButton_isVisible, manualButtons_isVisible) {
    const skipButton = runProcess_Elements.skipButton;
    const runButton = runProcess_Elements.runButton;
    const manualButtons = manualBtns_container;
    const nextButton = runProcess_Elements.nextButton;
    const backButton = runProcess_Elements.backButton;

    if (runButton_isVisible) runButton.classList.remove('hidden'); else runButton.classList.add('hidden');

    if (skipButton_isVisible) skipButton.classList.remove('locked'); else skipButton.classList.add('locked');

    if (manualButtons_isVisible) manualButtons.classList.remove('hidden'); else manualButtons.classList.add('hidden');

    // ------ MANUAL +/- BUTTON STATE (synced with container visibility) ------ \\
    // S0/S1 (hidden) -> not clickable; S2 (visible) -> clickable.
    // Safe for auto/instant: they always pass manualButtons_isVisible=false.
    if (nextButton) {
        if (manualButtons_isVisible) { nextButton.classList.remove('locked'); nextButton.disabled = false; }
        else { nextButton.classList.add('locked'); nextButton.disabled = true; }
    }
    if (backButton) {
        if (manualButtons_isVisible) { backButton.classList.remove('locked'); backButton.disabled = false; }
        else { backButton.classList.add('locked'); backButton.disabled = true; }
    }
}

let prevMode = state.outputMode;

// ------ REACT TO OUTPUT-MODE CHANGES ------ \\
outputMode_EventTarget.addEventListener('outputMode_change', (event) => {
    const mode = event.detail.selected_mode;

    // ------ VISIBILITY ------ \\
    if (mode === 'instant')
        toogle_Controllers_Visibility(true, false, false);
    else if (mode === 'auto') 
        toogle_Controllers_Visibility(true, true, false); 
    else if (mode === 'manual') {
        // ------ MANUAL STATE-MACHINE ENTRY: S0 (empty/computing) vs S2 (ready) ------ \\
        if (state.isComputing || state.workerResult.length === 0) {
            toogle_Controllers_Visibility(true, false, false);   /* S0/S1: only Run */
            if (!state.isComputing) {
                runProcess_Elements.runButton.disabled = false;  /* S0: Run enabled */
                setRunButtonMode(false);                         /* S0: Play icon */
            }
        } else {
            toogle_Controllers_Visibility(false, false, true);   /* S2: only +/- */
            runProcess_Elements.runButton.disabled = true;       /* S2: Run stays disabled */
        }
    }

    // ------ ACTIVE OUTPUT TRANSITIONS (single source of truth) ------ \\
    // Spec:
    //   SBS (Manual/Auto) --> Instant : skipSBS()
    //   Auto --> Manual (running)     : pause (transfer to user)
    //   Manual --> Auto (pending)     : resumeSBS() preserving currentStepIndex
    if ((prevMode === 'auto' || prevMode === 'manual') && mode === 'instant') {
        if (!SBSconfig.doneRunning && state.workerResult.length > 0) {
            skipSBS();
            setRunButtonMode(false);
        }
    } else if (prevMode === 'auto' && mode === 'manual') {
        if (SBSconfig.isRunning) {
            pauseSBS();
            setRunButtonMode(false);
        }
    } else if (prevMode === 'manual' && mode === 'auto') {
        const hasPending = state.workerResult.length > 0 && !SBSconfig.doneRunning && SBSconfig.currentStepIndex < state.workerResult.length;
        if (hasPending) {
            resumeSBS();
            setRunButtonMode(true);
        }
    }

    prevMode = mode;
});

