# Collatzium MVP 6: карта проекта, модулей и потоков данных

Документ описывает текущую архитектуру MVP 6 так, чтобы было понятно:

- какие элементы есть на странице;
- какие модули их используют;
- какие значения откуда появляются;
- где эти значения должны храниться;
- кто запускает worker;
- кто рисует sequence list;
- какие связи между модулями нормальные, а какие лучше не делать.

Это не финальная идеальная архитектура. Это рабочая карта текущего состояния проекта, от которой можно спокойно двигаться дальше.

---

## 1. Главная мысль проекта

В MVP 6 сейчас нужно построить первый рабочий путь:

```text
input
-> run button
-> workerManager
-> collatz.worker
-> chunk / done / error
-> sequenceView
-> sequence list на странице
```

Все остальное позже:

```text
reset
skip
copy
stats
speed
play / pause
search
modes
chart
chain
map
settings
```

Главное правило:

```text
Сначала один рабочий поток данных.
Потом расширения.
```

---

## 2. Текущие элементы страницы

Источник: `index.html`.

### 2.1 Input controls

```html
<button class="clear-inp inp-cont">clear</button>
<button class="save-inp inp-cont">save</button>
<button class="rand-inp inp-cont">rand</button>
```

Эти кнопки относятся к вводу числа.

| Элемент | Селектор | Текущая роль |
|---|---|---|
| clear button | `.clear-inp` | очистить input |
| save button | `.save-inp` | пока не определено |
| random button | `.rand-inp` | вставить случайное число |

Их должен использовать:

```text
ui/inputControls.js
```

Их не должны использовать напрямую:

```text
collatz.worker.js
sequenceView.js
state.js
```

---

### 2.2 Main input

```html
<input
  type="text"
  class="number-input ..."
  value="27"
  name="number-input"
  id="number-input"
>
```

Это главный input, из которого пользователь вводит стартовое число Collatz.

| Значение | Откуда берется | Что означает |
|---|---|---|
| `mainInputField` | `document.getElementById('number-input')` | сам DOM-элемент input |
| `mainInputField.value` | поле ввода | текущая строка в input |
| `activeInputValue` | значение input в момент Run | число, по которому идет текущий расчет |

Очень важно:

```text
mainInputField.value и activeInputValue - не одно и то же.
```

Пример:

```text
1. В input было 27.
2. Пользователь нажал Run.
3. activeInputValue стал 27.
4. Worker считает 27.
5. Пользователь меняет input на 999.
6. mainInputField.value теперь 999.
7. activeInputValue все еще 27.
8. Текущий результат должен оставаться результатом для 27.
```

Это защищает проект от ситуации, где пользователь меняет input посреди расчета и ломает текущий вывод.

---

### 2.3 Process controls

```html
<button class="proc-reset inp-cont">reset</button>
<button class="proc-run inp-cont">run</button>
<button class="proc-skip inp-cont">skip</button>
```

Эти кнопки относятся не к input, а к процессу вычисления/вывода.

| Элемент | Селектор | Текущая роль |
|---|---|---|
| reset button | `.proc-reset` | позже очистить результат |
| run button | `.proc-run` | запустить расчет |
| skip button | `.proc-skip` | позже показать все сразу |

Их должен использовать:

```text
ui/runProcessControls.js
```

Их не должен использовать:

```text
inputControls.js
collatz.worker.js
```

---

### 2.4 Sequence list

```html
<div class="sequence-list ...">
  <!-- сюда будут добавляться объекты списка -->
</div>
```

Это место, куда будут выводиться числа последовательности.

| Значение  | Откуда берется        | Что означает            |
| --------- | --------------------- | ----------------------- |
| `txtList` | `.sequence-list`      | DOM-контейнер для строк |
| `index`   | worker chunk + offset | номер шага              |
| `number`  | worker chunk data     | число на этом шаге      |

Его должны использовать:

```text
ui/sequenceView.js
ui/uiElements.js
```

Но по-разному:

```text
uiElements.js
  хранит ссылку на .sequence-list

sequenceView.js
  создает строки и добавляет их в .sequence-list
```

---

## 3. Текущие модули

### 3.1 `ESmodules/main.js`

Текущая роль:

```text
Верхняя точка входа ES modules.
Подключает модули и запускает начальную настройку.
```

