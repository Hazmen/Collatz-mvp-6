import { $, $$, $$$ } from './utils/dom.js';
import { InputControlsHere } from './ui/inputControls.js';
import { mainInputField } from './ui/uiElements.js';
import { preventLetters } from './ui/inputControls.js';
// ... другие импорты

// input controls
InputControlsHere(); // It should work..

// input itself
preventLetters(mainInputField);

