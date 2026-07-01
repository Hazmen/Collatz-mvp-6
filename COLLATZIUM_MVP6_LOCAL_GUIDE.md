# Collatzium MVP 6: подробная карта текущей архитектуры

Основано на локальной папке:

```text
D:\Рабочий стол\Myprojects\Collatz\projectprototype\mvp v6
```

Текущее состояние важно: проект уже не просто "план". В нем есть реальная структура, реальные DOM-элементы, реальные модули и уже начатый worker-flow.

---

## 1. Главная цель текущего этапа

Сейчас не нужно строить всю будущую архитектуру.

Главная цель:

```text
input -> run -> workerManager -> collatz.worker -> chunk/done/error -> sequenceView -> sequence list
```

Пока этот путь не работает, не нужно трогать:

```text
play/pause
speed
stepper
batch size
chart
map
chain
settings
copy
search
D3
```

---

## 2. Текущая структура проекта

Реальная структура ES modules:

```text
ESmodules/
  main.js

  utils/
    dom.js

  ui/
    uiElements.js
    inputControls.js
    runProcessControls.js
    sequenceView.js

  workers/
    collatz.worker.js
    workerManager.js

  state/
    state.js
```

Также есть:

```text
index.html
assets/css/layout.css
assets/css/scrollbars.css
assets/tailwind/src/input.css
assets/tailwind/dist/output.css
ready-to-use_script_folders/
PLAN.md
PLAN v2.md
README.md
```

---

## 3. Карта ролей модулей

### `ESmodules/main.js`

Текущая роль:

```text
Главная точка входа приложения.
Подключает стартовые модули и запускает первичную настройку.
```

Сейчас делает:

```text
импортирует InputControlsHere
импортирует mainInputField
импортирует preventLetters
запускает InputControlsHere()
вешает preventLetters(mainInputField)
```

Что должен делать:

```text
запускать верхнеуровневую инициализацию
оставаться коротким
связывать уже готовые модули
```

Что не должен делать:

```text
читать input для расчета
запускать worker напрямую
рисовать sequence list
хранить chunks
содержать логику Collatz
```

Ментальная модель:

```text
main.js - это рубильник приложения, а не место всей логики.
```

---

### `ESmodules/utils/dom.js`

Текущая роль:

```text
Маленькие DOM-хелперы.
```

Экспортирует:

```text
$
$$
$$$
```

Значение:

```text
$(selector)
  document.querySelector(selector)

$$(selector)
  массив querySelectorAll(selector)

$$$(id)
  document.getElementById(id)
```

Этот модуль не должен знать вообще ничего о проекте.

Он не знает:

```text
input
run
worker
Collatz
sequence
state
```

Он просто инструмент.

---

### `ESmodules/ui/uiElements.js`

Текущая роль:

```text
Карта DOM-элементов страницы.
```

Сейчас содержит:

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

Правильная ответственность:

```text
найти DOM-элемент
экспортировать DOM-элемент
сгруппировать связанные DOM-элементы
```

Пример нормальной группы:

```text
inputControls_Elements:
  saveInput
  clearInput
  randomInput
```

Пример нормальной группы:

```text
runProcess_Elements:
  runButton
  resetButton
  skipButton
```

Что этому модулю нельзя делать:

```text
addEventListener
BigInt
worker.postMessage
insertAdjacentHTML
расчет Collatz
изменение state
```

Главное правило:

```text
uiElements.js отвечает только на вопрос:
"Какие элементы есть на странице и как до них добраться?"
```

Он не отвечает:

```text
"Что эти элементы делают?"
```

---

### `ESmodules/ui/inputControls.js`

Текущая роль:

```text
Поведение input-кнопок и input-ограничений.
```

Сейчас содержит:

```text
preventLetters(inp)
InputControlsHere()
LetItRandom()
random click handler
clear click handler
```

#### `preventLetters(inp)`

Получает:

```text
DOM input element
```

Делает:

```text
вешает beforeinput
если введенный символ не цифра - отменяет ввод
```

Важно:

```text
preventLetters не делает число валидным на 100%.
Она только помогает пользователю не вводить буквы.
```

Позже все равно нужна проверка перед Run:

```text
input не пустой
input больше 0
input состоит из цифр
```

#### `InputControlsHere()`

Сейчас:

```text
создает локальный setMax = 99999999999n
объявляет LetItRandom()
вешает click на random
вешает click на clear
```

Random делает:

```text
генерирует случайный BigInt
записывает его в mainInputField.value
dispatchEvent(input)
focus()
```

Clear делает:

```text
mainInputField.value = ''
dispatchEvent(input)
focus()
```

Что `inputControls.js` не должен делать:

