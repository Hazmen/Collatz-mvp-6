// SBS = Step By Step
// Same statistics as statsLogic.js, but computed on the CURRENTLY VISIBLE slice
// (SBSconfig.visibleItems), not the full workerResult. Every function reads its
// data from the `ctx` object it's given — nothing is pulled from shared state here.

// ===== TABLE OF CONTENTS ===== //
// ENTRY POINT:    computeSBSStats
// ABSOLUTE:       getAllEvenNums, getAllOddNums, getMaxNumsStep, getFirstDropStep,
//                 getCountOfRecordBreaks, getCountOfLocalMaximas, getCountOfLocalMinimas,
//                 getCountOfMonotoneSegments
// TRAJECTORY:     getEoverO, getGrowthProduct, getAverageMultiplerPerStep, getAreaUnderCurve
// TAIL & SHARE:   getStepsFromMaxTo1, getShareAboveStart
// BINARY:         v2, getTotalV2, getMode4Breakdown, getBitShiftToPeak, getHeavyStepsCount
// RATIOS:         getOvershoot, getPeakToStartAndStepsRatio
// DISTRIBUTION:   getMean, getMedian, getLogStd, getAveragePercentile

// ===================================================================== \\
//  ENTRY POINT                                                           ||
// ===================================================================== //
// Called once per SBS tick, with the data that tick has available.
// Builds the shared `ctx` a single time and hands it to every stat function.

// ------ Compute every SBS statistic for the current visible slice ------ //
export function computeSBSStats(visibleItems, peakNumber, startValue) {
    const ctx = {
        data: visibleItems,      /* SBSconfig.visibleItems — everything shown so far */
        peak: peakNumber,        /* SBSconfig.currentMaxNum — running max of the shown items */
        start: startValue,       /* state.activeInputValue — the starting n */
        steps: BigInt(visibleItems.length), /* steps shown so far, as a count */
    };

    return {
        allEvenNums: getAllEvenNums(ctx),
        allOddNums: getAllOddNums(ctx),
        maxNumsStep: getMaxNumsStep(ctx),
        firstDropStep: getFirstDropStep(ctx),
        countOfRecordBreaks: getCountOfRecordBreaks(ctx),
        countOfLocalMaximas: getCountOfLocalMaximas(ctx),
        countOfLocalMinimas: getCountOfLocalMinimas(ctx),
        countOfMonotoneSegments: getCountOfMonotoneSegments(ctx),

        eOverO: getEoverO(ctx),
        growthProduct: getGrowthProduct(ctx),
        averageMultiplerPerStep: getAverageMultiplerPerStep(ctx),
        areaUnderCurve: getAreaUnderCurve(ctx),

        stepsFromMaxTo1: getStepsFromMaxTo1(ctx),
        shareAboveStart: getShareAboveStart(ctx),

        totalV2: getTotalV2(ctx),
        mode4Breakdown: getMode4Breakdown(ctx),
        bitShiftToPeak: getBitShiftToPeak(ctx),
        heavyStepsCount: getHeavyStepsCount(ctx),

        overshoot: getOvershoot(ctx),
        peakToStartAndStepsRatio: getPeakToStartAndStepsRatio(ctx),

        mean: getMean(ctx),
        median: getMedian(ctx),
        logStd: getLogStd(ctx),
        averagePercentile: getAveragePercentile(ctx),
    };
}

// ===================================================================== \\
//  ABSOLUTE COUNTERS (over the visible slice)                            ||
// ===================================================================== //

// ------ Shared single-pass E/O counter (over transitions, not items) ------ //
function countEOverO(ctx) {
    const { data } = ctx;

    let E = 0;   /* halving steps */
    let O = 0;   /* tripling steps */

    for (let i = 0; i < data.length - 1; i++) {
        if ((data[i] & 1n) === 0n) E++;   /* bitwise AND 0 -> lowest bit clear -> even */
        else O++;                          /* lowest bit set -> odd */
    }

    return { E, O };
}

// ------ Count number of even (halving) steps ------ //
function getAllEvenNums(ctx) {
    return countEOverO(ctx).E;
}

