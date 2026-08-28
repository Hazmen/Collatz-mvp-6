import { outputMode_EventTarget } from "../../webComponents/outputModeController.js";
import { runProcess_Elements, manualBtns_container } from "./uiElements.js";

function toogle_Controllers_Visibility(runButton_isVisible, skipButton_isVisible, manualButtons_isVisible) {
    const skipButton = runProcess_Elements.skipButton;
    const runButton = runProcess_Elements.runButton;
    const manualButtons = manualBtns_container;

    if (runButton_isVisible) runButton.classList.remove('hidden'); else runButton.classList.add('hidden');

    if (skipButton_isVisible) skipButton.classList.remove('locked'); else skipButton.classList.add('locked');

    if (manualButtons_isVisible) manualButtons.classList.remove('hidden'); else manualButtons.classList.add('hidden');
}

// ------ REACT TO OUTPUT-MODE CHANGES ------ \\
outputMode_EventTarget.addEventListener('outputMode_change', (event) => {
    const mode = event.detail.selected_mode;        /* NOTE: original used undefined `selected_mode` */

    if (mode === 'instant')
        toogle_Controllers_Visibility(true, false, false);

    else if (mode === 'auto') 
        toogle_Controllers_Visibility(true, true, false); 

    else if (mode === 'manual') 
        toogle_Controllers_Visibility(false, true, true);
});