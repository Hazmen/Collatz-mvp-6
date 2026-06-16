import { $, $$, $$$ } from './utils/dom.js';
import { InputControlsHere } from './ui/inputControls.js';
import { mainInputField, preventLetters } from './ui/uiElements.js';
// ... другие импорты

// input controls
InputControlsHere(); // It should work..

// input itself
preventLetters(mainInputField);

