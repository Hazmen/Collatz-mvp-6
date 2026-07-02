# Collatzium MVP 6 — Project Overview

A web-based interactive explorer for the Collatz conjecture (3n+1 problem), built with ES modules architecture. The application computes Collatz sequences for arbitrary BigInt inputs, streams results via Web Workers in chunks, and displays them in a step-by-step sequence list.

---

## 1. ES Modules Architecture

```
ESmodules/
├── 📄 main.js                    — Application entry point; wires modules together
│
├── 📁 app/                       — (reserved for future app-level orchestration)
├── 📁 controls/                  — (reserved for future control abstractions)
├── 📁 core/                      — (reserved for pure Collatz logic)
├── 📁 visualisation/             — (reserved for chart/map/chain visualization modes)
│
├── 📁 state/
│   └── 📄 state.js               — Centralized application state store
│
├── 📁 workers/
│   ├── 📄 collatz.worker.js      — Heavy Collatz computation in a background thread
│   └── 📄 workerManager.js       — Bridge between UI layer and the worker
│
├── 📁 ui/
│   ├── 📄 uiElements.js          — Map of all DOM element references
│   ├── 📄 inputControls.js       — Behavior of input-related buttons (random, clear)
│   ├── 📄 runProcessControls.js  — Behavior of process buttons (run, reset, skip)
│   └── 📄 sequenceView.js        — Renders sequence items into the DOM
│
└── 📁 utils/
    └── 📄 dom.js                 — Short DOM query helpers ($, $$, $$$)
```

---

## 2. Data Flow: How a Number Travels Through the System

```
HTML input contains a number (e.g., "27")
        │
        ▼
runProcessControls.js reads the input value
        │
        ▼
runProcessControls.js saves it as activeInputValue in state.js
        │
        ▼
workerManager.js receives activeInputValue and posts it to the worker
        │
        ▼
collatz.worker.js computes the Collatz sequence in chunks
        │
        ▼
workerManager.js receives chunk/done/error messages from the worker
        │
        ▼
sequenceView.js renders each chunk into the DOM sequence list
        │
        ▼
User sees the numbers appear in the list
```

The key boundary in this architecture: **the worker layer knows nothing about DOM**, and **the DOM layer knows nothing about Collatz math**. The state and workerManager act as the bridge between them.

---

## 3. Technologies & Dependencies

| Tool | Purpose |
|---|---|
| **Tailwind CSS 4** | Utility-first CSS framework for styling |
| **ES Modules** | Native browser module system (no bundler) |
| **Web Workers** | Background thread for non-blocking Collatz computation |
| **BigInt** | Arbitrary-precision integer arithmetic |
| **lite-server** | Local development server |
| **OverlayScrollbars** | Custom scrollbar library |

**Scripts (from `package.json`):**
- `npm run build:css` — Build Tailwind CSS output
- `npm run watch:css` — Watch and rebuild Tailwind CSS on changes
- `npm start` — Run both Tailwind watch and lite-server concurrently

---

## 4. Script Files: What Each One Does and Handles

Below is a breakdown of every non-empty code-containing file in the project (excluding `ready-to-use_script_folders/` which contains legacy/reserve scripts).

### `ESmodules/main.js` — Application Entry Point

The top-level entry point for the ES modules architecture. It imports the necessary top-level modules and performs initial setup:
- Initializes `InputControlsHere()` to wire up random/clear/save input button handlers.
- Applies `preventLetters(mainInputField)` to block non-digit characters from being typed into the input field.
- Remains intentionally short — it only orchestrates, never contains business logic.

---

### `ESmodules/utils/dom.js` — DOM Utility Helpers

Three tiny helper functions used across the entire project for querying DOM elements:

| Function | Signature | Description |
|---|---|---|
| `$` | `(selector, root?)` | Returns the first element matching a CSS selector. Analog of `querySelector`. |
| `$$` | `(selector, root?)` | Returns all elements matching a CSS selector as an array. Analog of `querySelectorAll`. |
| `$$$` | `(id)` | Returns an element by its `id`. Analog of `getElementById`. |

