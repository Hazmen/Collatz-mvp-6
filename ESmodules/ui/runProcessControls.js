import { runProcess_Elements, mainInputField } from "./uiElements.js";
import { getSpecificState, setStateValue } from "../state/stateManager.js";
import { workerManager_Recieve } from "../workers/workerManager.js";
import { PlayOrPause } from "./playButtonSVG.js";

export function RunSequenceCalc() {
    runProcess_Elements.runButton.addEventListener('click', () => {
        // THE PRE-CHECK LAYER 
        if (mainInputField.value === '' || !/^\d+$/.test(mainInputField.value)) {
            alert('Error! Your input contains unacceptable symbols!');
            //  For the future -> ErrorWindowAppend();
            return; // exit the function if input is invalid
        } 
        // IF THE INPUT IS VALID, THEN PROCEED WITH THE FOLLOWING LOGIC
        else {
            // setting activeInputValue
            setStateValue('activeInputValue', BigInt(mainInputField.value));
    
            // sending the active input value to Worker Manager
            workerManager_Recieve(getSpecificState('activeInputValue'));
    
            // Worker Manager is going to send our Input Value to Worker :D    
    
            // Play Pause change
            PlayOrPause();
        }

    });
}