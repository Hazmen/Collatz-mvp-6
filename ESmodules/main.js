import { $, $$, $$$ } from './utils/dom.js';
import { InputControlsHere } from './ui/inputControls.js';
import { mainInputField } from './ui/uiElements.js';
import { preventLetters } from './ui/inputControls.js';
import { toWiden } from './ui/viewModes/sequenceView_Logic.js';
// ... другие импорты

// input controls
InputControlsHere(); // It should work..

// input itself
preventLetters(mainInputField);

// to Widen
toWiden();

