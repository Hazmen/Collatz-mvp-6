import { seqList_Elements } from "../uiElements.js";
import { enableDragScroll } from "../dragModule.js";



export function txtListObj_create(parent, index, number) {
    // Check if the number is even or not, then decide what expression will stand beside the number in the object
    const isEven = (num) => num % 2 === 0;
    let expression = isEven(number) ? ': 2' : '× 3+ 1';
    const exp_color = isEven(number) ? 'text-emerald-400' : 'text-blue-400';

    const txtList_el = document.createElement("div");
    txtList_el.classList.add('txtList-obj', 'flex', 'flex-row', 'justify-between', 'overflow-x-hidden');

    const indexSpan = document.createElement('span');
    indexSpan.classList.add('txtList-index');
    indexSpan.textContent = `${index}.`

    const numSpan = document.createElement('span');
    numSpan.classList.add('txtList-num');
    numSpan.textContent = number;

    const expSpan = document.createElement('span');
    expSpan.classList.add('txtList-exp', 'math-exp-anim');
    expSpan.textContent = expression;

    enableDragScroll(numSpan, { horizontal: true, vertical: false });

    txtList_el.append(indexSpan, numSpan, expSpan);

    if (parent) {
        parent.appendChild( txtList_el );
    }
};


export function toWiden() {
    let isWide = false;
    seqList_Elements.txtList_sidebar.addEventListener('click', () => {
        seqList_Elements.txtList.classList.toggle('w-120');

        const allTxtListObjs = document.querySelectorAll('.txtList-obj');
        allTxtListObjs.forEach(obj => {
            obj.classList.toggle('expanded');
        });
    });
}

