// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { ICONS } from './icons.js';
import { gateMoves, gateSeen } from '../core/gate.js';

export const TOKENS = `
  :host {
    --bc-bg: #131417;
    --bc-card: #1C1D22;
    --bc-border: #2A2C33;
    --bc-surface: #23252B;
    --bc-sheet: #1A1B20;
    --bc-border-strong: #33353D;
    --bc-text: #EDEBE6;
    --bc-text-2: #A3A29C;
    --bc-amber: #E8A33D;
    --bc-blue: #6EA8E0;
    --bc-green: #8CC79A;
    --bc-red: #EF8A6F;
    --bc-heat: color-mix(in srgb, var(--bc-amber) 45%, var(--bc-red));
    --bc-violet: #9C8FD0;
    --bc-access: #D98C7A;
    --bc-cover: #BDB39E;
    --bc-music: #E29AB8;
    --bc-radius: 20px;
    --bc-radius-inner: 14px;
    --bc-touch: 44px;
    --bc-font-display: 'Sora', system-ui, sans-serif;
    --bc-font-text: 'IBM Plex Sans', system-ui, sans-serif;
  }
`;

export const BASE_CSS = `
  ${TOKENS}
  :host { display: block; color: var(--bc-text); font-family: var(--bc-font-text); }
  * { box-sizing: border-box; }
  .card {
    background: var(--bc-card);
    border: 1px solid var(--bc-border);
    border-radius: var(--bc-radius);
    padding: 16px;
    height: 100%;
    
    container-type: inline-size;
  }
  .card-title {
    display: flex; align-items: center; justify-content: space-between;
    margin: 0 0 12px; font: 500 13px/1.2 var(--bc-font-display);
    letter-spacing: .06em; text-transform: uppercase; color: var(--bc-text-2);
  }
  .num { font-family: var(--bc-font-display); font-variant-numeric: tabular-nums; }
  .muted { color: var(--bc-text-2); }
  .icon { width: 20px; height: 20px; flex: none; fill: currentColor; }
  ha-icon.icon { display: inline-flex; --mdc-icon-size: 20px; }
  button {
    font: inherit; color: inherit; background: none; border: 0; padding: 0;
    cursor: pointer; text-align: inherit; -webkit-tap-highlight-color: transparent;
  }
  .badge {
    display: inline-flex; align-items: center; gap: 4px; min-height: 24px;
    padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 500;
    background: var(--bc-surface); color: var(--bc-text-2);
  }
  .badge .icon { width: 14px; height: 14px; }
  .badge.amber { color: var(--bc-amber); }
  .badge.blue { color: var(--bc-blue); }
  .badge.green { color: var(--bc-green); }
  .badge.red { color: var(--bc-red); }
  .placeholder { color: var(--bc-text-2); font-size: 14px; }
  .pending { opacity: .55; }
  
  .bslider-row {
    display: flex; align-items: center; gap: 12px; touch-action: pan-y; user-select: none; -webkit-user-select: none;
    outline: none; border-radius: 12px;
  }
  .bslider-row:focus-visible { box-shadow: 0 0 0 2px var(--bc-blue); }
  .bslider-row.disabled { opacity: .45; }
  .bslider {
    position: relative; flex: 1; height: var(--bc-touch); border-radius: 12px; overflow: hidden; cursor: pointer;
    background: var(--bc-card); border: 1px solid var(--bc-border-strong);
  }
  .bslider-row.disabled .bslider { cursor: default; }
  .bslider .fill { position: absolute; inset: 0 auto 0 0; width: var(--p); background: var(--fill, #D6D4CE); }
  .bslider .mark { position: absolute; top: 6px; bottom: 6px; width: 3px; margin-left: -1.5px; border-radius: 2px; background: var(--bc-amber); }
  .bslider-row:not(.dragging) .fill { transition: width .25s ease; }

  
  .pwr { flex: none; width: var(--bc-touch); height: var(--bc-touch); border-radius: 12px; border: 1px solid var(--bc-border-strong); display: flex; align-items: center; justify-content: center; color: var(--bc-text-2); }
  .pwr.on { color: var(--bc-green); border-color: color-mix(in srgb, var(--bc-green) 55%, transparent); background: color-mix(in srgb, var(--bc-green) 14%, transparent); }
  .pwr:disabled { opacity: .4; cursor: default; }
  .pwr:not(:disabled):active { filter: brightness(1.2); }
  
  [data-hold] { position: relative; overflow: hidden; -webkit-touch-callout: none; user-select: none; touch-action: manipulation; }
  [data-hold] > * { position: relative; }
  [data-hold]::before {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 0; pointer-events: none;
    background: color-mix(in srgb, var(--hold-color, var(--bc-amber)) 32%, transparent);
  }
  [data-hold].holding::before { width: 100%; transition: width var(--hold-ms, 1000ms) linear; }
  [data-hold].sending::before { width: 100%; animation: bc-sending .6s ease-in-out infinite alternate; }
  [data-hold].done::before { width: 100%; background: color-mix(in srgb, var(--bc-green) 35%, transparent); }
  [data-hold].failed::before { width: 100%; background: color-mix(in srgb, var(--bc-red) 35%, transparent); }
  @keyframes bc-sending { from { opacity: 1; } to { opacity: .4; } }
  
  @media (min-width: 1001px) and (max-height: 790px) {
    .card { padding: 12px 14px; }
    .card-title { margin-bottom: 8px; }
  }
`;

