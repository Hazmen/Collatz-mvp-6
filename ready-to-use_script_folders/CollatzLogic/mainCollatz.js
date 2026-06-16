let inpValue = 0n // empty at first

// ===== DOM helpers =====


// workers
const CollatzWorker = new Worker("CollatzLogic/workers/collatz.worker.js");

// DOM things
let usinp = $('.number-input');
const inp = BigInt(usinp.value);

const RunProc = $('.proc-run');
const ResProc = $('.proc-reset');
const SkipProc = $('.proc-skip');

usinp.addEventListener('beforeinput', (e) => {
    if (e.data && !/^[0-9]+$/.test(e.data)) {
        e.preventDefault();
    }
});

// DOING SHIT WITH WORKER

RunProc.addEventListener('click', () => {
    if (usinp.value.trim() == '') {
        alert('Cant run Collatz with no number, dumbass')
    }
    else {
        CollatzWorker.postMessage(inp);
        alert("Done.")
    }
});

let fullList = []; // this is so i can restore (or recollect) the full list "List" from Worker that is being sent by chunks

// receiving our boys- i mean data from collatz worker (list (chunks), amount of steps and the biggest number)

let seqMaxNum = '';
let seqLength = '';

CollatzWorker.onmessage = (e) => {
    if (e.data.type === "chunk") {
        fullList.push(...e.data.data) // The ... (spread) operator expands this array into individual elements (so the list contains only numbers and not another lists with numbers)
    } else {
        if (e.data.type === "done") {
            seqMaxNum = e.data.max;
            seqLength = e.data.steps + 1;

            // filtering or doing smth with recieved data just in case
            let seqMaxNumString = (seqMaxNum).toString();
            let seqLengthString = (seqLength).toString();
        }
    };
}



// forget about this, its a test onmessage thing
// CollatzWorker.onmessage = (e) => {
//     colResult = e.data;

//     console.log(colResult)
// }




