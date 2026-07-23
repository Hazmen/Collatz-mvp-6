# Speed Controller — полный разбор

## Зачем

Это блок управления скоростью анимированного вывода чисел последовательности Коллатца в интерфейсе. Позволяет:

- Выбрать задержку между «тиками» (от 0 до 5 секунд, с шагом 10ms)
- Задать, сколько чисел выбрасывать за один тик (batch size, от 1 до 10 000)
- Мгновенно переключаться между популярными значениями через кнопки-пресеты

---

## Структура

Блок состоит из четырёх логических секций, собранных в одну карточку:

```
┌─ speed-controller (card) ──────────────────────────┐
│  «Скорость вывода»                      [Выкл]      │  ← заголовок + display
│  ═══════●═══════════════════════════════════         │  ← слайдер (0–5000ms)
│  Выкл  1с           2с           3с   4с   5с       │  ← подписи оси
│  [Выкл][50ms][100ms][250ms][500ms][750ms][1s][2s]   │  ← кнопки-пресеты
│  ─────────────────────────────────────────────       │  ← разделитель
│  «Чисел за тик»                     [−] [ 1 ] [+]   │  ← batch input + stepper
│  [1][5][10][25][50][100][500][1k]                    │  ← batch-пресеты
└──────────────────────────────────────────────────────┘
```

---

## 1. Слайдер (`<input type="range">`)

```html
<input
  type="range"
  id="speed-slider"
  min="0"
  max="5000"
  value="0"
  step="10"
  class="speed-slider ..."
/>
```

| Атрибут | Значение | Почему |
|---------|----------|--------|
| `min="0"` | 0ms | 0 = «Выкл» — мгновенный вывод |
| `max="5000"` | 5 секунд | Разумный потолок, дольше уже бессмысленно |
| `step="10"` | 10ms | Достаточно плавно, не даёт лишнего шума |
| `value="0"` | По умолчанию выкл | Пользователь сам решает |

### Кастомизация внешнего вида

