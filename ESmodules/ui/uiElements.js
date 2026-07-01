import { $, $$, $$$ } from '../utils/dom.js';

// THERE SHOULD BE ONLY LINKS TO REAL DOM ELEMENTS!!!

export let mainInputField = $$$('number-input'); // INPUT field

// Run process controls
export const runButton = $('.proc-run');
export const resetButton = $('.proc-reset');
export const skipButton = $('.proc-skip'); 


// input controls
export const saveInput = $('.save-inp'); 
export const clearInput = $('.clear-inp'); 
export const randomInput = $('.rand-inp'); 


// sequence list Text version
export let txtList = $('.sequence-list');


// idk i need style values for smth
export let seqListObj_Font = $('.txtList-obj_font');



// !! BATCHES OF ELEMENTS !! // 

// Run Process Controls
export const runProcess_Elements = {
    runButton,
    resetButton,
    skipButton
}

// input Controls 
export const inputControls_Elements = {
    saveInput,
    clearInput,
    randomInput
}






