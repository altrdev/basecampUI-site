// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { encode } from '../vendor/uqr/index.js';
import { icon } from './base.js';
import { esc, fmtNumber, fmtWhen, isUnavailable, stateValue } from '../core/format.js';
import { plantLevel } from '../core/alerts.js';
import { climateSummary } from './climate.js';
import { robotSummary } from './robot.js';
import { labSummary } from './lab.js';
import { rackSummary } from './rack.js';
import { settingsSummary } from './settings.js';
import { appliancesSummary } from './appliances.js';
import { musicSummary } from './music.js';
import { historySummary } from './history.js';
import { recordedCalls } from './intercom.js';

export const MENU_STYLES = `
  .menu-grid { display: grid; grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr)); gap: 12px; }
  .menu-grid.five > button { grid-column: span 2; }
  .menu-grid.five > button:nth-child(n + 4) { grid-column: span 3; }
  .menu-grid.seven > button { grid-column: span 3; }
  .menu-grid.seven > button:nth-child(n + 5) { grid-column: span 4; }
  .menu-grid.ten > button { grid-column: span 4; }
  .menu-grid.ten > button:nth-child(n + 7) { grid-column: span 3; }
  @media (max-width: 600px) {
    .menu-grid, .menu-grid.five, .menu-grid.seven, .menu-grid.ten { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .menu-grid.five > button, .menu-grid.five > button:nth-child(n + 4), .menu-grid.seven > button, .menu-grid.seven > button:nth-child(n + 5), .menu-grid.ten > button, .menu-grid.ten > button:nth-child(n + 7) { grid-column: auto; }
    .menu-grid.five > button:last-child, .menu-grid.seven > button:last-child { grid-column: 1 / -1; }
  }
  
  .menu-grid, .menu-wifi { flex: none; }
  @media (max-height: 640px) { .menu-grid { gap: 8px; } .menu-wifi { min-height: 48px; margin-top: 8px; } }
  .menu-wifi { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 56px; margin-top: 12px; padding: 0 18px; border-radius: var(--bc-radius-inner); border: 1px dashed var(--bc-border-strong); background: none; text-align: left; }
  .menu-wifi:active { background: var(--bc-surface); }
  .menu-wifi .icon { width: 22px; height: 22px; color: var(--bc-text-2); }
  .menu-wifi .title { font-size: 15px; font-weight: 600; }
  .menu-wifi .sub { flex: 1; font-size: 13px; color: var(--bc-text-2); }
  .menu-wifi .more { width: 18px; height: 18px; }
  .menu-grid button {
    min-height: 0; border-radius: 18px; border: 1px solid #2F3138; background: var(--bc-surface); padding: clamp(6px, calc((100vh - 520px) * .1), 18px) 16px;
    display: flex; flex-direction: column; justify-content: flex-start; gap: clamp(4px, calc((100vh - 520px) * .133), 22px); align-items: stretch; text-align: left;
  }
  .menu-grid button:not(:disabled):active { background: var(--bc-border); }
  
  .menu-grid button:disabled { cursor: default; opacity: .6; }
  
  .menu-grid .icon { width: 28px; height: 28px; color: var(--c, var(--bc-text-2)); }
  .menu-grid .text { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .menu-grid .title { font-size: 16px; font-weight: 600; }
  
  .menu-grid .sub { font-size: 13px; color: var(--bc-text-2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .menu-grid .sub.warn { color: var(--bc-amber); }
  .menu-grid .sub.ok { color: var(--bc-green); }
  .wifi { display: flex; flex-direction: column; align-items: center; gap: 18px; }
  .wifi .qr { width: 240px; margin: 0; padding: 16px; border-radius: 16px; background: #FAF9F5; }
  .wifi .info { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 15px; text-align: center; }
  .wifi .ssid { font-weight: 600; }
  .wifi .pwd { color: var(--bc-text-2); user-select: all; overflow-wrap: anywhere; }
  .wifi .actions { display: flex; gap: 10px; width: 100%; }
  .wifi .actions button {
    flex: 1 1 0; min-height: 48px; border-radius: 14px; border: 1px solid var(--bc-border-strong);
    background: var(--bc-surface); font-size: 15px; font-weight: 600; text-align: center;
  }
  .wifi .actions button.primary { background: var(--bc-text); border-color: var(--bc-text); color: var(--bc-bg); }

  .hero { display: flex; align-items: baseline; gap: 16px; }
  .hero .big { font-size: 48px; font-weight: 500; line-height: 1; }
  .hero .big small { font-size: 20px; color: var(--bc-text-2); }
  .hero .big { white-space: nowrap; }
  @media (max-width: 600px) { .hero { gap: 12px; } .hero .big { font-size: 34px; } .hero .big small { font-size: 15px; } }
  .meter { height: 10px; margin: 12px 0 8px; border-radius: 5px; background: var(--bc-surface); overflow: hidden; }
  .meter span { display: block; height: 100%; background: var(--bc-green); }
  .meter.low span { background: var(--bc-amber); }
  .charge { font-size: 14px; color: var(--bc-text-2); }
  .charge.on { color: var(--bc-green); }
  .car-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .car-stats > span { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 12px 6px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 12px; color: var(--bc-text-2); }
  .car-stats b { font: 500 30px/1.1 var(--bc-font-display); color: var(--bc-text); white-space: nowrap; }
  .car-stats b small { font-size: 14px; color: var(--bc-text-2); font-weight: 400; }
  .charge { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 10px; }
  .charge .icon { width: 18px; height: 18px; }
  @media (max-width: 600px) { .car-stats b { font-size: 24px; } .car-stats b small { font-size: 12px; } }
  .car-cmds { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  .car-cmds button { display: flex; flex-direction: column; align-items: center; gap: 4px; min-height: 84px; padding: 10px 4px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .car-cmds button:active { filter: brightness(1.2); }
  .car-cmds .icon { width: 26px; height: 26px; color: var(--bc-text); }
  .car-cmds .n { font-size: 13px; font-weight: 500; }
  .car-cmds .w { font-size: 11px; color: var(--bc-text-2); }
  .car-trips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .car-trips > span, .car-due > span { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 12px; color: var(--bc-text-2); min-width: 0; }
  .car-trips .icon, .car-due .icon { width: 20px; height: 20px; margin-bottom: 4px; color: var(--bc-text-2); }
  .car-trips b, .car-due b { font: 500 22px/1.15 var(--bc-font-display); color: var(--bc-text); white-space: nowrap; }
  .car-trips b small { font-size: 12px; color: var(--bc-text-2); font-weight: 400; }
  .car-due { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .car-due b { font-size: 17px; }
  .car-due .l { font-size: 12px; }
  .car-due i { font-style: normal; min-height: 15px; }
  .car-due .warn i, .car-due .warn .icon { color: var(--bc-amber); }
  .car-due .alert i, .car-due .alert .icon, .car-due .alert b { color: var(--bc-red); }
  .car-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; margin-top: 12px; padding: 12px 10px 8px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .car-week .d { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; color: var(--bc-text-2); }
  .car-week .n { font: 500 13px var(--bc-font-display); color: var(--bc-text); min-height: 16px; }
  .car-week .bar { display: flex; align-items: flex-end; height: 70px; width: 14px; }
  .car-week .bar span { display: block; width: 100%; min-height: 2px; border-radius: 3px 3px 0 0; background: var(--bc-blue); }
  .car-sum, .car-wait { margin: 8px 0 0; font-size: 13px; color: var(--bc-text-2); }
  .car-sum b { color: var(--bc-text); font-weight: 500; }
  .car-src { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 12px; color: var(--bc-text-2); }
  .car-src .icon { width: 16px; height: 16px; }
  @media (max-width: 600px) { .car-trips b { font-size: 18px; } .car-due b { font-size: 14px; } .car-trips > span, .car-due > span { padding: 10px; } }
  .car-fig { display: block; width: 100%; max-width: 460px; margin: 0 auto 6px; height: auto; flex: none; }
  .car-fig .body-line { fill: none; stroke: var(--bc-text); stroke-width: 2.5; stroke-linejoin: round; }
  .car-fig .glass { fill: var(--bc-surface); stroke: var(--bc-text-2); stroke-width: 1.5; }
  .car-fig .wheel { fill: var(--bc-bg); stroke: var(--bc-text); stroke-width: 2.5; }
  .car-fig .rim { fill: none; stroke: var(--bc-text-2); stroke-width: 2; }
  .car-fig .detail { fill: none; stroke: var(--bc-text-2); stroke-width: 1.5; stroke-linecap: round; }
  .car-fig .ground { stroke: var(--bc-border-strong); stroke-width: 2; stroke-linecap: round; }
  .car-fig .cable { fill: none; stroke: var(--bc-text-2); stroke-width: 3; stroke-linecap: round; }
  .car-fig .cable-dots { fill: none; stroke: var(--bc-green); stroke-width: 5; stroke-linecap: round; stroke-dasharray: 0 14; animation: car-charge 1.2s linear infinite; }
  @keyframes car-charge { to { stroke-dashoffset: 28; } }
  @media (prefers-reduced-motion: reduce) { .car-fig .cable-dots { animation: none; } }
  .car-fig .wallbox { fill: var(--bc-surface); stroke: var(--bc-text-2); stroke-width: 2; }
  .car-fig .pct { font: 600 26px var(--bc-font-display); fill: var(--bc-text); text-anchor: middle; font-variant-numeric: tabular-nums; }
  .warn { color: var(--bc-amber); }

  .plants { display: flex; flex-direction: column; gap: 12px; }
  .pcard { background: var(--bc-surface); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 12px; }
  .phead { display: flex; gap: 12px; align-items: center; }
  .pimg { width: 72px; height: 72px; flex: none; border-radius: 12px; object-fit: cover; background: var(--bc-card); }
  .pimg.empty { display: grid; place-items: center; color: var(--bc-text-2); }
  .ptext { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .pname { font: 600 17px/1.2 var(--bc-font-display); }
  .species { font-size: 12px; color: var(--bc-text-2); font-style: italic; }
  .ptext .badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
  .pmetrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 14px; }
  .pm-head { display: flex; align-items: center; gap: 6px; font-size: 13px; }
  .pm-head .icon { width: 16px; height: 16px; color: var(--bc-text-2); }
  .pm-label { flex: 1; color: var(--bc-text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pm-val { white-space: nowrap; }
  .pm-val small { color: var(--bc-text-2); font-size: 11px; }
  .pm-bar { height: 6px; margin-top: 5px; border-radius: 3px; background: var(--bc-border-strong); overflow: hidden; }
  .pm-bar span { display: block; height: 100%; border-radius: 3px; background: var(--bc-text-2); }
  .pm.ok .pm-bar span { background: var(--bc-green); }
  .pm.warn .pm-bar span { background: var(--bc-amber); }
  .pm.warn .pm-val { color: var(--bc-amber); }
  .pcare summary { cursor: pointer; min-height: var(--bc-touch); display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--bc-text-2); list-style: none; }
  .pcare summary::-webkit-details-marker { display: none; }
  .pcare .chev { width: 18px; height: 18px; transition: transform .15s; }
  .pcare[open] .chev { transform: rotate(90deg); }
  .pcare dl { margin: 6px 0 0; display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; font-size: 13px; }
  .pcare dt { color: var(--bc-text-2); }
  .pcare dd { margin: 0; }

  .wifi .qr svg { display: block; width: 100%; height: auto; }
`;