This module is a pure tool — it has no knowledge of Collatz math, workers, state, or UI logic.

---

### `ESmodules/ui/uiElements.js` — DOM Element Map

A centralized registry of all DOM element references used throughout the application. It answers the question *"Where are the elements on the page?"* — and nothing more.

**Individual references:**
- `mainInputField` — the main number input (`#number-input`)
- `runButton`, `resetButton`, `skipButton` — process control buttons
- `saveInput`, `clearInput`, `randomInput` — input control buttons
- `txtList` — the `.sequence-list` container where sequence items are rendered
- `seqListObj_Font` — a reference for font styling of sequence items

**Grouped references (batches):**
- `runProcess_Elements` — groups `runButton`, `resetButton`, `skipButton`
- `inputControls_Elements` — groups `saveInput`, `clearInput`, `randomInput`

This module **must not** contain `addEventListener` calls, BigInt logic, state mutations, or worker communication. It is a pure DOM reference map.

---

### `ESmodules/ui/inputControls.js` — Input Button Behavior

Handles the behavior of all buttons related to the number input field:

- **`preventLetters(inp)`**: Attaches a `beforeinput` event listener that blocks any non-digit characters from being typed. Only digits `0-9` are allowed.

- **`InputControlsHere()`**: Initializes all input control button handlers:
  - **Random button**: Generates a random BigInt up to `99999999999`, sets it as the input value, dispatches an `input` event (so other listeners react), and returns focus to the input.
  - **Clear button**: Empties the input field, dispatches an `input` event, and returns focus to the input.
  - **Save button**: Placeholder — logic is not yet implemented.

This module knows about `uiElements.js` but **must not** start the worker, render sequence items, or manage application state directly.

---

### `ESmodules/ui/runProcessControls.js` — Run/Reset/Skip Button Behavior

Handles the behavior of process control buttons. Currently implements the **Run** button flow:

1. **Pre-check layer**: Validates that the input is not empty and contains only digits. Shows an error alert if invalid.
2. **State update**: Saves the current input value as `activeInputValue` in `state.js` (via `setStateValue`). This freezes the value so subsequent input changes don't affect the ongoing computation.
3. **Worker dispatch**: Calls `workerManager_Recieve()` with the frozen `activeInputValue`, which forwards it to the Collatz web worker.

Reset and Skip button handlers are planned but not yet fully implemented.

This module knows about `uiElements.js` (for DOM elements), `state.js` (for state management), and `workerManager.js` (for dispatching work).

---

### `ESmodules/ui/sequenceView.js` — Sequence List Rendering

Responsible for creating visual items in the sequence list:

- **`txtListObj_create(parent, index, number)`**: Creates an HTML string for a single sequence row (containing the step index and the number value), then inserts it into the given parent container using `insertAdjacentHTML('beforeend', ...)`.

This module receives chunks of data from the worker (via workerManager) and renders them into the `.sequence-list` DOM container. It **must not** read the input, start the worker, compute Collatz, or manage state directly.

---

### `ESmodules/state/state.js` — Application State Store

A centralized plain-object state store shared across modules. Holds all runtime data:

| Property | Type | Description |
|---|---|---|
| `activeInputValue` | `BigInt` | The input value frozen at the moment Run was pressed |
| `inputError` | `Boolean` | Whether the input was invalid |
| `workerResult` | `Array` | Accumulated sequence numbers received as chunks from the worker |
| `workerListLen` | `Number` | Total number of steps in the sequence (received on `done`) |
| `workerMaxNum` | `BigInt` | The largest number reached in the sequence |
| `errorCause` | `String/null` | Error message if the worker reported an error |

**Exported functions:**
- `getState()` — returns the entire state object
- `getSpecificState(key)` — returns a single property by key
- `setState(patch)` — merges a partial object into the state
- `setStateValue(key, value)` — sets a single property
- `toReset()` — resets all state to initial values (for starting a new computation session)

