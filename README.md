# Разбор проекта

### 1. Архитектура ESmodules:
```
ESmodules/
├── 📄 main.js <- собирает приложение в одно целое
│
├── 📁 app/
│   └── 📄 app.js <- связывает состояние, UI, worker и режимы визуализации
│
├── 📁 core/
│   └── 📄 collatz.js <- чистая логика Collatz без DOM, worker, кнопок и графиков
│
├── 📁 workers/
│   └── 📄 collatz.worker.js <- тяжелые вычисления в фоне
│
├── 📁 state/
│   └── 📄 store.js <- состояние приложения: input, result, mode, batchSize, currentStep
│
├── 📁 ui/ <- фичи самого интерфейса и контроллеры процесса выведения рез-ов
│   ├── 📄 input-controls.js
│   ├── 📄 process-controls.js
│   └── 📄 status-view.js
│
├── 📁 visualizations/ <- Все режимы визуализации (график, список и т.д.)
│   ├── 📄 sequence-list.js
│   ├── 📄 chart-view.js
│   ├── 📄 map-view.js
│   └── 📄 visualization-manager.js  
│
└── 📁 utils/ <- Полезные утилиты
    ├── 📄 dom.js
    ├── 📄 format.js
    └── 📄 validate.js

```