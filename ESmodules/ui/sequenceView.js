export function txtListObj_create(parent, index, number) {
    const txtList_obj = 
    `
    <div class="txtList-obj">
        <span class="txtList-span">${index}</span>
        <span class="txtList-num font-bold">${number}</span>
    </div>
    `;

    if (parent) {
        parent.insertAdjacentHTML('beforeend', txtList_obj);
    }
};