Стандартный `<input type="range">» в разных браузерах выглядит по-разному. 
Чтобы сделать его красивым, используются **псевдоэлементы**:

- `::-webkit-slider-thumb` — кружок-ползунок в Chrome/Safari/Edge (WebKit)
- `::-moz-range-thumb` — кружок-ползунок в Firefox

Через них ползунок получил:
- Градиент `from-indigo-400 to-violet-500`
- Тень `shadow-lg shadow-indigo-500/40`
- Увеличение при наведении `hover:scale-110`
- Подскок при нажатии `active:scale-95`

Сам трек — просто фон слайдера через Tailwind `bg-gradient-to-r from-slate-700 via-indigo-800 to-slate-700`.

Под слайдером — ось с метками: «Выкл», «1с», «2с», …, «5с», чтобы глазами было понятно, где что, без необходимости смотреть в цифры.

---

## 2. Пресеты скорости

```html
<button data-ms="0"    class="speed-preset ...">Выкл</button>
<button data-ms="50"   class="speed-preset ...">50ms</button>
<button data-ms="100"  class="speed-preset ...">100ms</button>
...
<button data-ms="2000" class="speed-preset ...">2000ms</button>
```

Набор кнопок, каждая хранит значение в `data-ms`. При клике:

1. Слайдеру устанавливается значение
2. Запускается `updateSpeedDisplay()` — общий рендер

Визуально активная кнопка отличается:
- Фон `bg-indigo-500/20` (полупрозрачный индиго)
- Рамка `border-indigo-500/40`
- Текст `text-indigo-300`
- Неактивные: тусклый slate

Это делается в `updateSpeedDisplay()` — она пробегает по всем `.speed-preset` и добавляет/убирает классы в зависимости от совпадения с текущим значением слайдера.

---

## 3. Display скорости

```html
<span class="speed-display ...">Выкл</span>
```

Функция `formatSpeed(ms)`:

```
0     → "Выкл"
10    → "10ms"
1000  → "1c"
1500  → "1.5c"
5000  → "5c"
```

Использует `tabular-nums` (моноширинные цифры), чтобы при смене значений не дёргалась ширина.

---

## 4. Batch size (чисел за тик)

### 4.1. Input

```html
<input type="number" id="batch-input" value="1" min="1" max="10000" step="1" .../>
```

Особенности:
- Скрыты стрелки браузера через `[appearance:textfield]` и псевдоэлементы `::-webkit-outer-spin-button`, `::-webkit-inner-spin-button`
- Управление — только через кастомные кнопки `−` и `+` и пресеты
- Значение автоматически зажимается в `[1, 10000]` через функцию `clampBatch()`

### 4.2. Stepper-кнопки

```html
<button id="batch-decr">−</button>  <!-- SVG с минусом -->
<button id="batch-incr">+</button>  <!-- SVG с плюсом -->
```

При клике:
- Читают текущее значение
- Изменяют на ±1
- Прогоняют через `clampBatch()`
- Вызывают `updateBatchDisplay()`

### 4.3. Пресеты batch

```html
<button data-batch="1"   class="batch-preset ...">1</button>
<button data-batch="5"   class="batch-preset ...">5</button>
...
<button data-batch="1000" class="batch-preset ...">1k</button>
```

Работают аналогично пресетам скорости: клик → `batchInput.value = btn.dataset.batch` → `updateBatchDisplay()`.

---

## 5. Состояние (`speedState`)

```js
const speedState = {
  intervalMs: 0,    // задержка в миллисекундах
  batchSize: 1,     // сколько чисел за тик
};
```

Хранится в обычном объекте, вывешенном на `window.__speedState`, чтобы другие модули (которые будут читать `visibleItems[]` и управлять таймером) могли его читать.

---

## 6. Скрипт — ключевые моменты

### `updateSpeedDisplay()`

```js
function updateSpeedDisplay() {
  const ms = parseInt(speedSlider.value, 10);
  speedState.intervalMs = ms;
  speedDisplay.textContent = formatSpeed(ms);
  document.querySelectorAll('.speed-preset').forEach(btn => {
    const val = parseInt(btn.dataset.ms, 10);
    btn.classList.toggle('bg-indigo-500/20', val === ms);
    btn.classList.toggle('border-indigo-500/40', val === ms);
    btn.classList.toggle('text-indigo-300', val === ms);
    // ... неактивные классы наоборот
  });
}
```

**Почему toggle с условием?**
- `classList.toggle(className, condition)` — добавляет класс, если `condition === true`, иначе удаляет.
- Это компактнее, чем `if → add, else → remove`.

### `clampBatch(val)`

```js
function clampBatch(val) {
  return Math.max(1, Math.min(10000, Math.round(val)));
}
```

Зажимает значение в диапазон и округляет. Вызывается на каждый `input` и `change`, чтобы пользователь не ввёл мусор.

---

## 7. Почему это красиво

| Приём | Где используется |
|-------|------------------|
| Единый стек стилей (slate/indigo) | Весь блок |
| Glassmorphism (`backdrop-blur-md`, полупрозрачный фон) | Карточка |
| Плавные переходы (`transition-all duration-150`) | Все кнопки |
| `active:scale-95` (пружинистое нажатие) | Кнопки, stepper, пресеты |
| Кастомный ползунок через псевдоэлементы | `<input type="range">` |
| Моноширинный шрифт для цифр (`tabular-nums`) | Display скорости, batch input |
| Подсветка активного пресета | И скорость, и batch |

---

## 8. Связь с future `visibleItems[]`

Когда ты добавишь `visibleItems[]` в `state.js`:

1. **SpeedController** просто предоставляет `window.__speedState`
2. **Таймер-диспетчер** читает:
   - `speedState.intervalMs` — если 0, вывести сразу всё (без setInterval)
   - `speedState.batchSize` — сколько элементов забрать из `workerResult` за раз
3. Диспетчер пушит элементы в `visibleItems[]`
4. Список, график, статистика — все подписаны на `visibleItems[]`

Никакой связки с вёрсткой speedController это не требует. Он — pure UI-компонент, только устанавливает настройки.

---

## 9. Итог

Блок спроектирован так, чтобы:

- **Быть полностью независимым** — может стоять где угодно, не ломается при удалении
- **Не портить остальную стилистику** — Tailwind-классы наследуют ту же цветовую схему
- **Давать пользователю полный контроль** — любой интервал, любой batch
- **Быть готовым к интеграции** — `window.__speedState` уже ждёт, когда его прочитают