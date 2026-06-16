import { $, $$, $$$ } from '../utils/dom.js';

// THERE SHOULD BE ONLY LINKS TO REAL DOM ELEMENTS!!!

export let mainInputField = $$$('number-input');

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



