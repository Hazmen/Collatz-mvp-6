# Как создать Segmented Control с анимацией (пошаговое руководство)

Идея: строим компонент поэтапно — на каждом шаге сразу добавляем HTML-кусок и CSS к нему, чтобы видеть логику "зачем это здесь". JS подключаем в конце, когда скелет и стили готовы.

---

## Шаг 1. Базовый контейнер переключателя

**HTML:**
```html
<div class="segmented-control">
</div>
```

**CSS:**
```css
* { margin: 0; padding: 0; box-sizing: border-box; }

.segmented-control {
    position: relative;      /* якорь для всех абсолютных детей внутри */
    background: #1a1e2e;     /* цвет "трека" переключателя */
    border-radius: 9999px;   /* полная скругленность (капсула) */
    height: 58px;
    width: 340px;
    padding: 5px;             /* отступ, чтобы слайдер не прилипал к краям */
}
```
Зачем `position: relative`: дальше слайдер и текст будут `position: absolute`, а абсолютное позиционирование всегда считается от ближайшего родителя с `position` отличным от `static`.

---

## Шаг 2. Слайдер (бегающая плашка-подложка)

**HTML** (добавляем внутрь `.segmented-control`):
```html
<div class="segmented-control">
    <div class="slider"></div>
</div>
```

**CSS:**
```css
.slider {
    position: absolute;
    top: 5px;
    left: 5px;
    height: calc(100% - 10px);
    width: calc(50% - 5px);   /* пока фиксируем на левую половину */
    background: #ffffff;
    border-radius: 9999px;
    z-index: 1;                /* слайдер должен быть под текстом */
}
```
На этом шаге слайдер — это просто белая капсула слева. Двигать её будем позже через JS (меняя `left`/`width`).

---

## Шаг 3. Текст поверх слайдера (`.labels`)

Тексту нужен свой слой, поверх слайдера (`z-index: 2`), чтобы слайдер был визуально "под" текстом, а не поверх него.

**HTML:**
```html
<div class="segmented-control">
    <div class="slider"></div>

    <div class="labels">
        <label class="option" data-value="instant">
            <input type="radio" name="mode" value="instant" checked>
            <span>Мгновенный</span>
        </label>

        <div class="sbs-wrapper">
            <div class="sbs-single">Step By Step</div>
        </div>
    </div>
</div>
```
Почему `<input type="radio">` внутри `<label>`: это классический доступный паттерн — клик по любой части `label` активирует скрытый `input`, без JS для самого выделения.

**CSS:**
```css
.labels {
    position: absolute;
    inset: 5px;      /* то же самое что top/right/bottom/left: 5px */
    display: flex;
    z-index: 2;
}

.option {
    flex: 1;                 /* делит ширину .labels пополам с sbs-wrapper */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
}

.option input {
    position: absolute;
    opacity: 0;               /* скрываем нативный radio, но не убираем из DOM */
    pointer-events: none;
}

.option span {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
}

.sbs-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sbs-single {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
}
```
На этом этапе получаем статичный переключатель из двух текстовых пунктов, слайдер зафиксирован слева.

---

## Шаг 4. Добавляем скрытое "расщепление" (Auto / Manual)

Идея: внутри `.sbs-wrapper` держим ДВА варианта отображения — единый текст `.sbs-single` и расщепленный `.sbs-split` (Auto | Manual). Пока `.sbs-split` спрятан через `opacity: 0`.

**HTML** (дополняем `.sbs-wrapper`):
```html
<div class="sbs-wrapper">
    <div class="sbs-single">Step By Step</div>

    <div class="sbs-split">
        <label class="option" data-value="auto">
            <input type="radio" name="mode" value="auto">
            <span>Auto</span>
        </label>
        <div class="divider"></div>
        <label class="option" data-value="manual">
            <input type="radio" name="mode" value="manual">
            <span>Manual</span>
        </label>
    </div>
</div>
```

