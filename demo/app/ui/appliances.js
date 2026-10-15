// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { esc, fmtNumber, fmtTime, isUnavailable, programLabel } from '../core/format.js';

export const APPLIANCES_STYLES = `
  .appl-list { display: flex; flex-direction: column; gap: 14px; }
  .appl { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 16px; padding: 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .appl-fig { width: 100%; height: auto; display: block; }
  .appl-fig .af-body { fill: var(--bc-card); stroke: var(--bc-text-2); stroke-width: 2; }
  .appl-fig .af-panel { fill: var(--bc-bg); }
  .appl-fig .af-line { fill: none; stroke: var(--bc-text-2); stroke-width: 2; stroke-linecap: round; }
  .appl-fig .af-glass { fill: var(--bc-bg); stroke: var(--bc-text-2); stroke-width: 3; }
  .appl-fig .af-track { fill: none; stroke: var(--bc-border); stroke-width: 5; }
  .appl-fig .af-ring { fill: none; stroke-width: 5; stroke-linecap: round; transform: rotate(-90deg); transform-box: fill-box; transform-origin: center; }
  .appl-fig .af-drum { transform-box: view-box; transform-origin: 60px 92px; }
  .appl.run .appl-fig .af-drum { animation: appl-spin 2.4s linear infinite; }
  .appl.spin .appl-fig .af-drum { animation-duration: .5s; }
  .appl-fig .af-drop { opacity: 0; }
  .appl.run .appl-fig .af-drop { animation: appl-drop 1.2s ease-in infinite; }
  .appl.off .appl-fig { opacity: .45; filter: grayscale(1); }
  @keyframes appl-spin { to { transform: rotate(360deg); } }
  @keyframes appl-drop { 0% { opacity: 0; transform: translateY(-4px); } 30% { opacity: .9; } 100% { opacity: 0; transform: translateY(14px); } }
  @media (prefers-reduced-motion: reduce) { .appl .appl-fig .af-drum, .appl .appl-fig .af-drop { animation: none !important; } .appl.run .appl-fig .af-drop { opacity: .7; } }
  .appl-info { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
  .appl-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .appl-head .n { font: 600 18px var(--bc-font-display); }
  .appl-head .st { font-size: 14px; font-weight: 500; color: var(--bc-text-2); text-align: right; }
  .appl.run .appl-head .st { color: var(--bc-blue); }
  .appl.done .appl-head .st { color: var(--bc-green); }
  .appl.err .appl-head .st { color: var(--bc-red); }
  .appl-meta { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 13px; color: var(--bc-text-2); }
  .appl-meta b { color: var(--bc-text); font-weight: 500; font-variant-numeric: tabular-nums; }
  .appl-bar { height: 6px; border-radius: 3px; background: var(--bc-border); overflow: hidden; }
  .appl-bar span { display: block; height: 100%; border-radius: 3px; background: var(--bc-blue); }
  .appl-btns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 2px; }
  .appl-btns button { display: flex; align-items: center; justify-content: center; gap: 6px; min-height: var(--bc-touch); padding: 0 8px; border-radius: var(--bc-radius-inner); background: var(--bc-bg); font-size: 14px; font-weight: 500; }
  .appl-btns button .icon { width: 20px; height: 20px; }
  .appl-btns button.go:not(:disabled) { color: var(--bc-green); }
  .appl-btns button.stop:not(:disabled) { color: var(--bc-red); --hold-color: var(--bc-red); }
  .appl-btns button.pending { opacity: .6; }
  .appl-btns button:disabled { opacity: .4; }
  .appl-hint { font-size: 12px; color: var(--bc-text-2); }
  .appl-hint.warn { color: var(--bc-amber); }
  .appl-opts { display: flex; flex-wrap: wrap; gap: 6px; }
  .appl-opts button { min-height: 36px; padding: 0 12px; border-radius: 18px; border: 1px solid var(--bc-border-strong); background: none; font-size: 13px; color: var(--bc-text-2); }
  .appl-opts button[aria-pressed='true'] { border-color: var(--bc-blue); color: var(--bc-blue); background: color-mix(in srgb, var(--bc-blue) 12%, transparent); }
  .appl-opts button:disabled { opacity: .4; }
  .appl-delay { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--bc-text-2); }
  .appl-delay button { display: flex; align-items: center; justify-content: center; flex: none; width: 36px; height: 36px; padding: 0; border-radius: 50%; background: var(--bc-bg); }
  .appl-delay button .icon { width: 20px; height: 20px; }
  .appl-delay button:disabled { opacity: .4; }
  .appl-delay b { min-width: 52px; text-align: center; color: var(--bc-text); font-variant-numeric: tabular-nums; }
  @media (max-width: 600px) { .appl { grid-template-columns: 96px minmax(0, 1fr); gap: 12px; } }
`;