Сейчас он делает:

```text
импортирует InputControlsHere
импортирует mainInputField
импортирует preventLetters
запускает input controls
вешает запрет букв на input
```

Что `main.js` должен делать:

```text
инициализировать модули
связать верхнеуровневые части приложения
оставаться коротким
```

Что `main.js` не должен делать:

```text
считать Collatz
создавать строки sequence list
сам напрямую обрабатывать все кнопки
хранить большой state
содержать большую бизнес-логику
```

Текущая проблема:

```js
import { mainInputField,  } from './ui/uiElements.js';
```

Это нужно потом почистить до нормального импорта. Это мелкая уборка, но она важна для читаемости.

---

### 3.2 `ESmodules/utils/dom.js`

Текущая роль:

```text
Короткие функции для поиска DOM-элементов.
```

Содержит:

```js
$
$$
$$$
```

Смысл:

```text
$(selector)
  найти первый элемент по CSS-селектору

$$(selector)
  найти все элементы по CSS-селектору и вернуть массив

$$$(id)
  найти элемент по id
```

Этот модуль не должен знать:

```text
input
worker
Collatz
state
sequence
```

Это просто инструмент.

---

### 3.3 `ESmodules/ui/uiElements.js`

Текущая роль:

```text
Карта DOM-элементов страницы.
```

Это очень важный модуль, но он должен быть максимально тупым.

Он может делать:

```text
найти input
найти кнопки input controls
найти кнопки run/reset/skip
найти sequence list
собрать связанные элементы в объект-группу
```

Он не должен делать:

```text
addEventListener
BigInt
worker.postMessage
создание HTML строк
расчет Collatz
изменение state
```

Текущие элементы:

```text
mainInputField
runButton
resetButton
skipButton
runProcess_Elements
saveInput
clearInput
randomInput
inputControls_Elements
txtList
seqListObj_Font
```

Нормальная идея:

```js
inputControls_Elements = {
  saveInput,
  clearInput,
  randomInput
}
```

Это удобно, потому что `inputControls.js` использует эти элементы вместе.

Нормальная идея:

```js
runProcess_Elements = {
  runButton,
  resetButton,
  skipButton
}
```

Это удобно, потому что `runProcessControls.js` будет использовать эти элементы вместе.

Важно:

```text
uiElements.js отвечает на вопрос:
"Где на странице лежат элементы?"

Он НЕ отвечает на вопрос:
"Что эти элементы делают?"
```

---

### 3.4 `ESmodules/ui/inputControls.js`

Текущая роль:

```text
Поведение элементов, связанных с input.
```

Сейчас там есть:

```text
preventLetters(inp)
MAX_RANDOM
InputControlsHere(setMax)
LetItRandom(setMax)
random click handler
clear click handler
```

Что делает `preventLetters(inp)`:

```text
при вводе символа проверяет e.data
если символ не цифра - отменяет ввод
```

Что делает random:

```text
генерирует случайный BigInt
кладет его в mainInputField.value
создает input event
возвращает focus в input
```

Что делает clear:

```text
очищает mainInputField.value
создает input event
возвращает focus в input
```

Что `inputControls.js` не должен делать:

```text
запускать worker
решать, что такое текущий расчет
рисовать sequence list
хранить chunks
хранить steps/max
```

Текущая архитектурная мелочь:

```text
InputControlsHere(setMax) принимает setMax,
но внутри random сейчас использует MAX_RANDOM.
```

Нужно выбрать один подход:

```text
Вариант A:
InputControlsHere(setMax) реально использует setMax.

Вариант B:
InputControlsHere() не принимает аргументов и использует MAX_RANDOM внутри.
```

Для учебной архитектуры лучше Вариант A, потому что зависимость явно передается извне.

---

### 3.5 `ESmodules/ui/runProcessControls.js`

Текущая роль:

```text
Пока пустой файл.
Будущий модуль для run/reset/skip.
```

Первый смысл этого файла:

```text
по нажатию Run:
1. прочитать mainInputField.value
2. проверить, что значение не пустое
3. сохранить снимок значения как activeInputValue
4. отправить значение в workerManager
```

Этот модуль может знать:

```text
mainInputField
runProcess_Elements
workerManager
sequenceView
state, когда state появится
```

