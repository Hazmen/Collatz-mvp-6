import { getSpecificState, state, getToogleSwitch, stateTarget } from "../state/state.js";

const worker = new Worker(new URL('./collatz.worker.js', import.meta.url), { type: 'module' });

// getState();
let tumbler = getToogleSwitch(collatz_received);

// runProcessControls.js uses the input value that it has and we send it to the worker so it does it's thing :)
export function workerManager_Recieve(inputValue) {
    worker.postMessage(inputValue);
};

worker.onmessage = (e) => {
    // customEvents
    const CollatzData_Event = new CustomEvent('collatz_ready', {
        detail: {
            seq: [...e.data.data],
            max: e.data.max,
            len: e.data.steps,

            status: 'success'
        }
    });

    const CollatzError_Event = new CustomEvent('collatz_error', {
        detail: {
            seq: [],
            max: 0n,
            len: 0,
            status: 'error'
        }
    });

    // receiving chunks
    if (e.data.type === 'chunk') {
        state.workerResult.push(...e.data.data);
    }

    // it is done sending chunks, it sends the amount of steps the number got and the biggest number in sequence
    if (e.data.type === 'done') {
        state.workerListLen = e.data.steps;
        state.workerMaxNum = e.data.max;

        // switch its assigned toogle switch to True
        tumbler = true;

        stateTarget.dispatchEvent(CollatzData_Event);
    }

    // getting to know that something went wrong (yeah off course it will) 
    if (e.data.type === 'error') {
        stateTarget.dispatchEvent(CollatzError_Event);

        state.errorCause = 'Smth went wrong idk what';
    }
};



