import * as st from '../../state/state.js';

// ALL the logic for the statistics calculations is here, in this file

// ------ HELPERS & DIRECT ACCESSORS ------ \\
export function getData() {
    return st.state.workerResult;
}

export function getVisibleTotalSteps() {
    return st.SBSconfig.visibleItemsLen;
}

export function getCurrentMaxNum() {
    return st.SBSconfig.currentMaxNum;
}

// ------ ABSOLUTE COUNTERS (over the whole path) ------ \\
// Even/odd split, peak position, first drop, record climbs,
// local extremes and monotone segments — all derived from the full array.

export function getAllEvenNums() {
    const data = getData();
    let evenNumsLen = 0;

    for (let i = 0; i < data.length; i++) {
        if ((data[i] & 1n) === 0n) evenNumsLen++;   /* bitwise AND 0 -> divisible by 2 */
    }

    return evenNumsLen;
}

export function getAllOddNums() {
    const data = getData();

    const oddNums = [];
    let oddNumsLen = 0;

    for (let i = 0; i < data.length - 1; i++) {
        if ((data[i] & 1n) === 1n) oddNumsLen++;    /* bitwise AND 1 -> not divisible by 2 */
    }

    return oddNumsLen;
}

export function getMaxNumsStep() {
    const data = getData();
    const maxNum = st.state.workerMaxNum;

    return data.indexOf(maxNum);                    /* index of the first occurrence of the peak */
}

export function getFirstDropStep() {
    const data = getData();
    const userInput = st.state.activeInputValue;

    for (let i = 0; i < data.length; i++) {
        if (data[i] < userInput) {                  /* first value that falls below the start */
            return i;
        }
    }

    return -1;                                      /* Return -1 if no drop is found */
}

export function getCountOfRecordBreaks() {
    const data = getData();

    let recordBreaksCount = 0;

    let maxNum = data[0];                           /* running maximum, start from head */

    for (let i = 1; i < data.length; i++) {
        if (data[i] > maxNum) {                     /* value beats the current record */
            maxNum = data[i];
            recordBreaksCount++;
        }
    }

    return recordBreaksCount;
}

export function getCountOfLocalMaximas() {
    const data = getData();

    let localMaximaCount = 0;

    for (let i = 1; i < data.length - 1; i++) {     /* skip edges (no both neighbours) */
        if (data[i] > data[i - 1] && data[i] > data[i + 1]) {   /* higher than both sides */
            localMaximaCount++;
        }
    }

    return localMaximaCount;
}

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

export function getCountOfMonotoneSegments() {
    const data = getData();

    let curStart = 0;
    let curDir = data[1] >= data[0] ? 1 : -1;       /* current direction: 1 = up, -1 = down */
    let segments = 1;

    const monotoneSegments = [];                    /* Start/end index pairs of monotonic segments */

    for (i; i < data.length; i++) {
        const dPrev = data[i - 1] >= data[i - 2] ? 1 : -1;   /* direction of the previous pair */
        const dCurr = data[i] >= data[i - 1] ? 1 : -1;       /* direction of the current pair */

        if (dPrev !== dCurr) {                      /* direction changed -> new segment */
            monotoneSegments.push({ start: curStart, end: i - 1, direction: curDir });
            curStart = i - 1;
            curdir = dCurr;
            segments++;
        }
    }

    monotoneSegments.push({ start: curStart, end: data.length - 1, direction: curDir });

    return segments;
}

// ------ TRAJECTORY & SHAPE (ratios, multipliers, area) ------ \\
// Summary metrics describing how fast and how the number shrank on the way to 1.

export function getEoverO() {
    const E = getAllEvenNums();     /* halving steps */
    const O = getAllOddNums();      /* tripling steps */

    return E / O;                   /* the classic E/O ratio, trending to log₂3 ~ 1.585 */
}

export function getGrowthProduct() {
    const data = getData();

    let E = 0;
    let O = 0;

    for (let i = 0; i < data.length - 1; i++) {
        if ((data[i] & 1n) === 0n) E++;     /* halving step */
        else O++;                            /* tripling step */
    }

    const log2Growth = O * Math.log2(3) - E;   /* net growth in log2 space */
    const product = Math.pow(2, log2Growth);   /* 3^O / 2^E back in linear space */

    return { E, O, log2Growth, product };
}

