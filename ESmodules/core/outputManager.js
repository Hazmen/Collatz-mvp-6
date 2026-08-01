import { state, SBSconfig } from '../state/state.js';

// Функции сброса сессии (resetSession, resetOutputOnly, resetState, resetSBS)
// переехали в единый файл: ./resetManager.js

export const outputManagerEvTarget = new EventTarget();

export function canReset() {
    return !state.isComputing;
}

export function canResume() {
    return state.hasResult && !SBSconfig.doneRunning && SBSconfig.currentStepIndex < state.workerResult.length;
}
