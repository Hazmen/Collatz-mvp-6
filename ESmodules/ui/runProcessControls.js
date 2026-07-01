import { runProcess_Elements, mainInputField } from "./uiElements.js";
import { getSpecificState, setStateValue } from "../state/state.js";



runProcess_Elements.runButton.addEventListener('click', () => {
    // THE PRE-CHECK LAYER 
    if (mainInputField.value === '' || !/^\d+$/.test(mainInputField.value)) {
        alert('Error! Your input contains unacceptable symbols!');
        // state.inputError = true;
    };

    // setting activeInputValue
    // activeInputValue = BigInt(mainInputField.value);
    setStateValue(activeInputValue, BigInt(mainInputField.value));

    // sending the active input value to Worker Manager
    workerManager_Recieve(getSpecificState('activeInputValue'));

    // Worker Manager is going to send our Input Value to Worker :D
});
