// ------ SHARED PREFILL ------ \\
// Reads the number chosen on the landing page (sessionStorage 'collatz-start')
// and drops it into the simulator's #number-input, then clears the key.
// This ONLY touches the input value + fires a normal 'input' event so the
// existing simulator wiring reacts exactly as if the user typed it.
// It does NOT auto-run and does NOT alter simulator logic.

const KEY = 'collatz-start';

function prefill() {
  let value = null;
  try {
    value = sessionStorage.getItem(KEY);
    if (value) sessionStorage.removeItem(KEY);
  } catch { /* ignore */ }

  if (!value || !/^\d+$/.test(value)) return;

  const input = document.getElementById('number-input');
  if (!input) return;

  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', prefill);
} else {
  prefill();
}
