// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { BcElement, icon } from './base.js';
import { esc, fmtNumber, fmtTime, fmtWhen, isUnavailable } from '../core/format.js';
import { fmtSpan, gateMoves, gateSeen } from '../core/gate.js';

const ARM_MODES = [
  ['home', 'Casa', 'mdi:home-outline'],
  ['night', 'Notte', 'mdi:weather-night'],
  ['away', 'Fuori', 'mdi:lock-outline'],
];

let lastArm = null;

const ALARM_STATES = {
  
  disarmed: ['Disinserito', 'var(--bc-text-2)', 'mdi:shield-off-outline'],
  armed_home: ['Inserito · Casa', 'var(--bc-green)', 'mdi:shield-check-outline'],
  armed_night: ['Inserito · Notte', 'var(--bc-green)', 'mdi:shield-check-outline'],
  armed_away: ['Inserito · Fuori', 'var(--bc-green)', 'mdi:shield-check-outline'],
  arming: ['Inserimento…', 'var(--bc-amber)', 'mdi:shield-sync-outline'],
  pending: ['Ingresso rilevato', 'var(--bc-red)', 'mdi:shield-alert-outline'],
  triggered: ['ALLARME', 'var(--bc-red)', 'mdi:shield-alert-outline'],
  disarming: ['Disinserimento…', 'var(--bc-amber)', 'mdi:shield-sync-outline'],
};

class BcAlarm extends BcElement {
  static styles = `
    .card { display: flex; flex-direction: column; gap: 14px; }
    .card-title { margin: 0; }
    
    .head-link {
      display: flex; align-items: center; gap: 8px; min-height: var(--bc-touch); margin: -10px -6px -6px; padding: 0 6px;
      border-radius: var(--bc-radius-inner); text-align: left;
    }
    .head-link:active { background: var(--bc-surface); }
    .head-link .card-title { flex: 1; }
    .head-link .more { width: 18px; height: 18px; color: var(--bc-text-2); }
    
    .status { display: flex; align-items: center; justify-content: center; gap: 12px; color: var(--st); padding: 4px 0; }
    .status .big { width: 34px; height: 34px; flex: none; }
    .status .txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .status .label { font: 600 clamp(16px, 7cqi, 19px)/1.15 var(--bc-font-display); }
    .status .hint { font-size: 13px; color: var(--bc-text-2); }
    .modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .modes.single { grid-template-columns: 1fr; }
    .mode {
      display: flex; align-items: center; justify-content: center; min-height: 52px;
      border-radius: var(--bc-radius-inner); border: 1px solid var(--bc-border-strong); background: var(--bc-surface);
      font-size: 15px; font-weight: 600; text-align: center;
    }
    .mode { gap: 6px; }
    .mode .icon { width: 18px; height: 18px; color: var(--bc-text-2); }
    .mode:not(:disabled):active { background: var(--bc-border); }
    .mode:disabled { cursor: default; opacity: .5; }
    
    @media (min-width: 1001px) and (max-height: 790px) {
      .card { gap: 10px; }
      .status { padding: 0; }
      .status .hint { font-size: 12px; }
      .mode { min-height: 46px; }
    }
    .exit-bar { height: 4px; border-radius: 2px; background: var(--bc-surface); overflow: hidden; margin-top: -4px; }
    .exit-bar span { display: block; height: 100%; background: var(--bar, var(--bc-amber)); transition: width 1s linear; }
    .mode.disarm { background: var(--bc-surface); border-color: var(--bc-border-strong); color: var(--bc-text); }
    .keypad-overlay { position: fixed; inset: 0; z-index: 30; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .keypad-overlay .backdrop { position: absolute; inset: 0; background: rgb(8 8 10 / .72); }
    .keypad {
      position: relative; width: min(360px, 100%); background: var(--bc-sheet); border: 1px solid var(--bc-border);
      border-radius: 24px; box-shadow: 0 24px 64px rgb(0 0 0 / .5); padding: 24px; display: flex; flex-direction: column; gap: 16px;
    }
    .keypad h2 { margin: 0; text-align: center; font: 600 22px/1.2 var(--bc-font-display); }
    .dots { display: flex; justify-content: center; gap: 12px; min-height: 16px; }
    .dots span { width: 14px; height: 14px; border-radius: 50%; background: var(--bc-text); }
    .dots .empty { background: none; border: 2px solid var(--bc-border-strong); }
    .kp-error { text-align: center; min-height: 18px; font-size: 14px; font-weight: 500; color: var(--bc-red); }
    .keys { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .keys button {
      height: 64px; border-radius: 16px; background: var(--bc-surface); text-align: center;
      font: 500 24px/1 var(--bc-font-display); font-variant-numeric: tabular-nums;
    }
    .keys button:active { background: var(--bc-border); }
    .keys button.small { font: 500 15px/1 var(--bc-font-text); color: var(--bc-text-2); }
    .keys button.ok { background: var(--bc-green); color: var(--bc-bg); font: 600 16px/1 var(--bc-font-text); }
    .keys button.ok:disabled { opacity: .4; }
    .keypad.shake { animation: bc-shake .35s; }
    @keyframes bc-shake { 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }
  `;