```text
запускать worker
знать про run button
знать про sequence list
считать Collatz
хранить результат расчета
```

Формула:

```text
inputControls.js меняет только input-поведение.
```

---

### `ESmodules/ui/runProcessControls.js`

Текущее состояние:

```text
файл существует, но пустой
```

Это следующий главный модуль.

Его первая задача:

```text
научить кнопку Run запускать вычисление
```

Минимальный будущий поток:

```text
1. взять runProcess_Elements.runButton
2. повесить click
3. прочитать mainInputField.value
4. проверить значение
5. создать activeInputValue
6. очистить sequence list
7. вызвать workerManager
```

Что он может знать:

```text
mainInputField
runProcess_Elements
txtList
sequenceView
workerManager
state later
```

Что он не должен делать:

```text
считать Collatz сам
создавать строки списка вручную
генерировать random
знать детали цикла Collatz
содержать будущую логику chart/map
```

Ментальная модель:

```text
runProcessControls.js - это поведение кнопок процесса: run/reset/skip.
```

Сначала делать только Run.

Reset и Skip позже.

---

### `ESmodules/workers/workerManager.js`

Текущее состояние:

```text
файл существует, но пустой
```

Это не worker.

Это менеджер общения с worker.

Его роль:

```text
создать Worker
отправить число
принять сообщения worker
передать сообщения наружу
```

Он должен получать:

```text
activeInputValue
callbacks или обработчики:
  onChunk
  onDone
  onError
```

Он должен знать:

```text
путь до collatz.worker.js
как создать new Worker(...)
как обработать message.type
```

Он не должен знать:

```text
mainInputField
run button
random button
sequence-list CSS selector
Tailwind
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
runProcessControls создает activeInputValue
runProcessControls вызывает workerManager(activeInputValue)
workerManager отправляет activeInputValue в collatz.worker
```

---

### `ESmodules/workers/collatz.worker.js`

Текущая роль:

```text
Вычисляет Collatz в фоне.
```

Получает:

```text
e.data
```

Делает:

```text
BigInt(e.data)
считает list
считает max
режет list на chunks
отправляет chunk messages
отправляет done
если ошибка - отправляет error
```

Сообщения:

```text
chunk:
  { type: "chunk", data, offset }

done:
  { type: "done", steps, max }

error:
  { type: "error", message }
```

Что такое `offset`:

```text
offset - индекс начала chunk внутри полной последовательности.
```

Пример:

```text
CHUNK_SIZE = 10000

chunk 1:
  offset = 0
  data[0] - это общий индекс 0

chunk 2:
  offset = 10000
  data[0] - это общий индекс 10000
```

Как получить реальный индекс числа:

```text
realIndex = offset + localIndex
```

Что worker не должен знать:

```text
DOM
input
button
sequenceView
state
chart
map
```

Возможная будущая правка:

```text
цикл chunk сейчас использует i <= list.length
из-за этого может появиться пустой chunk
```

Позже лучше сделать так, чтобы пустые chunks не отправлялись.

---

### `ESmodules/ui/sequenceView.js`

Текущая роль:

```text
Создает HTML-элемент одного числа в sequence list.
```

Сейчас содержит:

```text
txtListObj_create(parent, index, number)
```

Получает:

```text
parent - DOM-контейнер списка
index - индекс/номер шага
number - число
```

Делает:

```text
создает HTML-строку
добавляет ее в parent через insertAdjacentHTML
```

Что должен уметь позже:

```text
создать одну строку
очистить список
отрисовать chunk
```

Что не должен делать:

```text
читать input
запускать worker
считать Collatz
знать random/clear
хранить общий state
```

Формула:

```text
sequenceView.js показывает данные, но не добывает и не считает их.
```

---

### `ESmodules/state/state.js`

Текущее состояние:

```text
файл существует, но пустой
```

Это нормально.

State нужен только когда появляются данные, которые нужны нескольким модулям.

Минимальный будущий state:

```text
status
activeInputValue
chunks
steps
max
error
```

Что значит каждое поле:

```text
status
  idle / computing / ready / error

activeInputValue
  число, по которому идет текущий расчет

chunks
  полученные куски последовательности

steps
  количество шагов из done message

max
  максимальное число из done message

error
  текст ошибки из error message
```

Пока не добавлять:

```text
playing
paused
currentStepIndex
batchSize
mode
```

Они нужны позже, когда появятся:

```text
play/pause
stepper
batch output
modes
```

---

## 4. Карта элементов сайта

### Input field

HTML:

```html
<input id="number-input" class="number-input" value="27">
```

DOM-ссылка:

```text
mainInputField
```

Где живет:

```text
uiElements.js
```

