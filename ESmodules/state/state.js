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

const CONSTANTS = {
    // stats that will not change (and may be used by multiple modules)
    // DELETE IF TURNS OUT TO BE USELESS!
}

export function toReset() { // reset State (like, a new session of computing)
    state = {
        status: 'idle', 
        activeInputValue: 0n,
        inputError: false,
        workerResult: [],
        workerListLen: 0,
        workerMaxNum: 0n,
        errorCause: null,
        // .. and so on
    }
}

export function getState() { return state; }
export function getSpecificState(obj) { return state[obj]; }

export function setState(patch) { Object.assign(state, patch); }
export function setStateValue(obj, value) { state[obj] = value; }