const LG = {
  power_off: 'Spenta', initial: 'Pronta', sleep: 'In attesa', detecting: 'Rileva il carico', reserved: 'Programmata',
  running: null, rinsing: 'Risciacquo', spinning: 'Centrifuga', drying: 'Asciugatura', cooling: 'Raffreddamento',
  cool_down: 'Raffreddamento', wrinkle_care: 'Antipiega', steam_softening: 'Vapore', refreshing: 'Rinfresco',
  rinse_hold: 'Pausa con acqua', pause: 'In pausa', end: 'Finita', error: 'Errore',
};
const BSH = {
  Inactive: 'Spenta', Ready: 'Pronta', DelayedStart: 'Partenza ritardata', Run: 'In lavaggio', Pause: 'In pausa',
  ActionRequired: 'Richiede intervento', Finished: 'Finita', Error: 'Errore', Aborting: 'Interruzione',
};
const RUNNING = new Set(['running', 'rinsing', 'spinning', 'drying', 'cooling', 'cool_down', 'wrinkle_care', 'steam_softening', 'refreshing', 'detecting', 'Run']);

export const appliancesWatchedIds = (model) =>
  (model.appliances ?? []).flatMap((a) => [
    a.state, a.end, a.duration, a.progress, a.program, a.remote_start, a.door, a.power_supply, a.start, a.stop,
    a.operation, a.delay, a.cycles, a.energy_month, a.water_forecast, a.energy_forecast, ...(a.options ?? []).map((o) => o.entity),
  ]).filter(Boolean);

 
function applianceState(store, a, now = Date.now()) {
  const raw = store.get(a.state)?.state;
  const key = String(raw ?? '').replace(/^BSH\.Common\.EnumType\.OperationState\./, '');
  const unavailable = isUnavailable(store.get(a.state));
  const running = RUNNING.has(key);
  
  const powerOff = !running && !!a.power_supply && store.get(a.power_supply)?.state === 'off';
  const label = unavailable
    ? 'Non raggiungibile'
    : powerOff
      ? 'Spenta'
      : key in BSH ? BSH[key] : key === 'running' ? (a.type === 'dryer' ? 'In asciugatura' : 'In lavaggio') : LG[key] ?? key;
  const endSt = store.get(a.end);
  const end = !isUnavailable(endSt) && Date.parse(endSt.state) ? new Date(endSt.state) : null;
  let progress = null;
  const pct = Number(store.get(a.progress)?.state);
  if (a.progress && Number.isFinite(pct)) progress = pct / 100;
  else if (end && Number(store.get(a.duration)?.state) > 0) progress = 1 - (end - now) / 60_000 / Number(store.get(a.duration).state);
  if (progress !== null) progress = Math.max(0, Math.min(1, progress));
  return {
    key, label, running, end: running || key === 'pause' || key === 'Pause' || key === 'DelayedStart' || key === 'reserved' ? end : null,
    progress: running || key === 'pause' || key === 'Pause' ? progress : key === 'end' || key === 'Finished' ? 1 : null,
    done: !powerOff && (key === 'end' || key === 'Finished'), error: key === 'error' || key === 'Error' || key === 'ActionRequired',
    off: unavailable || powerOff || key === 'power_off' || key === 'Inactive' || key === '',
    paused: key === 'pause' || key === 'Pause',
  };
}

 
export function appliancesSummary(store, model) {
  const on = (model.appliances ?? [])
    .map((a) => [a, applianceState(store, a)])
    .filter(([, s]) => s.running || s.paused)
    .map(([a, s]) => `${a.name}${s.progress !== null ? ` ${Math.round(s.progress * 100)}%` : ''}`);
  return on.length ? on.join(' · ') : 'Tutti fermi';
}