Кто использует:

```text
inputControls.js
runProcessControls.js later
```

Какие значения рождает:

```text
mainInputField.value
```

Тип:

```text
string
```

Важно:

```text
mainInputField.value - это не расчетное число.
Это текущий текст в поле.
```

---

### Random button

HTML:

```html
<button class="rand-inp">rand</button>
```

DOM-ссылка:

```text
randomInput
```

Группа:

```text
inputControls_Elements.randomInput
```

Где ссылка:

```text
uiElements.js
```

Где поведение:

```text
inputControls.js
```

Что делает:

```text
создает случайное число
записывает его в input
вызывает input event
возвращает focus
```

---

### Clear button

HTML:

```html
<button class="clear-inp">clear</button>
```

DOM-ссылка:

```text
clearInput
```

Группа:

```text
inputControls_Elements.clearInput
```

Где ссылка:

```text
uiElements.js
```

Где поведение:

```text
inputControls.js
```

Что делает:

```text
очищает input
вызывает input event
возвращает focus
```

---

### Save button

HTML:

```html
<button class="save-inp">save</button>
```

DOM-ссылка:

```text
saveInput
```

Где ссылка:

```text
uiElements.js
```

Где поведение:

```text
пока не определено
```

Пока не трогать, если нет точного поведения.

---

### Run button

HTML:

```html
<button class="proc-run">run</button>
```

DOM-ссылка:

```text
runButton
```

Группа:

```text
runProcess_Elements.runButton
```

Где ссылка:

```text
uiElements.js
```

Где поведение должно быть:

```text
runProcessControls.js
```

Что должен делать первым:

```text
прочитать input
создать activeInputValue
запустить workerManager
```

---

### Reset button

HTML:

```html
<button class="proc-reset">reset</button>
```

Где ссылка:

```text
uiElements.js
```

Где поведение позже:

```text
runProcessControls.js
```

Пока не делать до рабочего Run.

---

### Skip button

HTML:

```html
<button class="proc-skip">skip</button>
```

Где ссылка:

```text
uiElements.js
```

Где поведение позже:

```text
runProcessControls.js
```

Пока не делать до рабочего вывода sequence.

---

### Sequence list

HTML:

```html
<div class="sequence-list ..."></div>
```

DOM-ссылка:

```text
txtList
```

Где ссылка:

```text
uiElements.js
```

Где отрисовка:

```text
sequenceView.js
```

Что туда попадает:

```text
строки вида:
индекс + число
```

---

## 5. Карта значений

### `mainInputField`

Тип:

```text
DOM element
```

Где появляется:

```text
uiElements.js
```

Кто использует:

```text
inputControls.js
runProcessControls.js later
main.js for preventLetters
```

---

### `mainInputField.value`

Тип:

```text
string
```

Пример:

```text
"27"
```

Где появляется:

```text
input DOM
```

Кто меняет:

```text
пользователь
random button
clear button
```

Кто читает:

```text
runProcessControls.js later
```

Важно:

```text
Не хранить это как "текущий расчет".
Это просто текущее поле ввода.
```

---

### `activeInputValue`

Сейчас:

```text
еще не реализовано
```

Будущая роль:

```text
снимок input value в момент нажатия Run
```

Пример:

```text
input.value = "27"
нажали Run
activeInputValue = "27"
```

Почему важно:

```text
пользователь может изменить input после запуска,
но расчет должен продолжаться по старому activeInputValue.
```

Где должен появляться:

```text
runProcessControls.js
```

Где должен храниться позже:

```text
state.js
```

Кто использует:

```text
workerManager.js
```

---

### `setMax`

Тип:

```text
BigInt
```

Сейчас:

```text
99999999999n
```

Где живет:

```text
inputControls.js внутри InputControlsHere()
```

Кто использует:

```text
LetItRandom()
```

Роль:

```text
верхняя граница случайного числа
```

---

### `chunk`

Тип:

```text
object message from worker
```

Пример:

```text
{
  type: "chunk",
  data: [...],
  offset: 0
}
```

Где появляется:

```text
collatz.worker.js
```

Кто должен принять:

```text
workerManager.js
```

Кто должен использовать:

```text
sequenceView.js
state.js later
```

---

### `chunk.data`

Тип:

```text
array
```

Содержит:

```text
числа последовательности Collatz
```

Пример:

```text
[27n, 82n, 41n, ...]
```

---

### `chunk.offset`

Тип:

```text
number
```

Зачем нужен:

```text
показывает, с какого общего индекса начинается chunk
```

Как использовать:

```text
realIndex = offset + localIndex
```

---

### `done`

Тип:

```text
worker message
```

Пример:

