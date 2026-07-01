# Collatzium MVP 6 Roadmap

## Цель MVP 6

MVP 6 не переписывает проект с нуля и не строит идеальную архитектуру “на будущее”.  
Цель этой версии: спокойно перенести фундаментальную JS-логику из старого MVP в ES modules так, чтобы каждый модуль имел понятную роль и уже сейчас участвовал в рабочем потоке.

Первый главный рабочий путь:

```text
input -> run -> worker -> result messages -> sequence list
```

Все остальное добавляется только после того, как предыдущий слой реально работает.

---

## Текущая Архитектура

Сейчас базовая структура уже нормальная:

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
  state/
    state.js
  workers/
    collatz.worker.js
```

Роли:

```text
main.js
  запускает модули и связывает их на самом верхнем уровне

utils/dom.js
  короткие DOM-хелперы: $, $$, $$$

ui/uiElements.js
  только ссылки на реальные DOM-элементы и группы элементов

ui/inputControls.js
  поведение input-кнопок: random, clear, preventLetters

ui/runProcessControls.js
  поведение run/reset/skip, пока пустой

ui/sequenceView.js
  создание и отображение элементов sequence list

state/state.js
  состояние приложения, пока пустой

workers/collatz.worker.js
  тяжелый расчет Collatz вне главного потока
```

---

## Правило Архитектуры

Каждый модуль должен отвечать на один вопрос:

```text
uiElements.js
  Какие DOM-элементы есть на странице?

inputControls.js
  Что делают input-кнопки?

runProcessControls.js
  Что делают кнопки запуска процесса?

workerManager.js
  Как приложение общается с worker?

state.js
  Что сейчас происходит в приложении?

sequenceView.js
  Как показать последовательность на странице?

collatz.worker.js
  Как посчитать Collatz?
```

Если файл начинает отвечать сразу на несколько вопросов, его надо упростить или разделить.

---

## Этап 1: Закрепить Текущую Базу

Перед добавлением новой логики нужно привести текущие модули к ясному виду.

Сделать:

- В `main.js` убрать мусорный импорт вида `import { mainInputField, }`.
- В `inputControls.js` решить, откуда берется максимум для random:
  - либо `InputControlsHere(MAX_RANDOM)` использует переданный `setMax`;
  - либо функция сама использует внутренний `MAX_RANDOM`.
- В `uiElements.js` оставить только DOM-ссылки и группы DOM-ссылок.
- В `sequenceView.js` оставить функцию создания элемента списка.
- Не добавлять `actions.js`, `app.js`, `modes.js`, `stepper.js`, пока нет первого рабочего потока.

Критерий готовности:

```text
main.js запускает input controls
random работает
clear работает
preventLetters работает
sequenceView существует отдельно от uiElements
```

---

## Этап 2: Довести Input Controls

`inputControls.js` должен отвечать только за input-поведение.

Он может:

```text
запрещать буквы
генерировать random value
очищать input
возвращать focus в input
вызывать input event после программного изменения
```

Он не должен:

```text
запускать worker
считать Collatz
знать про sequence list
хранить результат
знать про графики и режимы
```

Сначала доделать только:

```text
preventLetters
random
clear
```

Save пока можно оставить пустым, если его поведение еще не определено.

---

## Этап 3: Сделать Run Process Controls

Следующий фундаментальный модуль:

```text
ESmodules/ui/runProcessControls.js
```

Сначала он должен уметь только одно:

```text
по нажатию run взять текущее значение input и запустить процесс вычисления
```

Пока не делать:

```text
pause
resume
speed
stepper
batch switching
graph
map
```

Важно:

```text
runProcessControls может знать input DOM element
workerManager не должен знать input DOM element
```

---

## Этап 4: Добавить Worker Manager

Добавить модуль только тогда, когда `runProcessControls` готов запускать расчет.

Файл:

```text
ESmodules/workers/workerManager.js
```

Роль:

```text
создать worker
отправить число worker'у
принять chunk/done/error
передать эти события наружу
```

Worker manager не должен сам читать input.

Правильный поток:

```text
runProcessControls читает input
runProcessControls валидирует/готовит значение
runProcessControls вызывает workerManager
workerManager отправляет значение в worker
```

Формула:

```text
workerManager не добывает число.
workerManager доставляет число worker'у.
```

---

## Этап 5: Закрепить Worker Contract

`collatz.worker.js` уже делает главное: считает Collatz и отправляет сообщения.

Его контракт должен быть стабильным:

```text
chunk
  пришла часть последовательности

