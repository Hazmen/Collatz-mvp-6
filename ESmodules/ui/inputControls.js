import { $, $$, $$$ } from '../utils/dom.js';
// import store from '../../ESmodules/store.js';

// Nescessary DOM elements

let usinp = $('.number-input');

let randInp = $('.rand-inp');
let clearInp = $('.clear-inp');
let saveInp = $('.save-inp');

// LOGIC of Random Input Value button

const MAX_RANDOM = 99999999999n;

export function InputControlsHere() {
    function LetItRandom(setMax) {
        const digits = setMax.toString().length;
        let result;

        do {
            let strList = [];

            for (let i = 0; i < digits; i++) {
                strList.push(Math.floor(Math.random() * 10));
            }

            strList = strList.join('');
            result = BigInt(strList);
        } while (result === 0n || result >= setMax);

        return result;
    }

    randInp.addEventListener('click', () => {
        const randResult = LetItRandom(MAX_RANDOM);
        usinp.value = randResult.toString();

        usinp.dispatchEvent(new Event('input', { bubbles: true }));
        usinp.focus();
    });

    // LOGIC of Clear Input (value) button

    clearInp.addEventListener('click', () => {
        usinp.value = '';

        usinp.dispatchEvent(new Event('input', { bubbles: true }));
        usinp.focus();
    });

    // LOGIC of Save Input (value) button
}

