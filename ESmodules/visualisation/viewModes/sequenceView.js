import { SBSeventTarget } from "../../core/SBSoutputManager.js";

import { seqList_Elements } from "../../ui/uiElements.js";
import { txtListObj_create } from "./sequenceView_Logic.js";
let userScrolled = false;
const cont = seqList_Elements.seqListContainer;

cont.addEventListener('scroll', () => {
    const isAtBottom = cont.scrollHeight - cont.scrollTop <= cont.clientHeight + 3;

    userScrolled = !isAtBottom
})

if (!userScrolled) {
    cont.scrollTop = cont.scrollHeight;
}

SBSeventTarget.addEventListener('sbs_batch', (event) => {
    const { batch, startIndex } = event.detail;

    for (let i = 0; i < batch.length; i++) {
        txtListObj_create(seqList_Elements.txtList, startIndex + i + 1, batch[i]);
    }
    
    if (!userScrolled) {
        cont.scrollTop = cont.scrollHeight;
    }
});

SBSeventTarget.addEventListener('sbs_removeBatch', (event) => {
    const { startIndex, endIndex } = event.detail;
    const list = seqList_Elements.txtList;

    for (let i = endIndex; i >= startIndex; i--) {
        list.removeChild(list.children[i]);
    }

    if (!userScrolled) cont.scrollTop = cont.scrollHeight;
});

SBSeventTarget.addEventListener('sbs_skip', (event) => {
    const { batch, startIndex } = event.detail;

    for (let i = 0; i < batch.length; i++) {
        txtListObj_create(seqList_Elements.txtList, startIndex + i + 1, batch[i]);
    }

    if (!userScrolled) {
        cont.scrollTop = cont.scrollHeight;
    }
});

SBSeventTarget.addEventListener('sbs_clear', () => {
    if (seqList_Elements.txtList) {
        seqList_Elements.txtList.innerHTML = '';
    }
});