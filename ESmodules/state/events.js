export function sendCollatz_MainData(item, st, data) {
    item[st].push(...data.data);
};

export function sendCollatz_SecondaryData(item, max, length, target) {
    item.workerMaxNum = max;
    item.workerListLen = length;
    item.hasResult = true;

    const CollatzData_DoneEvent = new CustomEvent('collatz_done', {
        detail: {
            status: 'done'
        }
    });

    target.dispatchEvent(CollatzData_DoneEvent);
};

export function sendCollatz_ErrorData(item, cause, target) {
    item.errorCause = cause;

    const CollatzData_ErrorEvent = new CustomEvent('collatz_error', {
        detail: {
            status: 'error'
        }
    });
    
    target.dispatchEvent(CollatzData_ErrorEvent);
};

/* -------------- SBS Output Events -------------- */

export function sendSBS_Data(item, data, target, startIndex, endIndex) {
    item.currentBatch = data;
    item.batchStartIndex = startIndex;
    item.batchEndIndex = endIndex;

    const SBSData_BatchEvent = new CustomEvent('sbs_batch', {
        detail: {
            status: 'batch',
            batch: data,
            startIndex,
            endIndex
        }
    });
    
    target.dispatchEvent(SBSData_BatchEvent);
};

export function sendSBS_DataRemoveEvent(item, target, startIndex, endIndex) {
    item.delBatchStartIndex = startIndex;
    item.delBatchEndIndex = endIndex;

    const SBSData_RemoveEvent = new CustomEvent('sbs_removeBatch', {
        detail: {
            status: 'removeBatch',
            startIndex,
            endIndex
        }
    });
    
    target.dispatchEvent(SBSData_RemoveEvent);
}

export function sendSBS_DoneEvent(target) {
    const SBSDoneEvent = new CustomEvent('sbs_done', {
        detail: {
            status: 'done'
        }
    });

    target.dispatchEvent(SBSDoneEvent);
};

export function sendSBS_ClearEvent(target) {
    const SBSClearEvent = new CustomEvent('sbs_clear', {
        detail: {
            status: 'clear'
        }
    });

    target.dispatchEvent(SBSClearEvent);
};

// -------------- OUTPUT MODE CHANGE EVENT -------------- \\
export function sendOutputMode_ChangeEvent(target, mode) {
    const OutputChangeEvent = new CustomEvent('outputMode_change', {
        detail: {
            status: 'changed',
            selected_mode: mode
        }
    });

    target.dispatchEvent(OutputChangeEvent);
    console.log('Output Mode Changed');
}


