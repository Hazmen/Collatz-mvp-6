import { SBSeventTarget } from "../../core/SBSoutputManager.js";
import { seqList_Elements } from "../../ui/uiElements.js";
import { txtListObj_create } from "./sequenceView_Logic.js";

SBSeventTarget.addEventListener('sbs_batch', (event) => {
    const { batch, startIndex } = event.detail;

    for (let i = 0; i < batch.length; i++) {
        txtListObj_create(seqList_Elements.txtList, startIndex + i + 1, batch[i]);
    }
});

SBSeventTarget.addEventListener('sbs_skip', (event) => {
    const { batch, startIndex } = event.detail;

    for (let i = 0; i < batch.length; i++) {
        txtListObj_create(seqList_Elements.txtList, startIndex + i + 1, batch[i]);
    }
});

SBSeventTarget.addEventListener('sbs_clear', () => {
    if (seqList_Elements.txtList) {
        seqList_Elements.txtList.innerHTML = '';
    }
});
