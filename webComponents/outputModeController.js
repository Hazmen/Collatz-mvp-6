import { state } from "../ESmodules/state/state.js";
import { sendOutputMode_ChangeEvent } from '../ESmodules/state/events.js';

// ------ CONSTANTS & SHARED EVENT BUS ------ \\
const VALID_MODES = ['instant', 'auto', 'manual']; /* allowed output modes */
const PADDING = 5;                                 /* inner padding for the slider math */
const SMOOTH_EASING = 'cubicBezier(0.16, 1, 0.3, 1)'; /* anime.js easing for slider motion */

export const outputMode_EventTarget = new EventTarget(); /* global bus for mode changes */

class OutputModeControl extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // ------ INIT STATE ------ \\
        this._mode = VALID_MODES.includes(state.outputMode) ? state.outputMode : 'instant'; /* fallback to instant */
        this._expanded = this._mode === 'auto' || this._mode === 'manual';                  /* SBS splits into Auto/Manual */

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                --bg-main: #1f2937;
                --control-bg: rgba(15, 23, 42, 0.6);
                --border-color: rgba(30, 41, 59, 0.9);
                --slider-bg: linear-gradient(135deg, #4f46e5, #7c3aed);
                --text-main: #ffffff;
                --text-invert: #ffffff;
                --accent-glow: rgba(99, 102, 241, 0.2);
                display: block;
            }

            * { margin: 0; padding: 0; box-sizing: border-box; }

            .segmented-control_container {
                margin-top: 24px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .segCont_label {
                font-size: 22px;
                font-weight: 800;
                letter-spacing: -0.025em;
                line-height: 1.1;
                text-align: center;
                color: #f1f5f9;
                // text-shadow: 0 2px 18px rgba(99, 102, 241, 0.35), 0 1px 0 rgba(255,255,255,0.08);
                margin: 0 0 2px 0;
                position: relative;
                padding-bottom: 10px;
                user-select: none;
            }

            // .segCont_label::after {
            //     content: "";
            //     position: absolute;
            //     left: 50%;
            //     bottom: 0;
            //     transform: translateX(-50%);
            //     width: 36px;
            //     height: 3px;
            //     border-radius: 9999px;
            //     background: linear-gradient(90deg, #6366f1, #8b5cf6);
            //     box-shadow: 0 0 14px rgba(99, 102, 241, 0.7), 0 0 6px rgba(139, 92, 246, 0.5);
            //     opacity: 0.95;
            // }

            .segmented-control {
                position: relative;
                background: var(--control-bg);
                border: 1px solid var(--border-color);
                border-radius: 9999px;
                height: 58px;
                width: 340px;
                padding: ${PADDING}px;
                user-select: none;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 30px var(--accent-glow);
                margin: 25px;
            }

            .slider {
                position: absolute;
                top: ${PADDING}px;
                left: ${PADDING}px;
                height: calc(100% - ${PADDING * 2}px);
                width: calc(50% - ${PADDING}px);
                background: var(--slider-bg);
                border-radius: 9999px;
                pointer-events: none;
                z-index: 1;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                will-change: left, width;
            }

            .labels {
                position: absolute;
                inset: ${PADDING}px;
                display: flex;
                z-index: 2;
            }

            .clip-mask {
                position: absolute;
                top: ${PADDING}px;
                left: ${PADDING}px;
                height: calc(100% - ${PADDING * 2}px);
                width: calc(50% - ${PADDING}px);
                overflow: hidden;
                pointer-events: none;
                border-radius: 9999px;
                z-index: 3;
                will-change: left, width;
            }

            .labels-invert {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                display: flex;
                will-change: left;
            }

            .labels-invert .option span,
            .labels-invert .sbs-single {
                color: var(--text-invert);
            }

            .option {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border-radius: 9999px;
                position: relative;
            }

            .labels-invert .option {
                cursor: default;
            }

            .option input {
                position: absolute;
                opacity: 0;
                pointer-events: none;
            }

            .option span {
                font-size: 14px;
                font-weight: 600;
                letter-spacing: -0.01em;
                color: var(--text-main);
                white-space: nowrap;
            }

            .sbs-wrapper {
                flex: 1;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
            }

            .sbs-single {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-main);
                cursor: pointer;
                border-radius: 9999px;
                will-change: transform, opacity;
            }

            .labels-invert .sbs-single {
                cursor: default;
            }

            .sbs-split {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                opacity: 0;
                pointer-events: none;
                will-change: transform, opacity;
            }

            .labels-invert .sbs-split {
                pointer-events: none !important;
            }

            .sbs-split .option {
                flex: 1;
            }

            .divider {
                width: 1px;
                height: 35%;
                background: var(--border-color);
                opacity: 0;
                flex-shrink: 0;
                will-change: opacity;
                display: none;
            }

            .labels-invert .divider {
                background: rgba(0,0,0,0.15);
            }

            @media (max-width: 480px) {
                .segmented-control {
                    height: 52px;
                    width: 290px;
                }
            }
        </style>

        <div class="segmented-control_container">
            <h1 class="segCont_label">Output Mode</h1>

            <div class="segmented-control">
                <div class="slider"></div>

                <div class="labels">
                    <label class="option" data-value="instant">
                        <input type="radio" name="mode" value="instant">
                        <span>Instant</span>
                    </label>

                    <div class="sbs-wrapper">
                        <div class="sbs-single">Step By Step</div>

                        <div class="sbs-split">
                            <label class="option" data-value="auto">
                                <input type="radio" name="mode" value="auto">
                                <span>Auto</span>
                            </label>
                            <div class="divider"></div>
                            <label class="option" data-value="manual">
                                <input type="radio" name="mode" value="manual">
                                <span>Manual</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="clip-mask">
                    <div class="labels-invert">
                        <label class="option" data-value="instant">
                            <span>Instant</span>
                        </label>

                        <div class="sbs-wrapper">
                            <div class="sbs-single">Step By Step</div>

                            <div class="sbs-split">
                                <label class="option" data-value="auto">
                                    <span>Auto</span>
                                </label>
                                <div class="divider"></div>
                                <label class="option" data-value="manual">
                                    <span>Manual</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // ------ LIFECYCLE: ATTACH ------ \\
    connectedCallback() {

        // ------ CACHE DOM REFS ------ \\
        this.control = this.shadowRoot.querySelector('.segmented-control');
        this.slider = this.shadowRoot.querySelector('.slider');
        this.clipMask = this.shadowRoot.querySelector('.clip-mask');
        this.labels = this.shadowRoot.querySelector('.labels');
        this.labelsInvert = this.shadowRoot.querySelector('.labels-invert');
        this.sbsSingle = this.shadowRoot.querySelector('.labels .sbs-single');
        this.labelsSplit = this.shadowRoot.querySelector('.labels .sbs-split');

        this.allSbsSingle = this.shadowRoot.querySelectorAll('.sbs-single');
        this.allSbsSplit = this.shadowRoot.querySelectorAll('.sbs-split');
        this.allDividers = this.shadowRoot.querySelectorAll('.divider');

        this.instantOption = this.shadowRoot.querySelector('.labels [data-value="instant"]');
        this.autoOption = this.shadowRoot.querySelector('.labels [data-value="auto"]');
        this.manualOption = this.shadowRoot.querySelector('.labels [data-value="manual"]');

        // ------ CLICK HANDLERS ------ \\
        this.instantOption.addEventListener('click', () => {
            if (this._mode === 'instant') return;   /* already there */
            this.collapseSBS(true);                 /* shrink SBS back to single label */
        });

        this.sbsSingle.addEventListener('click', (e) => {
            const rect = this.sbsSingle.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const target = x < rect.width / 2 ? 'auto' : 'manual'; /* left half = Auto, right = Manual */
            this.expandSBS(target, true);
        });

        this.autoOption.addEventListener('click', () => this.selectSbsChild('auto'));
        this.manualOption.addEventListener('click', () => this.selectSbsChild('manual'));

        // ------ KEEP SLIDER IN SYNC ON RESIZE ------ \\
        this.resizeObserver = new ResizeObserver(() => {
            this.moveSliderTo(this.getSliderPos(this._mode), false); /* re-measure, no animation */
        });
        this.resizeObserver.observe(this.control);

        // ------ INITIAL PAINT ------ \\
        if (this._expanded) {
            this.expandSBS(this._mode, false);      /* show Auto/Manual split immediately */
        } else {
            this.applyState(false);                 /* single "Step By Step" label */
        }
    }

    // ------ LIFECYCLE: DETACH ------ \\
    disconnectedCallback() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
    }

    // ------ MODE ACCESSOR ------ \\
    get mode() {
        return this._mode;
    }

    set mode(value) {
        if (!VALID_MODES.includes(value)) return;   /* ignore unknown values */
        this._expanded = value === 'auto' || value === 'manual';
        if (this._expanded) {
            this.expandSBS(value, false);           /* enter expanded SBS state */
        } else {
            this.collapseSBS(false);                /* back to Instant */
        }
    }

    // ------ SYNC INVERT LAYER WIDTH ------ \\
    syncInvertWidth() {
        const innerWidth = this.labels.getBoundingClientRect().width;
        this.labelsInvert.style.width = innerWidth + 'px'; /* inverted labels must match visible ones */
    }

    // ------ CALCULATE SLIDER GEOMETRY FOR A MODE ------ \\
    getSliderPos(target) {
        const controlRect = this.control.getBoundingClientRect();
        const innerWidth = controlRect.width - PADDING * 2;
        const halfWidth = innerWidth / 2;           /* Instant or whole SBS block */
        const quarterWidth = innerWidth / 4;        /* Auto or Manual each takes 1/4 */

        if (target === 'instant') {
            return { left: PADDING, width: halfWidth };
        }
        if (target === 'auto') {
            return { left: PADDING + halfWidth, width: quarterWidth }; /* first quarter of SBS half */
        }
        return { left: PADDING + halfWidth + quarterWidth, width: quarterWidth }; /* second quarter */
    }

    // ------ MOVE SLIDER + INVERT MASK TOGETHER ------ \\
    moveSliderTo(pos, animate) {
        this.syncInvertWidth();
        const invertLeft = -(pos.left - PADDING);   /* inverted layer moves opposite to stay aligned */

        anime.remove([this.slider, this.clipMask, this.labelsInvert]); /* cancel running tweens */

        if (animate) {
            const duration = 420;
            anime({
                targets: [this.slider, this.clipMask],
                left: pos.left,
                width: pos.width,
                duration: duration,                 /* slide + resize together */
                easing: SMOOTH_EASING
            });

            anime({
                targets: this.labelsInvert,
                left: invertLeft,                   /* counter-move keeps text visually static */
                duration: duration,
                easing: SMOOTH_EASING
            });
        } else {
            this.slider.style.left = pos.left + 'px';
            this.slider.style.width = pos.width + 'px';
            this.clipMask.style.left = pos.left + 'px';
            this.clipMask.style.width = pos.width + 'px';
            this.labelsInvert.style.left = invertLeft + 'px';
        }
    }

    // ------ SYNC HIDDEN RADIO STATE ------ \\
    syncRadio() {
        const radio = this.shadowRoot.querySelector(`.labels input[value="${this._mode}"]`);
        if (radio) radio.checked = true;            /* keep form state consistent */
    }

    // ------ APPLY VISUAL STATE FOR CURRENT MODE ------ \\
    applyState(animate) {
        const pos = this.getSliderPos(this._mode);

        if (this._expanded) {
            this.allSbsSingle.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'scale(0.85)'; /* shrink single label out */
                el.style.pointerEvents = 'none';
            });
            this.allSbsSplit.forEach(el => { el.style.opacity = '1'; el.style.transform = 'scale(1)'; }); /* reveal Auto/Manual */
            this.sbsSingle.style.pointerEvents = 'none';
            this.labelsSplit.style.pointerEvents = 'auto';
            this.allDividers.forEach(el => el.style.opacity = '1'); /* show divider between Auto/Manual */
        } else {
            this.allSbsSingle.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'scale(1)';    /* show single label */
            });
            this.sbsSingle.style.pointerEvents = 'auto';
            this.allSbsSplit.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'scale(0.95)'; /* hide split labels */
                el.style.pointerEvents = 'none';
            });
            this.allDividers.forEach(el => el.style.opacity = '0');
        }

        this.moveSliderTo(pos, animate);
        this.syncRadio();
    }

    // ------ EXPAND SBS: SINGLE -> SPLIT (AUTO/MANUAL) ------ \\
    expandSBS(target, animate) {
        this._expanded = true;
        this._mode = target;                        /* new child mode */

        anime.remove(this.allSbsSingle);
        anime.remove(this.allSbsSplit);
        anime.remove(this.allDividers);             /* stop previous animations */

        if (animate) {
            // ------ FADE OUT SINGLE LABEL ------ \\
            anime({
                targets: this.allSbsSingle,
                scale: 0.85,
                opacity: 0,
                duration: 220,
                easing: SMOOTH_EASING,
                begin: () => { this.sbsSingle.style.pointerEvents = 'none'; }
            });

            // ------ FADE IN SPLIT LABELS ------ \\
            anime({
                targets: this.allSbsSplit,
                opacity: 1,
                scale: 1,
                duration: 320,
                easing: SMOOTH_EASING,
                begin: () => { this.labelsSplit.style.pointerEvents = 'auto'; }
            });

            // ------ REVEAL DIVIDER ------ \\
            anime({
                targets: this.allDividers,
                opacity: 1,
                duration: 300,
                easing: SMOOTH_EASING
            });

            this.moveSliderTo(this.getSliderPos(this._mode), true);
        } else {
            this.applyState(false);                 /* instant layout, no tween */
        }

        this.syncRadio();
        this.commit();
    }

    // ------ COLLAPSE SBS: SPLIT -> SINGLE (INSTANT) ------ \\
    collapseSBS(animate) {
        this._expanded = false;
        this._mode = 'instant';

        anime.remove(this.allSbsSingle);
        anime.remove(this.allSbsSplit);
        anime.remove(this.allDividers);

        if (animate) {
            // ------ FADE OUT SPLIT LABELS ------ \\
            anime({
                targets: this.allSbsSplit,
                opacity: 0,
                scale: 0.95,
                duration: 180,
                easing: SMOOTH_EASING,
                begin: () => { this.labelsSplit.style.pointerEvents = 'none'; }
            });

            // ------ HIDE DIVIDER ------ \\
            anime({
                targets: this.allDividers,
                opacity: 0,
                duration: 150,
                easing: SMOOTH_EASING
            });

            // ------ FADE IN SINGLE LABEL ------ \\
            anime({
                targets: this.allSbsSingle,
                scale: 1,
                opacity: 1,
                duration: 320,
                easing: SMOOTH_EASING,
                begin: () => { this.sbsSingle.style.pointerEvents = 'auto'; }
            });

            this.moveSliderTo(this.getSliderPos('instant'), true);
        } else {
            this.applyState(false);
        }

        this.syncRadio();
        this.commit();
    }

    // ------ SWITCH BETWEEN AUTO <-> MANUAL (ALREADY EXPANDED) ------ \\
    selectSbsChild(target) {
        if (this._mode === target) return;          /* no-op if same child */
        this._mode = target;
        this.moveSliderTo(this.getSliderPos(target), true); /* slide quarter-width */
        this.syncRadio();
        this.commit();
    }

    // ------ COMMIT MODE TO GLOBAL STATE ------ \\
    commit() {
        state.outputMode = this._mode;              /* persist in shared state */
        sendOutputMode_ChangeEvent(outputMode_EventTarget, state.outputMode); /* notify listeners */
    }
}

customElements.define('output-mode-control', OutputModeControl);