const ring = (cx, cy, r, p, color) => {
  const c = 2 * Math.PI * r;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" class="af-track"/>${p !== null ? `<circle cx="${cx}" cy="${cy}" r="${r}" class="af-ring" style="stroke:${color};stroke-dasharray:${(p * c).toFixed(1)} ${c.toFixed(1)}"/>` : ''}`;
};

 
function drumFigure(kind, s) {
  
  const accent = 'var(--bc-blue)';
  
  const drum = kind === 'dryer'
    ? [0, 60, 120, 180, 240, 300].map((d) => { const a = (d * Math.PI) / 180; return `<circle cx="${(60 + Math.cos(a) * 16).toFixed(1)}" cy="${(92 + Math.sin(a) * 16).toFixed(1)}" r="3" fill="var(--bc-text-2)"/>`; }).join('')
    : [0, 120, 240].map((d) => `<path d="M60 92 L60 70" transform="rotate(${d} 60 92)" stroke="var(--bc-text-2)" stroke-width="5" stroke-linecap="round"/>`).join('');
  const water = s.running && kind === 'washer' ? `<path d="M34 100 Q47 94 60 100 T86 100 V108 Q73 122 60 122 Q47 122 34 108 Z" fill="${accent}" opacity=".35"/>` : '';
  return `<svg class="appl-fig" viewBox="0 0 120 150" aria-hidden="true">
    <rect x="8" y="4" width="104" height="142" rx="10" class="af-body" style=""/>
    <rect x="8" y="4" width="104" height="30" rx="10" class="af-panel" style=""/>
    <path d="M8 34 H112" class="af-line" style=""/>
    <rect x="16" y="13" width="26" height="10" rx="3" fill="var(--bc-card)"/>
    <circle cx="94" cy="18" r="7" class="af-line" style=""/><circle cx="76" cy="18" r="3" fill="${s.running ? accent : 'var(--bc-text-2)'}"/>
    ${ring(60, 92, 40, s.progress, accent)}
    <circle cx="60" cy="92" r="33" class="af-glass" style=""/>
    ${water}
    <g class="af-drum" style="">${drum}<circle cx="60" cy="92" r="5" fill="var(--bc-text-2)"/></g>
    <path d="M44 70 Q38 78 38 88" class="af-line" style="opacity:.5"/>
  </svg>`;
}

 
function dishFigure(s, doorOpen) {
  const accent = 'var(--bc-blue)';
  const p = s.progress;
  const drops = [26, 44, 62, 80, 96].map((x, i) => `<path class="af-drop" d="M${x} 66 q-3 6 0 9 q3 -3 0 -9" fill="${accent}" style="animation-delay:${(i * 0.22).toFixed(2)}s"/>`).join('');
  return `<svg class="appl-fig" viewBox="0 0 120 150" aria-hidden="true">
    <rect x="8" y="4" width="104" height="142" rx="8" class="af-body" style=""/>
    <rect x="8" y="4" width="104" height="24" rx="8" class="af-panel" style=""/>
    <rect x="18" y="11" width="50" height="10" rx="3" fill="var(--bc-card)"/>
    ${p !== null ? `<rect x="20" y="13" width="${(46 * p).toFixed(1)}" height="6" rx="2" fill="${accent}"/>` : ''}
    <circle cx="96" cy="16" r="5" class="af-line" style=""/>
    <path d="M8 28 H112" class="af-line" style=""/>
    ${doorOpen
      ? `<rect x="14" y="34" width="92" height="106" rx="4" fill="var(--bc-bg)"/><path d="M22 60 H98 M22 100 H98" class="af-line" style="opacity:.6"/><path d="M28 60 v-8 M40 60 v-8 M52 60 v-8 M64 60 v-8 M76 60 v-8 M88 60 v-8" class="af-line" style="opacity:.5"/>`
      : `<rect x="34" y="38" width="52" height="7" rx="3.5" fill="var(--bc-text-2)"/>
         <rect x="16" y="52" width="88" height="86" rx="4" fill="var(--bc-bg)" opacity=".55"/>
         ${s.running ? drops : ''}
         <path d="M24 128 H96" class="af-line" style="opacity:.35"/>`}
  </svg>`;
}

