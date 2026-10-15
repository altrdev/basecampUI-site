// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { BcElement, icon } from './base.js';

const LETTERS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const SYMBOLS = ['1234567890', '-/:;()€&@"', '.,?!\'#+='];

const ACCENTS = { a: 'àáâä', e: 'èéêë', i: 'ìíîï', o: 'òóôö', u: 'ùúûü', c: 'ç', n: 'ñ' };
const LONG_PRESS_MS = 380;

class BcKeyboard extends BcElement {
  static styles = `
    :host { display: none; position: fixed; right: 0; bottom: 0; z-index: 20; width: min(var(--bc-kbd-w, 580px), 100vw); }
    :host([open]) { display: block; }
    .kbd {
      display: flex; flex-direction: column; gap: 8px; padding: 10px 10px 14px; user-select: none; -webkit-user-select: none;
      background: var(--bc-card); border-top: 1px solid var(--bc-border-strong); box-shadow: 0 -12px 32px rgb(0 0 0 / .4);
      touch-action: manipulation;
    }
    .row { display: flex; justify-content: center; gap: 6px; }
    .key {
      position: relative; flex: 1 1 0; min-width: 0; height: 52px; display: grid; place-items: center; border-radius: 12px;
      background: var(--bc-surface); border: 1px solid var(--bc-border); font: 500 20px/1 var(--bc-font-text);
    }
    .key:active, .key.on { background: var(--bc-border-strong); }
    .key.fn { flex: 1.5 1 0; font-size: 15px; color: var(--bc-text-2); }
    .key.on { color: var(--bc-text); }
    .key.space { flex: 5 1 0; }
    .key.go { flex: 2 1 0; background: var(--bc-text); color: var(--bc-bg); border-color: transparent; font-size: 15px; font-weight: 600; }
    .key.go:active { opacity: .8; }
    .key .icon { width: 22px; height: 22px; }
    .alts {
      position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); z-index: 1; display: flex; gap: 4px; padding: 6px;
      border-radius: 14px; background: var(--bc-sheet); border: 1px solid var(--bc-border-strong); box-shadow: 0 8px 24px rgb(0 0 0 / .5);
    }
    .alts .key { flex: none; width: 48px; height: 52px; }
  `;

  constructor() {
    super();
    this.mode = 'letters';
    this.shift = false;
    this.target = null;
    this.alts = null;
    this.shadowRoot.addEventListener('mousedown', (ev) => ev.preventDefault());
    this.shadowRoot.addEventListener('pointerdown', (ev) => this.#down(ev));
    this.shadowRoot.addEventListener('pointerup', (ev) => this.#up(ev));
    this.shadowRoot.addEventListener('pointercancel', () => this.#cancelPress());
    this.shadowRoot.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }

   
  attach(host) {
    this.host = host;
    const root = host.shadowRoot;
    root.addEventListener('focusin', (ev) => {
      const el = ev.composedPath()[0];
      if (el?.matches?.('input[data-keyboard]')) this.#show(el);
    });
    root.addEventListener('focusout', (ev) => {
      if (ev.composedPath()[0] === this.target) this.#hideSoon();
    });
    
    new MutationObserver(() => {
      if (this.target && !this.target.isConnected) this.#hide();
    }).observe(root, { childList: true, subtree: true });
    this.update = () => {};
    this.#draw();
  }

  #show(el) {
    clearTimeout(this._hideTimer);
    this.target = el;
    this.mode = 'letters';
    this.shift = false;
    this.#draw();
    this.setAttribute('open', '');
    this.host.style.setProperty('--bc-kbd-h', `${this.offsetHeight}px`);
    el.scrollIntoView({ block: 'nearest' });
  }

  
  #hideSoon() {
    clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => {
      if (this.target && this.target.getRootNode().activeElement !== this.target) this.#hide();
    }, 150);
  }