**CSS:**
```css
.sbs-split {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    opacity: 0;              /* по умолчанию скрыт */
    pointer-events: none;    /* и не кликабелен, пока скрыт */
}

.sbs-split .option {
    flex: 1;
}

.divider {
    width: 1px;
    height: 35%;
    background: rgba(255,255,255,0.08);
    opacity: 0;
    flex-shrink: 0;
}
```
Оба состояния (`.sbs-single` и `.sbs-split`) лежат друг на друге (`position: absolute; inset: 0`) внутри `.sbs-wrapper`, и JS в будущем будет плавно переключать их `opacity`/`scale`.

---

## Шаг 5. Проблема с цветом текста на слайдере — и её решение

Если слайдер белый, а текст тоже белый (`--text-main`), то текст под слайдером станет невидимым. Обычное решение "менять цвет текста через класс" здесь не подходит, потому что слайдер **плавно скользит** и не совпадает точно с границами какого-то одного `<label>` (может быть где угодно, включая середину Auto/Manual).

**Решение**: продублировать весь блок `.labels` в отдельный слой с инвертированным цветом текста, а показывать из него видимой только ту часть, что находится над слайдером — через `overflow: hidden` на контейнере, который имеет **точно такие же координаты, что и слайдер**.

**HTML** (добавляем после `.labels`, как отдельный слой):
```html
<div class="clip-mask">
    <div class="labels-invert">
        <label class="option" data-value="instant">
            <span>Мгновенный</span>
        </label>

        <div class="sbs-wrapper">
            <div class="sbs-single">Step By Step</div>

            <div class="sbs-split">
                <label class="option" data-value="auto">
                    <span>Auto</span>
                </label>
                <div class="divider"></div>
                <label class="option" data-value="manual">
                    <span>Manual</span>
                </label>
            </div>
        </div>
    </div>
</div>
```
Обратите внимание: здесь **нет `<input>`** — это чисто визуальный дубликат текста, не должен участвовать в выборе (клики не нужны).

**CSS:**
```css
.clip-mask {
    position: absolute;
    top: 5px;
    left: 5px;                  /* СОВПАДАЕТ с .slider */
    height: calc(100% - 10px);
    width: calc(50% - 5px);     /* СОВПАДАЕТ с .slider */
    overflow: hidden;           /* обрезаем всё, что вне этих размеров */
    pointer-events: none;
    z-index: 3;                 /* выше текста (z-index: 2) */
}

.labels-invert {
    position: absolute;
    top: 0;
    left: 0;      /* пока 0, но в JS будет смещаться на -left слайдера */
    height: 100%;
    display: flex;
}

.labels-invert .option span,
.labels-invert .sbs-single {
    color: #000000;   /* инвертированный (--text-invert) цвет текста */
}
```

### Как это работает "на пальцах"
1. `.clip-mask` — окошко ровно такого же размера и на такой же позиции, как `.slider`.
2. Внутри окошка лежит `.labels-invert` — **полная копия** всей строки текста (не только видимого куска), но черного (или другого инвертированного) цвета.
3. `.labels-invert` сдвинута влево ровно настолько, чтобы её текст **пиксель в пиксель** совпал с текстом нижнего слоя `.labels` — тогда "окошко" вырезает из неё именно тот кусок, который лежит поверх слайдера.
4. Получается иллюзия: один текст, но кусок над слайдером — контрастного цвета, а кусок вне слайдера — обычного.

Формула сдвига (используется в JS): `labelsInvert.left = -(slider.left - padding)`.

---

## Шаг 6. Темы через CSS-переменные

Вместо хардкода цветов (`#ffffff`, `#000000` и т.д.) выносим их в переменные, чтобы менять одним атрибутом `data-theme` на `<html>`.

