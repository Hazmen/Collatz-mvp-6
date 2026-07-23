import { speedState } from "../ESmodules/state/state.js";

class SpeedController extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
        <style>
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
                margin-top: 24px;
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
            <!-- Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0 0.25rem;">
                <span style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8;">
                    Скорость вывода
                </span>
                <span class="speed-display" style="font-size:0.875rem; font-family:monospace; font-weight:bold; color:#a5b4fc; font-variant-numeric:tabular-nums; min-width:5rem; text-align:right;">
                    Выкл
                </span>
            </div>
        
            <!-- Slider -->
            <div style="display:flex; flex-direction:column; gap:0.25rem; padding:0 0.125rem;">
                <input type="range" id="speed-slider" min="0" max="5000" value="0" step="10" class="speed-slider">
                <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; font-family:monospace; padding:0 0.125rem; margin-top:0.125rem;">
                    <span>Выкл</span>
                    <span>1с</span>
                    <span>2с</span>
                    <span>3с</span>
                    <span>4с</span>
                    <span>5с</span>
                </div>
            </div>
        
            <!-- Preset buttons -->
            <div style="display:flex; flex-wrap:wrap; gap:0.375rem; justify-content:center;">
                <button data-ms="0" class="speed-preset active">Выкл</button>
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
        
            <!-- Batch size -->
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0 0.25rem; gap:0.75rem;">
                <span style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8; flex-shrink:0;">
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
        </div>
        `
    }

    connectedCallback() {
        const root = this.shadowRoot;

        const speedSlider = root.getElementById('speed-slider');
        const speedDisplay = root.querySelector('.speed-display');
        const batchInput = root.getElementById('batch-input');
        const batchDecr = root.getElementById('batch-decr');
        const batchIncr = root.getElementById('batch-incr');

        speedState.intervalMs = 0;
        speedState.batchSize = 1;

        const clampBatch = (val) => Math.max(1, Math.min(10000, Math.round(val)));

        const formatSpeed = (ms) => {
            if (ms === 0) return 'Выкл';
            if (ms < 1000) return ms + 'ms';
            return (ms / 1000).toFixed(1).replace(/\.0$/, '') + 'c';
        };

        const updateSpeedDisplay = () => {
            const ms = parseInt(speedSlider.value, 10);
            speedState.intervalMs = ms;
            speedDisplay.textContent = formatSpeed(ms);
            root.querySelectorAll('.speed-preset').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.ms, 10) === ms);
            });
        };

        const updateBatchDisplay = () => {
            const val = clampBatch(parseInt(batchInput.value, 10));
            batchInput.value = val;
            speedState.batchSize = val;
            root.querySelectorAll('.batch-preset').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.batch, 10) === val);
            });
        };

        speedSlider.addEventListener('input', updateSpeedDisplay);

        root.querySelectorAll('.speed-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                speedSlider.value = btn.dataset.ms;
                updateSpeedDisplay();
            });
        });

        batchInput.addEventListener('input', updateBatchDisplay);
        batchInput.addEventListener('change', updateBatchDisplay);

        batchDecr.addEventListener('click', () => {
            batchInput.value = clampBatch(parseInt(batchInput.value, 10) - 1);
            updateBatchDisplay();
        });

        batchIncr.addEventListener('click', () => {
            batchInput.value = clampBatch(parseInt(batchInput.value, 10) + 1);
            updateBatchDisplay();
        });

        root.querySelectorAll('.batch-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                batchInput.value = btn.dataset.batch;
                updateBatchDisplay();
            });
        });

        updateSpeedDisplay();
        updateBatchDisplay();

        window.__speedState = speedState;
    }
}

customElements.define('speed-controller', SpeedController);