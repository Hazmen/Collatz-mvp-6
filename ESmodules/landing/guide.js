// ------ GUIDE PAGE ------ \\
// Vanilla port of Astra_Collatz/src/pages/GuidePage.tsx, restyled to MVP6.
// Tabs: Simple / Rules / About. Content is bilingual and re-renders on langchange.
// Initial tab can be forced via ?tab=about|rules|simple.

import { getLang } from '../shared/i18n.js';

const TABS = ['simple', 'rules', 'about'];

function buildStars(count = 70) {
  const bg = document.querySelector('.clz-bg');
  if (!bg) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'clz-star';
    const size = Math.random() * 2 + 1;
    s.style.top = `${Math.random() * 100}%`;
    s.style.left = `${Math.random() * 100}%`;
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
    s.style.setProperty('--delay', `${Math.random() * 4}s`);
    s.style.setProperty('--dur', `${2.5 + Math.random() * 3}s`);
    frag.appendChild(s);
  }
  bg.appendChild(frag);
}

// ---- Content renderers (ru/en) ----
function simpleContent(ru) {
  const formula = `
    <div class="guide-formula">
      f(n) = <span class="op-even">n / 2</span> (${ru ? 'чётное' : 'even'}) &nbsp;|&nbsp;
      <span class="op-odd">3n + 1</span> (${ru ? 'нечётное' : 'odd'})
    </div>`;
  if (ru) {
    return `
      <h2>Что это вообще такое?</h2>
      <p>Возьми любое целое число. Если оно чётное — раздели на 2. Если нечётное — умножь на 3 и
      прибавь 1. Повторяй. Гипотеза Коллатца утверждает, что <b>любое</b> число рано или поздно
      придёт к 1.</p>
      ${formula}
      <p>Звучит просто, но никто в мире так и не смог доказать, что это работает для всех чисел.
      Компьютеры проверили числа до 2<sup>68</sup> и больше — и все они падают к 1. Но
      «проверить много» ≠ «доказать для всех».</p>
      <h2>Почему это так интересно?</h2>
      <p>Задача формулируется одной строкой, её поймёт школьник — но она сопротивляется самым
      сильным математикам уже почти 90 лет. Траектории чисел ведут себя хаотично: маленькое
      число может взлететь до огромных значений, прежде чем рухнуть к 1.</p>
      <blockquote class="guide-quote">
        <p>«Математика ещё не готова к таким задачам.»</p>
        <footer>— Пол Эрдёш</footer>
      </blockquote>
      <p>Именно поэтому Коллатц называют «чёрной дырой для целых чисел»: что бы ты ни бросил внутрь
      — всё в итоге затягивается в цикл 4 → 2 → 1.</p>`;
  }
  return `
    <h2>What is this?</h2>
    <p>Take any whole number. If it is even, divide it by 2. If it is odd, multiply by 3 and add 1.
    Repeat. The Collatz conjecture claims that <b>every</b> number eventually reaches 1.</p>
    ${formula}
    <p>It sounds trivial, yet nobody has ever proved it holds for all numbers. Computers have
    checked numbers past 2<sup>68</sup> — all of them fall to 1. But "checking many" is not
    "proving all".</p>
    <h2>Why is it so fascinating?</h2>
    <p>The problem fits on a single line and a child can understand it — yet it has resisted the
    greatest mathematicians for almost 90 years. Trajectories behave chaotically: a small number
    can rocket to enormous values before collapsing back to 1.</p>
    <blockquote class="guide-quote">
      <p>"Mathematics is not yet ready for such problems."</p>
      <footer>— Paul Erdős</footer>
    </blockquote>
    <p>That is why Collatz is called a "black hole for the integers": whatever you throw in, it all
    gets pulled into the 4 → 2 → 1 loop.</p>`;
}

function rulesContent(ru) {
  const kbds = [
    ['Space', ru ? 'Старт / Пауза' : 'Run / Pause'],
    ['F', ru ? 'Показать всё' : 'Show all'],
    ['R', ru ? 'Сброс' : 'Reset'],
    ['1 / 2 / 3', ru ? 'Режим вывода' : 'Output mode'],
    ['Z / X', ru ? 'Добавить / убрать' : 'Add / remove'],
  ].map(([k, v]) => `<div class="guide-kbd-row"><kbd>${k}</kbd><span>${v}</span></div>`).join('');

  return `
    <h2>${ru ? 'Как работает эта программа' : 'How this app works'}</h2>
    <p>${ru
      ? 'Введи число на главном экране и запусти симуляцию. Collatzium вычислит всю последовательность и покажет её:'
      : 'Enter a number on the home screen and start the simulation. Collatzium computes the full sequence and shows it as a step-by-step list:'}</p>
    <ul>
      <li><b>${ru ? 'Мгновенно' : 'Instant'}</b> — ${ru ? 'всё сразу.' : 'everything at once.'}</li>
      <li><b>${ru ? 'Авто' : 'Auto'}</b> — ${ru ? 'числа появляются по одному; регулируй скорость.' : 'numbers appear one by one; control the speed.'}</li>
      <li><b>${ru ? 'Вручную' : 'Manual'}</b> — ${ru ? 'Z добавляет числа, X убирает.' : 'Z adds numbers, X removes them.'}</li>
    </ul>
    <h2>${ru ? 'Горячие клавиши' : 'Keyboard shortcuts'}</h2>
    <div class="guide-kbds">${kbds}</div>`;
}

function aboutContent(ru) {
  return `
    <h2>${ru ? 'О проекте' : 'About'}</h2>
    <p>${ru
      ? 'Этот проект родился из любопытства к простой задаче, которая прячет невероятную сложность. Хотелось увидеть хаос Коллатца своими глазами.'
      : 'This project grew from curiosity about a simple problem that hides staggering complexity — a wish to see the Collatz chaos with my own eyes.'}</p>
    <h2>${ru ? 'Посмотреть видео' : 'Watch a video'}</h2>
    <a class="guide-link" href="https://www.youtube.com/watch?v=094y1Z2wpJg" target="_blank" rel="noreferrer">
      ${ru ? 'Veritasium — Самая опасная задача' : 'Veritasium — The Hardest Problem'}
    </a>
    <h2>${ru ? 'Ссылки' : 'Links'}</h2>
    <a class="guide-link is-plain" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>`;
}

function renderPanel() {
  const ru = getLang() === 'ru';
  const article = document.getElementById('guide-article');
  if (!article) return;
  const map = { simple: simpleContent, rules: rulesContent, about: aboutContent };
  const fn = map[currentTab] || simpleContent;
  article.innerHTML = `<div class="guide-panel">${fn(ru)}</div>`;
}

let currentTab = 'simple';

function initTabs() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('tab');
  if (TABS.includes(requested)) currentTab = requested;

  const btns = Array.from(document.querySelectorAll('.guide-tab'));
  const paint = () => {
    btns.forEach((b) => b.classList.toggle('is-active', b.dataset.tab === currentTab));
  };
  btns.forEach((b) => {
    b.addEventListener('click', () => {
      currentTab = b.dataset.tab;
      paint();
      renderPanel();
    });
  });
  paint();
}

function init() {
  buildStars();
  initTabs();
  renderPanel();
  window.addEventListener('langchange', renderPanel);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
