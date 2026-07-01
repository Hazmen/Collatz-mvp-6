import { $, $$, $$$ } from '../utils/dom.js';
import { mainInputField, inputControls_Elements } from './uiElements.js'
// import store from '../../ESmodules/store.js';
// Nescessary DOM elements


// INPUT lock
export function preventLetters(inp) {
    inp.addEventListener('beforeinput', (e) => {
        if (e.data && !/^[0-9]+$/.test(e.data)) {
            e.preventDefault();
        }
    });
};

// LOGIC of Random Input Value button

export function InputControlsHere() {
    const setMax = 99999999999n;
    function LetItRandom() {
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

    inputControls_Elements.randomInput.addEventListener('click', () => {
        const randResult = LetItRandom(setMax);
        mainInputField.value = randResult.toString();

        mainInputField.dispatchEvent(new Event('input', { bubbles: true }));
        mainInputField.focus();
    });

    // LOGIC of Clear Input (value) button

    inputControls_Elements.clearInput.addEventListener('click', () => {
        mainInputField.value = '';

        mainInputField.dispatchEvent(new Event('input', { bubbles: true }));
        mainInputField.focus();
    });

    // LOGIC of Save Input (value) button
    // soon to be made..
}

