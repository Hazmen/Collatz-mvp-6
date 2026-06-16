# Roadmap: Самостоятельная Сборка Логики Collatzium MVP 6

## Summary

Цель MVP 6: не красивый интерфейс, а полное логическое ядро проекта на ES modules, поверх которого в следующем MVP можно будет спокойно строить UI, D3-графики, карту, режимы визуализации, настройки и анимации.

Работать нужно не “сразу писать все файлы”, а по слоям: сначала понять ответственность каждого слоя, потом руками перенести готовые идеи из MVP 5 и текущего MVP 6 в модульную архитектуру.

Главный порядок:

```text
данные -> вычисление -> состояние -> управление -> вывод -> режимы -> расширения
```

## Phase 0: Привести Папки К Понятной Форме

Оставь основной вариант `ESmodules/` с подпапками, а не плоский `(alt)_ESmodules`.

Рекомендуемая структура:

```text
ESmodules/
  app/
  core/
  state/
  controls/
  ui/
  visModes/
  workers/
  utils/
```

Что понять:

- папка не должна называться по “типу файла”, она должна называться по роли;
- если ты не можешь объяснить папку одним предложением, структура ещё сырая;
- `unused-for-now` лучше не держать: идеи записывай в заметки, а не в пустые файлы.

Что сделать самому:

- нарисуй на бумаге или в `.md` схему проекта;
- напротив каждой папки напиши: “эта папка отвечает за...”;
- не пиши код, пока не можешь объяснить роль папки.

## Phase 1: Core Logic

Сначала чистая математика Collatz без DOM, кнопок, worker и UI.

Модуль:

```text
ESmodules/core/collatz.js
```

Что там должно быть:

```js
nextCollatz(n)
isValidStartNumber(value)
normalizeInput(value)
```

Позже:

```js
getSequenceStats(sequence)
```

Что понять:

- pure function: функция получает данные и возвращает данные;
- чистая логика не должна знать про HTML;
- BigInt нужен, потому что числа быстро становятся огромными.

Практическое задание:

- напиши `nextCollatz(27n)`;
- проверь вручную несколько шагов;
- напиши функцию валидации input;
- не подключай это к UI, пока логика не понятна отдельно.

Читать:

