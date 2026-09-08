import { resetState, resetSBS } from "../state/stateManager.js";
import { sendSBS_ClearEvent } from "../state/events.js";
import { setRunButtonMode } from "../ui/playButtonSVG.js";
import { clearSBSTimer, SBSeventTarget } from "./SBSoutputManager.js";

/*
    ЕДИНАЯ ТОЧКА СБРОСА СЕССИИ

    Все команды, которые стирают результат вычислений и/или SBS-вывод,
    собраны здесь, в одном файле. Импортируй сбросы только отсюда.

    Схема «веса» сбросов, от лёгкого к тяжёлому:

      resetSBS()          — обнулить только SBSconfig (вывод), данные вычислений живы
      resetState()        — обнулить только state (данные вычислений), вывод живой
      resetOutputOnly()   = resetSBS() + очистка DOM через sbs_clear
      resetSession()      = resetOutputOnly() + resetState()   ← полный сброс

    resetState() и resetSBS() переэкспортированы из stateManager, а не
    перенесены сюда: они пишут прямо в объекты state / SBSconfig, а
    единственный владелец этих объектов — stateManager. Здесь они просто
    доступны, чтобы весь сброс импортировался из одного места.
*/
export { resetState, resetSBS };

// ------ ОЧИСТКА ТОЛЬКО ВЫВОДА (SBS), РЕЗУЛЬТАТ ВЫЧИСЛЕНИЙ ЖИВ ------ \\
// Когда использовать:
//   1) реплей того же числа после завершения (doneRunning === true),
//      когда workerResult уже посчитан и пересчитывать не нужно;
//   2) кнопка Reset — теперь это "мягкий" сброс: чистится только
//      SBSconfig + DOM (sbs_clear), а workerResult/activeInputValue
//      остаются для мгновенного повтора того же числа (lazy reset).
//      Полный сброс сессии (resetState) откладывается до следующего
//      запуска с ДРУГИМ числом — его делают ветки startRunProcess /
//      startManualAddProcess, которые вызывают resetSession() прямо
//      перед workerManager_Recieve() когда !inputMatchesActive.
export function resetOutputOnly() {
    clearSBSTimer();                        // 1. отменить уже запланированный тик SBS (если есть)
    resetSBS();                             // 2. обнулить SBSconfig: currentStepIndex, visibleItems, currentMaxNum и т.д.
    sendSBS_ClearEvent(SBSeventTarget);     // 3. разослать sbs_clear: режимы визуализации стирают свой DOM/данные
    // setRunButtonMode(false);                // 4. вернуть кнопку Play/Pause в состояние «Запустить»
}

// ------ ПОЛНЫЙ СБРОС СЕССИИ: ВЫВОД + РЕЗУЛЬТАТ ВЫЧИСЛЕНИЙ ------ \\
// Когда использовать: пользователь ввёл НОВОЕ число и нажал Play
// (или + в manual с другим числом). Стирается всё, включая workerResult.
// Вызывается лениво — только перед чистым новым запуском, когда
// BigInt(input) !== activeInputValue. Кнопка Reset его больше не вызывает.
export function resetSession() {
    resetOutputOnly();                      // шаги 1-4: остановить тик, сбросить SBSconfig, оповестить визуализацию, кнопку
    resetState();                           // 5. стереть данные вычислений: workerResult, workerMaxNum, hasResult, activeInputValue и т.д.
}
