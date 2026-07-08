export const state = {
    // status: 'idle', // idle - untouched; computing - in process of adding new data; error - error; ready - modules are allowed to use data from there
    activeInputValue: 0n,
    inputError: false,
    workerResult: [],
    workerListLen: 0,
    workerMaxNum: 0n,
    errorCause: null,
    // .. and so on
}

export const stateTarget = new EventTarget();

const CONSTANTS = {
    // data that will not change (and may be used by multiple modules)
    // DELETE IF TURNS OUT TO BE USELESS!
}

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
export const CALC_PARAMETERS = { // dflt = default
    ifEven: dflt, /* n : 2 */
    ifOdd: dflt   /* n × 3 + 1 */
}


const TUMBLERS = {
    collatz_received: false,

    // ... and so on
}