Этот модуль не должен:

```text
считать Collatz сам
создавать worker напрямую, если есть workerManager
создавать HTML строки вручную, если есть sequenceView
генерировать random input
```

Простая формула:

```text
runProcessControls - это поведение кнопок процесса.
```

---

### 3.6 `ESmodules/workers/collatz.worker.js`

Текущая роль:

```text
Считает последовательность Collatz в отдельном потоке.
```

Worker получает:

```text
e.data
```

Сейчас он превращает это в:

```js
BigInt(e.data)
```

Потом считает:

```text
list
max
steps
```

И отправляет наружу:

```text
chunk messages
done message
error message
```

Контракт сообщений:

```text
{ type: "chunk", data, offset }
{ type: "done", steps, max }
{ type: "error", message }
```

Что означает `chunk`:

```text
Worker не обязан отправлять весь список одним огромным сообщением.
Он режет список на части.
Каждая часть - chunk.
```

Что означает `offset`:

```text
offset - это стартовый индекс chunk в полной последовательности.
```

Пример:

```text
CHUNK_SIZE = 10000

первый chunk:
  offset = 0
  data содержит элементы 0..9999

второй chunk:
  offset = 10000
  data содержит элементы 10000..19999
```

Тогда индекс элемента внутри chunk считается так:

```text
realIndex = offset + localIndex
```

Что worker не должен знать:

```text
input DOM element
run button
sequence list
Tailwind
state.js
chart/map/modes
```

Worker должен быть максимально тупым:

```text
получил число
посчитал
отправил сообщения
```

Текущий нюанс:

```js
for (let i = 0; i <= list.length; i += CHUNK_SIZE)
```

Из-за `<=` может появиться пустой последний chunk, если `i === list.length`.
Позже лучше заменить логику так, чтобы пустой chunk не отправлялся.

---

### 3.7 `ESmodules/workers/workerManager.js`

Сейчас файла нет, но это следующий нужный модуль после `runProcessControls.js`.

Роль:

```text
Посредник между UI-логикой и worker.
```

Он должен знать:

```text
где лежит collatz.worker.js
как создать Worker
как отправить число
как принять chunk/done/error
как передать события наружу
```

Он не должен знать:

```text
mainInputField
.number-input
.sequence-list
run button
random button
HTML
```

Главная формула:

```text
workerManager не добывает число.
workerManager доставляет число worker'у.
```

Правильный поток:

```text
runProcessControls читает input
runProcessControls готовит activeInputValue
runProcessControls вызывает workerManager
workerManager отправляет activeInputValue в collatz.worker
workerManager получает chunk/done/error
workerManager вызывает callbacks
```

Почему это важно:

```text
Если workerManager сам читает input, он становится зависим от DOM.
Если input потом поменяется на saved number/search/random replay,
workerManager придется переписывать.

Если workerManager получает число параметром,
его можно использовать откуда угодно.
```

---

### 3.8 `ESmodules/ui/sequenceView.js`

Текущая роль:

```text
Создает визуальные строки sequence list.
```

Сейчас там есть:

```text
txtListObj_create(parent, index, number)
```

Она получает:

```text
parent - DOM-контейнер, куда вставлять строку
index - номер шага
number - число
```

Она делает:

```text
создает HTML для одной строки
добавляет его в parent
```

Что этот модуль должен делать позже:

```text
appendSequenceItem(parent, index, number)
renderChunk(parent, chunk, offset)
clearSequence(parent)
```

Что он не должен делать:

```text
читать input
запускать worker
считать Collatz
хранить state
знать про random/clear
```

Как sequenceView должен использовать worker chunk:

```text
worker прислал:
{
  type: "chunk",
  data: [27n, 82n, 41n],
  offset: 0
}

sequenceView получает:
parent = txtList
chunk = data
offset = 0

для каждого элемента:
index = offset + localIndex
number = item
```

---

### 3.9 `ESmodules/state/state.js`

Сейчас файл пустой.

Это нормально, если пока нет рабочего run-flow.

State нужен не ради “архитектуры”, а когда появляются данные, которые используют несколько модулей.

Минимальный будущий state:

```text
status
activeInputValue
chunks
steps
max
error
```

Что означает каждое поле:

