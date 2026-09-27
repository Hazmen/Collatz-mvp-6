// ------ SHARED I18N ------ \\
// Ported/trimmed from Astra_Collatz/src/i18n/translations.ts.
// Scope: ONLY the landing page, guide page and the shared loading screen.
// The simulation UI itself stays English and is untouched.

const KEY = 'collatz-lang';
const DEFAULT_LANG = 'en';

export const QUOTES = [
  { en: 'Mathematics is not yet ready for such problems.', ru: 'Математика ещё не готова к таким задачам.', byEn: 'Paul Erdős · 1992', byRu: 'Пол Эрдёш · 1992' },
  { en: '3n + 1 is like a black hole for the integers.', ru: '3n + 1 — как чёрная дыра для целых чисел.', byEn: '', byRu: '' },
  { en: 'Every number leads to one. Or does it?', ru: 'Каждое число ведёт к единице. Или нет?', byEn: '', byRu: '' },
  { en: 'A child can understand it. No mathematician can prove it.', ru: 'Ребёнок её поймёт. Ни один математик не докажет.', byEn: '', byRu: '' },
  { en: 'The Collatz problem is like a weed: it grows on its own and is impossible to kill.', ru: 'Проблема Коллатца — как сорняк: растёт сама и её невозможно вырвать.', byEn: 'Attributed to John H. Conway', byRu: 'Приписывается Джону Конвею' },
  { en: 'An extraordinarily difficult problem, completely out of reach of present day mathematics.', ru: 'Необычайно сложная задача, полностью вне досягаемости современной математики.', byEn: 'Jeffrey C. Lagarias · 2010', byRu: 'Джеффри Лагариас · 2010' },
  { en: 'Also try Minecraft!', ru: 'А ещё попробуй Minecraft!', byEn: '', byRu: '' },
  { en: 'I spent 1 year on this project. Don’t waste your time proving the Collatz conjecture.', ru: 'Я потратил год на этот проект. Не трать время на доказательство гипотезы Коллатца.', byEn: 'Hazmen (dev :3)', byRu: 'Хазмен (разработчик)' },
  { en: 'You should try Namida the Music Player!', ru: 'Попробуй Namida Music Player!', byEn: 'P.S. developer didn’t pay me', byRu: 'P.S. разработчик мне не платил' },
  { en: 'Hopeless. Absolutely hopeless.', ru: 'Безнадёжно. Совершенно безнадёжно.', byEn: 'Paul Erdős, via J. Lagarias', byRu: 'Пол Эрдёш, со слов Лагариаса' },
  { en: 'One of the most dangerous conjectures known, notorious for absorbing massive amounts of time.', ru: 'Одна из самых опасных гипотез, печально известная тем, что поглощает уйму времени.', byEn: 'Terence Tao', byRu: 'Теренс Тао' },
  { en: 'No counterexample below 2⁷¹. That is still 0% of infinity.', ru: 'Нет контрпримера ниже 2⁷¹. Но это всё ещё 0% бесконечности.', byEn: 'D. Barina · 2025', byRu: 'Д. Барина · 2025' },
  { en: 'Almost all numbers fall almost all the way down. Almost.', ru: 'Почти все числа падают почти до самого низа. Почти.', byEn: 'Terence Tao · 2019', byRu: 'Теренс Тао · 2019' },
  { en: 'If you’re a math student, remember not to waste your time on Collatz.', ru: 'Если ты студент-математик — не трать время на Коллатц.', byEn: '', byRu: '' },
  { en: '', ru: '', byEn: 'Rick Astley · 1987', byRu: 'Рик Эстли · 1987', img: 'assets/media/images/rickroll.gif' },
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
    'home.tagline': 'Все числа ведут к единице. Но так ли это?',
    'home.rule1': 'Дели на 2, если чётное',
    'home.rule2': 'Умножай на 3 и прибавляй 1, если нечётное',
    'home.rule3': 'Повторяй, пока не дойдешь до 1',

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
    'home.tagline': 'Any number leads to one. Or does it?',
    'home.rule1': 'Divide by 2 if even',
    'home.rule2': 'Multiply by 3 and add 1 if odd',
    'home.rule3': 'Repeat, and you will reach 1',

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
