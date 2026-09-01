import { state, TUMBLERS, speedState, SBSconfig } from "./state.js";

// STATE 
export function getState() { return state; }
export function getSpecificState(obj) { return state[obj]; }

export function setState(patch) { Object.assign(state, patch); }
export function setStateValue(obj, value) { state[obj] = value; }

// TUMBLERS
export function getToogleSwitch(ts) { return TUMBLERS[ts].value; }
export function setToogleSwitch(ts, st) { return TUMBLERS[ts] = st; }
export function getAllToogles() { return TUMBLERS; }

// SPEED STATE
export function getSpeedState() { return speedState; }
export function setSpeedState(patch) { Object.assign(speedState, patch); }

// RESET for a new session
export function resetState() {
  const initialStateConfig = {
    activeInputValue: 0n,
    inputError: false,
    isComputing: false,
    hasResult: false,
    workerResult: [],
    workerListLen: 0,
    workerMaxNum: 0n,
    errorCause: null,
  };
  
  Object.assign(state, initialStateConfig);
}

export function resetSBS() {
  const initialSBSconfig = {
    currentStepIndex: 0,
    isRunning: false,
    doneRunning: false,
    visibleItems: [],
    visibleItemsLen: 0,
    currentMaxNum: 0n, 
    currentBatch: [],
    batchStartIndex: 0,
    batchEndIndex: 0,
    removeBatchStartIndex: 0,
    removeBatchEndIndex: 0,
  };

  Object.assign(SBSconfig, initialSBSconfig);
}