- [MDN BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
- [javascript.info: Data types](https://javascript.info/types)

## Phase 2: Worker Layer

Твой worker уже есть, его не надо выбрасывать. Его нужно сделать стабильным вычислительным модулем.

Файл:

```text
CollatzLogic/workers/collatz.worker.js
```

Или позже:

```text
ESmodules/workers/collatz.worker.js
```

Что worker должен делать:

```text
получить число
посчитать Collatz
отправить chunks
отправить done
отправить error при проблеме
```

Контракт сообщений:

```js
{ type: "chunk", data: [...], offset: 0 }
{ type: "done", steps: 111, max: "9232" }
{ type: "error", message: "Invalid input" }
```

Что понять:

- worker не имеет доступа к DOM;
- worker общается только через `postMessage`;
- worker лучше не отправлять UI-команды;
- лучше отправлять наружу строки, если BigInt начинает мешать сериализации/отображению.

Практическое задание:

- заставь worker считать `27`;
- убедись, что `steps = sequence.length - 1`;
- сделай chunks, например по 1000 элементов;
- проверь, что main thread не зависает на большом числе.

Читать:

- [MDN: Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [MDN: Structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)

## Phase 3: Worker Manager

Не общайся с worker напрямую из `main.js`.

Модуль:

```text
ESmodules/workers/workerManager.js
```

Его роль:

```text
создать worker
отправить число
принять chunk/done/error
передать события дальше
```

Интерфейс:

```js
runCollatz(inputValue, {
  onChunk,
  onDone,
  onError,
});
```

Что понять:

- manager скрывает технические детали worker;
- остальное приложение не должно знать, где лежит worker-файл;
- если потом появится `chart.worker.js`, архитектура не развалится.

Практическое задание:

- сделай `runCollatz`;
- из `main.js` вызови только manager;
- не обновляй DOM внутри manager.

## Phase 4: State

Тут убирается каша из `isComputing`, `isRunning`, `playMode`, `isResetted`.

Модуль:

```text
ESmodules/state/store.js
```

Начальный state:

```js
{
  inputValue: "",
  status: "idle",
  chunks: [],
  steps: null,
  max: null,
  currentStepIndex: 0,
  batchSize: 100,
  mode: "sequence",
  error: null
}
```

Статусы:

```text
idle
computing
ready
playing
paused
error
```

Что понять:

- `isComputing` = worker считает;
- `isRunning` = UI проигрывает результат;
- лучше один `status`, чем много boolean-флагов;
- reset — это действие, а не отдельное состояние.

Практическое задание:

- сделай `getState()`;
- сделай `setState(patch)`;
- сделай `resetState()`;
- пока без сложных подписок, можно проще.

## Phase 5: Input Controls

Твои random/clear уже готовы. Их нужно не выбросить, а превратить в модуль.

Модуль:

```text
ESmodules/controls/inputControls.js
```

Роль:

```text
beforeinput validation
random input
clear input
save input later
input change callback
```

Интерфейс:

```js
setupInputControls({
  onInputChange,
  onRandom,
  onClear,
  onSave,
});
```

Что понять:

- input controls не должны запускать Collatz;
- input controls не должны знать про worker;
- они только сообщают приложению: “значение изменилось”.

Практическое задание:

- перенеси random и clear из текущего файла;
- замени прямую связь на callbacks;
- проверь, что input обновляется и событие `input` срабатывает.

## Phase 6: Process Controls

Это кнопки управления вычислением и показом.

Модуль:

```text
ESmodules/controls/processControls.js
```

Роль:

```text
run
pause
resume
reset
skip
changeSpeed
```

Что понять:

- `run` запускает вычисление, если результата нет;
- `pause` останавливает показ, а не worker;
- `skip` показывает всё оставшееся;
- `reset` чистит state и UI;
- speed влияет на playback, а не на сам Collatz.

Практическое задание:

- перенеси идеи из MVP 5: play/pause, reset, skip, speed;
- не копируй монолитом;
- каждая кнопка должна вызывать action, а не сама менять всё подряд.

## Phase 7: Stepper

Это ключ к пачкам 10/100/1000 и будущей анимации.

Модуль:

```text
ESmodules/app/stepper.js
```

Роль:

```text
получить текущую пачку
перейти к следующей
перейти к предыдущей
изменить batchSize
сбросить позицию
```

Интерфейс:

```js
getCurrentBatch(state)
nextBatch(state)
previousBatch(state)
setBatchSize(state, size)
```

Что понять:

- stepper не рисует HTML;
- stepper не считает Collatz;
- stepper только выбирает, какую часть данных показывать;
- график, карта и sequence могут использовать один и тот же источник данных.

Практическое задание:

- собери все chunks в логическую последовательность;
- покажи первые 100;
- переключись на следующие 100;
- смени batch size на 10 без пересчёта Collatz.

## Phase 8: Renderer И Первый Sequence View

Сначала делай самый простой вывод, без красоты.

Модули:

```text
ESmodules/ui/renderer.js
ESmodules/visModes/sequenceView.js
```

`renderer.js`:

```text
обновляет status
обновляет stats
очищает result area
вызывает активный view
```

`sequenceView.js`:

```text
рисует список чисел или текущую пачку
```

Что понять:

- renderer — это мост между state и DOM;
- visualization view отвечает только за один режим;
- не смешивай “выбрать данные” и “нарисовать данные”.

Практическое задание:

- вывести `steps`;
- вывести `max`;
- вывести текущую пачку;
- сделать next/prev batch;
- проверить на `27`.

## Phase 9: Modes

В MVP 5 уже есть хорошая идея:

```text
sequence
chart
chain
map
```

Модуль:

```text
ESmodules/visModes/modes.js
```

Роль:

```text
хранить список режимов
переключать активный режим
вызывать нужный view
```

Минимальные режимы:

```js
sequence
chart
chain
map
```

Что понять:

- mode manager не должен содержать D3-код;
- каждый режим должен быть отдельным модулем;
- если режим ещё не готов, он может показывать placeholder, но архитектурно он уже существует.

Практическое задание:

- перенеси идею carousel/dots из MVP 5;
- сделай переключение режима;
- пока пусть `chart/map/chain` показывают “not implemented yet”;
- `sequence` должен реально работать.

## Phase 10: Chart, Chain, Map

Только после того, как sequence работает.

Модули:

```text
ESmodules/visModes/chartView.js
ESmodules/visModes/chainView.js
ESmodules/visModes/mapView.js
```

Порядок:

1. `chartView`
2. `chainView`
3. `mapView`

Почему так:

- chart проще всего: x = step, y = value;
- chain сложнее, потому что это визуальная структура переходов;
- map сложнее всего, потому что нужно придумать координаты, масштабирование и навигацию.

D3 изучать только когда данные уже готовы.

Читать:

- [D3: Getting started](https://d3js.org/getting-started)
- [D3: Selections](https://d3js.org/d3-selection)
- [D3: Scales](https://d3js.org/d3-scale)

## Phase 11: Actions Layer

Когда логики станет много, добавь слой действий.

Модуль:

```text
ESmodules/app/actions.js
```

Роль:

```text
runCalculation
resetCalculation
pausePlayback
resumePlayback
skipPlayback
changeBatchSize
changeMode
```

Что понять:

- action — это “намерение пользователя”;
- controls вызывают actions;
- actions меняют state, worker и renderer;
- кнопки не должны сами знать всю логику приложения.

Практическое задание:

- выбери одну кнопку, например reset;
- перенеси всю reset-логику в `resetCalculation`;
- кнопка должна только вызвать action.

## Phase 12: Финальная Сборка В App

Файлы:

```text
main.js
ESmodules/app/app.js
```

`main.js` должен быть коротким:

```js
import { initApp } from "./ESmodules/app/app.js";

initApp();
```

`app.js` связывает:

```text
store
controls
worker manager
renderer
modes
stepper
```

Что понять:

- `main.js` не место для логики;
- `app.js` — композиция приложения;
- если файл становится огромным, значит внутри смешались роли.

## Self-Check Для Каждого Модуля

Перед тем как писать следующий модуль, ответь письменно:

```text
1. За что отвечает этот файл?
2. Чего этот файл НЕ должен знать?
3. Какие данные он получает?
4. Какие данные он возвращает или какое событие вызывает?
5. Можно ли проверить его без всего приложения?
```

Если не можешь ответить, код писать рано.

## Минимальный Порядок Работы

1. Нарисовать структуру папок.
2. Описать роль каждой папки.
3. Доделать `core/collatz.js`.
4. Привести worker к `chunk/done/error`.
5. Сделать `workerManager.js`.
6. Сделать `store.js` со `status`.
7. Перенести `inputControls.js`.
8. Сделать `processControls.js`.
9. Сделать `stepper.js`.
10. Сделать `renderer.js`.
11. Сделать `sequenceView.js`.
12. Сделать `modes.js`.
13. Подключить всё через `app.js`.
14. Только потом трогать chart/map/chain.
15. Только потом делать красивый UI.

## Что Читать И Учить По Порядку

Ты уже достаточно прочитал про ES modules, поэтому дальше читать не “историю модулей”, а практические темы:

1. Чистые функции и разделение ответственности.
   Ищи: `pure functions javascript`, `separation of concerns javascript`.

2. Состояние приложения.
   Ищи: `state management vanilla javascript`.

3. Web Workers.
   Читать: [MDN Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).

4. Message contracts.
   Ищи: `event driven architecture javascript`, `message passing web workers`.

5. DOM rendering без фреймворка.
   Ищи: `vanilla javascript render state to DOM`.

6. D3 только после готового sequence mode.
   Читать: [D3 Getting started](https://d3js.org/getting-started).

7. Архитектура UI-режимов.
   Ищи: `state machine UI javascript`.

## Assumptions

- Ты пишешь код сам, а Codex используется как наставник, ревьюер и планировщик.
- MVP 6 посвящён логике, не красоте.
- Готовые части из MVP 5 и MVP 6 не выбрасываются, а постепенно раскладываются по модулям.
- Основной вариант структуры — `ESmodules/` с подпапками, не `(alt)_ESmodules`.
- Первый реально работающий режим — `sequence`; `chart`, `chain`, `map` появляются после него.
