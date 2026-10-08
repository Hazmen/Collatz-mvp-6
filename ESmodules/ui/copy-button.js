import { copyButton } from "./uiElements.js";
import { SBSconfig, state } from "../state/state.js";
import { showToast } from "./toast.js";

copyButton.addEventListener('click', () => {
    if (state.workerResult?.length && SBSconfig.visibleItems?.length) {
        const dataToCopy = SBSconfig.visibleItems.join('\n');

        navigator.clipboard.writeText(dataToCopy).then(() => {
            showToast('Copied Succesfully!', 'All sequence is copied.', 'green', 2000);
            copyButton.innerHTML = 
            `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
                <path fill="none" stroke="#44ef74" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M416 128L192 384l-96-96"/>
            </svg>
            `;

            setTimeout(() => {
                copyButton.innerHTML = 
                `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
                    <rect width="336" height="336" x="128" y="128" fill="none" stroke="#ffffff" stroke-linejoin="round" stroke-width="32.00" rx="57" ry="57"/>
                    <path fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="32.00" d="m383.5 128l.5-24a56.16 56.16 0 0 0-56-56H112a64.19 64.19 0 0 0-64 64v216a56.16 56.16 0 0 0 56 56h24"/>
                </svg>
                `
            }, 1750);
        }).catch((err) => {
            console.error('Failed to copy:', err);
            showToast('Error', 'Failed to copy.', '#fc0320', 2500);
        })
    } else {
        copyButton.innerHTML = 
        `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
            <path fill="none" stroke="#ff8080" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144M368 144L144 368"/>
        </svg>
        `;

        showToast('Error', 'Nothing to copy.', '#fc0320', 2500);

        setTimeout(() => {
            copyButton.innerHTML = 
            `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
                <rect width="336" height="336" x="128" y="128" fill="none" stroke="#ffffff" stroke-linejoin="round" stroke-width="32.00" rx="57" ry="57"/>
                <path fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="32.00" d="m383.5 128l.5-24a56.16 56.16 0 0 0-56-56H112a64.19 64.19 0 0 0-64 64v216a56.16 56.16 0 0 0 56 56h24"/>
            </svg>
            `
        }, 1750);
    }
})