```text
status
  текущее состояние приложения:
  idle / computing / ready / error

activeInputValue
  число, по которому идет текущий расчет

chunks
  полученные части последовательности от worker

steps
  количество шагов Collatz

max
  максимальное число в последовательности

error
  текст ошибки, если что-то сломалось
```

Почему не стоит сразу добавлять много:

```text
playing
paused
currentStepIndex
batchSize
mode
```

Эти поля нужны позже:

```text
playing / paused - когда будет play/pause
currentStepIndex - когда будет пошаговый вывод
batchSize - когда будет batch view
mode - когда появятся sequence/chart/map/chain
```

Не надо хранить то, что еще не используется.

---

## 4. Значения проекта: откуда возникают и кто использует

### 4.1 DOM references

Примеры:

```text
mainInputField
runButton
resetButton
skipButton
txtList
```

Где возникают:

```text
uiElements.js
```

Кем используются:

```text
inputControls.js
runProcessControls.js
sequenceView.js через parent
```

Где не должны использоваться:

```text
collatz.worker.js
```

---

### 4.2 Raw input value

Пример:

```text
mainInputField.value
```

Тип:

```text
string
```

Где возникает:

```text
HTML input
```

Кем читается:

```text
runProcessControls.js
```

Кем изменяется:

```text
пользователь руками
inputControls.js random
inputControls.js clear
```

Важно:

```text
raw input value - это не BigInt.
Это строка.
```

---

### 4.3 Active input value

Пример:

```text
activeInputValue = "27"
```

или позже:

```text
activeInputValue = 27n
```

Где возникает:

```text
в момент нажатия Run
```

Кем создается:

```text
runProcessControls.js
```

Кем используется:

```text
workerManager.js
state.js
```

Почему нужен:

```text
Чтобы текущий расчет не зависел от того,
что пользователь потом напишет в input.
```

---

### 4.4 Worker input

Пример:

```text
"27"
```

или:

```text
27n
```

Где возникает:

```text
workerManager получает activeInputValue
```

Кем используется:

```text
collatz.worker.js
```

Важно:

```text
workerManager должен отправлять уже выбранное значение.
Он не должен сам читать input.
```

---

### 4.5 Sequence list

Пример:

```text
[27n, 82n, 41n, ...]
```

Где возникает:

```text
collatz.worker.js
```

Кем используется:

```text
sequenceView.js
state.js later
chartView later
mapView later
```

Сейчас worker отправляет не весь list напрямую, а chunks:

```text
chunk 1
chunk 2
chunk 3
...
```

Это хорошо для больших последовательностей.

---

### 4.6 Chunk

Пример:

```text
{
  type: "chunk",
  data: [27n, 82n, 41n],
  offset: 0
}
```

Где возникает:

```text
collatz.worker.js
```

Кем принимается:

```text
workerManager.js
```

Кем используется:

```text
sequenceView.js
state.js
```

Как рисовать chunk:

```text
для каждого number в data:
  index = offset + localIndex
  создать строку списка
```

---

### 4.7 Done message

Пример:

```text
{
  type: "done",
  steps: 111,
  max: 9232n
}
```

Где возникает:

```text
collatz.worker.js
```

Кем принимается:

```text
workerManager.js
```

Кем используется:

```text
state.js
stats UI later
```

Что означает:

```text
Worker закончил расчет.
Больше chunks не будет.
Можно считать результат готовым.
```

---

### 4.8 Error message

Пример:

```text
{
  type: "error",
  message: "..."
}
```

Где возникает:

```text
collatz.worker.js
```

Кем принимается:

```text
workerManager.js
```

Кем используется:

```text
state.js
error UI later
```

Что означает:

```text
Расчет не получился.
UI должен не падать, а показать ошибку.
```

---

## 5. Полный поток Run

Вот как должен выглядеть первый рабочий запуск.

### Шаг 1: Пользователь вводит число

```text
Пользователь пишет 27 в input.
```

Где это живет:

```text
mainInputField.value = "27"
```

Кто контролирует ввод:

```text
preventLetters(mainInputField)
```

---

### Шаг 2: Пользователь нажимает Run

```text
click на .proc-run
```

Кто слушает:

```text
runProcessControls.js
```

Что происходит:

