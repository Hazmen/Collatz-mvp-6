import { getSpecificState, getState, state } from "../state/state.js";

const worker = new Worker(new URL('./collatz.worker.js', import.meta.url), { type: 'module' });

// getState();


// runProcessControls.js uses the input value that it has and we send it to the worker so it does it's thing :)
export function workerManager_Recieve(inputValue) {
    worker.postMessage(inputValue);
};

worker.onmessage = (e) => {
    // receiving chunks
    if (e.data.type === 'chunk') {
        state.workerResult.push(...e.data.data);
    }

    // it is done sending chunks, it sends the amount of steps the number got and the biggest number in sequence
    if (e.data.type === 'done') {
        state.workerListLen = e.data.steps;
        state.workerMaxNum = e.data.max;
    }

    // getting to know that something went wrong (yeah off course it will) 
    if (e.data.type === 'error') {
        state.errorCause = 'Smth went wrong idk what';
    }
}