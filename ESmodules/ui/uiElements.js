import { $, $$, $$$ } from '../utils/dom.js';

// THERE SHOULD BE ONLY LINKS TO REAL DOM ELEMENTS!!!

export let mainInputField = $$$('number-input'); // INPUT field

// Run process controls
export const runButton = $('.proc-run');
export const resetButton = $('.proc-reset');
export const skipButton = $('.proc-skip'); 
export const nextButton = $('.proc-showNext');
export const backButton = $('.proc-delLast');

export const manualBtns_container = $('.sbs-manual_controllers')


// input controls
export const saveInput = $('.save-inp'); 
export const clearInput = $('.clear-inp'); 
export const randomInput = $('.rand-inp'); 


// sequence list Text version
export let txtList = $('.sequence-list');
export const txtList_sidebar = $$$('seqList_sidebar_btn');

    
// idk i need style values for smth
export let seqListObj_Font = $('.txtList-obj_font');
export const txtList_num = $('.txtList-num');
export const seqListContainer = $('.sequence-list-container');


// !! BATCHES OF ELEMENTS !! // 

// Run Process Controls
export const runProcess_Elements = {
    runButton,
    resetButton,
    skipButton,

    nextButton,
    backButton
}

// input Controls 
export const inputControls_Elements = {
    saveInput,
    clearInput,
    randomInput
}

// Sequence List batch
export const seqList_Elements = {
    txtList,
    txtList_sidebar,
    seqListContainer
}