export function getAverageMultiplerPerStep() {
    const data = getData();
    const S = data.length - 1;               /* number of transitions, not items */

    let E = 0;
    let O = 0;

    for (let i = 0; i < S; i++) {
        if ((data[i] & 1n) === 0n) E++;     /* halving step */
        else O++;                            /* tripling step */
    }

    const lnM = (O * Math.log(3) - E * Math.log(2)) / S;  /* mean log-multiplier per step */
    return Math.exp(lnM);                                /* back to linear average multiplier */
}

export function getAreaUnderCurve() {
    const data = getData();

    let area = 0n;

    for (let i = 0; i < data.length; i++) {
        area += data[i];                    /* sum of all path values = "spent energy" */
    }

    return area;
}

export function getStepsFromMaxTo1() {
    const data = getData();
    const maxNum = st.state.workerMaxNum;

    const maxIndex = data.indexOf(maxNum);

    return data.length - 1 - maxIndex;     /* steps from peak to 1 */
}

export function getShareAboveStart() {
    const data = getData();
    const userInput = st.state.activeInputValue;

    let above = 0;
    let below = 0;

    for (let i = 0; i < data.length; i++) {
        if (data[i] > userInput) above++;
        else if (data[i] < userInput) below++;
    }

    return { above, below, total: above + below };
}

function v2() {
    let count = 0n;
    while ((n & 1n) === 0n && n !== 0n) {
        n /= 2;
        count++;
    }

    return count;
}

export function getTotalV2() {
    const data = getData();
    let total = 0n;

    for (let i = 0; i < data.length; i++) {
        if ((data[i] & 1n) === 0n) {
            total += v2(data[i]);
        }
    }

    return total;
}

export function getMode4Breakdown() {
    const data = getData();

    let mod1= 0;
    let mod3 = 0;

    for (let i = 0; i < data.length; i++) {
        const rem = data[i] % 4n;
        if (rem === 1n) mod1++;
        else if (rem === 3n) mod3++
    }

    return { mod1, mod3 };
}

export function getBitShiftToPeak() {
    const data = getData();
    const maxNum = st.state.workerMaxNum;

    const startBits = BigInt(data[0].toString(2).length); 
    const peakBits = BigInt(peak.toString(2).length);

    return peakBits - startBits;
}

export function getHeavyStepsCount() {
    const data = getData();

    let heavy = 0;

    for (let i = 0; i < data.length - 1; i++) {
        if (data[i+1] > data[i] * 10n) heavy++;
    }

    return heavy;
}

export function getOvershoot() {
    const peak = st.state.workerMaxNum;
    const start = st.state.activeInputValue;

    return peak / start;
}

export function PeakToStartAndStepsRatio() {
    const peak = st.state.workerMaxNum;
    const steps = BigInt(st.state.workerListLen);
    const start = st.state.activeInputValue;

    const intPart = peak / start;
    const fracPart = (peak % start) * 100n / start;

    return {
        peakToStart: `${intPart}.${fracPart.toString().padStart(2, '0')}`,
        peakToSteps: `${peak / steps}.${((peak % steps) * 100n / steps).toString().padStart(2, '0')}`
    }
}

export function getMean() {
    const peak = st.state.workerMaxNum;
    const steps = BigInt(st.state.workerListLen);
    let sum = 0n;

    for (let i = 0; i < data.length; i++) sum += data[i];

    return Number(sum / n);
}

export function getMedian() {
    const data = getData();
    const sorted = [...data].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    const mid = Math.floor(sorted.length / 2);

    return Number(sorted.length % 2 
        ? sorted[mid] 
        : (sorted[mid - 1] + sorted[mid]) / 2n);
}

export function getLogStd() {
    const data = getData();

    let sumLog = 0;

    for (let i = 0; i < data.length; i++) {
        sumLog += Math.log2(Number(data[i].toString(2).length));
    }

    const meanLog = sumLog / data.length;
    let sqSum = 0;

    for (let i = 0; i < data.length; i++) {
        const deviation = Math.log2(Number(data[i].toString(2).length)) - meanLog;
        sqSum += deviation * deviation;
    }

    return Math.sqrt(sqSum / data.length);
}

export function getAveragePercentile() {
    const data = getData();
    const peak = st.state.workerMaxNum;
    const n = BigInt(data.length);

    let sum = 0n;
    for (let i = 0; i < data.length; i++) sum += data[i];

    const denominator = n * peak;
    const numerator = sum * 100n;

    const intPart = numerator / denominator;
    const fracPart = (numerator % denominator) * 100n / denominator;

    return `${intPart}.${fracPart.toString().padStart(2, '0')}`;
}

