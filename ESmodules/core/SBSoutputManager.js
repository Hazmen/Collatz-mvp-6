import { state, stateTarget, speedState, SBSconfig } from "../state/state.js";
import { sendSBS_Data, sendSBS_DoneEvent, sendSBS_DataRemoveEvent } from "../state/events.js";
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

    // ------ GUARD: ALREADY DONE ------ \\
    if (SBSconfig.doneRunning) return;                          /* nothing to skip if already finished */

    // ------ PAUSE TICK LOOP FIRST ------ \\
    pauseSBS();                                                 /* stop the timer before jumping to the end */

    // ------ PREPARE SKIP DATA ------ \\
    const workerResultLen = state.workerResult.length;
    const startIndex = SBSconfig.currentStepIndex;              /* first not-yet-shown index */

    // ------ EXIT IF NOTHING LEFT TO SHOW ------ \\
    if (startIndex >= workerResultLen) { finishSBS(); return; } /* everything already rendered */

    // ------ TAKE ALL REMAINING ITEMS IN ONE BATCH ------ \\
    currentBatch = state.workerResult.slice(startIndex);        /* from current position to the end */
    SBSconfig.visibleItems.push(...currentBatch);               /* show them all at once */

    // ------ SET Visible Items Length ------ \\
    SBSconfig.visibleItemsLen = state.workerListLen;

    // ------ TRACK MAXIMUM VALUE ------ \\
    SBSconfig.currentMaxNum = state.workerMaxNum;               /* max is already known from worker */

    // ------ UPDATE STEP INDEX ------ \\
    const endIndex = workerResultLen - 1;
    SBSconfig.currentStepIndex = workerResultLen;               /* invariant: shown == length */

    // ------ DISPATCH SKIP DATA TO UI ------ \\
    sendSBS_Data(SBSconfig, currentBatch, SBSeventTarget, startIndex, endIndex); /* this is Data of ONE current tick */

    finishSBS();                                                /* mark done and notify the UI */
}

// ------ MANUAL STEP: RENDER ONE MORE BATCH ------ \\
export function addOneBatchSBS() {

    // ------ PREPARE BATCH DATA ------ \\
    const workerResultLen = state.workerResult.length;
    const batchSize = Math.max(1, Number(speedState.batchSize) || 1);    /* guard against 0/NaN */
    const startIndex = SBSconfig.currentStepIndex;                       /* first not-yet-shown index */

    // ------ GUARD: NOTHING LEFT ------ \\
    if (startIndex >= workerResultLen) { finishSBS(); return; }          /* all data already shown */

    // ------ SLICE NEXT BATCH ------ \\
    currentBatch = state.workerResult.slice(startIndex, startIndex + batchSize); /* up to batchSize items */

    // ------ RENDER BATCH ------ \\
    SBSconfig.visibleItems.push(...currentBatch);                        /* append to visible list */

    // ------ SET VISIBLE ITEMS LENGTH ------ \\
    SBSconfig.visibleItemsLen = SBSconfig.visibleItems.length;           /* keep length in sync */

    // ------ TRACK MAXIMUM VALUE ------ \\
    for (let i = 0; i < currentBatch.length; i++) {
        if (SBSconfig.currentMaxNum === 0n || currentBatch[i] > SBSconfig.currentMaxNum) {
            SBSconfig.currentMaxNum = currentBatch[i];                  /* update running max */
        }
    }

    // ------ UPDATE STEP INDEX ------ \\
    const endIndex = startIndex + currentBatch.length - 1;
    SBSconfig.currentStepIndex = startIndex + currentBatch.length;       /* move pointer forward */

    // ------ DISPATCH DATA TO UI ------ \\
    sendSBS_Data(SBSconfig, currentBatch, SBSeventTarget, startIndex, endIndex); /* this is Data of ONE current tick */

    // ------ FINISH IF THIS WAS THE LAST BATCH ------ \\
    if (SBSconfig.currentStepIndex >= workerResultLen) {
        finishSBS();                                                     /* mark done and notify UI */
        return;
    }
}

// ------ MANUAL STEP: REMOVE ONE BATCH ------ \\
export function removeOneBatchSBS() {

    // ------ GUARD: NOTHING TO REMOVE ------ \\
    if (SBSconfig.visibleItems.length === 0 || SBSconfig.currentStepIndex <= 0) return; /* empty or at start */
    if (SBSconfig.doneRunning) SBSconfig.doneRunning = false;            /* going back means not done anymore */

    // ------ CALC HOW MUCH TO REMOVE ------ \\
    const batchSize = Math.max(1, Number(speedState.batchSize) || 1);    /* guard against 0/NaN */
    const howMuchToRemove = Math.min(batchSize, SBSconfig.visibleItems.length); /* don't overshoot */

    // ------ CALC REMOVED RANGE ------ \\
    const startIndex = SBSconfig.currentStepIndex - howMuchToRemove;     /* first removed (0-based) */
    const endIndex = SBSconfig.currentStepIndex - 1;                     /* last removed */

    // ------ TAKE AND CUT ------ \\
    currentBatch = SBSconfig.visibleItems.slice(startIndex, endIndex + 1); /* snapshot before cutting */
    SBSconfig.visibleItems.splice(startIndex, howMuchToRemove);            /* remove from visible list */

    // ------ UPDATE LENGTH ------ \\
    SBSconfig.visibleItemsLen = SBSconfig.visibleItems.length;           /* keep length in sync */

    // ------ RECALC MAXIMUM ------ \\
    SBSconfig.currentMaxNum = (SBSconfig.visibleItems.length === 0)
        ? 0n                                                             /* nothing left -> reset */
        : SBSconfig.visibleItems.reduce((a, b) => a > b ? a : b);       /* scan remainder for max */

    // ------ UPDATE STEP INDEX ------ \\
    SBSconfig.currentStepIndex = startIndex;                             /* shown == startIndex again */

    // ------ DISPATCH REMOVE TO UI ------ \\
    sendSBS_DataRemoveEvent(SBSconfig, SBSeventTarget, startIndex, endIndex);
}



// ------ PAUSE & RESUME ------ \\
export function resumeSBS() {
    if (SBSconfig.doneRunning) return;
    if (state.workerResult.length === 0) return;

    clearSBSTimer();
    switchRunning(true);
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

// ------ ENTRY POINT: connect worker completion to SBS start ------ \\
export function SBSoutput() {
    stateTarget.addEventListener('collatz_done', () => {
        startSBS();
    });
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

    // ------ SET Visible Items Length ------ \\
    SBSconfig.visibleItemsLen = SBSconfig.visibleItems.length;

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
    sendSBS_Data(SBSconfig, currentBatch, SBSeventTarget, startIndex, endIndex); /* this is Data of ONE current tick */

    // ------ EXIT IF THIS WAS THE LAST BATCH ------ \\
    if (SBSconfig.currentStepIndex >= workerResultLen) { finishSBS(); return; }

    // ------ SCHEDULE NEXT TICK ------ \\
    const intervalMs = Math.max(0, Number(speedState.intervalMs) || 0);
    timerId = setTimeout(() => {
        timerId = null;
        runSBSTick();
    }, intervalMs);
}