// ------ Count number of odd (tripling) steps ------ //
function getAllOddNums(ctx) {
    return countEOverO(ctx).O;
}

// ------ Index of the step where the peak occurs (within the visible slice) ------ //
function getMaxNumsStep(ctx) {
    const { data, peak } = ctx;
    return data.indexOf(peak);
}

// ------ Step of the first drop below the starting number ------ //
function getFirstDropStep(ctx) {
    const { data, start } = ctx;

    for (let i = 0; i < data.length; i++) {
        if (data[i] < start) return i;      /* first value that falls below the start */
    }

    return -1;                              /* no drop seen yet */
}

// ------ How many times the running max was beaten, within the visible slice ------ //
function getCountOfRecordBreaks(ctx) {
    const { data } = ctx;
    if (data.length === 0) return 0;

    let recordBreaksCount = 0;
    let maxNum = data[0];

    for (let i = 1; i < data.length; i++) {
        if (data[i] > maxNum) {
            maxNum = data[i];
            recordBreaksCount++;
        }
    }

    return recordBreaksCount;
}

// ------ Count of local peaks (higher than both neighbours) ------ //
function getCountOfLocalMaximas(ctx) {
    const { data } = ctx;
    let localMaximaCount = 0;

    for (let i = 1; i < data.length - 1; i++) {
        if (data[i] > data[i - 1] && data[i] > data[i + 1]) localMaximaCount++;
    }

    return localMaximaCount;
}

// ------ Count of local valleys (lower than both neighbours) ------ //
function getCountOfLocalMinimas(ctx) {
    const { data } = ctx;
    let localMinimaCount = 0;

    for (let i = 1; i < data.length - 1; i++) {
        if (data[i] < data[i - 1] && data[i] < data[i + 1]) localMinimaCount++;
    }

    return localMinimaCount;
}

// ------ Count of monotone (up or down) runs ------ //
function getCountOfMonotoneSegments(ctx) {
    const { data } = ctx;
    if (data.length < 2) return data.length;   /* 0 items -> 0 runs, 1 item -> 1 run */

    let segments = 1;
    let curDir = data[1] >= data[0] ? 1 : -1;

    for (let i = 2; i < data.length; i++) {
        const dir = data[i] >= data[i - 1] ? 1 : -1;
        if (dir !== curDir) {
            curDir = dir;
            segments++;
        }
    }

    return segments;
}

// ===================================================================== \\
//  TRAJECTORY & SHAPE                                                    ||   
// ===================================================================== //

// ------ Even-to-odd step ratio (the E/O factor) ------ //
function getEoverO(ctx) {
    const { E, O } = countEOverO(ctx);
    return E / O;
}

// ------ Net growth factor 3^O / 2^E ------ //
function getGrowthProduct(ctx) {
    const { E, O } = countEOverO(ctx);

    const log2Growth = O * Math.log2(3) - E;
    const product = Math.pow(2, log2Growth);

    return { E, O, log2Growth, product };
}

// ------ Geometric-mean per-step multiplier ------ //
function getAverageMultiplerPerStep(ctx) {
    const { data } = ctx;
    const S = data.length - 1;
    if (S <= 0) return 1;

    const { E, O } = countEOverO(ctx);

    const lnM = (O * Math.log(3) - E * Math.log(2)) / S;
    return Math.exp(lnM);
}

// ------ Sum of all visible path values ("spent energy") ------ //
function getAreaUnderCurve(ctx) {
    const { data } = ctx;
    let area = 0n;

    for (let i = 0; i < data.length; i++) area += data[i];

    return area;
}

// ===================================================================== \\
//  TAIL & SHARE                                                          ||
// ===================================================================== //

// ------ Visible steps left between the running peak and the last shown value ------ //
function getStepsFromMaxTo1(ctx) {
    const { data, peak } = ctx;
    if (data.length === 0) return 0;

    const maxIndex = data.indexOf(peak);
    return data.length - 1 - maxIndex;
}

// ------ Count of steps above vs below the start, within the visible slice ------ //
function getShareAboveStart(ctx) {
    const { data, start } = ctx;

    let above = 0;
    let below = 0;

    for (let i = 0; i < data.length; i++) {
        if (data[i] > start) above++;
        else if (data[i] < start) below++;
    }

    return { above, below, total: above + below };
}