  constructor() {
    super();
    this._code = '';
    this.shadowRoot.addEventListener('click', (ev) => {
      const mode = ev.target.closest('[data-alarm]');
      if (mode && !mode.disabled) return this.#onMode(mode.dataset.alarm);
      if (!this._keypad) return;
      const key = ev.target.closest('[data-key]');
      if (key) return this.#onKey(key.dataset.key);
      if (ev.target.closest('.backdrop')) this.#closeKeypad();
    });
    
    this._onKeydown = (ev) => {
      if (this._keypad && ev.key === 'Escape') {
        ev.preventDefault();
        this.#closeKeypad();
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this._onKeydown);
    clearInterval(this._tick);
    this._tick = null;
    this.#closeKeypad();
  }

  
  #syncTicker(active) {
    if (active && !this._tick) this._tick = setInterval(() => this.update(), 1000);
    if (!active && this._tick) {
      clearInterval(this._tick);
      this._tick = null;
    }
  }

  watchedIds() {
    return this.model.alarm ? [this.model.alarm] : [];
  }

  get state() {
    return this.store.get(this.model.alarm)?.state;
  }

  #onMode(target) {
    const id = this.model.alarm;
    if (target === 'disarm') {
      if (this.state && this.state !== 'disarmed') {
        this._keypad = true;
        this._code = '';
        this._error = '';
        this.update();
      }
      return;
    }
    
