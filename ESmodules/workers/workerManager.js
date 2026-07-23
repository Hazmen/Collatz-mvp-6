import { state, stateTarget } from "../state/state.js";
import * as ev from "../state/events.js"
import { setToogleSwitch } from "../state/stateManager.js";

const worker = new Worker(new URL('./collatz.worker.js', import.meta.url), { type: 'module' });

// getState();
// let tumbler = getToogleSwitch(collatz_received);

// runProcessControls.js uses the input value that it has and we send it to the worker so it does it's thing :)
export function workerManager_Recieve(inputValue) {
    worker.postMessage(inputValue);
};

worker.onmessage = (e) => {
    // receiving chunks
    if (e.data.type === 'chunk') {
        ev.sendCollatz_MainData(state, 'workerResult', e.data);
    }

    // it is done sending chunks, it sends the amount of steps the number got and the biggest number in sequence
    if (e.data.type === 'done') {

        // switch its assigned toogle switch to True
        setToogleSwitch('collatz_received', true);

        // new badass way to write all the data :DDDD
        ev.sendCollatz_SecondaryData( state, e.data.max, e.data.steps, stateTarget );
    }

    // getting to know that something went wrong (yeah of course it will) 
    if (e.data.type === 'error') {
        ev.sendCollatz_ErrorData( state, 'Something went wrong :(', stateTarget );
    }
};