**CSS:**
```css
:root {
    --bg-main: #0a0a0a;
    --control-bg: #000000;
    --border-color: rgba(255,255,255,0.08);
    --slider-bg: #ffffff;
    --text-main: #ffffff;
    --text-invert: #000000;
    --accent-glow: rgba(255,255,255,0.1);
}

[data-theme="neon-violet"] {
    --control-bg: #1a1e2e;
    --slider-bg: linear-gradient(135deg, #8b5cf6, #6d28d9);
    --accent-glow: rgba(139, 92, 246, 0.25);
    /* и т.д. */
}

[data-theme="light"] {
    --control-bg: #ffffff;
    --slider-bg: #0f172a;
    --text-main: #0f172a;
    --text-invert: #ffffff;
    /* и т.д. */
}
```
Дальше все селекторы (`.slider`, `.option span`, `.labels-invert .option span`) заменяем на `var(--slider-bg)`, `var(--text-main)`, `var(--text-invert)` вместо жёстких hex-значений.

**Переключатель тем** — просто набор кнопок:
```html
<div class="theme-switcher">
    <button class="theme-btn active" data-theme="neon-violet">Neon Violet</button>
    <button class="theme-btn" data-theme="dark">Dark Minimal</button>
    <button class="theme-btn" data-theme="light">Light</button>
</div>
```
```js
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const theme = e.target.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    });
});
```
Смена `data-theme` на `<html>` мгновенно меняет значения всех `var(--...)` — CSS-каскад сам всё перекрашивает, без единой строчки JS для цветов.

---

## Шаг 7. JS-логика: вычисление позиции слайдера

Теперь оживляем статичную верстку. Первая задача — по названию режима (`instant` / `auto` / `manual`) вычислить, куда должен встать слайдер (`left`, `width`).

```js
function getSliderPos(target) {
    const controlRect = control.getBoundingClientRect();
    const padding = 5;
    const innerWidth = controlRect.width - padding * 2;
    const halfWidth = innerWidth / 2;
    const quarterWidth = innerWidth / 4;

    if (target === 'instant') {
        return { left: padding, width: halfWidth };
    }
    if (target === 'auto') {
        return { left: padding + halfWidth, width: quarterWidth };
    }
    // manual
    return { left: padding + halfWidth + quarterWidth, width: quarterWidth };
}
```
Логика деления: вся внутренняя ширина (`innerWidth`) делится на 2 половины. Левая половина целиком — под `instant`. Правая половина далее делится еще на 2 четверти — под `auto` и `manual`.

---

## Шаг 8. JS: синхронное движение слайдера и слоя инверсии

```js
function moveSliderTo(pos, animate) {
    syncInvertWidth();  // labels-invert должен быть той же ширины, что и labels
    const padding = 5;
    const invertLeft = -(pos.left - padding);  // формула из Шага 5

    anime.remove([slider, clipMask, labelsInvert]); // сброс текущих анимаций

    if (animate) {
        anime({
            targets: [slider, clipMask],
            left: pos.left,
            width: pos.width,
            duration: 420,
            easing: 'cubicBezier(0.16, 1, 0.3, 1)'
        });
        anime({
            targets: labelsInvert,
            left: invertLeft,
            duration: 420,
            easing: 'cubicBezier(0.16, 1, 0.3, 1)'
        });
    } else {
        // мгновенно, без анимации (для инициализации/ресайза)
        slider.style.left = pos.left + 'px';
        slider.style.width = pos.width + 'px';
        clipMask.style.left = pos.left + 'px';
        clipMask.style.width = pos.width + 'px';
        labelsInvert.style.left = invertLeft + 'px';
    }
}
```
Важно: `slider` и `clipMask` анимируются **одинаковыми** значениями `left`/`width` — они обязаны совпадать всегда (см. Шаг 5), поэтому их можно объединить в один вызов `anime()` с массивом `targets`.

---

## Шаг 9. JS: анимация расщепления Step-By-Step на Auto/Manual