const valueOf = stateValue;

function carSummary(store, car) {
  const battery = valueOf(store, car.battery);
  const range = valueOf(store, car.range);
  const charging = valueOf(store, car.charging) === 'on';
  return `${fmtNumber(battery, 0)}% · ${fmtNumber(range, 0)} km${charging ? ' · in carica' : ''}`;
}

const CAR_BODY =
  'M28 138 L53 136 A36 36 0 0 1 125 132 L292 132 A36 36 0 0 1 364 132 L371 137 C379 135 384 131 384 128 L382 106 C381 99 378 94 375 91 L362 73 L349 51 L318 20 L331 14 C331 11 329 10 326 10 L252 7 C222 7 200 8 186 9 C168 13 154 19 142 25 L100 54 C82 57 66 60 54 64 C44 67 36 71 32 75 C28 79 26 82 24 86 C20 95 19 100 19 106 L14 133 Z';
const CAR_LINES = [
  'M54 76 L362 65', 
  'M155 55 L349 52', 
  'M105 54 L173 18 C190 13 215 11 245 11', 
  'M155 55 L170 37 C186 25 214 18 245 17 L245 54', 
  'M252 10 L261 52', 
  'M253 18 C274 18 290 20 298 24 C306 32 312 42 314 50', 
  'M300 18 L346 48', 
  'M138 66 C134 92 135 118 142 134', 
  'M261 52 C265 78 262 112 244 135', 
  'M151 60 C148 50 151 45 157 45 C163 45 165 50 163 56 L159 62', 
];