```text
1. прочитать mainInputField.value
2. проверить, что не пусто
3. сохранить как activeInputValue
4. очистить старый sequence list
5. вызвать workerManager
```

---

### Шаг 3: Worker manager запускает worker

```text
workerManager получает activeInputValue
```

Что делает:

```text
1. создает Worker
2. вешает onmessage
3. отправляет activeInputValue через postMessage
```

Чего не делает:

```text
не читает input
не рисует list
не знает кнопки
```

---

### Шаг 4: Worker считает

```text
collatz.worker.js получает e.data
```

Что делает:

```text
1. BigInt(e.data)
2. считает list
3. считает max
4. режет list на chunks
5. отправляет chunk messages
6. отправляет done
```

---

### Шаг 5: Worker manager принимает сообщения

Если пришел chunk:

```text
workerManager вызывает onChunk(message)
```

Если пришел done:

```text
workerManager вызывает onDone(message)
```

Если пришел error:

```text
workerManager вызывает onError(message)
```

---

### Шаг 6: Sequence view рисует chunk

```text
onChunk получает data и offset
```

Что делает:

```text
для каждого элемента chunk:
  index = offset + localIndex
  sequenceView добавляет строку в txtList
```

---

## 6. Кто кого может знать

### Разрешенные связи

```text
main.js
  может знать почти все верхнеуровневые модули

inputControls.js
  может знать uiElements.js

runProcessControls.js
  может знать uiElements.js
  может знать workerManager.js
  может знать sequenceView.js
  позже может знать state.js

workerManager.js
  может знать collatz.worker.js

sequenceView.js
  может знать DOM parent, который ему передали

state.js
  не обязан знать DOM
```

---

### Запрещенные или плохие связи

```text
collatz.worker.js -> uiElements.js
  нельзя: worker не должен знать DOM

workerManager.js -> mainInputField
  плохо: manager не должен добывать число

inputControls.js -> collatz.worker.js
  плохо: random/clear не должны запускать расчет

sequenceView.js -> mainInputField
  плохо: view списка не должен знать input

uiElements.js -> addEventListener
  плохо: uiElements должен быть картой элементов, а не поведением
```

---

## 7. Как понять, куда класть новую функцию

Задай вопрос: "О чем эта функция?"

### Если функция ищет DOM-элемент

Класть в:

```text
uiElements.js
```

Пример:

```text
mainInputField
runButton
txtList
```

---

### Если функция реагирует на random/clear/save input

Класть в:

```text
inputControls.js
```

---

### Если функция реагирует на run/reset/skip

Класть в:

```text
runProcessControls.js
```

---

### Если функция запускает worker или принимает сообщения worker

Класть в:

```text
workerManager.js
```

---

### Если функция считает Collatz

Класть в:

```text
collatz.worker.js
```

или позже:

```text
core/collatz.js
```

Но сейчас не нужно добавлять `core`, если он не участвует в рабочем потоке.

---

### Если функция создает строку sequence list

Класть в:

```text
sequenceView.js
```

---

### Если функция хранит состояние

Класть в:

```text
state.js
```

Но только когда state реально нужен.

---

## 8. Текущий минимальный порядок работы

### Шаг 1: Почистить текущую базу

Смысл:

```text
Убрать мелкую мутность, не меняя архитектуру.
```

Что сделать:

```text
main.js:
  убрать пустой импорт

inputControls.js:
  решить setMax vs MAX_RANDOM

uiElements.js:
  оставить только DOM-ссылки и группы
```

---

### Шаг 2: Сделать runProcessControls

Смысл:

```text
Run button должен стать реальной точкой запуска процесса.
```

Он должен:

```text
прочитать input
проверить input
сделать activeInputValue
запустить workerManager
```

---

### Шаг 3: Сделать workerManager

Смысл:

```text
Не общаться с worker напрямую из runProcessControls.
```

Он должен:

```text
принимать число
создавать worker
слушать сообщения
вызывать callbacks
```

---

### Шаг 4: Подключить sequenceView к chunk

Смысл:

```text
Первые результаты должны появиться на странице.
```

Когда пришел chunk:

```text
sequenceView рисует элементы в txtList
```

---

### Шаг 5: Добавить минимальный state

Смысл:

```text
Когда поток заработал, появляются данные, которые надо хранить.
```

