import { sendSBS_ClearEvent } from '../state/events.js'
import { resetSBS } from '../state/stateManager.js';
import { setRunButtonMode } from '../ui/playButtonSVG.js';

export const outputTarget = new EventTarget();

export function resetOutputSession() {
    resetSBS();
    sendSBS_ClearEvent(outputTarget);
    setRunButtonMode(false);
}