    if (this.state !== 'disarmed') return;
    lastArm = { mode: target, at: Date.now() };
    this.ctx.services.armAlarm(id, target).catch(() => {});
  }

  #onKey(key) {
    if (this._busy) return;
    if (key === 'back') this._code = this._code.slice(0, -1);
    else if (key === 'cancel') return this.#closeKeypad();
    else if (key === 'ok') return this.#submit();
    else if (this._code.length < 12) this._code += key;
    this._error = '';
    this.update();
  }

  async #submit() {
    if (!this._code) return;
    const code = this._code;
    this._code = '';
    this._busy = true;
    this.update();
    try {
      await this.ctx.services.disarmAlarm(this.model.alarm, code);
      this.#closeKeypad();
    } catch {
      this._error = 'Codice errato o allarme non raggiungibile';
      this._busy = false;
      this.update();
      this.shadowRoot.querySelector('.keypad')?.classList.add('shake');
      setTimeout(() => this.shadowRoot.querySelector('.keypad')?.classList.remove('shake'), 400);
    }
  }

  #closeKeypad() {
    this._keypad = false;
    this._code = '';
    this._error = '';
    this._busy = false;
    if (this._ctx) this.update();
  }

  renderKeypad() {
    const len = Math.max(this._code.length, 4);
    const dots = Array.from({ length: len }, (_, i) => `<span class="${i < this._code.length ? '' : 'empty'}"></span>`).join('');
    const digit = (d) => `<button data-key="${d}" aria-label="${d}">${d}</button>`;
    return `
      <div class="keypad-overlay">
        <div class="backdrop"></div>
        <div class="keypad" role="dialog" aria-modal="true" aria-label="Disinserisci allarme">
          <h2>Disinserisci allarme</h2>
          <div class="dots" aria-label="${this._code.length} cifre inserite">${dots}</div>
          <div class="kp-error" role="alert">${esc(this._error ?? '')}</div>
          <div class="keys">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit).join('')}
            <button class="small" data-key="cancel">Annulla</button>
            ${digit(0)}
            <button class="small" data-key="back" aria-label="Cancella cifra">${icon('mdi:backspace-outline')}</button>
          </div>
          <div class="keys" style="grid-template-columns:1fr">
            <button class="ok" data-key="ok" ${this._code && !this._busy ? '' : 'disabled'}>${this._busy ? 'Verifica…' : 'Disinserisci'}</button>
          </div>
        </div>
      </div>`;
  }

  render() {
    const state = this.state;
    const alarmState = this.store.get(this.model.alarm);
    
    if (this._keypad && state === 'disarmed') {
      this._keypad = false;
      this._code = '';
    }
    const available = !isUnavailable(alarmState);
    const can = this.model.alarm && this.ctx.services.canControl(this.model.alarm) && available;
    const [label, color, ic] = available ? ALARM_STATES[state] ?? [state, 'var(--bc-text-2)', 'mdi:shield-outline'] : ['Non disponibile', 'var(--bc-text-2)', 'mdi:shield-off-outline'];
    let hint = '';
    let exitBar = '';
    const exitTotal = this.ctx.config.alarm?.exit_delay_s;
    const entryTotal = this.ctx.config.alarm?.entry_delay_s;
    
    const secondsLeft = (total) => Math.max(0, Math.ceil(total - (Date.now() - new Date(alarmState.last_changed).getTime()) / 1000));
    const bar = (left, total, color) => `<div class="exit-bar" style="--bar:${color}"><span style="width:${(left / total) * 100}%"></span></div>`;
    if (state === 'disarmed') hint = 'Nessuna zona sorvegliata';
    else if (state?.startsWith('armed_')) hint = `Inserito alle ${fmtTime(new Date(alarmState.last_changed))}`;
    else if (state === 'pending') {
      hint = 'Disinserisci subito';
      if (entryTotal) {
        const left = secondsLeft(entryTotal);
        hint = left > 0 ? `Disinserisci entro ${left} s` : 'Allarme imminente';
        exitBar = bar(left, entryTotal, 'var(--bc-red)');
      }
    }
    else if (state === 'triggered') hint = 'Allarme in corso: disinserisci';
    else if (state === 'arming') {
      
      const away = lastArm?.mode === 'away' && Math.abs(new Date(alarmState.last_changed).getTime() - lastArm.at) < 15_000;
      hint = away ? 'Tempo di uscita in corso' : 'Inserimento in corso';
      if (exitTotal) {
        const left = secondsLeft(exitTotal);
        hint = left > 0 ? (away ? `Esci entro ${left} s` : `Inserimento tra ${left} s`) : 'Inserimento imminente';
        exitBar = bar(left, exitTotal, 'var(--bc-amber)');
      }
    }
    this.#syncTicker((state === 'arming' && !!exitTotal) || (state === 'pending' && !!entryTotal));

    const buttons = !available
      ? ''
      : state === 'disarmed'
        ? `<div class="modes">${ARM_MODES.map(([mode, text, ic]) => `<button class="mode" ${can ? `data-alarm="${mode}"` : 'disabled'}>${icon(ic)}${text}</button>`).join('')}</div>`
        : `<div class="modes single"><button class="mode disarm" ${can ? 'data-alarm="disarm"' : 'disabled'}>Disinserisci</button></div>`;

    return `
      <section class="card">
        <button class="head-link" data-open="#sicurezza" aria-label="Apri Sicurezza">
          <h2 class="card-title">Sicurezza</h2>
          ${icon('mdi:chevron-right', 'icon more')}
        </button>
        <div class="status" style="--st:${color}">
          ${icon(ic, 'icon big')}
          <div class="txt"><span class="label">${esc(label)}</span>${hint ? `<span class="hint num">${esc(hint)}</span>` : ''}</div>
        </div>
        ${exitBar}
        ${buttons}
      </section>
      ${this._keypad ? this.renderKeypad() : ''}`;
  }
}