export function icon(name, cls = 'icon', fallback = null) {
  const path = name && ICONS[name.replace(/^mdi:/, '')];
  if (path) return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
  if (name && /^mdi:[a-z0-9-]+$/.test(name) && customElements.get('ha-icon')) {
    return `<ha-icon class="${cls}" icon="${name}" aria-hidden="true"></ha-icon>`;
  }
  return fallback ? icon(fallback, cls) : '';
}

 
export function powerBadge({ on, glyph = 'mdi:power' }) {
  return `<span class="pwr ${on ? 'on' : ''}" aria-hidden="true">${icon(glyph)}</span>`;
}

export function powerButton({ on, attrs = '', label, glyph = 'mdi:power' }) {
  return `<button class="pwr ${on ? 'on' : ''}" ${attrs} aria-pressed="${Boolean(on)}" aria-label="${label}" title="${label}">${icon(glyph)}</button>`;
}

const TRANSIENT_CLASSES = ['holding', 'sending', 'done', 'failed', 'dragging'];

function morphAttributes(from, to) {
  
  if (from.classList?.contains('dragging')) return;
  
  const dragging = from.tagName === 'INPUT' && from.matches(':active');
  for (const { name } of [...from.attributes]) {
    if (to.hasAttribute(name) || name === 'style') continue;
    
    if (name === 'open' && from.tagName === 'DETAILS') continue;
    const keep = name === 'class' ? TRANSIENT_CLASSES.filter((c) => from.classList.contains(c)) : [];
    if (keep.length) from.setAttribute('class', keep.join(' '));
    else from.removeAttribute(name);
  }
  for (const { name, value } of [...to.attributes]) {
    let next = value;
    if (name === 'class') {
      const keep = TRANSIENT_CLASSES.filter((c) => from.classList.contains(c));
      if (keep.length) next = [value, ...keep].join(' ').trim();
    }
    if (dragging && (name === 'value' || name === 'style')) continue;
    if (from.getAttribute(name) !== next) from.setAttribute(name, next);
    
    if (name === 'value' && from.tagName === 'INPUT' && from.value !== next) from.value = next;
  }
}

function morphChildren(from, to) {
  if (from.nodeType === 1 && from.classList.contains('dragging')) return;
  
  if (from.nodeType === 1 && from.hasAttribute('data-keep')) return;
  const next = [...to.childNodes];
  let current = from.firstChild;
  for (const node of next) {
    if (!current) {
      from.append(node);
      continue;
    }
    const sameElement = current.nodeType === 1 && node.nodeType === 1 && current.nodeName === node.nodeName;
    const sameText = current.nodeType === node.nodeType && (node.nodeType === 3 || node.nodeType === 8);
    if (sameElement) {
      morphAttributes(current, node);
      morphChildren(current, node);
      current = current.nextSibling;
    } else if (sameText) {
      if (current.nodeValue !== node.nodeValue) current.nodeValue = node.nodeValue;
      current = current.nextSibling;
    } else {
      const replaced = current;
      current = current.nextSibling;
      replaced.replaceWith(node);
    }
  }
  while (current) {
    const extra = current;
    current = current.nextSibling;
    extra.remove();
  }
}