  #hide() {
    this.target = null;
    this.alts = null;
    this.removeAttribute('open');
    this.host?.style.removeProperty('--bc-kbd-h');
  }

  #insert(text) {
    const el = this.target;
    if (!el?.isConnected) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    el.setRangeText(text, start, end, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  #backspace() {
    const el = this.target;
    if (!el?.isConnected) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    if (start === end) {
      if (!start) return;
      el.setRangeText('', start - 1, start, 'end');
    } else el.setRangeText('', start, end, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  #press(key) {
    if (key === 'shift') this.shift = !this.shift;
    else if (key === 'mode') {
      this.mode = this.mode === 'letters' ? 'symbols' : 'letters';
      this.shift = false;
    } else if (key === 'back') this.#backspace();
    else if (key === 'space') this.#insert(' ');
    else if (key === 'go') {
      this.target?.blur();
      return this.#hide();
    } else {
      this.#insert(this.shift && this.mode === 'letters' ? key.toUpperCase() : key);
      this.shift = false;
    }
    this.#draw();
  }

  #down(ev) {
    ev.preventDefault();
    const btn = ev.target.closest('[data-k]');
    this._pressed = btn ?? null;
    this._long = false;
    this._startX = ev.clientX;
    this._startY = ev.clientY;
    
    const alts = btn && !btn.dataset.alt && ACCENTS[btn.dataset.k];
    if (alts) {
      this._timer = setTimeout(() => {
        this._long = true;
        const up = this.shift;
        this.alts = [...alts].map((c) => (up ? c.toUpperCase() : c));
        this.altsFor = btn.dataset.k;
        this.#draw();
      }, LONG_PRESS_MS);
    }
  }

  #up(ev) {
    ev.preventDefault();
    this.#cancelPress();
    const alt = ev.target.closest('[data-alt]');
    if (alt) {
      this.#insert(alt.dataset.k);
      this.alts = null;
      this.shift = false;
      return this.#draw();
    }
    const btn = ev.target.closest('[data-k]');
    
    if (this._long) return;
    if (this.alts) {
      this.alts = null;
      this.#draw();
    }
    if (btn && btn === this._pressed) this.#press(btn.dataset.k);
  }

  #cancelPress() {
    clearTimeout(this._timer);
  }

  #draw() {
    const rows = (this.mode === 'letters' ? LETTERS : SYMBOLS).map((r) => [...r]);
    const label = (k) => (this.shift && this.mode === 'letters' ? k.toUpperCase() : k);
    const keyHtml = (k) => {
      const popup = this.alts && this.altsFor === k
        ? `<span class="alts">${this.alts.map((c) => `<span class="key" role="button" data-k="${c}" data-alt="1">${c}</span>`).join('')}</span>`
        : '';
      return `<button class="key" data-k="${k}">${label(k)}${popup}</button>`;
    };
    const [r1, r2, r3] = rows;
    const shiftKey = this.mode === 'letters'
      ? `<button class="key fn ${this.shift ? 'on' : ''}" data-k="shift" aria-label="Maiuscole" aria-pressed="${this.shift}">${icon('mdi:arrow-up-bold-outline')}</button>`
      : '<span class="key fn" style="visibility:hidden"></span>';
    this.shadowRoot.innerHTML = `
      <div class="kbd" role="group" aria-label="Tastiera">
        <div class="row">${r1.map(keyHtml).join('')}</div>
        <div class="row">${r2.map(keyHtml).join('')}</div>
        <div class="row">${shiftKey}${r3.map(keyHtml).join('')}<button class="key fn" data-k="back" aria-label="Cancella">${icon('mdi:backspace-outline')}</button></div>
        <div class="row">
          <button class="key fn" data-k="mode">${this.mode === 'letters' ? '123' : 'ABC'}</button>
          <button class="key" data-k=",">,</button>
          <button class="key space" data-k="space" aria-label="Spazio"></button>
          <button class="key" data-k=".">.</button>
          <button class="key go" data-k="go">Cerca</button>
        </div>
      </div>`;
  }
}

customElements.define('bc-keyboard', BcKeyboard);
