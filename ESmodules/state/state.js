export const state = {
    activeInputValue: 0n,
    inputError: false,

    outputMode: 'instant',

    isComputing: false,
    hasResult: false,
    workerResult: [],
    workerListLen: 0,
    workerMaxNum: 0n,

    errorCause: null,
    // ... and so on
}

export const stateTarget = new EventTarget();

export const speedState = {
    intervalMs: 0,
    batchSize: 1,
};

export const SBSconfig = {
    currentStepIndex: 0,

    isRunning: false,
    doneRunning: false,

    visibleItems: [],
    visibleItemsLen: 0,

    currentMaxNum: 0n, // the biggest num from displayed ones
    currentBatch: [],

    batchStartIndex: 0,
    batchEndIndex: 0,
    // ... and so on
};

/*
This object will be necessary when
i will want to allow users to
change the basic sequence acts 
default are 3n+1 & n/2 
but people will be able to change this
               AS 
              THEY 
              WISH 
*/ 
// export const CALC_PARAMETERS = { // dflt = default
//     ifEven: dflt, /* n : 2 */
//     ifOdd: dflt,   /* n × 3 + 1 */
// }


export const TUMBLERS = {
    collatz_received: false,
    
    // ... and so on
}

export const STATISTICS = {
    
}

export const SBS_STATISTICS = {

}



