import { enableDragScroll } from "../../ui/dragModule.js";

// ------ CREATE A SINGLE SEQUENCE ROW ELEMENT ------ \\
export function txtListObj_create(parent, index, number) {

    // ------ EVEN/ODD CHECK ------ \\
    const isEven = (number) => (number & 1n) === 0n;    /* bitwise AND: 0 for even, 1 for odd */
    const isNumEven = isEven(number);                   /* decide which rule was applied */

    // ------ ROOT ELEMENT ------ \\
    const txtList_el = document.createElement("div");
    txtList_el.classList.add('txtList-obj');

    // ------ TOP ROW: INDEX + NUMBER ------ \\
    const topRow = document.createElement("div");
    topRow.classList.add('txtList-obj_item');

    const indexSpan = document.createElement('span');
    indexSpan.classList.add('txtList-index');
    indexSpan.textContent = `${index}.`;                /* step number, 1-based */

    const numSpan = document.createElement('span');
    numSpan.classList.add('txtList-num');
    numSpan.textContent = `${number}`;                  /* value of the sequence step */

    topRow.append(indexSpan, numSpan);

    // ------ TAGS BLOCK ------ \\
    const tagsBlock = document.createElement("div");
    tagsBlock.classList.add('txtList-tags');

    // ------ RULE TAG: WHICH COLLATZ STEP WAS APPLIED ------ \\
    const tag = document.createElement('span');
    tag.classList.add(
        'text-[11px]', 'px-2', 'py-0.5', 'rounded-md', 'font-mono', 'font-semibold',
        'border', 'border-slate-700/50', 'bg-slate-800/50',
        isNumEven ? 'text-emerald-400' : 'text-blue-400'   /* color-coded by parity */
    );
    tag.textContent = isNumEven ? '÷ 2' : '× 3 + 1';       /* rule for even/odd number */

    tagsBlock.appendChild(tag);

    // ------ ASSEMBLE ROW ------ \\
    txtList_el.append(topRow, tagsBlock);

    // ------ CLICK: SHOW/HIDE TAG ------ \\
    /* click toggles visibility classes, revealing the applied rule */
    txtList_el.addEventListener('click', () => {
        tagsBlock.classList.toggle('max-h-12');
        tagsBlock.classList.toggle('opacity-100');
        tagsBlock.classList.toggle('mt-1');
        tagsBlock.classList.toggle('mb-0.5');
    });

    // ------ ATTACH TO PARENT (IF PROVIDED) ------ \\
    if (parent) {
        parent.appendChild(txtList_el);
    }

    // ------ DRAG-TO-SCROLL ONLY FOR OVERFLOWING NUMBERS ------ \\
    /* измерять можно только после вставки в DOM: иначе нет ширины */
    if (parent && numSpan.scrollWidth > numSpan.clientWidth) {
        numSpan.style.cursor = 'grab';
        enableDragScroll(numSpan, { horizontal: true, vertical: false });
    } else {
        numSpan.style.cursor = 'pointer';
    }

    // ------ HIGHLIGHT NEW ROW (indigo flash 500ms) ------ \\
    txtList_el.classList.add('is-new');
    txtList_el.addEventListener('animationend', () => {
        txtList_el.classList.remove('is-new');
    }, { once: true });

    return txtList_el;
};


