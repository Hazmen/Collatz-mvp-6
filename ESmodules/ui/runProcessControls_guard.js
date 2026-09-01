import { state, SBSconfig } from "../state/state.js";
import { mainInputField } from "./uiElements.js";

function validateInput() {
    return /^\d+$/.test(mainInputField.value);
}

function getInputMatchesActive() {
    try {
        return BigInt(mainInputField.value) === state.activeInputValue;
    } catch {
        return false;
    }
}

function sbsAuto_canPause() {
    return SBSconfig.isRunning === true;
}

function sbsAuto_canResume() {
    const hasResult = state.workerResult.length > 0;
    const canResume = hasResult &&
        !SBSconfig.doneRunning &&
        SBSconfig.currentStepIndex < state.workerResult.length;

    return getInputMatchesActive() && canResume;
}

function canReplay_SameInput() {
    return getInputMatchesActive() && SBSconfig.doneRunning === true;
}

function isNewInput_AfterDone() {
    return !getInputMatchesActive() && SBSconfig.doneRunning === true;
}

export const guard = {
    validateInput,
    sbsAuto_canPause,
    canReplay_SameInput,
    isNewInput_AfterDone,
    sbsAuto_canResume,
    getInputMatchesActive
};
