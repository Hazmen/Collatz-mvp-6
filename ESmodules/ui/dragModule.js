/**
 * Включает drag-to-scroll для любого элемента
 * @param {HTMLElement} element - Элемент, который нужно сделать перетаскиваемым
 * @param {Object} options - Настройки
 * @param {number} options.speed - Множитель скорости (1 = 1:1, 1.2 = быстрее)
 * @param {boolean} options.horizontal - Горизонтальный скролл (по умолчанию true)
 * @param {boolean} options.vertical - Вертикальный скролл (по умолчанию false)
 * @returns {Function} Функция для отключения drag-to-scroll
 */
export function enableDragScroll(element, options = {}) {
    const config = {
        speed: options.speed || 1,
        horizontal: options.horizontal !== false,
        vertical: options.vertical || false
    };

    let isDown = false;
    let startX, startY;
    let scrollLeft, scrollTop;

    const startDrag = (e) => {
        isDown = true;
        element.classList.add('dragging');
        document.body.style.cursor = 'grabbing';

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        startX = clientX;
        startY = clientY;
        scrollLeft = element.scrollLeft;
        scrollTop = element.scrollTop;
    };

    const stopDrag = () => {
        if (!isDown) return;
        isDown = false;
        element.classList.remove('dragging');
        document.body.style.cursor = '';
    };

    const onDrag = (e) => {
        if (!isDown) return;
        e.preventDefault();

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        if (config.horizontal) {
            const walkX = (clientX - startX) * config.speed;
            element.scrollLeft = scrollLeft - walkX;
        }

        if (config.vertical) {
            const walkY = (clientY - startY) * config.speed;
            element.scrollTop = scrollTop - walkY;
        }
    };

    // Мышь
    element.addEventListener('mousedown', startDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('mousemove', onDrag);

    // Тач
    element.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('touchend', stopDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });

    // Возвращаем функцию для очистки (если нужно отключить позже)
    return function destroy() {
        element.removeEventListener('mousedown', startDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('mousemove', onDrag);
        element.removeEventListener('touchstart', startDrag);
        document.removeEventListener('touchend', stopDrag);
        document.removeEventListener('touchmove', onDrag);
    };
}