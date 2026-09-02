import { outputMode_EventTarget } from "../../webComponents/outputModeController.js";
import { runProcess_Elements, manualBtns_container } from "./uiElements.js";
import { state, SBSconfig } from "../state/state.js";
import { skipSBS, pauseSBS, resumeSBS } from "../core/SBSoutputManager.js";
import { setRunButtonMode } from "./playButtonSVG.js";

function toogle_Controllers_Visibility(runButton_isVisible, skipButton_isVisible, manualButtons_isVisible) {
    const skipButton = runProcess_Elements.skipButton;
    const runButton = runProcess_Elements.runButton;
    const manualButtons = manualBtns_container;

    if (runButton_isVisible) runButton.classList.remove('hidden'); else runButton.classList.add('hidden');

    if (skipButton_isVisible) skipButton.classList.remove('locked'); else skipButton.classList.add('locked');

    if (manualButtons_isVisible) manualButtons.classList.remove('hidden'); else manualButtons.classList.add('hidden');
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
    else if (mode === 'manual') 
        toogle_Controllers_Visibility(false, true, true);

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