import * as st from '../../state/state.js';

// ALL the logic for the statistics calculations is here, in this file

// ===== TABLE OF CONTENTS ===== //
// HELPERS:        getData, getVisibleTotalSteps, getCurrentMaxNum
// ABSOLUTE:       getAllEvenNums, getAllOddNums, getMaxNumsStep, getFirstDropStep,
//                 getCountOfRecordBreaks, getCountOfLocalMaximas, getCountOfLocalMinimas,
//                 getCountOfMonotoneSegments
// TRAJECTORY:     getEoverO, getGrowthProduct, getAverageMultiplerPerStep, getAreaUnderCurve
// TAIL & SHARE:   getStepsFromMaxTo1, getShareAboveStart
// BINARY:         v2, getTotalV2, getMode4Breakdown, getBitShiftToPeak, getHeavyStepsCount
// RATIOS:         getOvershoot, PeakToStartAndStepsRatio
// DISTRIBUTION:   getMean, getMedian, getLogStd, getAveragePercentile

// ===================================================================== \\
//  HELPERS & DIRECT ACCESSORS                                           \\
// ===================================================================== \\
// Raw reads from shared state — no iteration, no heavy math.

// ------ Get the full sequence array ------ \\
export function getData() {
    return st.state.workerResult;           /* the whole Collatz path, from start to 1 */
}

// ------ Count of items currently shown in the UI ------ \\
export function getVisibleTotalSteps() {
    return st.SBSconfig.visibleItemsLen;    /* how many rows the UI has rendered so far */
}

// ------ Current running maximum displayed ------ \\
export function getCurrentMaxNum() {
    return st.SBSconfig.currentMaxNum;      /* biggest value out of the shown ones */
}

// ===================================================================== \\
//  ABSOLUTE COUNTERS (over the whole path)                               //
// ===================================================================== //
// One-pass counts and positions computed by walking `workerResult`.

// ------ Shared single-pass E/O counter (over transitions, not items) ------ //
// Diagnostics of step i is the parity of data[i]; the final element (1) is not a step.
function countEOverO() {
    const data = getData();

    let E = 0;   /* halving steps */
    let O = 0;   /* tripling steps */

    for (let i = 0; i < data.length - 1; i++) {
        if ((data[i] & 1n) === 0n) E++;   /* bitwise AND 0 -> lowest bit clear -> even */
        else O++;                          /* lowest bit set -> odd */
    }

    return { E, O };
}

// ------ Count number of even (halving) steps ------ //
export function getAllEvenNums() {
    return countEOverO().E;
}

// ------ Count number of odd (tripling) steps ------ //
export function getAllOddNums() {
    return countEOverO().O;
}

// ------ Index of the step where the peak occurs ------ //
export function getMaxNumsStep() {
    const data = getData();
    const maxNum = st.state.workerMaxNum;   // global peak of the whole path

    return data.indexOf(maxNum);            // first index where that peak value sits
}

// ------ Step of the first drop below the starting number ------ //
export function getFirstDropStep() {
    const data = getData();
    const userInput = st.state.activeInputValue;   // the start value n

    for (let i = 0; i < data.length; i++) {
        if (data[i] < userInput) {          /* first value that falls below the start */
            return i;
        }
    }

    return -1;                              /* Return -1 if no drop is found (never drops) */
}

// ------ How many times the all-time max was beaten ------ //
export function getCountOfRecordBreaks() {
    const data = getData();

    let recordBreaksCount = 0;              /* number of new-record events */
    let maxNum = data[0];                   /* running maximum, start from head */

    for (let i = 1; i < data.length; i++) {
        if (data[i] > maxNum) {             /* value beats the current record */
            maxNum = data[i];               // move the running max up
            recordBreaksCount++;
        }
    }

    return recordBreaksCount;
}

// ------ Count of local peaks (higher than both neighbours) ------ //
export function getCountOfLocalMaximas() {
    const data = getData();

    let localMaximaCount = 0;

    for (let i = 1; i < data.length - 1; i++) {       /* skip edges (no both neighbours) */
        if (data[i] > data[i - 1] && data[i] > data[i + 1]) { /* higher than both sides */
            localMaximaCount++;
        }
    }

    return localMaximaCount;
}

// ------ Count of local valleys (lower than both neighbours) ------ //
export function getCountOfLocalMinimas() {
    const data = getData();

    let localMinimaCount = 0;

    for (let i = 1; i < data.length - 1; i++) {
        if (data[i] < data[i - 1] && data[i] < data[i + 1]) {   /* lower than both sides */
            localMinimaCount++;
        }
    }

    return localMinimaCount;
}

