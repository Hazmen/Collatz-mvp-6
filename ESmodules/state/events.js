import { stateTarget, state, TUMBLERS } from "./state.js";

export function sendCollatz_MainData(item, st, data) {
    item.st.push(...data.data);
};

export function sendCollatz_SecondaryData(item, max, length, target) {
    item.workerMaxNum = max;
    item.workerListLen = length;

    const CollatzData_DoneEvent = new CustomEvent('collatz_done', {
        detail: {
            status: 'done'
        }
    });

    target.dispatchEvent(CollatzData_DoneEvent);
};

export function sendCollatz_ErrorData(item, cause, target) {
    item.errorCause = cause;

    const CollatzData_ErrorEvent = new CustomEvent('collatz_error', {
        detail: {
            status: 'error'
        }
    });
    
    target.dispatchEvent(CollatzData_ErrorEvent);
};