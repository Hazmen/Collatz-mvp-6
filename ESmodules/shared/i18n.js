// ------ SHARED I18N ------ \\
// Ported/trimmed from Astra_Collatz/src/i18n/translations.ts.
// Scope: ONLY the landing page, guide page and the shared loading screen.
// The simulation UI itself stays English and is untouched.

const KEY = 'collatz-lang';
const DEFAULT_LANG = 'en';

export const QUOTES = [
  '"Mathematics is not yet ready for such problems." — Paul Erdős',
  '"3n + 1 is a black hole for the integers."',
  '"Any number. One law. Always one?"',
  '"The Collatz conjecture: simple to state, impossible to prove."',
  '"Even down, odd up — and yet, always home to 1."',
];

export const translations = {
  ru: {
    'app.title': 'COLLATZIUM',
    'app.subtitle': 'Исследователь гипотезы Коллатца',

    'home.enterNumber': 'Введите число',
    'home.placeholder': 'число',
    'home.start': 'Запустить',
    'home.howItWorks': 'Как это работает',
    'home.about': 'О проекте',
    'home.tagline': 'Любое число. Один закон. Всегда единица?',
    'home.rule1': 'Чётное — делим на 2',
    'home.rule2': 'Нечётное — умножаем на 3 и прибавляем 1',
    'home.rule3': 'Повторяем, пока не дойдём до 1',

    'nav.back': 'Назад',

    'error.invalid': 'Введите целое положительное число',
    'error.empty': 'Поле пустое',

    'loading.text': 'Загрузка…',

    'guide.title': 'Гипотеза Коллатца',
    'guide.tab.simple': 'Простое объяснение',
    'guide.tab.rules': 'Правила',
    'guide.tab.about': 'О проекте',
  },
  en: {
    'app.title': 'COLLATZIUM',
    'app.subtitle': 'Collatz Conjecture Explorer',

    'home.enterNumber': 'Enter your number',
    'home.placeholder': 'number',
    'home.start': 'Start',
    'home.howItWorks': 'How it works',
    'home.about': 'About',
    'home.tagline': 'Any number. One law. Always one?',
    'home.rule1': 'Even — divide by 2',
    'home.rule2': 'Odd — multiply by 3 and add 1',
    'home.rule3': 'Repeat until you reach 1',

    'nav.back': 'Back',

    'error.invalid': 'Enter a positive whole number',
    'error.empty': 'The field is empty',

    'loading.text': 'Loading…',

    'guide.title': 'The Collatz Conjecture',
    'guide.tab.simple': 'Simple explanation',
    'guide.tab.rules': 'Rules',
    'guide.tab.about': 'About',
  },
};

let currentLang = load();

function load() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'ru' || saved === 'en') return saved;
  } catch { /* private mode / quota */ }
  return DEFAULT_LANG;
}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  currentLang = lang === 'en' ? 'en' : 'ru';
  try { localStorage.setItem(KEY, currentLang); } catch { /* ignore */ }
  document.documentElement.setAttribute('lang', currentLang);
  applyTranslations();
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
}

export function toggleLang() {
  setLang(currentLang === 'ru' ? 'en' : 'ru');
}

export function t(key) {
  const dict = translations[currentLang] || translations.en;
  return dict[key] ?? translations.en[key] ?? key;
}

// Applies translations to every [data-i18n] node in the document.
// Uses textContent by default; [data-i18n-attr="placeholder"] targets an attribute instead.
export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    const value = t(key);
    if (attr) el.setAttribute(attr, value);
    else el.textContent = value;
  });
}

// apply immediately on import
document.documentElement.setAttribute('lang', currentLang);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyTranslations());
} else {
  applyTranslations();
}