// ------ Count of monotone (up or down) runs ------ //
export function getCountOfMonotoneSegments() {
    const data = getData();

    if (data.length < 2) return data.length;   /* 0 items -> 0 runs, 1 item -> 1 run */

    let segments = 1;                              // at least one segment exists
    let curDir = data[1] >= data[0] ? 1 : -1;      // direction of the first pairing

    for (let i = 2; i < data.length; i++) {
        const dir = data[i] >= data[i - 1] ? 1 : -1;   /* direction of the current pairing */

        if (dir !== curDir) {                      /* direction changed -> new segment */
            curDir = dir;
            segments++;
        }
    }

    return segments;
}

// ===================================================================== \\
//  TRAJECTORY & SHAPE (ratios, multipliers, area)                         //
// ===================================================================== \\
// Aggregate shape of the path: how fast it shrank on the way to 1.

// ------ Even-to-odd step ratio (the E/O factor) ------ //
export function getEoverO() {
    const E = getAllEvenNums();     /* halving steps */
    const O = getAllOddNums();      /* tripling steps */

    return E / O;                   /* the classic E/O ratio, trending to log2(3) ~ 1.585 */
}

// ------ Net growth factor 3^O / 2^E ------ //
// Determines whether the path on average grew or shrank.
export function getGrowthProduct() {
    const { E, O } = countEOverO();   /* halving / tripling steps */

    const log2Growth = O * Math.log2(3) - E;  /* net growth expressed in log2 */
    const product = Math.pow(2, log2Growth);  /* bring it to the same numbers (3^O/2^E) */

    return { E, O, log2Growth, product };
}

// ------ Geometric-mean per-step multiplier ------ //
export function getAverageMultiplerPerStep() {
    const data = getData();
    const S = data.length - 1;           /* number of transitions, not items */
    const { E, O } = countEOverO();      /* halving / tripling steps */

    const lnM = (O * Math.log(3) - E * Math.log(2)) / S; /* mean of the log-multipliers */
    return Math.exp(lnM);                              /* back into a linear multiplier */
}

// ------ Sum of all path values ("spent energy") ------ //
export function getAreaUnderCurve() {
    const data = getData();

    let area = 0n;

    for (let i = 0; i < data.length; i++) {
        area += data[i];            /* accumulate every step value */
    }

    return area;
}

// ===================================================================== \\
//  TAIL & SHARE (trajectory after the peak)                                //
// ===================================================================== //
// How the path behaves once it starts falling back to 1.

// ------ Path length from the peak down to 1 ------ //
export function getStepsFromMaxTo1() {
    const data = getData();
    const maxNum = st.state.workerMaxNum;   /* the peak */

    const maxIndex = data.indexOf(maxNum);  /* where the peak sits in the array */

    return data.length - 1 - maxIndex;      /* steps remaining past the peak */
}

// ------ Count of steps above vs below the start ------ //
export function getShareAboveStart() {
    const data = getData();
    const userInput = st.state.activeInputValue;   /* the start value n */

    let above = 0;   /* how many steps stay higher than n */
    let below = 0;   /* how many steps drop below n */

    for (let i = 0; i < data.length; i++) {
        if (data[i] > userInput) above++;           /* higher than the start */
        else if (data[i] < userInput) below++;      /* lower than the start  */
    }

    return { above, below, total: above + below };
}

// ===================================================================== \\
//  BINARY / STRUCTURAL  (Collatz as a bit game)                            //
// ===================================================================== //
// How the binary representation of the number evolves.

// ------ Exponent of 2 in n (count of halvings it can do) ------ //
function v2(n) {                            /* v2(n) = how many times 2 divides n */
    let count = 0n;
    while ((n & 1n) === 0n && n !== 0n) {  /* keep halving while the number stays even */
        n /= 2;                             // divide by 2 each pass
        count++;                            // one more bit consumed
    }

    return count;                           // total exponent of 2 in n
}

// ------ Sum of v2 over every even step ------ //
export function getTotalV2() {
    const data = getData();
    let total = 0n;

    for (let i = 0; i < data.length; i++) {
        if ((data[i] & 1n) === 0n) {       /* only even numbers contain powers of 2 */
            total += v2(data[i]);          // add how deep that number is divisible by 2
        }
    }

    return total;                           /* total bits 'eaten' by halving steps */
}

// ------ Count how many values are 1 mod 4 vs 3 mod 4 ------ //
export function getMode4Breakdown() {
    const data = getData();

    let mod1 = 0;
    let mod3 = 0;

    for (let i = 0; i < data.length; i++) {
        const rem = data[i] % 4n;           /* residue of n modulo 4 */
        if (rem === 1n) mod1++;             /* n ≡ 1 (mod 4) — usually short drop */
        else if (rem === 3n) mod3++;        /* n ≡ 3 (mod 4) — usually long growth */
    }

    return { mod1, mod3 };
}

