import { SBSconfig } from "../state/state.js";

export function PlayOrPause() {
    SBSconfig.isRunning = !SBSconfig.isRunning;
    const btn = document.querySelector('.proc-run');
    if (!btn) return;
    if (SBSconfig.isRunning) {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="ml-0.5"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>`;
        btn.title = "Пауза";
    } else {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="ml-0.5"><path d="M8 5v14l11-7z"/></svg>`;
        btn.title = "Запустить";
    }
}