export function morph(root, html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  morphChildren(root, template.content);
}

export const HOLD_MS = 1000;

 
export function sliderText(kind, v) {
  if (kind === 'light') return v > 0 ? `Accesa · ${v}%` : 'Spenta';
  if (kind === 'cover') return v <= 0 ? 'Chiusa' : v >= 100 ? 'Aperta' : `${v}%`;
  return `${v}%`;
}

export function bslider({ entity, action, value, label, step = 1, enabled = true, mark = null, fill = null }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const style = [`--p:${v}%`, fill && `--fill:${fill}`].filter(Boolean).join(';');
  const attrs = enabled
    ? `role="slider" tabindex="0" data-slider="${entity}" data-slider-action="${action}" data-step="${step}"`
    : 'role="slider" aria-disabled="true"';
  return `<div class="bslider-row ${enabled ? '' : 'disabled'}" ${attrs} aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" aria-valuetext="${v}%" style="${style}">
    <div class="bslider">
      <span class="fill"></span>
      ${mark !== null && mark !== undefined ? `<span class="mark" style="left:${mark}%"></span>` : ''}
    </div>
  </div>`;
}

const SHEETS = new Map();
function sheetFor(cls) {
  if (!SHEETS.has(cls)) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(BASE_CSS + cls.styles);
    SHEETS.set(cls, sheet);
  }
  return SHEETS.get(cls);
}

