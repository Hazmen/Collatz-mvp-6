import { $, $$, $$$ } from '../utils/dom.js';

// $ -> document.querySelector();
// $$ -> document.querySelectorAll();
// $$$ -> document.getElementById();

// THERE SHOULD BE ONLY LINKS TO REAL DOM ELEMENTS!!!

// Main input field
export let mainInputField = $$$('number-input'); // INPUT field

// Run process controls
export const runButton = $('.proc-run');
export const resetButton = $('.proc-reset');
export const skipButton = $('.proc-skip'); 
export const nextButton = $('.proc-showNext');
export const backButton = $('.proc-delLast');

export const manualBtns_container = $('.sbs-manual_controllers');

// Reset (Normal / Hard) DOM elements
export const resetHint = $$$('reset-hint');

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

// toast — автономный доступ, лениво (DOM может ещё не быть готов при импорте)
export const toastRoot = document.documentElement;
function ensureContainer(id, ariaLabel) {
    let s = document.getElementById(id);
    if (s) return s;
    s = document.createElement('div');
    s.id = id;
    if (id === 'toast-container') {
        s.setAttribute('role', 'log');
        s.setAttribute('aria-live', 'polite');
        s.setAttribute('aria-label', ariaLabel || 'Notifications');
    } else {
        s.setAttribute('aria-live', 'polite');
        s.setAttribute('aria-atomic', 'false');
    }
    document.body.appendChild(s);
    return s;
}
export const getToastContainer = () => ensureContainer('toast-container', 'Notifications');
// legacy: центр сверху, оставлен для совместимости
export const getToastStack = () => ensureContainer('toast-stack');
export const getToastTemplate = () => document.getElementById('toast-template');


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