const BATTERY_ICONS = [
  'mdi:battery-10', 'mdi:battery-20', 'mdi:battery-30', 'mdi:battery-40', 'mdi:battery-50',
  'mdi:battery-60', 'mdi:battery-70', 'mdi:battery-80', 'mdi:battery-90', 'mdi:battery',
];
export function batteryIcon(level) {
  if (!Number.isFinite(level)) return 'mdi:battery-unknown';
  if (level <= 5) return 'mdi:battery-alert-variant-outline';
  return BATTERY_ICONS[Math.min(9, Math.max(0, Math.round(level / 10) - 1))];
}
const batteryTone = (level) => (!Number.isFinite(level) ? '' : level <= 20 ? 'low' : level <= 40 ? 'mid' : '');

const CONFIRM_MS = 6000;

class BcAccess extends BcElement {
  static styles = `
    .card { display: flex; flex-direction: column; gap: 12px; }
    .head { display: flex; justify-content: space-between; align-items: center; }
    .head .card-title { margin: 0; }
    .head .sum { font-size: 13px; color: var(--bc-text-2); }
    .locks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    
    @container (max-width: 250px) {
      .lock { min-height: 64px; padding: 8px 10px; }
      .lock .who { font-size: 13px; gap: 6px; }
      .lock .who .icon { width: 18px; height: 18px; }
      .lock .bottom { font-size: 11px; }
      .lock .batt .icon { display: none; }
    }
    .lock {
      min-height: 76px; border-radius: 14px; border: 1px solid #2F3138; background: var(--bc-surface); padding: 10px 12px;
      display: flex; flex-direction: column; justify-content: space-between; align-items: stretch; text-align: left; gap: 6px;
      --hold-color: var(--bc-access);
    }
    .lock.unlocked { background: color-mix(in srgb, var(--bc-access) 14%, transparent); border-color: color-mix(in srgb, var(--bc-access) 55%, transparent); }
    .lock:disabled { cursor: default; opacity: .6; }
    
    .lock.gate-tile .who .icon { color: var(--bc-access); }
    .gate-overlay { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; padding: 16px; }
    .gate-backdrop { position: absolute; inset: 0; background: rgb(8 8 10 / .62); }
    .gate-dialog {
      position: relative; width: min(360px, 100%); display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 20px 20px;
      border-radius: 24px; background: var(--bc-sheet); border: 1px solid var(--bc-border-strong); box-shadow: 0 24px 64px rgb(0 0 0 / .5); text-align: center;
    }
    .gate-dialog .gate-ico { width: 36px; height: 36px; color: var(--bc-access); }
    .lock.gate-tile .bottom.gate-seen { flex-direction: column; align-items: flex-start; gap: 1px; }
    .lock.gate-tile .gate-seen .st { color: var(--bc-text); font-weight: 500; }
    .lock.gate-tile.unlocked .gate-seen .st { color: var(--bc-access); }
    
    .lock.gate-tile.closed .who .icon, .lock.gate-tile.closed .gate-seen .st { color: var(--bc-green); }
    
    .lock.gate-tile.moving .gate-seen .st { color: var(--bc-access); }
    .lock.gate-tile .gate-seen .last { font-size: 12px; }
    .lock.gate-tile .star { margin-left: 3px; color: var(--bc-amber); font-weight: 700; }
    .gate-dialog .gate-note { margin: -4px 0 8px; font-size: 13px; }
    .gate-dialog h3 { margin: 0; font: 600 22px/1.2 var(--bc-font-display); }
    .gate-dialog p { margin: 0 0 8px; font-size: 15px; color: var(--bc-text-2); }
    .gate-btns { display: flex; gap: 10px; width: 100%; }
    .gate-btns button { flex: 1; min-height: 56px; border-radius: 14px; font-size: 16px; font-weight: 600; text-align: center; }
    .gate-cancel { background: var(--bc-surface); border: 1px solid var(--bc-border-strong); }
    .gate-go { background: var(--bc-access); color: var(--bc-bg); }

    .lock.gate-tile .bottom { color: var(--bc-text-2); }
    .lock .top { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
    .lock .who { display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 15px; font-weight: 600; }
    .lock .who .icon { color: var(--st); }
    .lock .who span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .lock .batt { display: flex; align-items: center; gap: 2px; font-size: 12px; font-weight: 500; color: var(--bc-text-2); }
    .lock .batt.low { color: var(--bc-red); }
    .lock .batt.mid { color: var(--bc-amber); }
    .lock .batt .icon { width: 14px; height: 14px; }
    .lock .bottom { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--st); }
    .lock .top .hint-hold { width: 14px; height: 14px; color: var(--bc-text-2); flex: none; }
    .lock .bottom > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .rows { display: flex; flex-direction: column; gap: 8px; }
    
    .shutter {
      background: var(--bc-surface); border-radius: 14px; padding: 8px 8px 8px 14px;
      display: flex; align-items: center; gap: 10px;
    }
    .shutter > .icon { color: var(--bc-text-2); }
    .shutter.open > .icon, .shutter.open .info { color: var(--bc-access); }
    .shutter .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .shutter .n { font-size: 15px; font-weight: 600; }
    .shutter .info { font-size: 12px; color: var(--bc-text-2); }
    .shutter .btns { display: flex; gap: 6px; flex: none; }
    .shutter .btns button {
      width: var(--bc-touch); height: var(--bc-touch); border-radius: 12px; background: var(--bc-card);
      border: 1px solid var(--bc-border-strong); display: flex; align-items: center; justify-content: center;
    }
    .shutter .btns button:active { background: var(--bc-border); }
    .shutter .btns button.stop { color: var(--bc-red); }
    .shutter .btns button:disabled { opacity: .4; cursor: default; }
    
    @container (max-width: 300px) {
      .shutter { flex-wrap: wrap; padding: 10px 10px 10px 12px; row-gap: 8px; }
      .shutter .btns { flex-basis: 100%; }
      .shutter .btns button { flex: 1; width: auto; height: 40px; }
    }
  `;