```js
function expandSBS(target, animate) {
    expanded = true;
    state = target;

    if (animate) {
        const easing = 'cubicBezier(0.16, 1, 0.3, 1)';

        anime({
            targets: allSbsSingle,     // .sbs-single (в обоих слоях: labels и labels-invert)
            scale: 0.85,
            opacity: 0,
            duration: 220,
            easing,
            begin: () => { sbsSingle.style.pointerEvents = 'none'; }
        });

        anime({
            targets: allSbsSplit,      // .sbs-split
            opacity: 1,
            scale: 1,
            duration: 320,
            easing,
            begin: () => {
                document.querySelector('.labels .sbs-split').style.pointerEvents = 'auto';
            }
        });

        anime({
            targets: allDividers,
            opacity: 1,
            duration: 300,
            easing
        });

        moveSliderTo(getSliderPos(state), true); // слайдер сжимается до четверти
    }

    syncRadio();
}
```
Обратите внимание на порядок причин-следствий:
1. Текст "Step By Step" уменьшается и растворяется (`scale: 0.85, opacity: 0`).
2. Одновременно "Auto | Manual" проявляется (`opacity: 1, scale: 1`).
3. Разделитель проявляется.
4. Слайдер параллельно едет и сужается до нужной четверти.

`collapseSBS()` — зеркальная функция, делает всё то же самое в обратную сторону.

---

## Шаг 10. JS: обработчики кликов

```js
instantOption.addEventListener('click', () => {
    if (state === 'instant') return;
    collapseSBS(true);
});

sbsSingle.addEventListener('click', (e) => {
    // определяем, по какой половине текста "Step By Step" кликнули
    const rect = sbsSingle.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const target = x < rect.width / 2 ? 'auto' : 'manual';
    expandSBS(target, true);
});

autoOption.addEventListener('click', () => selectSbsChild('auto'));
manualOption.addEventListener('click', () => selectSbsChild('manual'));
```
Хитрость с `sbsSingle`: клик по левой половине текста "Step By Step" сразу разворачивает его в режим `auto`, по правой — в `manual`. Это UX-улучшение, чтобы не заставлять пользователя делать два клика подряд.

---

## Шаг 11. JS: адаптивность и инициализация

```js
const resizeObserver = new ResizeObserver(() => {
    moveSliderTo(getSliderPos(state), false); // без анимации, мгновенный пересчет
});
resizeObserver.observe(control);

// восстановление состояния из localStorage при загрузке страницы
let state = localStorage.getItem('segmented-mode') || 'instant';
let expanded = state === 'auto' || state === 'manual';

if (expanded) {
    expandSBS(state, false);
} else {
    applyState(false);
}
```
`ResizeObserver` нужен, потому что все расчеты позиции слайдера идут в пикселях (`getBoundingClientRect().width`) — при изменении размера окна/контейнера позиции нужно пересчитать заново, но без анимации (иначе будет дёргаться при каждом кадре ресайза).

---

## Итоговый порядок действий, если строите такое с нуля

1. Верстаете статичный контейнер с `position: relative`.
2. Кладете внутрь слайдер (`position: absolute`), фиксируете где-то вручную.
3. Кладете текст поверх слайдера отдельным слоем с `z-index` выше.
4. Добавляете альтернативные под-состояния текста (`single` / `split`), скрытые через `opacity: 0`.
5. Решаете проблему видимости текста на слайдере — дублируете текст в инвертированном цвете под `overflow: hidden` окошком, синхронизированным по размеру/позиции со слайдером.
6. Выносите все цвета в CSS-переменные, чтобы получить темы "бесплатно".
7. Пишете функцию вычисления позиции слайдера по имени состояния.
8. Пишете функцию перемещения слайдера + синхронного сдвига инвертированного слоя.
9. Добавляете анимации появления/исчезновения под-состояний (`expand`/`collapse`).
10. Вешаете обработчики кликов, которые дергают вышеописанные функции.
11. Добавляете `ResizeObserver` и восстановление состояния при загрузке.