// ===================================================================== \\
//  BINARY / STRUCTURAL                                                   ||
// ===================================================================== //

// ------ Exponent of 2 in n (count of halvings it can do) ------ //
function v2(n) {
    let count = 0n;
    while ((n & 1n) === 0n && n !== 0n) {
        n /= 2n;
        count++;
    }

    return count;
}

// ------ Sum of v2 over every even value in the visible slice ------ //
function getTotalV2(ctx) {
    const { data } = ctx;
    let total = 0n;

    for (let i = 0; i < data.length; i++) {
        if ((data[i] & 1n) === 0n) total += v2(data[i]);
    }

    return total;
}

// ------ Count how many visible values are 1 mod 4 vs 3 mod 4 ------ //
function getMode4Breakdown(ctx) {
    const { data } = ctx;

    let mod1 = 0;
    let mod3 = 0;

    for (let i = 0; i < data.length; i++) {
        const rem = data[i] % 4n;
        if (rem === 1n) mod1++;
        else if (rem === 3n) mod3++;
    }

    return { mod1, mod3 };
}

// ------ Difference in bit length between the first visible value and the running peak ------ //
function getBitShiftToPeak(ctx) {
    const { data, peak } = ctx;
    if (data.length === 0) return 0n;

    const startBits = BigInt(data[0].toString(2).length);
    const peakBits = BigInt(peak.toString(2).length);

    return peakBits - startBits;
}

// ------ Count of steps that grew more than an order of magnitude ------ //
function getHeavyStepsCount(ctx) {
    const { data } = ctx;
    let heavy = 0;

    for (let i = 0; i < data.length - 1; i++) {
        if (data[i + 1] > data[i] * 10n) heavy++;
    }

    return heavy;
}

// ===================================================================== \\
//  DERIVATIVE RATIOS                                                     ||
// ===================================================================== //

// ------ Overshoot: how many times the running peak exceeded the start ------ //
function getOvershoot(ctx) {
    const { peak, start } = ctx;
    return peak / start;
}

// ------ Peak-to-start and peak-to-steps ratios (2 decimals) ------ //
function getPeakToStartAndStepsRatio(ctx) {
    const { peak, start, steps } = ctx;
    if (steps === 0n) return { peakToStart: '0.00', peakToSteps: '0.00' };

    const intPart = peak / start;
    const fracPart = (peak % start) * 100n / start;

    return {
        peakToStart: `${intPart}.${fracPart.toString().padStart(2, '0')}`,
        peakToSteps: `${peak / steps}.${((peak % steps) * 100n / steps).toString().padStart(2, '0')}`
    };
}

// ===================================================================== \\
//  DISTRIBUTION STATS                                                    ||
// ===================================================================== //

// ------ Arithmetic-array mean of all visible values ------ //
function getMean(ctx) {
    const { data } = ctx;
    if (data.length === 0) return 0;

    let sum = 0n;
    for (let i = 0; i < data.length; i++) sum += data[i];

    return Number(sum / BigInt(data.length));
}

// ------ Median of the visible values ------ //
function getMedian(ctx) {
    const { data } = ctx;
    if (data.length === 0) return 0;

    const sorted = [...data].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    const mid = Math.floor(sorted.length / 2);

    return Number(sorted.length % 2
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2n);
}

// ------ Standard deviation of the log-2 bit lengths ------ //
function getLogStd(ctx) {
    const { data } = ctx;
    if (data.length === 0) return 0;

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

// ------ Average how high you were (value as % of the running peak) ------ //
function getAveragePercentile(ctx) {
    const { data, peak } = ctx;
    if (data.length === 0 || peak === 0n) return '0.00';

    const n = BigInt(data.length);

    let sum = 0n;
    for (let i = 0; i < data.length; i++) sum += data[i];

    const denominator = n * peak;
    const numerator = sum * 100n;

    const intPart = numerator / denominator;
    const fracPart = (numerator % denominator) * 100n / denominator;

    return `${intPart}.${fracPart.toString().padStart(2, '0')}`;
}