This module **must not** know about DOM elements or depend on UI modules. It is a pure data layer.

---

### `ESmodules/workers/collatz.worker.js` — Collatz Computation Worker

The core computation unit running in a dedicated Web Worker thread. It receives a number, computes the full Collatz sequence, and streams results back in chunks.

**Algorithm:**
1. Converts input to `BigInt`.
2. Iterates the Collatz function: if even → `n/2`, if odd → `3n+1`.
3. Tracks the maximum value reached.
4. Slices the full sequence into chunks of `CHUNK_SIZE = 10,000` elements.

**Message contract (sent from worker to main thread):**
| Type | Payload | Meaning |
|---|---|---|
| `"chunk"` | `{ data: BigInt[], offset: number }` | A slice of the sequence. `offset` is the starting index in the full sequence, used to compute the real step index as `offset + localIndex`. |
| `"done"` | `{ steps: number, max: BigInt }` | Computation finished. `steps` is the total step count, `max` is the largest number reached. |
| `"error"` | `{ message: string }` | An exception occurred during computation. |

This worker **must not** know about DOM elements, buttons, input fields, state, or any UI concepts. It is pure math in isolation.

---

### `ESmodules/workers/workerManager.js` — Worker Bridge / Manager

Acts as the intermediary between the UI layer and the Collatz web worker. It abstracts all direct worker communication away from UI modules.

**Responsibilities:**
- Creates a single shared `Worker` instance from `collatz.worker.js`.
- Exposes `workerManager_Recieve(inputValue)` — the function UI modules call to start computation. Forwards the value to the worker via `postMessage`.
- Listens for worker messages (`onmessage`) and routes them:
  - **`chunk`** → pushes chunk data into `state.workerResult` for accumulation.
  - **`done`** → stores `steps` and `max` into `state.workerListLen` and `state.workerMaxNum`.
  - **`error`** → sets `state.errorCause` with an error indicator.

This module knows about `state.js` (for storing results) and the worker file path. It **must not** read the input directly, know about DOM elements, or render UI. It receives data from the UI layer and delivers it to the worker.

---

### `[OLD]_main.js` — Legacy Monolithic Main File (v5)

The previous monolithic version of the application preserved for reference. Contains everything in a single file (~500 lines):

- Direct DOM queries and element references
- Collatz computation worker setup and message handling
- Step-by-step animated sequence rendering with configurable speed
- Input validation, random BigInt generator, clear button
- Copy-to-clipboard functionality
- Error window with sound and animation
- Draggable window logic (commented out)
- Speed slider controls with multiple presets
- Scroll tracking for auto-scroll behavior
- Reset, Skip, and Play/Pause functionality

This file is not part of the current ES modules architecture. It remains as a reference of the previously working monolithic approach before the modular refactor.

---

## 5. Project Status

### Currently Working
- Input field with digit-only validation
- Random BigInt generation button
- Clear input button
- Run button → worker → chunk/done/error message flow
- State management (activeInputValue, workerResult, steps, max, error)
- Sequence view rendering (`txtListObj_create`)

### In Progress / Planned
- Reset button full implementation
- Skip button (show all at once)
- Play/Pause step-by-step animation
- Batch size control (10/100/1000)
- Visualization modes: chart, map, chain
- Save input button
- Statistics display
- Settings panel
- Search functionality

### Empty Reserved Directories
These directories exist as placeholders for future modules:
- `ESmodules/app/` — app-level orchestrator
- `ESmodules/controls/` — reusable control abstractions
- `ESmodules/core/` — pure Collatz math (extracted from worker)
- `ESmodules/visualisation/` — chart/map/chain rendering modules

---

## 6. How to Run

```bash
npm install
npm start
```

This starts both the Tailwind CSS watcher and lite-server. Open the provided localhost URL in a browser. The application uses native ES modules (`type="module"`), so it must be served over HTTP (not opened as a file).