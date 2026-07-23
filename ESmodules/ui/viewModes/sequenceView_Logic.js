import { enableDragScroll } from "../dragModule.js";

export function txtListObj_create(parent, index, number) {
    const isEven = (number) => (number & 1n) === 0n;
    const isNumEven = isEven(number);

    const txtList_el = document.createElement("div");
    txtList_el.classList.add('txtList-obj');

    const topRow = document.createElement("div");
    topRow.classList.add('txtList-obj_item');

    const indexSpan = document.createElement('span');
    indexSpan.classList.add('txtList-index');
    indexSpan.textContent = `${index}.`;

    const numSpan = document.createElement('span');
    numSpan.classList.add('txtList-num');
    numSpan.textContent = `${number}`;

    enableDragScroll(numSpan, { horizontal: true, vertical: false });

    topRow.append(indexSpan, numSpan);

    const tagsBlock = document.createElement("div");
    tagsBlock.classList.add('txtList-tags');

    const tag = document.createElement('span');
    tag.classList.add(
        'text-[11px]', 'px-2', 'py-0.5', 'rounded-md', 'font-mono', 'font-semibold',
        'border', 'border-slate-700/50', 'bg-slate-800/50',
        isNumEven ? 'text-emerald-400' : 'text-blue-400'
    );
    tag.textContent = isNumEven ? '÷ 2' : '× 3 + 1';

    tagsBlock.appendChild(tag);

    txtList_el.append(topRow, tagsBlock);

    txtList_el.addEventListener('click', () => {
        tagsBlock.classList.toggle('max-h-12');
        tagsBlock.classList.toggle('opacity-100');
        tagsBlock.classList.toggle('mt-1');
        tagsBlock.classList.toggle('mb-0.5');
    });

    if (parent) {
        parent.appendChild(txtList_el);
    }
};


// export function toWiden() {
//     let isWide = false;
//     seqList_Elements.txtList_sidebar.addEventListener('click', () => {
//         seqList_Elements.txtList.classList.toggle('w-120');

//         const allTxtListObjs = document.querySelectorAll('.txtList-obj');
//         allTxtListObjs.forEach(obj => {
//             obj.classList.toggle('expanded');
//         });
//     });
// }