function carFigure(battery, plugged, charging) {
  const pct = Number.isFinite(battery) ? Math.max(0, Math.min(100, battery)) : 0;
  const color = pct < 10 ? 'var(--bc-red)' : pct < 20 ? 'var(--bc-amber)' : 'var(--bc-green)';
  
  const fillW = (pct / 100) * 370;
  
  const wheel = (cx) => `<circle cx="${cx}" cy="132" r="29" class="wheel" style=""/><circle cx="${cx}" cy="132" r="17" class="rim" style=""/><circle cx="${cx}" cy="132" r="5" class="rim" style=""/>`;
  const cable = 'M331 80 C352 80 372 78 390 82 C404 88 400 138 418 136 C430 134 434 124 434 112';
  return `<svg class="car-fig" viewBox="6 2 ${plugged ? 444 : 384} 164" role="img" aria-label="Auto elettrica, batteria ${fmtNumber(pct, 0)}%">
    <defs><clipPath id="car-clip"><path d="${CAR_BODY}"/></clipPath></defs>
    <line x1="10" x2="${plugged ? 450 : 388}" y1="162" y2="162" class="ground" style=""/>
    <rect x="14" y="4" width="${fillW.toFixed(1)}" height="140" clip-path="url(#car-clip)" style="fill:${color};opacity:.28"/>
    <path d="${CAR_BODY}" class="body-line" style="stroke:${color}"/>
    <path d="${CAR_LINES.join(' ')}" class="detail" clip-path="url(#car-clip)" style=""/>
    <circle cx="41" cy="79" r="5" class="detail" style=""/><circle cx="36" cy="97" r="4" class="detail" style=""/>
    <path d="M370 96 L377 100 L378 112 L372 110 Z" style="fill:var(--bc-red);opacity:.85"/>
    <circle cx="331" cy="80" r="7" class="detail" style=""/>
    ${wheel(89)}${wheel(328)}
    ${plugged ? `<rect x="422" y="56" width="24" height="56" rx="6" class="wallbox" style=""/><circle cx="434" cy="72" r="4" style="fill:${charging ? 'var(--bc-green)' : 'var(--bc-text-2)'}"/>
      <path d="${cable}" class="cable" style=""/>${charging ? `<path d="${cable}" class="cable-dots" style="stroke-dashoffset:0"/>` : ''}
      <circle cx="331" cy="80" r="3.5" style="fill:var(--bc-text)"/>` : ''}
  </svg>`;
}

 
function deadlineParts(date) {
  if (!date) return ['—', '', ''];
  const days = Math.ceil((date - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
  const short = date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  if (days < 0) return [short, 'scaduta', 'alert'];
  if (days <= 30) return [short, `tra ${days} giorni`, 'warn'];
  return [short, `tra ${days} giorni`, ''];
}

const dueTile = (ic, label, value, note = '', tone = '') =>
  `<span class="${tone}">${icon(ic)}<span class="l">${esc(label)}</span><b class="num">${value}</b><i>${esc(note)}</i></span>`;

export function loadCarHistory(conn, car, onData) {
  const id = car.kilometers;
  let alive = true;
  const data = { week: null, todo: null };
  const done = () => alive && onData({ ...data });
  const list = car.deadlines?.list;
  const unsub = list
    ? conn.subscribeMessage((msg) => { data.todo = msg.items ?? []; done(); }, { type: 'todo/item/subscribe', entity_id: list }).catch(() => null)
    : null;
  if (!id) return () => { alive = false; unsub?.then((u) => u?.()).catch(() => {}); };
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  conn
    .sendMessagePromise({ type: 'history/history_during_period', start_time: new Date(today - 8 * 86_400_000).toISOString(), entity_ids: [id], minimal_response: true, no_attributes: true })
    .then((res) => {
      
      const last = new Map();
      for (const s of res[id] ?? []) {
        const v = Number(s.s);
        if (!Number.isFinite(v) || v <= 0) continue;
        const t = new Date(((s.lu ?? s.lc) ?? 0) * 1000);
        last.set(new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime(), v);
      }
      const days = [];
      let prev = null;
      for (let i = 7; i >= 0; i--) {
        const key = today.getTime() - i * 86_400_000;
        const v = last.get(key) ?? prev;
        if (i < 7) days.push({ start: key, km: v !== null && prev !== null ? Math.max(0, v - prev) : null });
        prev = v;
      }
      data.week = days;
      done();
    })
    .catch(() => {
      data.week = [];
      done();
    });
  return () => {
    alive = false;
    unsub?.then((u) => u?.()).catch(() => {});
  };
}

 
function dueDate(data, summary) {
  const items = (data?.todo ?? []).filter((i) => i.summary === summary && i.due);
  const item = items.find((i) => i.status === 'needs_action') ?? items.at(-1);
  if (!item) return null;
  const [y, m, d] = item.due.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function carWeek(data) {
  if (!data?.week) return '<p class="car-wait">Caricamento…</p>';
  const days = data.week ?? [];
  if (!days.length) return '';
  const max = Math.max(1, ...days.map((d) => d.km ?? 0));
  const total = days.reduce((s, d) => s + (d.km ?? 0), 0);
  return `<div class="car-week">${days
    .map((d, i) => {
      const name = i === days.length - 1 ? 'Oggi' : new Date(d.start).toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '');
      return `<div class="d"><span class="n num">${d.km ? fmtNumber(d.km, 0) : ''}</span><span class="bar"><span style="height:${((d.km ?? 0) / max) * 100}%"></span></span><span>${esc(name.charAt(0).toUpperCase() + name.slice(1))}</span></div>`;
    })
    .join('')}</div>
    <p class="car-sum">Ultimi 7 giorni: <b class="num">${fmtNumber(total, 0)} km</b></p>`;
}

function carCommands(store, car, services) {
  const list = car.controls ?? [];
  if (!list.length) return '';
  return `<div class="car-cmds">${list
    .map((c) => {
      const st = store.get(c.entity);
      const when = st && !isUnavailable(st) ? fmtWhen(st.state) : null;
      const ok = st && st.state !== 'unavailable' && services?.canControl(c.entity);
      return `<button ${ok ? `data-press="${esc(c.entity)}"` : 'disabled'}>${icon(c.icon ?? 'mdi:gesture-tap-button')}<span class="n">${esc(c.name)}</span><span class="w num">${when ? esc(when) : '—'}</span></button>`;
    })
    .join('')}</div>`;
}

const WALLBOX_STATES = {
  'timed charging waiting': 'In attesa della fascia programmata',
  charging: 'In carica',
  'pv power charging': 'In carica dal solare',
  standby: 'A riposo',
  idle: 'A riposo',
  'no car connected': 'Nessuna auto collegata',
  fault: 'Guasto',
};

function carWallbox(store, w) {
  if (!w?.state) return '';
  const st = store.get(w.state);
  if (!st) return '';
  const raw = isUnavailable(st) ? null : String(st.state);
  const label = raw ? (WALLBOX_STATES[raw.trim().toLowerCase()] ?? raw) : 'Non raggiungibile';
  
  const rawPower = valueOf(store, w.power);
  const kw = rawPower !== null && store.get(w.power)?.attributes?.unit_of_measurement === 'W' ? Number(rawPower) / 1000 : rawPower;
  const month = valueOf(store, w.month);
  const last = valueOf(store, w.last_month);
  const total = valueOf(store, w.total);
  const src = w.updated ? store.get(w.updated) : null;
  const when = src?.attributes?.updated ? fmtWhen(src.attributes.updated) : null;
  const on = Number(kw) > 0.05; 
  const tile = (value, unit, name) => `<span><b class="num">${fmtNumber(value, 1)}<small> ${unit}</small></b>${name}</span>`;
  return `<section><h3>Wallbox</h3>
    <div class="charge ${on ? 'on' : ''}">${icon('mdi:ev-station')}${esc(label)}</div>
    <div class="car-trips" style="margin-top:10px">${tile(kw, 'kW', 'Potenza')}${tile(month, 'kWh', 'Questo mese')}${tile(last, 'kWh', 'Mese scorso')}</div>
    <p class="car-sum">${total !== null ? `Totale <b class="num">${fmtNumber(total, 0)} kWh</b> · ` : ''}${when ? `dati della colonnina del ${esc(when)}` : 'in attesa dei dati della colonnina'}</p>
  </section>`;
}

export function renderCar({ store, model, services, ui = {} }) {
  const car = model.car;
  const v = (role) => valueOf(store, car[role]);
  const battery = Number(v('battery'));
  const charging = v('charging') === 'on';
  const plugged = v('plugged_in') === 'on';
  const end = v('charge_end');
  const chargeText = charging ? `In carica${end && end !== '00:00' ? ` · fine alle ${end}` : ''}` : plugged ? 'Collegata, non in carica' : 'Scollegata';
  const kwhLeft = Number(v('energy_left'));

  return `
    <section>
      ${carFigure(battery, plugged, charging)}
      <div class="car-stats">
        <span><b class="num" style="color:${battery < 10 ? 'var(--bc-red)' : battery < 20 ? 'var(--bc-amber)' : 'var(--bc-green)'}">${fmtNumber(v('battery'), 0)}<small>%</small></b>Batteria</span>
        <span><b class="num">${fmtNumber(v('range'), 0)}<small> km</small></b>Autonomia</span>
        ${Number.isFinite(kwhLeft) && v('energy_left') !== null ? `<span><b class="num">${fmtNumber(kwhLeft, 1)}<small> kWh</small></b>In batteria</span>` : ''}
      </div>
      <div class="charge ${charging ? 'on' : ''}">${icon(charging ? 'mdi:ev-plug-type2' : plugged ? 'mdi:power-plug-outline' : 'mdi:power-plug-off-outline')}${esc(chargeText)}</div>
    </section>
    ${carCommands(store, model.car, services)}
    ${carWallbox(store, car.wallbox)}
    <section><h3>Viaggi</h3>
      <div class="car-trips">
        <span>${icon('mdi:map-marker-distance')}<b class="num">${fmtNumber(v('trip_a'), 0)}<small> km</small></b>Trip A</span>
        <span>${icon('mdi:map-marker-distance')}<b class="num">${fmtNumber(v('trip_b'), 0)}<small> km</small></b>Trip B</span>
        <span>${icon('mdi:counter')}<b class="num">${fmtNumber(v('kilometers'), 0)}<small> km</small></b>Totali</span>
      </div>
      ${carWeek(ui.car)}
    </section>
    <section><h3>Scadenze</h3>
      <div class="car-due">
        ${dueTile('mdi:wrench-outline', 'Tagliando tra', `${fmtNumber(v('service'), 0)} km`, ...(Number(v('service')) < 1000 ? ['mancano pochi km', 'warn'] : ['', '']))}
        ${dueTile('mdi:shield-car', 'Assicurazione', ...deadlineParts(dueDate(ui.car, car.deadlines?.insurance)))}
        ${dueTile('mdi:clipboard-check-outline', 'Revisione', ...deadlineParts(dueDate(ui.car, car.deadlines?.inspection)))}
      </div>
    </section>
    <p class="car-src">${icon('mdi:map-marker-outline')}${esc(v('position') ?? '—')} · dati dell'auto del ${esc(v('updated') ?? '—')}</p>`;
}

const PLANT_PROBLEMS = {
  moisture: ['Da annaffiare', 'Troppa acqua'],
  conductivity: ['Da concimare', 'Troppo concime'],
  illuminance: ['Poca luce', 'Troppa luce'],
  dli: ['Poca luce', 'Troppa luce'],
  temperature: ['Troppo freddo', 'Troppo caldo'],
  humidity: ['Aria secca', 'Aria umida'],
  soil_temperature: ['Terreno freddo', 'Terreno caldo'],
};

const plantProblems = (store, metrics) =>
  Object.entries(metrics ?? {}).flatMap(([kind, metric]) => {
    const level = plantLevel(store, metric);
    const texts = PLANT_PROBLEMS[kind];
    return level === 'low' || level === 'high' ? [texts ? texts[level === 'high' ? 1 : 0] : `${kind} ${level}`] : [];
  });

const PLANT_BARS = [
  ['moisture', 'Terreno', 'mdi:water-outline', 0],
  ['conductivity', 'Nutrienti', 'mdi:leaf', 0],
  ['temperature', 'Temperatura', 'mdi:thermometer', 1],
  ['illuminance', 'Luce', 'mdi:white-balance-sunny', 0],
  ['humidity', 'Umidità aria', 'mdi:water-percent', 0],
  ['dli', 'Luce del giorno', 'mdi:weather-sunset', 1],
];
const CARE = [
  ['care_watering', 'Acqua'],
  ['care_sunlight', 'Luce'],
  ['care_soil', 'Terreno'],
  ['care_fertilization', 'Concime'],
  ['care_pruning', 'Potatura'],
];

function plantBar(store, metric, [, label, ic, digits]) {
  if (!metric?.sensor) return '';
  const st = store.get(metric.sensor);
  const v = isUnavailable(st) ? null : Number(st.state);
  const min = Number(store.get(metric.min)?.state);
  const max = Number(store.get(metric.max)?.state);
  const unit = st?.attributes.unit_of_measurement ?? '';
  const level = plantLevel(store, metric);
  const tone = level === 'low' || level === 'high' ? 'warn' : level === 'ok' ? 'ok' : '';
  
  const pct = v !== null && Number.isFinite(min) && Number.isFinite(max) && max > min ? Math.max(3, Math.min(100, ((v - min) / (max - min)) * 100)) : 0;
  const range = Number.isFinite(min) && Number.isFinite(max) ? `${fmtNumber(min, digits)}–${fmtNumber(max, digits)} ${unit}` : '';
  return `
    <div class="pm ${tone}" title="${esc(`${label}: ${range}`)}">
      <div class="pm-head">${icon(ic)}<span class="pm-label">${label}</span><span class="pm-val num">${v === null ? '—' : `${fmtNumber(v, digits)}`}<small> ${esc(unit)}</small></span></div>
      <div class="pm-bar"><span style="width:${pct}%"></span></div>
    </div>`;
}

export function renderPlants({ store, model, hassUrl = (p) => p }) {
  if (!model.plants.length) return '<p class="placeholder">Nessuna pianta in HA.</p>';
  const cards = model.plants.map(({ id, metrics }) => {
    const state = store.get(id);
    const problems = plantProblems(store, metrics);
    const badges = problems.length
      ? [...new Set(problems)].map((t) => `<span class="badge amber">${esc(t)}</span>`).join('')
      : isUnavailable(state)
        ? '<span class="badge">Non disponibile</span>'
        : '<span class="badge green">OK</span>';
    const picture = state?.attributes.entity_picture;
    const img = picture
      ? `<img class="pimg" src="${esc(hassUrl(encodeURI(picture)))}" alt="" loading="lazy">`
      : `<span class="pimg empty">${icon('mdi:sprout')}</span>`;
    const care = CARE.filter(([k]) => state?.attributes[k]).map(([k, label]) => `<dt>${label}</dt><dd>${esc(state.attributes[k])}</dd>`);
    return `
      <article class="pcard">
        <div class="phead">
          ${img}
          <div class="ptext">
            <span class="pname">${esc(model.name(id))}</span>
            <span class="species">${esc(state?.attributes.species ?? '')}</span>
            <span class="badges">${badges}</span>
          </div>
        </div>
        <div class="pmetrics">${PLANT_BARS.map((b) => plantBar(store, metrics?.[b[0]], b)).join('')}</div>
        ${care.length ? `<details class="pcare"><summary>${icon('mdi:chevron-right', 'icon chev')}Consigli di cura</summary><dl>${care.join('')}</dl></details>` : ''}
      </article>`;
  });
  return `<div class="plants">${cards.join('')}</div>`;
}

 
function parseWifi(text) {
  const fields = {};
  for (const [, key, value] of String(text ?? '').replace(/^WIFI:/, '').matchAll(/([A-Z]):((?:\\.|[^;\\])*);/g)) {
    fields[key] = value.replace(/\\(.)/g, '$1');
  }
  return fields;
}

const wifiText = (store, model) => store.get(model.guestWifi)?.attributes.text ?? null;

function qrSvg(text) {
  const { data, size } = encode(text, { ecc: 'M', border: 0 });
  let path = '';
  data.forEach((row, y) => row.forEach((dark, x) => dark && (path += `M${x} ${y}h1v1h-1z`)));
  return `<svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="QR code Wi-Fi ospiti"><path fill="#131417" d="${path}"/></svg>`;
}

export function renderWifi({ store, model }) {
  const text = wifiText(store, model);
  const actions = `<div class="actions"><button data-open="#funzioni" data-replace>Indietro</button><button class="primary" data-close>Chiudi</button></div>`;
  if (!text) return `<div class="wifi"><p class="placeholder">Wi-Fi ospiti non configurato.</p>${actions}</div>`;
  const { S: ssid, P: password, H: hidden } = parseWifi(text);
  return `
    <div class="wifi">
      <div class="qr">${qrSvg(text)}</div>
      <div class="info">
        <span>Rete: <span class="ssid">${esc(ssid ?? '—')}</span>${hidden === 'true' ? ' (nascosta)' : ''}</span>
        ${password ? `<span class="pwd">Password: ${esc(password)}</span>` : ''}
      </div>
      ${actions}
    </div>`;
}

export function menuWatchedIds(model, id) {
  const car = Object.entries(model.car)
    .filter(([k]) => k !== 'name')
    .flatMap(([k, v]) => (k === 'controls' ? v.map((c) => c.entity) : k === 'deadlines' ? [] : k === 'wallbox' ? Object.values(v) : [v]));
  if (id === 'auto') return car;
  if (id === 'piante') {
    return model.plants.flatMap((p) => [p.id, ...Object.values(p.metrics ?? {}).flatMap((m) => [m.sensor, m.min, m.max])].filter(Boolean));
  }
  if (id === 'wifi') return [model.guestWifi].filter(Boolean);
  return [model.intercom?.call, model.intercom?.do_not_disturb, model.intercom?.calls, model.car.battery, model.car.range, model.car.charging, model.guestWifi, model.robot?.vacuum, model.robot?.battery, ...(model.settings ?? []).map((x) => x.entity), ...(model.appliances ?? []).flatMap((x) => [x.state, x.progress, x.end, x.duration])].filter(Boolean);
}

export const MENU_COLORS = {
  robot: 'var(--bc-green)',
  auto: '#7FD3E0',
  lab: 'var(--bc-amber)',
  rack: '#9AA7C7',
  clima: 'var(--bc-violet)',
  elettrodomestici: 'var(--bc-blue)',
  impostazioni: 'var(--bc-cover)',
  musica: 'var(--bc-music)',
  storico: '#6FC3B2',
  citofono: 'var(--bc-access)',
};

export const MENU_TITLES = { robot: 'Robot', auto: 'Auto elettrica', clima: 'Clima', lab: 'Laboratorio', rack: 'Rack', wifi: 'Wi-Fi ospiti', piante: 'Piante', impostazioni: 'Impostazioni', elettrodomestici: 'Elettrodomestici', musica: 'Musica', storico: 'Storico', citofono: 'Citofono' };

 
function intercomSummary(store, model) {
  const c = model.intercom;
  if (store.get(c.call)?.state === 'on') return ['Sta suonando', 'warn'];
  if (store.get(c.do_not_disturb)?.state === 'on') return ['Non disturbare attivo', 'warn'];
  const last = recordedCalls(store, model)[0];
  if (!last) return ['Nessuna chiamata', ''];
  const hm = last.t.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const today = last.t.toDateString() === new Date().toDateString();
  return [`Ultima: ${today ? 'oggi' : last.t.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} ${hm}`, ''];
}

export function renderMenu({ store, model, mass }) {
  const ssid = parseWifi(wifiText(store, model)).S;
  const charging = valueOf(store, model.car.charging) === 'on';
  
  const items = [
    ...(model.intercom ? [['citofono', 'mdi:doorbell-video', MENU_TITLES.citofono, ...intercomSummary(store, model), MENU_COLORS.citofono]] : []),
    ...(model.climate ? [['clima', 'mdi:thermostat', MENU_TITLES.clima, climateSummary(store, model.climate), '', MENU_COLORS.clima]] : []),
    ...(model.robot ? [['robot', 'mdi:robot-vacuum', model.robot.name ?? MENU_TITLES.robot, robotSummary(store, model.robot), '', MENU_COLORS.robot]] : []),
    ['auto', 'mdi:car-electric', model.car.name ?? MENU_TITLES.auto, carSummary(store, model.car), charging ? 'ok' : '', MENU_COLORS.auto],
    ...(model.appliances?.length ? [['elettrodomestici', 'mdi:washing-machine', MENU_TITLES.elettrodomestici, appliancesSummary(store, model), '', MENU_COLORS.elettrodomestici]] : []),
    ...(mass?.configured ? [['musica', 'mdi:music', MENU_TITLES.musica, ...musicSummary(mass), MENU_COLORS.musica]] : []),
    ...(model.history?.rows.length ? [['storico', 'mdi:chart-line', MENU_TITLES.storico, historySummary(), '', MENU_COLORS.storico]] : []),
    ...(model.lab ? [['lab', 'mdi:tools', MENU_TITLES.lab, labSummary(store, model), '', MENU_COLORS.lab]] : []),
    ...(model.rack ? [['rack', 'mdi:server-network', MENU_TITLES.rack, rackSummary(store, model), '', MENU_COLORS.rack]] : []),
    ...(model.settings?.length ? [['impostazioni', 'mdi:cog-outline', MENU_TITLES.impostazioni, settingsSummary(store, model), '', MENU_COLORS.impostazioni]] : []),
  ];
  
  
  const five = items.length === 5;
  const seven = items.length === 7;
  const ten = items.length === 10;
  
  const wifi = `<button class="menu-wifi" data-open="#funzioni/wifi" data-replace>${icon('mdi:qrcode')}<span class="title">${esc(MENU_TITLES.wifi)}</span><span class="sub">${esc(ssid ? 'Mostra QR code' : 'Non configurato')}</span>${icon('mdi:chevron-right', 'icon more')}</button>`;
  return `<div class="menu-grid ${five ? 'five' : seven ? 'seven' : ten ? 'ten' : ''}" style="--cols:${seven || ten ? 12 : five ? 6 : items.length % 4 === 0 ? 4 : 3}">${items
    .map(
      ([id, ic, title, sub, cls, color]) => `
      <button ${id ? `data-open="${id === 'citofono' ? '#citofono' : `#funzioni/${id}`}" data-replace` : 'disabled'} style="--c:${color}">
        ${icon(ic)}
        <span class="text"><span class="title">${esc(title)}</span><span class="sub ${cls}">${esc(sub)}</span></span>
      </button>`,
    )
    .join('')}</div>${wifi}`;
}