export function renderAppliances({ store, model, services }) {
  const list = model.appliances ?? [];
  if (!list.length) return '<p class="placeholder">Nessun elettrodomestico in config.json.</p>';
  const on = (id) => store.get(id)?.state === 'on';
  return `<div class="appl-list">${list
    .map((a) => {
      const s = applianceState(store, a);
      const remote = a.remote_start ? on(a.remote_start) : true;
      const doorOpen = a.door ? on(a.door) : false;
      const cls = [s.off ? 'off' : '', s.running ? 'run' : '', s.key === 'spinning' ? 'spin' : '', s.done ? 'done' : '', s.error ? 'err' : ''].join(' ');
      const fig = a.type === 'dishwasher' ? dishFigure(s, doorOpen) : drumFigure(a.type, s);

      
      const meta = [];
      const prog = a.program && !isUnavailable(store.get(a.program)) ? programLabel(store.get(a.program).state) : null;
      if (prog && !s.off) meta.push(`Programma <b>${esc(prog)}</b>`);
      if (s.end) {
        const min = Math.max(0, Math.round((s.end - Date.now()) / 60_000));
        meta.push(`Fine <b>${fmtTime(s.end)}</b>${s.running ? ` · tra ${min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`}` : ''}`);
      }
      if (s.progress !== null && !s.done) meta.push(`<b>${Math.round(s.progress * 100)}%</b>`);
      if (a.type === 'dishwasher' && doorOpen) meta.push('Porta <b>aperta</b>');
      if (a.cycles && !isUnavailable(store.get(a.cycles))) meta.push(`Cicli <b>${esc(store.get(a.cycles).state)}</b>`);
      const kwh = Number(store.get(a.energy_month)?.state);
      if (a.energy_month && Number.isFinite(kwh)) meta.push(`Questo mese <b>${fmtNumber(kwh / 1000, 1)} kWh</b>`);
      if (a.water_forecast && !s.running && !s.off && Number.isFinite(Number(store.get(a.water_forecast)?.state))) {
        meta.push(`Acqua <b>${store.get(a.water_forecast).state}%</b> · energia <b>${store.get(a.energy_forecast)?.state ?? '—'}%</b> previste`);
      }

      
      
      const startBtn = a.start ? store.get(a.start) : null;
      const canStart = !s.off && !s.running && !s.done && remote && (a.operation || (startBtn && startBtn.state !== 'unavailable'));
      const canStop = s.running || s.paused || s.key === 'DelayedStart' || s.key === 'reserved';
      const power = a.power_supply ? store.get(a.power_supply) : null;
      const btns = `<div class="appl-btns">
        <button class="go" ${canStart ? `data-appliance="${esc(a.id)}" data-action="start"` : 'disabled'}>${icon('mdi:play')}Avvia</button>
        <button class="stop" ${canStop ? `data-hold="${esc(a.id)}" data-hold-appliance="stop" aria-label="Stop, tieni premuto"` : 'disabled'}>${icon('mdi:stop')}Stop${canStop ? icon('mdi:gesture-tap-hold', 'icon') : ''}</button>
        <button ${power && !isUnavailable(power) ? `data-appliance="${esc(a.id)}" data-action="power"` : 'disabled'} aria-pressed="${power?.state === 'on'}">${icon('mdi:power')}${power?.state === 'on' ? 'Spegni' : 'Accendi'}</button>
      </div>`;
      const hint = !s.off && !s.running && !s.done && !remote
        ? `<div class="appl-hint warn">Per avviarla da qui abilita l'avvio da remoto sulla macchina.</div>`
        : canStop ? '<div class="appl-hint">Tieni premuto Stop per interrompere il programma.</div>' : '';

      
      let extra = '';
      if (a.type === 'dishwasher' && !s.off && !s.running) {
        const delay = store.get(a.delay);
        const opts = delay?.attributes.options ?? [];
        const i = opts.indexOf(delay?.state);
        const canDelay = delay && !isUnavailable(delay) && services.canControl(a.delay) && i >= 0;
        const step = (d) => (canDelay && opts[i + d] ? `data-select="${esc(a.delay)}" data-option="${esc(opts[i + d])}"` : 'disabled');
        const delayRow = a.delay
          ? `<div class="appl-delay">Partenza tra <button ${step(-1)} aria-label="Meno">${icon('mdi:minus')}</button><b>${canDelay ? esc(delay.state.replace(':00', ' h').replace(':30', ',5 h').replace(/^0 h$/, 'subito')) : '—'}</b><button ${step(1)} aria-label="Più">${icon('mdi:plus')}</button></div>`
          : '';
        const optBtns = (a.options ?? [])
          .map((o) => {
            const st = store.get(o.entity);
            const ok = st && !isUnavailable(st) && services.canControl(o.entity);
            return `<button ${ok ? `data-toggle="${esc(o.entity)}"` : 'disabled'} aria-pressed="${st?.state === 'on'}">${esc(o.name)}</button>`;
          })
          .join('');
        extra = `${delayRow}${optBtns ? `<div class="appl-opts">${optBtns}</div>` : ''}`;
      }

      return `<div class="appl ${cls}">
        ${fig}
        <div class="appl-info">
          <div class="appl-head"><span class="n">${esc(a.name)}</span><span class="st">${esc(s.label)}</span></div>
          ${s.progress !== null && !s.done ? `<div class="appl-bar"><span style="width:${(s.progress * 100).toFixed(0)}%"></span></div>` : ''}
          ${meta.length ? `<div class="appl-meta">${meta.map((m) => `<span>${m}</span>`).join('')}</div>` : ''}
          ${btns}${hint}${extra}
        </div>
      </div>`;
    })
    .join('')}</div>`;
}
