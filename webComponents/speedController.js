import { state, speedState } from "../ESmodules/state/state.js";
import { outputMode_EventTarget } from "./outputModeController.js";

class SpeedController extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                margin-top: 24px;
                transition: opacity 250ms ease, transform 250ms ease;
                transform-origin: top center;
            }
            :host(.is-hidden) {
                opacity: 0;
                transform: scaleY(0.9);
                pointer-events: none;
            }
            .speed-controller {
                width: 100%;
                max-width: 24rem;
                padding: 1.25rem;
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(30, 41, 59, 1);
                border-radius: 1.5rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                display: flex;
                flex-direction: column;
                gap: 1rem;
                user-select: none;
                transition: gap 260ms cubic-bezier(0.4, 0, 0.2, 1), padding 260ms ease;
            }

            .speed-controller.is-compact {
                gap: 0;
            }

            .controller-section {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                overflow: hidden;
                max-height: 420px;
                opacity: 1;
                transition:
                    max-height 320ms cubic-bezier(0.4, 0, 0.2, 1),
                    opacity 220ms ease,
                    transform 260ms cubic-bezier(0.4, 0, 0.2, 1);
                transform: scaleY(1);
                transform-origin: top center;
            }

            .controller-section.is-collapsed {
                max-height: 0;
                opacity: 0;
                transform: scaleY(0.92);
                pointer-events: none;
            }
        
            .speed-preset,
            .batch-preset {
                transition: all 150ms;
                border: 1px solid;
                font-weight: 600;
                cursor: pointer;
            }
            .speed-preset:active,
            .batch-preset:active {
                transform: scale(0.95);
            }
        
            .speed-preset {
                padding: 0.375rem 0.625rem;
                font-size: 0.75rem;
                border-radius: 0.75rem;
                background: rgba(30, 41, 59, 0.4);
                border-color: rgba(51, 65, 85, 0.3);
                color: #94a3b8;
            }
            .speed-preset:hover {
                color: white;
                background: rgba(51, 65, 85, 0.6);
                border-color: rgba(71, 85, 105, 0.5);
            }
            .speed-preset.active {
                background: rgba(99, 102, 241, 0.2);
                border-color: rgba(99, 102, 241, 0.4);
                color: #a5b4fc;
            }
        
            .batch-preset {
                padding: 0.25rem 0.5rem;
                font-size: 11px;
                border-radius: 0.75rem;
                background: rgba(30, 41, 59, 0.3);
                border-color: rgba(51, 65, 85, 0.2);
                color: #64748b;
            }
            .batch-preset:hover {
                color: white;
                background: rgba(51, 65, 85, 0.5);
                border-color: rgba(71, 85, 105, 0.4);
            }
            .batch-preset.active {
                background: rgba(99, 102, 241, 0.2);
                border-color: rgba(99, 102, 241, 0.4);
                color: #a5b4fc;
            }
        
            .speed-slider {
                width: 100%;
                height: 0.5rem;
                appearance: none;
                cursor: pointer;
                border-radius: 9999px;
                outline: none;
                background: linear-gradient(to right, #334155, #1e1b4b, #334155);
            }
            .speed-slider::-webkit-slider-thumb {
                appearance: none;
                width: 1.25rem;
                height: 1.25rem;
                border-radius: 50%;
                background: linear-gradient(to bottom right, #818cf8, #8b5cf6);
                box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
                border: 2px solid rgba(255, 255, 255, 0.2);
                transition: transform 100ms;
                cursor: pointer;
            }
            .speed-slider::-webkit-slider-thumb:hover {
                transform: scale(1.1);
            }
            .speed-slider::-webkit-slider-thumb:active {
                transform: scale(0.95);
            }
            .speed-slider::-moz-range-thumb {
                appearance: none;
                width: 1.25rem;
                height: 1.25rem;
                border-radius: 50%;
                background: linear-gradient(to bottom right, #818cf8, #8b5cf6);
                border: 2px solid rgba(255, 255, 255, 0.2);
                cursor: pointer;
            }
        
            .batch-input {
                width: 5rem;
                text-align: center;
                font-size: 0.875rem;
                font-family: monospace;
                font-weight: bold;
                color: #a5b4fc;
                background: rgba(2, 6, 23, 0.5);
                border: 1px solid rgba(51, 65, 85, 0.5);
                border-radius: 0.75rem;
                padding: 0.375rem 0.5rem;
                outline: none;
                transition: all 200ms;
                appearance: textfield;
            }
            .batch-input:focus {
                border-color: #6366f1;
                box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
            }
            .batch-input::-webkit-outer-spin-button,
            .batch-input::-webkit-inner-spin-button {
                appearance: none;
            }
        
            .btn-icon-sm {
                width: 2rem;
                height: 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #94a3b8;
                background: rgba(30, 41, 59, 0.4);
                border: 1px solid rgba(51, 65, 85, 0.3);
                border-radius: 0.75rem;
                transition: all 150ms;
                cursor: pointer;
            }
            .btn-icon-sm:hover {
                color: white;
                background: rgba(51, 65, 85, 0.6);
            }
            .btn-icon-sm:active {
                transform: scale(0.9);
            }
        </style>
        
        <div class="speed-controller">
            <section id="speed-section" class="controller-section">
                <!-- Header -->
                <div style="display:flex; justify-content:space-between; align-items:center; padding:0 0.25rem;">
                    <span style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8;">
                        Output speed
                    </span>
                    <span class="speed-display" style="font-size:0.875rem; font-family:monospace; font-weight:bold; color:#a5b4fc; font-variant-numeric:tabular-nums; min-width:5rem; text-align:right;">
                        Off
                    </span>
                </div>

                <!-- Slider -->
                <div style="display:flex; flex-direction:column; gap:0.25rem; padding:0 0.125rem;">
                    <input type="range" id="speed-slider" min="0" max="5000" value="500" step="10" class="speed-slider">
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; font-family:monospace; padding:0 0.125rem; margin-top:0.125rem;">
                        <span>Off</span>
                        <span>1с</span>
                        <span>2с</span>
                        <span>3с</span>
                        <span>4с</span>
                        <span>5с</span>
                    </div>
                </div>

                <!-- Preset buttons -->
                <div style="display:flex; flex-wrap:wrap; gap:0.375rem; justify-content:center;">
                    <button data-ms="0" class="speed-preset active">Off</button>
                    <button data-ms="50" class="speed-preset">50ms</button>
                    <button data-ms="100" class="speed-preset">100ms</button>
                    <button data-ms="250" class="speed-preset">250ms</button>
                    <button data-ms="500" class="speed-preset">500ms</button>
                    <button data-ms="750" class="speed-preset">750ms</button>
                    <button data-ms="1000" class="speed-preset">1000ms</button>
                    <button data-ms="2000" class="speed-preset">2000ms</button>
                </div>

                <!-- Divider -->
                <div style="border-top:1px solid rgba(30,41,59,0.8); margin:0.125rem 0;"></div>
            </section>

            <section id="batch-section" class="controller-section">
                <!-- Batch size -->
                <div style="display:flex; justify-content:space-between; align-items:center; padding:0 0.25rem; gap:0.75rem;">
                    <span class="batch_label" style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8; flex-shrink:0;">
                        Чисел за тик
                    </span>
                    <div style="display:flex; align-items:center; gap:0.375rem;">
                        <button id="batch-decr" class="btn-icon-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>
                        </button>
                        <input type="number" id="batch-input" value="1" min="1" max="10000" step="1" class="batch-input">
                        <button id="batch-incr" class="btn-icon-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Quick batch presets -->
                <div style="display:flex; flex-wrap:wrap; gap:0.375rem; justify-content:center; margin-top:-0.125rem;">
                    <button data-batch="1" class="batch-preset active">1</button>
                    <button data-batch="5" class="batch-preset">5</button>
                    <button data-batch="10" class="batch-preset">10</button>
                    <button data-batch="25" class="batch-preset">25</button>
                    <button data-batch="50" class="batch-preset">50</button>
                    <button data-batch="100" class="batch-preset">100</button>
                    <button data-batch="500" class="batch-preset">500</button>
                    <button data-batch="1000" class="batch-preset">1k</button>
                </div>
            </section>
        </div>
        `
    }

    // ------ LIFECYCLE: ATTACH ------ \\
    connectedCallback() {

        // ------ CACHE DOM REFS ------ \\
        const root = this.shadowRoot;

        const speedSlider = root.getElementById('speed-slider');
        const speedDisplay = root.querySelector('.speed-display');
        this.speedSection = root.getElementById('speed-section');
        this.batchSection = root.getElementById('batch-section');
        this._controllerEl = root.querySelector('.speed-controller');
        const batchInput = root.getElementById('batch-input');
        const batchDecr = root.getElementById('batch-decr');
        const batchIncr = root.getElementById('batch-incr');

        // ------ INIT SHARED STATE ------ \\
        speedState.intervalMs = 0;              /* default: no delay between ticks */
        speedState.batchSize = 1;               /* default: one number per tick */

        // ------ HELPERS ------ \\
        const clampBatch = (val) => Math.max(1, Math.min(10000, Math.round(val))); /* keep batch in [1, 10000] */

        const formatSpeed = (ms) => {           /* human-readable label for the delay */
            if (ms === 0) return 'Off';         /* 0 means SBS is effectively instant */
            if (ms < 1000) return ms + 'ms';
            return (ms / 1000).toFixed(1).replace(/\.0$/, '') + 's';
        };

        // ------ UPDATERS: SYNC UI <-> STATE ------ \\
        const updateSpeedDisplay = () => {
            const ms = parseInt(speedSlider.value, 10);
            speedState.intervalMs = ms;         /* push slider value to shared state */
            speedDisplay.textContent = formatSpeed(ms);
            root.querySelectorAll('.speed-preset').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.ms, 10) === ms); /* highlight matching preset */
            });
        };

        const updateBatchDisplay = () => {
            const val = clampBatch(parseInt(batchInput.value, 10));
            batchInput.value = val;             /* normalize the input */
            speedState.batchSize = val;         /* push batch size to shared state */
            root.querySelectorAll('.batch-preset').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.batch, 10) === val); /* highlight matching preset */
            });
        };

        // ------ SPEED CONTROLS: SLIDER + PRESETS ------ \\
        speedSlider.addEventListener('input', updateSpeedDisplay);

        root.querySelectorAll('.speed-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                speedSlider.value = btn.dataset.ms; /* preset drives the slider */
                updateSpeedDisplay();
            });
        });

        // ------ BATCH CONTROLS: INPUT + STEPPERS + PRESETS ------ \\
        batchInput.addEventListener('input', updateBatchDisplay);
        batchInput.addEventListener('change', updateBatchDisplay);

        batchDecr.addEventListener('click', () => {
            batchInput.value = clampBatch(parseInt(batchInput.value, 10) - 1); /* decrement by one */
            updateBatchDisplay();
        });

        batchIncr.addEventListener('click', () => {
            batchInput.value = clampBatch(parseInt(batchInput.value, 10) + 1); /* increment by one */
            updateBatchDisplay();
        });

        root.querySelectorAll('.batch-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                batchInput.value = btn.dataset.batch; /* preset drives the input */
                updateBatchDisplay();
            });
        });

        // ------ INITIAL RENDER ------ \\
        updateSpeedDisplay();
        updateBatchDisplay();

        // ------ OUTPUT-MODE SUBSCRIPTION ------ \\
        this._hostHideTimer = null;             /* timer for deferred display:none after fade-out */

        this.handleOutputModeChange = (event) => {
            this.applyMode(event.detail.selected_mode); /* react to global mode switch */
        };
        outputMode_EventTarget.addEventListener('outputMode_change', this.handleOutputModeChange);

        // ------ INITIAL VISIBILITY (NO ANIMATION) ------ \\
        /*
         * On first paint we apply the mode instantly without
         * transitions. "instant" means the whole controller stays
         * hidden; otherwise we prepare sections for the current mode.
         * Batch stays collapsed by requirement — "hide immediately".
         * Later switches will animate.
         */
        this.classList.toggle('is-hidden', state.outputMode === 'instant'); /* hide host in instant */
        if (state.outputMode === 'instant') this.style.display = 'none';
        this._toggleSection(this.speedSection, state.outputMode === 'auto', false); /* speed only in auto */
        this._toggleSection(this.batchSection, false, false);                        /* batch hidden on start */
        this._controllerEl.classList.toggle('is-compact', state.outputMode !== 'auto'); /* remove gap when speed hidden */

        window.__speedState = speedState;       /* expose for debugging */
    }

    // ------ LIFECYCLE: DETACH ------ \\
    disconnectedCallback() {
        outputMode_EventTarget.removeEventListener('output_change', this.handleOutputModeChange); /* NOTE: event name differs from subscribed one */
        if (this._hostHideTimer) clearTimeout(this._hostHideTimer);
    }

    // ------ HOST VISIBILITY WITH FADE ------ \\
    _setHostVisible(isVisible) {
        if (isVisible) {
            if (this._hostHideTimer) { clearTimeout(this._hostHideTimer); this._hostHideTimer = null; }
            this.style.display = '';            /* make host participate in layout again */
            void this.offsetWidth;              /* force reflow so the transition triggers */
            this.classList.remove('is-hidden');
        } else {
            if (this.classList.contains('is-hidden')) return;
            this.classList.add('is-hidden');    /* start fade-out */
            if (this._hostHideTimer) clearTimeout(this._hostHideTimer);
            this._hostHideTimer = setTimeout(() => {
                if (this.classList.contains('is-hidden')) this.style.display = 'none'; /* hide after animation */
                this._hostHideTimer = null;
            }, 260);                            /* matches CSS transition duration */
        }
    }

    // ------ SECTION TOGGLE (WITH OPTIONAL ANIMATION) ------ \\
    _toggleSection(section, show, animate = true) {
        if (!section) return;
        if (!animate) {
            section.style.transition = 'none';                  /* disable transition for instant switch */
            section.classList.toggle('is-collapsed', !show);    /* show/hide by collapsed class */
            void section.offsetHeight;                          /* force reflow */
            section.style.transition = '';                      /* restore transition */
            return;
        }
        section.classList.toggle('is-collapsed', !show);        /* animated toggle */
    }

    // ------ PUBLIC API: TOGGLE INDIVIDUAL SECTIONS ------ \\
    setSpeedSectionVisible(isVisible) {
        this._toggleSection(this.speedSection, isVisible, true);
    }

    setBatchSectionVisible(isVisible) {
        this._toggleSection(this.batchSection, isVisible, true);
    }

    // ------ APPLY OUTPUT MODE TO THE WHOLE CONTROLLER ------ \\
    applyMode(mode) {
        const isInstant = mode === 'instant';
        const isAuto = mode === 'auto';
        const isManual = mode === 'manual';

        // ------ HOST ------ \\
        this._setHostVisible(!isInstant);       /* instant hides the entire controller */

        /*
         * If the host was hidden, give it a short delay
         * so it can expand before inner sections animate.
         */
        const delay = !isInstant && this.classList.contains('is-hidden') ? 60 : 0;

        // ------ LABEL ------ \\
        this.shadowRoot.querySelector('.batch_label').textContent = isManual ? 'Numbers per click' : 'Numbers per tick'; /* manual vs auto wording */

        // ------ SECTIONS ------ \\
        const doToggle = () => {
            this._toggleSection(this.speedSection, isAuto, true);                 /* speed only in auto */
            this._toggleSection(this.batchSection, isAuto || isManual, true);     /* batch in auto + manual */
            /*
             * When the speed section is hidden, remove the gap
             * on the container — otherwise ~16px remains between
             * the top and the "Numbers per tick" row.
             */
            this._controllerEl.classList.toggle('is-compact', !isAuto);
        };

        if (delay) {
            setTimeout(doToggle, delay);
        } else {
            doToggle();
        }
    }
}

customElements.define('speed-controller', SpeedController);
