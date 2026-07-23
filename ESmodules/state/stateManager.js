import { state, TUMBLERS, speedState, SBSconfig } from "./state.js";

export function toReset() {
    // terminateWorker();  // TODO: убить текущий воркер
    // clearInterval(timer); // TODO: убить таймер вывода
    SBSconfig.visibleItems = [];
    Object.assign(state, {
        // REMAKE SOON!
    });
  }

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
