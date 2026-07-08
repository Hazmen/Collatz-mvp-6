import { state, TUMBLERS, CONSTANTS, CALC_PARAMETERS } from "./state.js";

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