```text
{
  type: "done",
  steps: 111,
  max: 9232n
}
```

Где появляется:

```text
collatz.worker.js
```

Кто принимает:

```text
workerManager.js
```

Кто использует позже:

```text
state.js
stats UI
```

---

### `error`

Тип:

```text
worker message
```

Пример:

```text
{
  type: "error",
  message: "..."
}
```

Где появляется:

```text
collatz.worker.js
```

Кто принимает:

```text
workerManager.js
```

Кто использует позже:

```text
state.js
error UI
```

---

## 6. Полный будущий поток Run

### Шаг 1: пользователь вводит число

```text
mainInputField.value = "27"
```

Контроль ввода:

```text
preventLetters(mainInputField)
```

---

### Шаг 2: пользователь нажимает Run

Событие:

```text
click на runProcess_Elements.runButton
```

Обработчик:

```text
runProcessControls.js
```

Должно произойти:

```text
1. прочитать mainInputField.value
2. проверить, что строка не пустая
3. проверить, что это положительное число
4. создать activeInputValue
5. очистить txtList
6. вызвать workerManager
```

---

### Шаг 3: workerManager запускает worker

Вход:

```text
activeInputValue
```

Действия:

```text
1. создать Worker для collatz.worker.js
2. назначить onmessage
3. отправить activeInputValue
```

---

### Шаг 4: worker считает

Модуль:

```text
collatz.worker.js
```

Действия:

```text
1. BigInt(e.data)
2. считать list
3. считать max
4. отправить chunks
5. отправить done
```

---

### Шаг 5: workerManager принимает сообщения

Если:

```text
message.type === "chunk"
```

то:

```text
передать chunk наружу
```

Если:

```text
message.type === "done"
```

то:

```text
передать done наружу
```

Если:

```text
message.type === "error"
```

то:

```text
передать error наружу
```

---

### Шаг 6: sequenceView рисует chunk

Вход:

```text
parent = txtList
data = chunk.data
offset = chunk.offset
```

Для каждого числа:

```text
index = offset + localIndex
number = data[localIndex]
txtListObj_create(parent, index, number)
```

---

## 7. Разрешенные связи между модулями

Нормально:

```text
main.js -> inputControls.js
main.js -> uiElements.js

inputControls.js -> uiElements.js

runProcessControls.js -> uiElements.js
runProcessControls.js -> workerManager.js
runProcessControls.js -> sequenceView.js

workerManager.js -> collatz.worker.js

sequenceView.js -> получает parent как аргумент
```

Позже нормально:

```text
runProcessControls.js -> state.js
workerManager.js -> state.js через callbacks, если нужно
```

---

## 8. Плохие связи между модулями

Плохо:

```text
workerManager.js читает mainInputField.value
```

Почему:

```text
workerManager становится зависимым от DOM.
```

Плохо:

```text
collatz.worker.js знает про sequence list
```

Почему:

```text
worker должен только считать.
```

Плохо:

```text
inputControls.js запускает worker
```

Почему:

```text
random/clear не являются запуском расчета.
```

Плохо:

```text
uiElements.js вешает addEventListener
```

Почему:

```text
uiElements.js должен быть картой элементов, а не поведением.
```

---

## 9. Что делать следующим

### 1. Не трогать новые большие фичи

Не делать сейчас:

```text
state manager
play/pause
speed
batch output
modes
chart
map
settings
copy
search
```

### 2. Заполнить `runProcessControls.js`

Цель:

```text
кнопка Run читает input и запускает workerManager
```

### 3. Заполнить `workerManager.js`

Цель:

```text
получить число
запустить worker
разобрать chunk/done/error
```

### 4. Расширить `sequenceView.js`

Цель:

```text
уметь очистить список
уметь отрисовать chunk
```

### 5. Только потом начать `state.js`

Цель:

```text
хранить status, activeInputValue, steps, max, error
```

---

## 10. Самопроверка

Перед любой новой функцией:

```text
1. Она ищет DOM-элемент?
   -> uiElements.js

2. Она управляет random/clear/save?
   -> inputControls.js

3. Она управляет run/reset/skip?
   -> runProcessControls.js

4. Она общается с worker?
   -> workerManager.js

5. Она считает Collatz?
   -> collatz.worker.js

6. Она рисует sequence list?
   -> sequenceView.js

7. Она хранит общее состояние?
   -> state.js
```

Если функция подходит сразу к нескольким пунктам, она слишком большая или лежит не там.

---

## 11. Самая важная фраза

```text
DOM добывает данные.
runProcessControls решает, когда запускать процесс.
workerManager доставляет задачу worker'у.
worker считает.
sequenceView показывает.
state позже запоминает общее состояние.
```

