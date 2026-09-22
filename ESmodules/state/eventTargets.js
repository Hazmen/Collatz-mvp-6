// ------ CENTRAL EVENT TARGETS ------ \\

/**
 * @domain state — global Collatz state
 * @dispatched `ESmodules/state/events.js:16` dispatchEvent('collatz_done') via sendCollatz_SecondaryData
 *             `ESmodules/state/events.js:27` dispatchEvent('collatz_error') via sendCollatz_ErrorData
 *             (triggered from `ESmodules/workers/workerManager.js:27/33`)
 * @listened `ESmodules/core/SBSoutputManager.js:173` addEventListener('collatz_done')
 *           `ESmodules/ui/playButtonSVG.js:57` addEventListener('collatz_done')
 *           `ESmodules/ui/playButtonSVG.js:62` addEventListener('collatz_error')
 * @events collatz_done, collatz_error
 */
export const stateTarget = new EventTarget();

/**
 * @domain SBS — step-by-step output engine
 * @dispatched `ESmodules/state/events.js:47` dispatchEvent('sbs_batch') via sendSBS_Data
 *             `ESmodules/state/events.js:62` dispatchEvent('sbs_removeBatch') via sendSBS_DataRemoveEvent
 *             `ESmodules/state/events.js:72` dispatchEvent('sbs_done') via sendSBS_DoneEvent
 *             `ESmodules/state/events.js:84` dispatchEvent('sbs_clear') via sendSBS_ClearEvent
 *             (fired from `ESmodules/core/SBSoutputManager.js:32/66/103/143/216` and `ESmodules/core/resetManager.js:40`)
 * @listened `ESmodules/visualisation/viewModes/sequenceView.js:18` addEventListener('sbs_batch')
 *           `ESmodules/visualisation/viewModes/sequenceView.js:30` addEventListener('sbs_removeBatch')
 *           `ESmodules/visualisation/viewModes/sequenceView.js:53` addEventListener('sbs_clear')
 *           `ESmodules/ui/runProcessControls.js:180` addEventListener('sbs_done')
 * @events sbs_batch, sbs_removeBatch, sbs_done, sbs_clear
 */
export const SBSeventTarget = new EventTarget();

/**
 * @domain outputMode — Instant / Auto / Manual switch
 * @dispatched `ESmodules/state/events.js:96` dispatchEvent('outputMode_change') via sendOutputMode_ChangeEvent
 *             (fired from `webComponents/outputModeController.js:650` commit())
 * @listened `webComponents/speedController.js:419` addEventListener('outputMode_change')
 *           `ESmodules/ui/outputModeController_Logic.js:22` addEventListener('outputMode_change')
 * @events outputMode_change
 */
export const outputMode_EventTarget = new EventTarget();

/**
 * @domain reset — Soft / Hard reset intent bus
 * @dispatched `ESmodules/state/events.js:110` dispatchEvent('reset_request') via sendReset_RequestEvent
 *             (fired from `ESmodules/ui/hard-reset.js` requestSoft/requestHard)
 *           `ESmodules/state/events.js:121` dispatchEvent('reset_done') via sendReset_DoneEvent
 *             (fired from `ESmodules/ui/runProcessControls.js` reset_request listener)
 * @listened `ESmodules/ui/runProcessControls.js` addEventListener('reset_request')
 *           `ESmodules/ui/hard-reset.js` addEventListener('reset_done')
 * @events reset_request, reset_done
 */
export const reset_EventTarget = new EventTarget();