export class BcElement extends HTMLElement {
  static styles = '';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sheetFor(this.constructor)];
    this.shadowRoot.addEventListener('click', (ev) => {
      
      if (this._afterHold) {
        this._afterHold = false;
        return;
      }
      
      const open = ev.target.closest('[data-open]');
      if (open) return this.ctx.router.open(open.dataset.open, 'replace' in open.dataset);
      
      
      const appl = ev.target.closest('[data-appliance]');
      if (appl && !appl.disabled) return this.#pending(appl, this.ctx.services.appliance(appl.dataset.appliance, appl.dataset.action));
      const command = ev.target.closest('[data-toggle], [data-select], [data-press], [data-vacuum], [data-fan], [data-climate-fan]');
      if (command && !command.disabled) return this.#command(command);
      
      const cover = ev.target.closest('[data-cover-toggle]');
      if (cover && !cover.disabled) return this.#toggleCover(cover.dataset.coverToggle);
      
      const lock = ev.target.closest('[data-lock]');
      if (lock && !lock.disabled) this.ctx.services.lockDoor(lock.dataset.lock).catch(() => {});
    });
    this.#setupHold();
    this.#setupSliders();
    this.#setupMouseScroll();
  }

  set ctx(ctx) {
    this._ctx = ctx;
    this.#rewatch();
    this.update();
  }

  get ctx() {
    return this._ctx;
  }

  get store() {
    return this._ctx.store;
  }

  get model() {
    return this._ctx.model;
  }

  watchedIds() {
    return [];
  }

  connectedCallback() {
    if (this._ctx) this.#rewatch();
  }

  disconnectedCallback() {
    this._unwatch?.();
    this._unwatch = null;
  }

  
  #pending(el, run) {
    el.classList.add('pending');
    const clear = () => el.classList.remove('pending');
    setTimeout(clear, 5000);
    run.then(clear, clear);
  }

  #command(el) {
    const { toggle, select, option, press, vacuum, action, fan, climateFan } = el.dataset;
    const services = this.ctx.services;
    el.classList.add('pending');
    const clear = () => el.classList.remove('pending');
    setTimeout(clear, 5000);
    const run = toggle
      ? services.toggle(toggle)
      : select
        ? services.selectOption(select, option)
        : vacuum
          ? services.vacuum(vacuum, action)
          : fan
            ? services.setFanSpeed(fan, option)
            : climateFan
              ? services.setFanMode(climateFan, option)
              : services.press(press);
    
    
    const sent = el.dataset.sent;
    run.then(
      press
        ? clear
        : sent
          ? () => {
              clear();
              this._sent = { ...this._sent, [sent]: true };
              this.update();
              setTimeout(() => {
                delete this._sent?.[sent];
                this.update();
              }, 4000);
            }
          : undefined,
      clear,
    );
  }

  
  #setupSliders() {
    const root = this.shadowRoot;
    const show = (el, v) => {
      el.style.setProperty('--p', `${v}%`);
      el.setAttribute('aria-valuenow', v);
      el.setAttribute('aria-valuetext', `${v}%`);
      
      const scope = el.closest('[data-slider-scope]');
      const label = scope?.querySelector('[data-slider-value]');
      if (label) label.textContent = sliderText(label.dataset.sliderValue, v);
    };
    
    const valueAt = (el, x) => {
      const r = (el.querySelector('.bslider') ?? el).getBoundingClientRect();
      const step = Number(el.dataset.step) || 1;
      const raw = ((x - r.left) / r.width) * 100;
      return Math.max(0, Math.min(100, Math.round(raw / step) * step));
    };
    const commit = (el, v) => {
      el.classList.remove('dragging');
      el.closest('[data-slider-scope]')?.classList.remove('dragging');
      this.onSliderCommit?.(el.dataset.slider, el.dataset.sliderAction, v);
      
      if (!['cover-position', 'light-brightness'].includes(el.dataset.sliderAction)) return;
      const services = this.ctx.services;
      const id = el.dataset.slider;
      const run =
        el.dataset.sliderAction === 'cover-position'
          ? services.setCoverPosition(id, v)
          : v > 0
            ? services.turnOn(id, { brightness_pct: v })
            : services.turnOff(id);
      run.catch(() => this.update());
    };
    
    const setDragging = (el, on) => {
      el.classList.toggle('dragging', on);
      el.closest('[data-slider-scope]')?.classList.toggle('dragging', on);
    };
    let active = null;
    root.addEventListener('pointerdown', (ev) => {
      const el = ev.target.closest('[data-slider]');
      if (!el || ev.button > 0 || !ev.target.closest('.bslider')) return;
      active = { el, id: ev.pointerId, v: valueAt(el, ev.clientX) };
      setDragging(el, true);
      try {
        el.setPointerCapture(ev.pointerId);
      } catch {
        
      }
      show(el, active.v);
    });
    root.addEventListener('pointermove', (ev) => {
      if (!active || ev.pointerId !== active.id) return;
      active.v = valueAt(active.el, ev.clientX);
      show(active.el, active.v);
    });
    root.addEventListener('pointerup', (ev) => {
      if (!active || ev.pointerId !== active.id) return;
      const { el, v } = active;
      active = null;
      commit(el, v);
    });
    root.addEventListener('pointercancel', () => {
      if (!active) return;
      setDragging(active.el, false);
      active = null;
      this.update();
    });
    const timers = new WeakMap();
    root.addEventListener('keydown', (ev) => {
      const el = ev.target.closest?.('[data-slider]');
      if (!el) return;
      const step = Number(el.dataset.step) || 1;
      const cur = Number(el.getAttribute('aria-valuenow'));
      const next = { ArrowRight: cur + step, ArrowUp: cur + step, ArrowLeft: cur - step, ArrowDown: cur - step, Home: 0, End: 100 }[ev.key];
      if (next === undefined) return;
      ev.preventDefault();
      const v = Math.max(0, Math.min(100, next));
      setDragging(el, true);
      show(el, v);
      clearTimeout(timers.get(el));
      timers.set(el, setTimeout(() => commit(el, v), 500));
    });
  }

  #toggleCover(id) {
    const st = this.store.get(id);
    if (!st) return;
    const pos = st.attributes.current_position;
    const moving = ['opening', 'closing'].includes(st.state);
    const action = moving ? 'stop' : (pos ?? (st.state === 'closed' ? 0 : 100)) > 0 ? 'close' : 'open';
    this.ctx.services.cover(id, action).catch(() => {});
  }

   
  #setupMouseScroll() {
    const root = this.shadowRoot;
    const DRAG_PX = 5;
    root.addEventListener('wheel', (ev) => {
      const row = ev.target.closest?.('[data-hscroll]');
      if (!row || Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;
      const max = row.scrollWidth - row.clientWidth;
      
      if (max <= 0 || (ev.deltaY < 0 && row.scrollLeft <= 0) || (ev.deltaY > 0 && row.scrollLeft >= max - 1)) return;
      row.scrollLeft += ev.deltaY;
      ev.preventDefault();
    }, { passive: false });
    let drag = null;
    let dragged = false;
    root.addEventListener('pointerdown', (ev) => {
      const row = ev.target.closest?.('[data-hscroll]');
      if (!row || ev.pointerType !== 'mouse' || ev.button > 0 || row.scrollWidth <= row.clientWidth) return;
      dragged = false;
      drag = { row, x: ev.clientX, left: row.scrollLeft };
    });
    root.addEventListener('pointermove', (ev) => {
      if (!drag) return;
      const dx = ev.clientX - drag.x;
      if (!dragged && Math.abs(dx) < DRAG_PX) return;
      if (!dragged) {
        dragged = true;
        drag.row.setPointerCapture?.(ev.pointerId);
        drag.row.classList.add('dragging');
      }
      drag.row.scrollLeft = drag.left - dx;
    });
    const end = () => {
      drag?.row.classList.remove('dragging');
      drag = null;
      
      setTimeout(() => (dragged = false), 0);
    };
    root.addEventListener('pointerup', end);
    root.addEventListener('pointercancel', end);
    
    root.addEventListener('click', (ev) => {
      if (!dragged) return;
      dragged = false;
      ev.stopImmediatePropagation();
      ev.preventDefault();
    }, true);
  }

  #setupHold() {
    const root = this.shadowRoot;
    let timer = null;
    let target = null;
    let startX = 0;
    let startY = 0;
    const EDGE_PX = 32;
    const MOVE_PX = 10;
    const cancel = () => {
      clearTimeout(timer);
      target?.classList.remove('holding');
      target = null;
    };
    root.addEventListener('pointerdown', (ev) => {
      this._afterHold = false;
      const el = ev.target.closest('[data-hold]');
      if (!el || el.disabled || ev.button > 0) return;
      cancel();
      
      
      if (ev.pointerType === 'touch' && ev.clientY > window.innerHeight - EDGE_PX) return;
      startX = ev.clientX;
      startY = ev.clientY;
      target = el;
      el.style.setProperty('--hold-ms', `${HOLD_MS}ms`);
      el.classList.add('holding');
      timer = setTimeout(() => {
        const el = target;
        cancel();
        this._afterHold = true;
        el.classList.add('sending');
        const finish = (cls) => {
          el.classList.remove('sending');
          el.classList.add(cls);
          setTimeout(() => el.classList.remove(cls), 1500);
        };
        
        const services = this.ctx.services;
        
        
        const id = el.dataset.hold;
        const gate = el.dataset.holdGate;
        
        let run;
        if ('holdEvent' in el.dataset) {
          el.dispatchEvent(new CustomEvent('bc-hold', { bubbles: true, composed: true, detail: { id, event: el.dataset.holdEvent } }));
          run = Promise.resolve();
        } else {
          run = 'holdAppliance' in el.dataset
            ? services.appliance(id, el.dataset.holdAppliance, { held: true })
            : 'holdCall' in el.dataset ? services.longPress(id) : services.hold(id);
        }
        if (gate) gateMoves.start(id, gateSeen(this.ctx.store, gate));
        run.then(() => finish('done'), () => {
          if (gate) gateMoves.clear(id);
          finish('failed');
        });
      }, HOLD_MS);
    });
    for (const type of ['pointerup', 'pointerleave', 'pointercancel']) {
      root.addEventListener(type, (ev) => {
        if (target && (type !== 'pointerleave' || ev.target === target)) cancel();
      }, true);
    }
    
    root.addEventListener('pointermove', (ev) => {
      if (target && Math.hypot(ev.clientX - startX, ev.clientY - startY) > MOVE_PX) cancel();
    }, true);
    
    root.addEventListener('contextmenu', (ev) => {
      if (ev.target.closest('[data-hold]')) ev.preventDefault();
    });
  }

  #rewatch() {
    this._unwatch?.();
    this._unwatch = this.isConnected ? this.store.watch(this.watchedIds(), () => this.update()) : null;
  }

  update() {
    if (!this._ctx) return;
    morph(this.shadowRoot, this.render());
  }

  render() {
    return '';
  }
}
