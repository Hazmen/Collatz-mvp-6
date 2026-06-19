import { $, $$, $$$ } from '../utils/dom.js';

// THERE SHOULD BE ONLY LINKS TO REAL DOM ELEMENTS!!!

export let mainInputField = $$$('number-input'); // INPUT field

// Run process controls
export const runButton = $('.proc-run');
export const resetButton = $('.proc-reset');
export const skipButton = $('.proc-skip'); 

// sequence list Text version
export let txtList = $('.sequence-list');
export function txtListObj_create(parent, index, number) {
    const txtList_div = document.createElement('div');

    const txtList_obj = 
    `
    <div class="txtList-obj">
        <span class="txtList-span">${index}</span>
        <span class="txtList-num font-bold">${number}</span>
    </div>
    `;

    if (parent) {
        parent.insertAdjacentHTML('beforeend', txtList_obj);
    }
}

// idk i need style values for smth
export let seqListObj_Font = $('.txtList-obj_font');


export function preventLetters(inp) {
    inp.addEventListener('beforeinput', (e) => {
        if (e.data && !/^[0-9]+$/.test(e.data)) {
            e.preventDefault();
        }
    });
};

export function updateUsinp(inp) {
    inp.addEventListener('input', () => {
        return BigInt(inp.value);
    });
}



