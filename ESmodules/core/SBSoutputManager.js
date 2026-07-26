import { state, stateTarget, speedState, SBSconfig } from "../state/state.js";
import { sendSBS_Data } from "../state/events.js";

// SBS = Step By Step 

const SBSeventTarget = new EventTarget();

export let currentBatch = []; // I decided to make it so even if batch size is 1, it still gets send as an array 
export let resumeSBS = null;

export function SBSoutput() {
    
    let visibleMax = SBSconfig.currentMaxNum; // this is the max number that is displayed right now, in the middle of the SBS process.
    let csi = SBSconfig.currentStepIndex;
    // const addedBatch = []; <-- might not be necessary due to currentBatch 
    
    
    const startSBS = () => {
        if (!SBSconfig.isRunning) return;
        
        const workerResultLen = state.workerListLen;
        const ms = speedState.intervalMs;
        const bs = speedState.batchSize;

        if (csi >= workerResultLen) {
            SBSconfig.isRunning = false;
            SBSconfig.doneRunning = true;
            return;
        }

        currentBatch = state.workerResult.slice(csi, csi + bs);
        // let currentNumber = state.workerResult[csi]; <-- might be the wrong way to do this
        let currentNumber = currentBatch[currentBatch.length - 1]; // get the last number in the batch
        
        if (currentNumber === undefined) {
            console.error('Index overflow:', csi);
            SBSconfig.isRunning = false;
            return;
        }

        SBSconfig.visibleItems.push(...currentBatch);
        // addedBatch.push(...currentBatch);

        // if (visibleMax === null || currentNumber > visibleMax) { // oh shoot, it only checks if the last number in the batch is 
        //     visibleMax = currentNumber;                          // greater than the current max, not all numbers in the batch.
        //     SBSconfig.currentyDisplayedMaxNum = visibleMax;      // I need to check all numbers in the batch to find the max（；´д｀）ゞ
        // }

        // const batchMax = Math.max(...currentBatch); <-- Doesn't work with BigInt
        for (let i = 0; i < currentBatch.length; i++) {
            if (visibleMax === 0n || currentBatch[i] > visibleMax) {
                visibleMax = currentBatch[i];
            }
        }

        
        csi = csi + currentBatch.length;
        
        SBSconfig.batchStartIndex = csi;
        SBSconfig.batchEndIndex = csi + currentBatch.length - 1;

        sendSBS_Data(SBSconfig, currentBatch, SBSeventTarget, SBSconfig.batchStartIndex, SBSconfig.batchEndIndex);

        setTimeout(() => {
            startSBS()
            const ms = speedState.intervalMs;
            const bs = speedState.batchSize;
            console.log('ITS WORKIIIINGGGG');
        }, ms);
    }

    resumeSBS = startSBS;

    stateTarget.addEventListener('collatz_done', () => {
        startSBS();
    });

};
