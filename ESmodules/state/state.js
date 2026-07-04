export const state = {
    // status: 'idle', // idle - untouched; computing - in process of adding new data; error - error; ready - modules are allowed to use data from there
    activeInputValue: 0n,
    inputError: false,
    workerResult: [],
    workerListLen: 0,
    workerMaxNum: 0n,
    errorCause: null,
    // .. and so on
}

export const stateTarget = new EventTarget();

const CONSTANTS = {
    // stats that will not change (and may be used by multiple modules)
    // DELETE IF TURNS OUT TO BE USELESS!
}

const TUMBLERS = {
    collatz_received: false,

    // ... and so on
}

export function toReset() { // reset State (like, a new session of computing)
    Object.assign(state, {
        status: 'idle', 
        activeInputValue: 0n,
        inputError: false,
        workerResult: [],
        workerListLen: 0,
        workerMaxNum: 0n,
        errorCause: null,
        // .. and so on
    });
}

export function getState() { return state; }
export function getSpecificState(obj) { return state[obj]; }

export function setState(patch) { Object.assign(state, patch); }
export function setStateValue(obj, value) { state[obj] = value; }

export function getToogleSwitch(ts) { return TUMBLERS[ts].value; }
export function setToogleSwitch(ts, st) { return TUMBLERS[ts] = st; }
export function getAllToogles() { return TUMBLERS; }

// Custom events that alert other modules that needed data is here
// stateTarget.addEventListener('collatz_ready', (event) => {
//     state.workerResult = event.detail.seq;
//     state.workerMaxNum = event.detail.max;
//     state.workerListLen = event.detail.len;

//     TUMBLERS.collatz_received = true;
// });

export function sendCollatz_MainData(data) {
    state.workerResult.push(...data.data);
};

export function sendCollatz_SecondaryData(max, length) {
    state.workerMaxNum = max;
    state.workerListLen = length;
};

export function sendCollatz_ErrorData(cause) {
    state.errorCause = cause;
}