// ------ Difference in bit length between the start and the peak ------ //
export function getBitShiftToPeak() {
    const data = getData();
    const maxNum = st.state.workerMaxNum;   // the peak

    const startBits = BigInt(data[0].toString(2).length);   /* bit length of the start value */
    const peakBits = BigInt(maxNum.toString(2).length);       /* bit length of the peak value */

    return peakBits - startBits;            /* how many extra bits the peak gained over start */
}

// ------ Count of steps that more than an order grew ------ //
export function getHeavyStepsCount() {
    const data = getData();

    let heavy = 0;

    for (let i = 0; i < data.length - 1; i++) {
        if (data[i + 1] > data[i] * 10n) heavy++;  /* next step larger than 10x the current */
    }

    return heavy;
}

// ===================================================================== \\
//  DERIVATIVE RATIOS  (peak relative to start / steps)                     //
// ===================================================================== //
// How extreme the trajectory is compared to the start and to the step count.

// ------ Overshoot: how many times the peak exceeded the start ------ //
export function getOvershoot() {
    const peak = st.state.workerMaxNum;         // the highest point
    const start = st.state.activeInputValue;    // the starting value

    return peak / start;                        /* >= 1 practically for Collatz */
}

// ------ Peak-to-start and peak-to-steps ratios (2 decimals) ------ //
export function PeakToStartAndStepsRatio() {
    const peak = st.state.workerMaxNum;      // the peak value
    const steps = BigInt(st.state.workerListLen);  // total steps in the path
    const start = st.state.activeInputValue; // the starting value

    // Build Ratio as "int + 2 fractional digits" by integer bigint math.
    const intPart = peak / start;                          /* whole part of peak/start */
    const fracPart = (peak % start) * 100n / start;        /* two decimal places        */

    return {
        peakToStart: `${intPart}.${fracPart.toString().padStart(2, '0')}`,
        peakToSteps: `${peak / steps}.${((peak % steps) * 100n / steps).toString().padStart(2, '0')}`
    }
}

// ===================================================================== \\
//  DISTRIBUTION STATS  (statistics over the produced values)                //
// ===================================================================== //
// Central tendency of the sequence values.

// ------ Arithmetic-array mean of all path values ------ //
export function getMean() {
    const data = getData();

    let sum = 0n;

    for (let i = 0; i < data.length; i++)
        sum += data[i];                     /* accumulate every step value */

    return Number(sum / BigInt(data.length));   /* sum / n as a plain Number */
}

// ------ Median of the path values ------ //
export function getMedian() {
    const data = getData();
    const sorted = [...data].sort((a, b) => a < b ? -1 : a > b ? 1 : 0); /* values in ascending order */
    const mid = Math.floor(sorted.length / 2);   /* the middle index */

    // If the length is odd — the value in the middle;
    // if even — average of the two most central ones.
    return Number(sorted.length % 2
        ? sorted[mid]                                // odd
        : (sorted[mid - 1] + sorted[mid]) / 2n);     // even
}

// ------ Standard deviation of the log-2 bit lengths ------ //
export function getLogStd() {
    const data = getData();

    let sumLog = 0;

    for (let i = 0; i < data.length; i++) {
        sumLog += Math.log2(Number(data[i].toString(2).length));   /* bit length of value i */
    }

    const meanLog = sumLog / data.length;          /* mean bit length */
    let sqSum = 0;

    for (let i = 0; i < data.length; i++) {
        const deviation = Math.log2(Number(data[i].toString(2).length)) - meanLog; // diff from mean
        sqSum += deviation * deviation;            // squared, for a proper standard deviation
    }

    return Math.sqrt(sqSum / data.length);         /* root-mean-square = stddev */
}

// ------ Average how high you were (value as % of the peak) ------ //
export function getAveragePercentile() {
    const data = getData();
    const peak = st.state.workerMaxNum;      // the max value
    const n = BigInt(data.length);           // number of steps

    let sum = 0n;
    for (let i = 0; i < data.length; i++)
        sum += data[i];                     /* sum all the values */

    const denominator = n * peak;            // total possible area if it stayed at the peak
    const numerator = sum * 100n;            // scale sum (%) 

    // Compose a fixed-total two-decimal percentage of how close to the peak.
    const intPart = numerator / denominator;                  // whole part
    const fracPart = (numerator % denominator) * 100n / denominator;   // decimal part

    return `${intPart}.${fracPart.toString().padStart(2, '0')}`;
}