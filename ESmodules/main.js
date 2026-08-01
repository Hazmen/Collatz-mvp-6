import { $, $$, $$$ } from './utils/dom.js';
import { InputControlsHere } from './ui/inputControls.js';
import { mainInputField, txtList } from './ui/uiElements.js';
import { SBSoutput } from './core/SBSoutputManager.js';
import { preventLetters } from './ui/inputControls.js';
import { RunSequenceCalc } from './ui/runProcessControls.js';
import '../webComponents/speedController.js';
import './visualisation/viewModes/sequenceView.js';

// input controls
InputControlsHere(); // It should work..

// run process controls
RunSequenceCalc();

// input itself
preventLetters(mainInputField);

SBSoutput();

// to Widen
// toWiden();

// txtListObj_create(txtList, 1, 123832728134628473857428574285742857428574285235n);
// txtListObj_create(txtList, 2, 1235n);