Минимально:

```text
status
activeInputValue
steps
max
error
```

---

### Шаг 6: Добавить reset

Только после рабочего run.

Reset должен:

```text
очистить list
сбросить status
убрать error
сбросить steps/max
```

---

### Шаг 7: Добавить skip

Только после reset.

Skip должен:

```text
показать все уже полученные данные
```

или позже:

```text
остановить пошаговую анимацию и вывести остаток
```

---

## 9. Что пока не трогать

Пока не нужно:

```text
play / pause
speed
stepper
batch size 10/100/1000
modes
chart
map
chain
settings
copy
search
OverlayScrollbars
D3
```

Причина:

```text
Они зависят от базового потока:
input -> run -> worker -> sequence list.
```

Если базовый поток не работает, все эти функции только увеличат хаос.

---

## 10. Короткая карта "элемент -> модуль"

| Элемент сайта | DOM-ссылка живет в | Поведение живет в | Данные уходят в |
|---|---|---|---|
| input `#number-input` | `uiElements.js` | `inputControls.js`, `runProcessControls.js` | `activeInputValue`, worker |
| random button | `uiElements.js` | `inputControls.js` | input value |
| clear button | `uiElements.js` | `inputControls.js` | input value |
| save button | `uiElements.js` | позже отдельная логика | saved values later |
| run button | `uiElements.js` | `runProcessControls.js` | workerManager |
| reset button | `uiElements.js` | later `runProcessControls.js` | state, sequenceView |
| skip button | `uiElements.js` | later `runProcessControls.js` | sequenceView |
| sequence list | `uiElements.js` | `sequenceView.js` | DOM output |

---

## 11. Короткая карта "значение -> где живет"

| Значение | Тип | Где возникает | Где должно храниться |
|---|---|---|---|
| `mainInputField` | DOM element | `uiElements.js` | `uiElements.js` |
| `mainInputField.value` | string | HTML input | не хранить как главный расчет |
| `activeInputValue` | string или BigInt | момент Run | `state.js` later |
| `chunk.data` | array | worker | `state.js` later, сразу в `sequenceView` now |
| `chunk.offset` | number | worker | нужен для индексов |
| `steps` | number | worker done | `state.js` later |
| `max` | BigInt/string | worker done | `state.js` later |
| `error` | string | worker error | `state.js` later |

---

## 12. Самая важная mental model

Не думай:

```text
"Как все приложение должно выглядеть в финале?"
```

Думай:

```text
"Как одно значение проходит через систему?"
```

Для числа `27` путь такой:

```text
HTML input содержит "27"
runProcessControls читает "27"
runProcessControls решает: это activeInputValue
workerManager получает activeInputValue
collatz.worker считает Collatz
workerManager получает chunk
sequenceView рисует chunk
пользователь видит числа
```

Если ты можешь объяснить путь одного значения, архитектура становится понятнее.

---

## 13. Проверка перед новым кодом

Перед каждой новой функцией спросить:

```text
1. Это DOM-ссылка?
   -> uiElements.js

2. Это поведение input-кнопок?
   -> inputControls.js

3. Это поведение run/reset/skip?
   -> runProcessControls.js

4. Это общение с worker?
   -> workerManager.js

5. Это расчет Collatz?
   -> collatz.worker.js

6. Это вывод sequence?
   -> sequenceView.js

7. Это данные, которые нужны нескольким модулям?
   -> state.js
```

Если функция подходит сразу к трем пунктам, она слишком большая.

---

## 14. Главная граница проекта

Самая важная граница сейчас:

```text
DOM/input layer
  знает, где кнопки и input

worker layer
  не знает DOM

view layer
  рисует результат, но не считает его
```

Именно эта граница делает проект управляемым.

---

## 15. Что добавить следующим

Следующим логичным добавлением будет:

```text
ESmodules/workers/workerManager.js
```

Но добавлять его стоит не пустым файлом, а когда ты реально начнешь подключать Run.

Минимальная цель workerManager:

```text
получить число
запустить worker
на chunk вызвать onChunk
на done вызвать onDone
на error вызвать onError
```

После этого можно связать:

```text
runProcessControls -> workerManager -> sequenceView
```

И это будет первый настоящий рабочий позвоночник MVP 6.

