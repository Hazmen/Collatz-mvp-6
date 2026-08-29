import { runProcess_Elements, mainInputField } from "./uiElements.js";
import { getSpecificState, setStateValue } from "../state/stateManager.js";
import { workerManager_Recieve } from "../workers/workerManager.js";
import { setRunButtonMode } from "./playButtonSVG.js";
import { state, SBSconfig } from "../state/state.js";
import { pauseSBS, resumeSBS, skipSBS, SBSeventTarget, startSBS, addOneBatchSBS, removeOneBatchSBS } from "../core/SBSoutputManager.js";
import { resetOutputOnly, resetSession } from "../core/resetManager.js";
import { guard } from "./runProcessControls_guard.js";

// -------------- ENTRY POINT: WIRE UP ALL RUN/SKIP/RESET CONTROLS -------------- \\
export function RunSequenceCalc() {
    
    
    // внутри RunSequenceCalc()
    function startRunProcess() { 
        if (state.outputMode === 'manual') return;

        // -------------- PRE-CHECK LAYER: VALIDATE NEW INPUT -------------- \\
        /* this layer runs only when starting a brand-new calculation */

        if (!guard.validateInput()) {
            alert('Error! Your input must contain only numbers and cannot be empty!');
            /* ErrorWindowAppend(); <-- For the future */
            return; 
        }

        // -------------- GUARD: WORKER IS BUSY -------------- \\
        /* SBS regulating does not depend on the input validity */
        if (state.isComputing) return;                  /* don't act while worker is busy */

        // -------------- TOGGLE OFF: CURRENTLY RUNNING -------------- \\
        if (guard.sbsAuto_canPause()) {
            pauseSBS();                                 /* pause the SBS output */
            setRunButtonMode(false);
            return;
        }

        // -------------- DOES THE INPUT STILL MATCH THE ACTIVE RUN? -------------- \\
        // -------------- SAME NUMBER, ALREADY FINISHED: REPLAY WITHOUT RE-COMPUTING -------------- \\
        // -------------- ----------- IF NOT: COMPLETE RESET ----------- -------------- \\

        if (guard.canReplay_SameInput()) {
            resetOutputOnly();                            /* clear the output session */
            setRunButtonMode(true);
            startSBS();
            return;
        } 

        if (guard.isNewInputAfterDone()) {
            resetSession();           
            setStateValue('activeInputValue', BigInt(mainInputField.value));
            workerManager_Recieve(getSpecificState('activeInputValue'));
            setRunButtonMode(true);
            return;
        }

        // -------------- TOGGLE ON: RESUME FROM PAUSE (only if the number is the same) -------------- \\
        if (guard.sbsAuto_canResume()) {
            resumeSBS();                                /* continue from the last index */
            setRunButtonMode(true);
            return;
        }

        // -------------- START NEW CALCULATION -------------- \\
        resetSession();                            /* wipe previous data/DOM before a new number */

        setStateValue('activeInputValue', BigInt(mainInputField.value)); /* store the input as BigInt */

        /* send the active input value to the Worker Manager */
        workerManager_Recieve(getSpecificState('activeInputValue'));
        /* Worker Manager is going to send our Input Value to Worker :D */

        setRunButtonMode(true);     
    }  

    runProcess_Elements.runButton.addEventListener('click', (e) => {
        if (state.outputMode === 'manual') return;
        startRunProcess();
    });
    document.addEventListener('keydown', (e) => {
        if (state.outputMode === 'manual') return;
        if (e.code === 'Space' && !e.repeat) { e.preventDefault(); startRunProcess(); }
    });

    // -------------- AUTO-RETURN BUTTON WHEN OUTPUT FINISHES -------------- \\
    /* when the output finishes by itself (normal way or via skip) — */
    /* the button must return to "Run" without the user's help       */
    SBSeventTarget.addEventListener('sbs_done', () => {
        setRunButtonMode(false);
    });

    // -------------- SKIP BUTTON -------------- \\
    function skipProcess() {
        if (state.isComputing) return;                  /* don't skip while worker is busy */
        /* nothing to skip: never started, nothing shown yet and no data at all */
        if (!SBSconfig.isRunning && SBSconfig.currentStepIndex === 0 && !SBSconfig.doneRunning && state.workerResult.length === 0) return;

        skipSBS();                                      /* show all remaining items at once */
        setRunButtonMode(false);
    }


    runProcess_Elements.skipButton.addEventListener('click', skipProcess);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyF' && !e.repeat) skipProcess(); 
    });

    // -------------- RESET BUTTON -------------- \\
    function resetProcess() {
        /* don't reset while worker is counting — nobody would stop it */
        if (state.isComputing) return;
    
        resetSession();                            /* clear the output session */
    }

    runProcess_Elements.resetButton.addEventListener('click', resetProcess);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyR' && !e.repeat) resetProcess(); 
    });

    // -------------- SBS MANUAL CONTROLS -------------- \\
    // -------------- 1. SHOW NEXT BATCH -------------- \\
    runProcess_Elements.nextButton.addEventListener('click', () => {
        if (!state.outputMode === 'manual') return;
        addOneBatchSBS();
    });
    document.addEventListener('keydown', (e) => {
        if (state.outputMode != 'manual') return;
        if (e.code === 'KeyZ' && !e.repeat) addOneBatchSBS(); 
    }); 

    // -------------- 2. REMOVE ONE BATCH -------------- \\
    runProcess_Elements.backButton.addEventListener('click', () => {
        if (!state.outputMode === 'manual') return;
        removeOneBatchSBS();
    });
    document.addEventListener('keydown', (e) => {
        if (state.outputMode != 'manual') return;
        if (e.code === 'KeyX' && !e.repeat) removeOneBatchSBS(); 
    }); 
}