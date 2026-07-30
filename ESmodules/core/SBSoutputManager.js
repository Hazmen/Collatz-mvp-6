import { state, stateTarget, speedState, SBSconfig } from "../state/state.js";
import { sendSBS_Data, sendSBS_DoneEvent, sendSBS_ClearEvent, sendSBS_SkipEvent } from "../state/events.js";
import { resetSBS } from "../state/stateManager.js";

// SBS = Step By Step 

export const SBSeventTarget = new EventTarget();

export let currentBatch = []; // I decided to make it so even if batch size is 1, it still gets send as an array

let timerId = null;

// ------ EASY SWITCH FOR isRunning & doneRunning ------ \\
function switchRunning(ans) {  SBSconfig.isRunning = ans === true; }

function Is_Done_Running(is, done) {
    SBSconfig.isRunning = is;
    SBSconfig.doneRunning = done;
}

// ------ FINISH & CLEAR ------ \\
export function clearSBSTimer() {
    if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
    }
}

export function finishSBS() {
    clearSBSTimer();
    Is_Done_Running(false, true);
    sendSBS_DoneEvent(SBSeventTarget);
}

// ------ SKIP ALL REMAINING ------ \\
export function skipSBS() {
    if (SBSconfig.doneRunning) return;

    pauseSBS();
    switchRunning(false);

    const workerResultLen = state.workerResult.length; 
    // const startIndex = SBSconfig.currentStepIndex;

    currentBatch = state.workerResult.slice(SBSconfig.currentStepIndex, SBSconfig.currentStepIndex + workerResultLen);
    SBSconfig.visibleItems.push(...currentBatch);

    SBSconfig.currentMaxNum = state.workerMaxNum;

    // const endIndex = startIndex + currentBatch.length - 1;
    // SBSconfig.currentStepIndex = startIndex + currentBatch.length;

    sendSBS_SkipEvent(SBSeventTarget, currentBatch);

    finishSBS();
}

// ------ PAUSE & RESUME ------ \\
export function resumeSBS() {
    if (SBSconfig.doneRunning) return;
    if (state.workerResult.length === 0) return;

    clearSBSTimer();
    switchRunning(false);
    runSBSTick();
}

export function pauseSBS() {
    switchRunning(false);
    clearSBSTimer();
}

// ------ START ------ \\
export function startSBS() {
    clearSBSTimer();
    resetSBS();
    Is_Done_Running(true, false);
    runSBSTick();
}

// ------ ONE TICK ------ \\
function runSBSTick() {

    // ------ GUARD: STOP IF PAUSED ------ \\
    if (!SBSconfig.isRunning) return;

    // ------ PREPARE TICK DATA ------ \\
    const workerResultLen = state.workerResult.length;                   
    const batchSize = Math.max(1, Number(speedState.batchSize) || 1);    /* guard against 0/NaN */
    const startIndex = SBSconfig.currentStepIndex;

    // ------ EXIT IF ALL DATA PROCESSED ------ \\
    if (startIndex >= workerResultLen) { finishSBS(); return; }

    // ------ SLICE CURRENT BATCH ------ \\
    currentBatch = state.workerResult.slice(startIndex, startIndex + batchSize);
    if (currentBatch.length === 0) { finishSBS(); return; }             /* empty slice = done */

    // ------ RENDER BATCH ------ \\
    SBSconfig.visibleItems.push(...currentBatch);

    // ------ TRACK MAXIMUM VALUE ------ \\
    for (let i = 0; i < currentBatch.length; i++) {                      
        if (SBSconfig.currentMaxNum === 0n || currentBatch[i] > SBSconfig.currentMaxNum) {
            SBSconfig.currentMaxNum = currentBatch[i];
        }
    }  

    // ------ UPDATE STEP INDEX ------ \\
    const endIndex = startIndex + currentBatch.length - 1;
    SBSconfig.currentStepIndex = startIndex + currentBatch.length;       /* move forward */

    // ------ DISPATCH DATA TO UI ------ \\
    sendSBS_Data(SBSconfig, currentBatch, startIndex, endIndex); /* this is Data of ONE current tick */

    // ------ EXIT IF THIS WAS THE LAST BATCH ------ \\
    if (SBSconfig.currentStepIndex >= workerResultLen) { finishSBS(); return; }

    // ------ SCHEDULE NEXT TICK ------ \\
    const interValMs = Math.max(0, Number(speedState.intervalMs) || 0);
    timerId = setTimeout(() => {
        timerId = null;
        runSBSTick();
    }, intervalMs);
}