  watchedIds() {
    return [...this.model.access.flatMap((a) => [a.id, a.battery].filter(Boolean)), ...(this.model.seenGates ?? []).map((g) => g.sensor)];
  }

  lockTile({ id, battery }) {
    const st = this.store.get(id);
    const name = this.model.name(id);
    const services = this.ctx.services;
    const avail = !isUnavailable(st);
    const state = st?.state;
    const labels = {
      locked: ['Bloccata', 'var(--bc-green)'], unlocked: ['Sbloccata', 'var(--bc-access)'], jammed: ['Inceppata', 'var(--bc-red)'],
      locking: ['Blocco in corso…', 'var(--bc-access)'], unlocking: ['Sblocco in corso…', 'var(--bc-access)'], open: ['Aperta', 'var(--bc-access)'],
    };
    const [text, color] = avail ? labels[state] ?? [state, 'var(--bc-text-2)'] : ['Non disponibile', 'var(--bc-text-2)'];
    const unlocked = ['unlocked', 'open'].includes(state);
    const can = avail && services.canControl(id);
    
    let attrs = 'disabled';
    if (can && state === 'locked') attrs = `data-hold="${esc(id)}" title="Tieni premuto per sbloccare" aria-label="${esc(name)}: bloccata, tieni premuto per sbloccare"`;
    else if (can && (unlocked || state === 'jammed')) attrs = `data-lock="${esc(id)}" aria-label="${esc(name)}: ${esc(text.toLowerCase())}, tocca per bloccare"`;
    const level = Number(this.store.get(battery)?.state);
    const batt = battery ? `<span class="batt ${batteryTone(level)}">${icon(batteryIcon(level))}${fmtNumber(level, 0)}%</span>` : '';
    return `
      <button class="lock ${unlocked ? 'unlocked' : ''}" style="--st:${color}" ${attrs}>
        <span class="top"><span class="who">${icon(unlocked ? 'mdi:lock-open-variant-outline' : 'mdi:lock-outline')}<span>${esc(name)}</span></span>${state === 'locked' && can ? icon('mdi:gesture-tap-hold', 'icon hint-hold') : ''}</span>
        <span class="bottom"><span>${esc(text)}</span>${batt}</span>
      </button>`;
  }

