// toast-logic.js — автономный, всё нужное только в этом файле
// Использует DOM из uiElements.js ( getToastStack / getToastTemplate / toastRoot ), но не ломается если их нет

import { getToastStack, getToastTemplate, toastRoot } from '../uiElements.js';

function resolveColor(raw) {
    let c = (raw ?? '').trim();
    if (c && !c.startsWith('#')) c = '#' + c;
    const ok = /^#[0-9A-F]{6}$/i.test(c);
    if (ok) return c;
    const fallback = getComputedStyle(toastRoot).getPropertyValue('--toast-color').trim();
    return fallback || '#ef4444';
}

/**
 * Показать тост. Создаёт ОТДЕЛЬНЫЙ объект по шаблону <template id="toast-template">.
 * Автономна: сама найдёт/создаст #toast-stack, сработает даже если DOM ещё не готов.
 * @param {string} toastLabel - заголовок (обрезается ... если длинный)
 * @param {string} toastDesc - описание (перенос, максимум 2 строки)
 * @param {string} toastColor - HEX цвет "#ef4444" или "ef4444"
 * @returns {HTMLElement} созданный .toast
 */

export function showToast(toastLabel, toastDesc, toastColor) {
    const stack = getToastStack();
    const finalColor = resolveColor(toastColor);
    const tpl = getToastTemplate();

    let toastEl = null;
    if (tpl && tpl.content && tpl.content.querySelector('.toast')) {
        const clone = tpl.content.cloneNode(true);
        toastEl = clone.querySelector('.toast');
    } else {
        // фолбек если шаблона нет — создаём вручную (файл остаётся автономным)
        toastEl = document.createElement('div');
        toastEl.className = 'toast';
        toastEl.setAttribute('role', 'status');
        toastEl.innerHTML = '<span class="toast-dot" aria-hidden="true"></span><div class="toast-text"><span class="toast-label"></span><span class="toast-desc"></span></div>';
    }

    const labelEl = toastEl.querySelector('.toast-label');
    const descEl = toastEl.querySelector('.toast-desc');
    if (labelEl) labelEl.textContent = toastLabel ?? '';
    if (descEl) {
        descEl.textContent = toastDesc ?? '';
        if (!toastDesc) descEl.style.display = 'none';
        else descEl.style.display = '';
    }

    toastEl.style.setProperty('--toast-color', finalColor);

    stack.appendChild(toastEl);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toastEl.classList.add('show'));
    });

    setTimeout(() => {
        toastEl.classList.remove('show');
        toastEl.addEventListener('transitionend', () => toastEl.remove(), { once: true });
        setTimeout(() => toastEl.remove(), 600);
    }, 2600);

    return toastEl;
}

if (typeof window !== 'undefined') window.showToast = showToast;