done
  расчет завершен, есть steps и max

error
  расчет невозможен или сломался
```

Критерий готовности:

```text
worker получает 27
worker отправляет хотя бы один chunk
worker отправляет done
steps равен list.length - 1
ошибки отправляются через error message
```

---

## Этап 6: Вывести Результат В Sequence List

`sequenceView.js` должен стать первым настоящим view-модулем.

Он отвечает за:

```text
создать строку списка
добавить строку в parent
очистить список
отрисовать chunk
```

Сначала достаточно простого поведения:

```text
пришел chunk
каждое число из chunk добавляется в sequence list
```

Пока не делать:

```text
виртуализацию списка
пачки 10/100/1000
анимацию по шагам
scrollbar-библиотеки
```

---

## Этап 7: Минимальное State

`state.js` не нужно делать сложным сразу.

Минимальный state появляется только после первого рабочего run-flow.

Сначала достаточно хранить:

```text
status
activeInputValue
chunks
steps
max
error
```

Пример статусов на уровне идеи:

```text
idle
computing
ready
error
```

Пока не нужны:

```text
playing
paused
currentStepIndex
batchSize
mode
```

Они появятся позже, когда будет playback, stepper и режимы.

---

## Этап 8: Reset

После того как run и sequence output работают, добавить reset.

Reset должен:

```text
остановить текущий вывод, если он есть
очистить sequence list
сбросить state
вернуть статус в idle
оставить input как есть или очистить его, если ты так решишь
```

Reset не должен:

```text
пересчитывать Collatz
создавать новый UI
трогать random/clear логику input controls
```

---

## Этап 9: Skip

Skip имеет смысл только после того, как уже есть результат или идет вывод.

Первый вариант skip:

```text
если chunks уже пришли, показать все доступные числа сразу
```

Не делать skip раньше, чем есть рабочий вывод sequence list.

---

## Этап 10: Перенос Из MVP 5

Переносить идеи из старого `scripts/main.js` только после рабочего базового пути.

Порядок переноса:

1. `run`
2. `reset`
3. `skip`
4. `copy`
5. `stats`
6. `speed`
7. `play/pause`
8. `search`
9. `modes`
10. `chart`
11. `chain`
12. `map`
13. `settings`

Не копировать большой файл целиком.  
Переносить по одному поведению и сразу решать, в какой модуль оно относится.

---

## Что Пока Не Делать

Пока не добавлять:

```text
actions.js
app.js
stepper.js
modes.js
chartView.js
mapView.js
chainView.js
D3
OverlayScrollbars
сложный state manager
```

Эти вещи нужны позже, но сейчас они будут создавать архитектуру под функции, которые еще не работают.

---

## Ближайший Практический Порядок

1. Почистить `main.js`.
2. Довести `inputControls.js`.
3. Проверить `uiElements.js`: только DOM-ссылки и группы.
4. Начать `runProcessControls.js`.
5. Добавить `workerManager.js`, когда run реально должен вызвать worker.
6. Подключить worker и принять `chunk/done/error`.
7. Использовать `sequenceView.js` для вывода chunk в список.
8. Только потом заполнить минимальный `state.js`.
9. После этого добавить reset.
10. После reset добавить skip.

---

## Самопроверка Перед Каждым Новым Модулем

Перед созданием или заполнением файла ответить:

```text
1. Зачем этот файл существует?
2. Что он получает на вход?
3. Что он возвращает или вызывает?
4. Какие модули он не должен знать?
5. Можно ли сейчас использовать его в рабочем потоке?
```

Если ответ на пункт 5 — “нет, это только на будущее”, файл пока не нужен.

---

## Главный Принцип

Не строить архитектуру впереди работающей логики.

Правильный темп:

```text
маленький рабочий кусок
понять его роль
вынести в модуль
проверить
перейти к следующему куску
```

MVP 6 должен расти спокойно: от input и worker к sequence, потом к управлению, потом к режимам.