  constructor() {
    super();
    this.#bindGate();
    
    this.shadowRoot.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-cover][data-action]');
      if (b && !b.disabled) this.ctx.services.cover(b.dataset.cover, b.dataset.action).catch(() => {});
    });
  }

  shutterRow(id, enabled) {
    const st = this.store.get(id);
    const pos = st?.attributes.current_position;
    const moving = { opening: 'In apertura…', closing: 'In chiusura…' }[st?.state];
    const open = !isUnavailable(st) && (pos !== undefined ? pos > 0 : st.state !== 'closed');
    const txt = isUnavailable(st)
      ? 'Non disponibile'
      : moving ?? (pos === undefined || pos <= 0 || pos >= 100 ? (open ? 'Aperta' : 'Chiusa') : `Aperta ${pos}%`);
    const name = this.model.shortName(id);
    const btn = (action, ic, label, cls = '') =>
      `<button class="${cls}" ${enabled ? `data-cover="${esc(id)}" data-action="${action}"` : 'disabled'} aria-label="${label} ${esc(name)}" title="${label}">${icon(ic)}</button>`;
    return `
      <div class="shutter ${open ? 'open' : ''}">
        ${icon(this.model.icon(id) ?? (open ? 'mdi:garage-open' : 'mdi:garage'))}
        <span class="txt"><span class="n">${esc(name)}</span><span class="info num">${esc(txt)}</span></span>
        <span class="btns">${btn('open', 'mdi:arrow-up', 'Apri')}${btn('stop', 'mdi:stop', 'Stop', 'stop')}${btn('close', 'mdi:arrow-down', 'Chiudi')}</span>
      </div>`;
  }

  
  
  
  
  gateSeen(id) {
    const sensor = this.ctx.config.entities?.[id]?.seen;
    return sensor ? gateSeen(this.store, sensor) : null;
  }

  gateTile(id) {
    const st = this.store.get(id);
    const when = st && !isUnavailable(st) ? fmtWhen(st.state) : null;
    const can = st && st.state !== 'unavailable' && this.ctx.services.canControl(id);
    const action = this.ctx.config.entities?.[id]?.action ?? 'Apri';
    const name = this.model.name(id);
    const seen = this.gateSeen(id);
    const moving = gateMoves.label(id, seen);
    const known = seen && seen.state !== 'incerto';
    const open = !moving && seen?.state === 'aperto';
    
    const stateText = moving ?? (known ? (open ? `Aperto${seen.since ? ` · da ${fmtSpan(Date.now() - seen.since)}` : ''}` : 'Chiuso') : '');
    const attrs = can && !moving ? `data-gate-confirm="${esc(id)}" aria-label="${esc(name)}${stateText ? `, ${esc(stateText)}` : ''}: ${esc(action)}, chiede conferma"` : `disabled${moving ? ` aria-label="${esc(name)}: ${esc(moving)}"` : ''}`;
    const bottom = known || moving
      ? `<span class="bottom gate-seen"><span class="st">${esc(stateText)}</span><span class="last">${when ? `Ultimo ${esc(when)}` : ''}</span></span>`
      : `<span class="bottom"><span>${when ? `Ultimo ${esc(when)}` : esc(action)}${seen ? '<span class="star" title="Stato incerto">*</span>' : ''}</span></span>`;
    return `
      <button class="lock gate-tile ${open ? 'unlocked' : ''} ${known && !open && !moving ? 'closed' : ''} ${moving ? 'moving' : ''}" ${attrs}>
        <span class="top"><span class="who">${icon(open ? 'mdi:gate-open' : this.model.icon(id) ?? 'mdi:gate')}<span>${esc(name)}</span></span></span>
        ${bottom}
      </button>`;
  }

  #bindGate() {
    this.shadowRoot.addEventListener('click', (ev) => {
      const ask = ev.target.closest('[data-gate-confirm]');
      if (ask && !ask.disabled) return this.#ask(ask.dataset.gateConfirm);
      if (ev.target.closest('[data-gate-cancel]')) return this.#close();
      const go = ev.target.closest('[data-gate-go]');
      if (!go) return;
      const id = go.dataset.gateGo;
      const seen = this.gateSeen(id);
      this.#close();
      
      gateMoves.start(id, seen);
      this.ctx.services.confirmed(id).catch(() => gateMoves.clear(id));
    });
    this.#escape = (ev) => ev.key === 'Escape' && this._confirm && this.#close();
  }

  #escape;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.#escape);
    this._unsubMoves = gateMoves.subscribe(() => this.update());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubMoves?.();
    window.removeEventListener('keydown', this.#escape);
    clearTimeout(this._confirmTimer);
  }

  
  
  #ask(id) {
    const seen = this.gateSeen(id);
    const at = seen?.checked ? `alle ${fmtTime(new Date(seen.checked))}` : '';
    const cfg = this.ctx.config.entities?.[id] ?? {};
    let view = { id, ask: cfg.confirm ?? 'Vuoi aprirlo?', go: cfg.action ?? 'Apri', note: '' };
    if (seen?.state === 'aperto') view = { id, ask: 'Vuoi chiuderlo?', go: 'Chiudi', note: `Visto aperto dalla telecamera ${at}` };
    else if (seen?.state === 'chiuso') view = { id, ask: 'Vuoi aprirlo?', go: 'Apri', note: `Visto chiuso dalla telecamera ${at}` };
    else if (seen) view = { id, ask: 'Stato incerto', go: 'Invia comando', note: 'Non riesco a vedere se è aperto o chiuso: il comando apre o chiude a seconda di com\'è ora.' };
    this._confirm = view;
    clearTimeout(this._confirmTimer);
    this._confirmTimer = setTimeout(() => this.#close(), CONFIRM_MS);
    this.update();
  }

  #close() {
    clearTimeout(this._confirmTimer);
    this._confirm = null;
    this.update();
  }

  
  confirmDialog() {
    const v = this._confirm;
    if (!v) return '';
    const open = v.go === 'Chiudi';
    return `
      <div class="gate-overlay">
        <div class="gate-backdrop" data-gate-cancel></div>
        <div class="gate-dialog" role="alertdialog" aria-modal="true" aria-label="Conferma">
          ${icon(open ? 'mdi:gate-open' : this.model.icon(v.id) ?? 'mdi:gate', 'icon gate-ico')}
          <h3>Cancello ${esc(this.model.name(v.id).toLowerCase())}</h3>
          <p>${esc(v.ask)}</p>
          ${v.note ? `<p class="gate-note">${esc(v.note)}</p>` : ''}
          <div class="gate-btns">
            <button class="gate-cancel" data-gate-cancel>Annulla</button>
            <button class="gate-go" data-gate-go="${esc(v.id)}">${esc(v.go)}</button>
          </div>
        </div>
      </div>`;
  }

  render() {
    const s = (id) => this.store.get(id);
    const can = (id) => id && this.ctx.services.canControl(id) && !isUnavailable(s(id));
    const locks = this.model.access.filter((a) => a.id.startsWith('lock.'));
    const others = this.model.access.filter((a) => !a.id.startsWith('lock.'));
    const locked = locks.filter((a) => s(a.id)?.state === 'locked').length;
    const rows = others.filter(({ id }) => id.startsWith('cover.')).map(({ id }) => this.shutterRow(id, can(id)));
    const gates = others.filter(({ id }) => id.startsWith('button.'));
    return `
      <section class="card">
        <div class="head"><h2 class="card-title">Accessi</h2>${locks.length ? `<span class="sum">Porte ${locked}/${locks.length} bloccate</span>` : ''}</div>
        ${locks.length ? `<div class="locks">${locks.map((a) => this.lockTile(a)).join('')}</div>` : ''}
        <div class="rows">${rows.join('')}</div>
        ${gates.length ? `<div class="locks">${gates.map(({ id }) => this.gateTile(id)).join('')}</div>` : ''}
      </section>${this.confirmDialog()}`;
  }
}

customElements.define('bc-alarm', BcAlarm);
customElements.define('bc-access', BcAccess);
