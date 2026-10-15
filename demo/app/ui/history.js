// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { esc, fmtNumber, fmtTime, fmtWhen, isUnavailable } from '../core/format.js';
import { plain } from '../core/history.js';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
export const PERIODS = [
  ['24h', '24 ore', DAY],
  ['7d', '7 giorni', 7 * DAY],
  ['30d', '30 giorni', 30 * DAY],
];
const PERIOD_MS = Object.fromEntries(PERIODS.map(([id, , ms]) => [id, ms]));
const MAX_ROWS = 60;
const MAX_POINTS = 360;

export const HISTORY_STYLES = `
  .st-search { display: flex; flex-direction: column; gap: 10px; }
  .st-search input {
    width: 100%; min-height: 52px; padding: 0 16px; border-radius: var(--bc-radius-inner); border: 1px solid var(--bc-border-strong);
    background: var(--bc-surface); color: var(--bc-text); font: 400 16px var(--bc-font-text);
  }
  .st-search input:focus-visible { outline: 2px solid var(--bc-blue); outline-offset: 1px; }
  .st-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .st-chips::-webkit-scrollbar { display: none; }
  [data-hscroll].dragging { cursor: grabbing; user-select: none; }
  .st-chips button {
    flex: none; min-height: 40px; padding: 0 16px; border-radius: 20px; border: 1px solid var(--bc-border-strong);
    background: var(--bc-surface); font-size: 14px; white-space: nowrap;
  }
  .st-chips button.on { background: var(--bc-text); border-color: var(--bc-text); color: var(--bc-bg); font-weight: 600; }
  .st-list { display: flex; flex-direction: column; gap: 6px; }
  .st-row { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 60px; padding: 8px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); text-align: left; }
  .st-row:active { background: var(--bc-border); }
  .st-row .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .st-row .n { font-size: 15px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .st-row .a { font-size: 12px; color: var(--bc-text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .st-row .v { flex: none; font-size: 14px; color: var(--bc-text-2); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .st-row .icon { flex: none; width: 18px; height: 18px; color: var(--bc-text-2); }
  .st-note { margin: 0; font-size: 13px; color: var(--bc-text-2); text-align: center; }

  .st-back { display: inline-flex; align-items: center; gap: 4px; align-self: flex-start; min-height: var(--bc-touch); padding: 0 14px 0 6px; border-radius: 22px; font-size: 14px; color: var(--bc-text-2); }
  .st-back .icon { width: 20px; height: 20px; }
  .st-back:active { background: var(--bc-surface); }
  .st-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
  .st-head .t { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .st-head .n { font: 600 20px/1.2 var(--bc-font-display); }
  .st-head .a { font-size: 12px; color: var(--bc-text-2); overflow-wrap: anywhere; }
  .st-head .now { flex: none; font: 500 34px/1 var(--bc-font-display); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .st-head .now small { font-size: 16px; color: var(--bc-text-2); font-weight: 400; }
  .st-head .now.txt { font-size: 22px; }
  .st-periods { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .st-periods button { min-height: 44px; border-radius: var(--bc-radius-inner); border: 1px solid var(--bc-border-strong); background: var(--bc-surface); font-size: 14px; font-weight: 500; text-align: center; }
  .st-periods button.on { background: var(--bc-text); border-color: var(--bc-text); color: var(--bc-bg); font-weight: 600; }
  .st-card { background: var(--bc-surface); border-radius: var(--bc-radius-inner); padding: 14px 14px 10px; }
  .st-plot { position: relative; margin-left: 40px; height: 160px; touch-action: pan-y; user-select: none; -webkit-user-select: none; }
  .st-plot svg { display: block; width: 100%; height: 100%; }
  .st-ref { position: absolute; left: -40px; width: 34px; transform: translateY(-50%); font-size: 10px; text-align: right; color: var(--bc-text-2); opacity: .85; font-variant-numeric: tabular-nums; pointer-events: none; }
  .st-cursor { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px solid var(--bc-text); opacity: .5; pointer-events: none; display: none; }
  .st-dot { position: absolute; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; border: 2px solid var(--bc-bg); pointer-events: none; display: none; }
  .st-tip {
    position: absolute; top: -4px; transform: translate(-50%, -100%); padding: 5px 9px; border-radius: 10px; background: var(--bc-bg);
    border: 1px solid var(--bc-border-strong); font-size: 12px; white-space: nowrap; pointer-events: none; display: none; font-variant-numeric: tabular-nums;
  }
  .st-axis { display: flex; justify-content: space-between; margin: 6px 0 0 40px; font-size: 11px; color: var(--bc-text-2); }
  .st-axis.flush { margin-left: 0; }
  .st-wait { margin: 0; padding: 40px 0; text-align: center; font-size: 14px; color: var(--bc-text-2); }
  .st-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .st-stats > span { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 12px; color: var(--bc-text-2); min-width: 0; }
  .st-stats b { font: 500 22px/1.15 var(--bc-font-display); color: var(--bc-text); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .st-stats b small { font-size: 12px; color: var(--bc-text-2); font-weight: 400; }
  .st-stats i { font-style: normal; min-height: 15px; }
  .st-band { display: flex; height: 44px; border-radius: 10px; overflow: hidden; background: var(--bc-bg); }
  .st-band span { display: block; height: 100%; min-width: 2px; }
  .st-share { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
  .st-share div { display: flex; align-items: center; gap: 10px; font-size: 14px; }
  .st-share .sw, .st-changes .sw { flex: none; width: 12px; height: 12px; border-radius: 4px; }
  .st-share .l { flex: 1; min-width: 0; }
  .st-share .d { color: var(--bc-text-2); font-size: 13px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .st-changes { display: flex; flex-direction: column; gap: 6px; }
  .st-changes div { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 6px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 14px; }
  .st-changes .l { flex: 1; min-width: 0; }
  .st-changes .d { color: var(--bc-text-2); font-size: 13px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .st-src { margin: 0; font-size: 12px; color: var(--bc-text-2); }
  @media (max-width: 600px) { .st-head .now { font-size: 28px; } .st-stats b { font-size: 18px; } .st-plot { height: 140px; } }
`;

export const historySummary = () => 'Grafici dei sensori';
export const historyWatchedIds = (route) => (route?.entity ? [route.entity] : []);

 
export const isNumericEntity = (id, st) => id.startsWith('sensor.') && st && !isUnavailable(st) && Number.isFinite(parseFloat(st.state)) && !Number.isNaN(Number(st.state));

function stats(points, source) {
  let min = points[0], max = points[0];
  let area = 0, span = 0, sum = 0;
  points.forEach((p, i) => {
    const lo = p.lo ?? p.v, hi = p.hi ?? p.v;
    if (lo < (min.lo ?? min.v)) min = p;
    if (hi > (max.hi ?? max.v)) max = p;
    sum += p.v;
    if (source === 'history' && points[i + 1]) {
      const dt = points[i + 1].t - p.t;
      area += p.v * dt;
      span += dt;
    }
  });
  return { min: min.lo ?? min.v, minT: min.t, max: max.hi ?? max.v, maxT: max.t, avg: span ? area / span : sum / points.length };
}

function bucket(points, from, to) {
  if (points.length <= MAX_POINTS) return points;
  const width = (to - from) / MAX_POINTS;
  const groups = new Map();
  for (const p of points) {
    const k = Math.min(MAX_POINTS - 1, Math.floor((p.t - from) / width));
    (groups.get(k) ?? groups.set(k, []).get(k)).push(p);
  }
  return [...groups.values()].map((g) => ({
    t: g.reduce((s, p) => s + p.t, 0) / g.length,
    v: g.reduce((s, p) => s + p.v, 0) / g.length,
    lo: Math.min(...g.map((p) => p.lo ?? p.v)),
    hi: Math.max(...g.map((p) => p.hi ?? p.v)),
  }));
}

export function loadHistory(conn, id, period, numeric, onData) {
  let alive = true;
  const to = Date.now();
  const from = to - PERIOD_MS[period];
  const finish = (data) => alive && onData({ entity: id, period, from, to, ...data });
  const iso = new Date(from).toISOString();

  const history = async () => {
    const res = await conn.sendMessagePromise({ type: 'history/history_during_period', start_time: iso, entity_ids: [id], minimal_response: true, no_attributes: true });
    return (res[id] ?? []).map((s) => ({ t: Math.max(from, (s.lu ?? s.lc ?? 0) * 1000), s: String(s.s) }));
  };

  
  const longTerm = async () => {
    const bucketMs = period === '7d' ? HOUR : DAY;
    const res = await conn.sendMessagePromise({ type: 'recorder/statistics_during_period', start_time: iso, statistic_ids: [id], period: period === '7d' ? 'hour' : 'day', types: ['mean', 'min', 'max', 'change'] });
    const rows = (res[id] ?? []).map((r) => ({ t: typeof r.start === 'number' ? r.start : Date.parse(r.start), ...r })).filter((r) => Number.isFinite(r.t));
    const means = rows.filter((r) => Number.isFinite(r.mean)).map((r) => ({ t: r.t + bucketMs / 2, v: r.mean, lo: r.min ?? r.mean, hi: r.max ?? r.mean }));
    if (means.length >= 2) return { kind: 'line', source: 'stats', points: bucket(means, from, to), stats: stats(means, 'stats') };
    const changes = rows.filter((r) => Number.isFinite(r.change)).map((r) => ({ t: r.t, v: r.change }));
    if (changes.length) return { kind: 'bars', source: 'stats', bucketMs, points: changes, stats: stats(changes, 'stats') };
    return null;
  };

  (async () => {
    try {
      if (numeric) {
        if (period !== '24h') {
          const long = await longTerm().catch(() => null);
          if (!alive) return;
          if (long) return finish(long);
        }
        const rows = await history();
        if (!alive) return;
        const points = rows.map((r) => ({ t: r.t, v: Number(r.s) })).filter((p) => Number.isFinite(p.v));
        if (!points.length) return finish({ kind: 'empty' });
        const shown = bucket([...points, { t: to, v: points.at(-1).v }], from, to);
        return finish({ kind: 'line', source: 'history', points: shown, stats: stats(points, 'history') });
      }
      const rows = await history();
      if (!alive) return;
      if (!rows.length) return finish({ kind: 'empty' });
      const segs = [];
      for (const r of rows) if (segs.at(-1)?.state !== r.s) segs.push({ state: r.s, from: r.t });
      segs.forEach((s, i) => (s.to = segs[i + 1]?.from ?? to));
      const totals = new Map();
      for (const s of segs) totals.set(s.state, (totals.get(s.state) ?? 0) + (s.to - s.from));
      finish({ kind: 'timeline', segs, totals: [...totals].sort((a, b) => b[1] - a[1]) });
    } catch {
      finish({ kind: 'error' });
    }
  })();
  return () => {
    alive = false;
  };
}

const BINARY_LABELS = {
  door: ['Aperta', 'Chiusa'], window: ['Aperta', 'Chiusa'], opening: ['Aperto', 'Chiuso'], garage_door: ['Aperta', 'Chiusa'],
  motion: ['Movimento', 'Nessun movimento'], occupancy: ['Presenza', 'Libero'], presence: ['Presenza', 'Assente'],
  moisture: ['Bagnato', 'Asciutto'], smoke: ['Fumo', 'OK'], gas: ['Gas', 'OK'], problem: ['Problema', 'OK'], safety: ['Pericolo', 'OK'], tamper: ['Manomissione', 'OK'],
  connectivity: ['Connesso', 'Non connesso'], plug: ['Collegato', 'Scollegato'], running: ['In funzione', 'Fermo'], battery_charging: ['In carica', 'Non in carica'], light: ['Luce', 'Buio'], lock: ['Sbloccata', 'Bloccata'],
};
const STATE_LABELS = {
  light: { on: 'Accesa', off: 'Spenta' }, switch: { on: 'Acceso', off: 'Spento' }, input_boolean: { on: 'Acceso', off: 'Spento' },
  lock: { locked: 'Bloccata', unlocked: 'Sbloccata', locking: 'In blocco', unlocking: 'In sblocco', open: 'Aperta', jammed: 'Inceppata' },
  cover: { open: 'Aperta', closed: 'Chiusa', opening: 'In apertura', closing: 'In chiusura', stopped: 'Ferma' },
  climate: { off: 'Spento', heat: 'Riscaldamento', cool: 'Raffrescamento', heat_cool: 'Auto', auto: 'Auto', dry: 'Deumidifica', fan_only: 'Ventilazione' },
  person: { home: 'A casa', not_home: 'Fuori casa' },
  alarm_control_panel: { disarmed: 'Disinserito', armed_home: 'Casa', armed_night: 'Notte', armed_away: 'Fuori', arming: 'In inserimento', pending: 'In attesa', triggered: 'Scattato' },
};

function stateLabel(id, state, deviceClass) {
  if (state === 'unavailable') return 'Non disponibile';
  if (state === 'unknown') return 'Sconosciuto';
  const domain = id.split('.')[0];
  if (domain === 'binary_sensor') {
    const pair = BINARY_LABELS[deviceClass];
    return pair ? pair[state === 'on' ? 0 : 1] : state === 'on' ? 'Attivo' : 'Non attivo';
  }
  return STATE_LABELS[domain]?.[state] ?? state.charAt(0).toUpperCase() + state.slice(1).replace(/_/g, ' ');
}

const decimals = (state) => Math.min(2, String(state).split('.')[1]?.length ?? 0);

function currentText(id, st) {
  if (!st) return '—';
  if (isNumericEntity(id, st)) return `${fmtNumber(st.state, decimals(st.state))}${st.attributes.unit_of_measurement ? ` ${st.attributes.unit_of_measurement}` : ''}`;
  return stateLabel(id, st.state, st.attributes.device_class);
}

function fmtElapsed(ms) {
  const min = Math.round(ms / 60_000);
  if (min < 1) return 'meno di 1 min';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return min % 60 ? `${h} h ${min % 60} min` : `${h} h`;
  const d = Math.floor(h / 24);
  return h % 24 ? `${d} g ${h % 24} h` : `${d} g`;
}

const axisText = (period, t) => {
  const d = new Date(t);
  if (period === '24h') return fmtTime(d);
  if (period === '7d') return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }).replace('.', '');
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).replace('.', '');
};

const axis = (data, flush = false) => `<div class="st-axis${flush ? ' flush' : ''}">${[0, 1, 2, 3, 4].map((i) => `<span>${i === 4 ? 'ora' : esc(axisText(data.period, data.from + ((data.to - data.from) * i) / 4))}</span>`).join('')}</div>`;

const ON_LIKE = new Set(['on', 'open', 'opening', 'unlocked', 'unlocking', 'home', 'heat', 'armed_home', 'armed_away', 'armed_night', 'triggered']);
const OFF_LIKE = new Set(['off', 'closed', 'closing', 'locked', 'locking', 'not_home', 'disarmed', 'idle']);
const PALETTE = ['var(--bc-blue)', 'var(--bc-green)', 'var(--bc-violet)', 'var(--bc-cover)', 'var(--bc-red)'];
const DISABLED = 'repeating-linear-gradient(135deg, #2A2C33 0 4px, #1C1D22 4px 8px)';

function stateColors(totals) {
  const colors = new Map();
  let next = 0;
  for (const [state] of totals) {
    colors.set(state, ON_LIKE.has(state) ? 'var(--bc-amber)' : OFF_LIKE.has(state) ? '#464952' : state === 'unavailable' || state === 'unknown' ? DISABLED : PALETTE[next++ % PALETTE.length]);
  }
  return colors;
}

const LINE_COLORS = { temperature: 'var(--bc-amber)', humidity: 'var(--bc-blue)', battery: 'var(--bc-green)', power: 'var(--bc-amber)', energy: 'var(--bc-amber)', pm25: 'var(--bc-red)', carbon_dioxide: 'var(--bc-violet)' };

function niceTicks(lo, hi) {
  const span = hi - lo || 1;
  const raw = span / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const f = raw / mag;
  const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  const ticks = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + step * 1e-9; t += step) ticks.push(Math.round(t / step) * step);
  return { ticks, step };
}

const W = 520;
const H = 160;

function chart(data, color) {
  const pts = data.points;
  const bars = data.kind === 'bars';
  let lo = Math.min(...pts.map((p) => p.lo ?? p.v));
  let hi = Math.max(...pts.map((p) => p.hi ?? p.v));
  if (bars) lo = Math.min(0, lo);
  const pad = (hi - lo || Math.abs(hi) || 1) * (bars ? 0.05 : 0.12);
  if (!bars || hi > 0) hi += pad;
  if (!bars) lo -= pad;
  const span = hi - lo || 1;
  const X = (t) => ((t - data.from) / (data.to - data.from)) * W;
  const Y = (v) => H - 4 - ((v - lo) / span) * (H - 10);
  const { ticks, step } = niceTicks(lo, hi);
  const digits = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  const grid = ticks.map((t) => `<line x1="0" x2="${W}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" stroke="var(--bc-text-2)" stroke-width="1" stroke-dasharray="2 4" opacity=".25" vector-effect="non-scaling-stroke"/>`).join('');
  const labels = ticks.map((t) => `<span class="st-ref" style="top:${((Y(t) / H) * 100).toFixed(1)}%">${fmtNumber(t, digits)}</span>`).join('');
  let shape;
  if (bars) {
    const w = Math.max(1.5, X(data.from + data.bucketMs) - X(data.from) - (data.period === '7d' ? 0.6 : 3));
    shape = pts.map((p) => `<rect x="${X(p.t).toFixed(1)}" y="${Math.min(Y(p.v), Y(0)).toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(1, Math.abs(Y(p.v) - Y(0))).toFixed(1)}" rx="2" fill="${color}" opacity=".85"/>`).join('');
  } else {
    const line = pts.map((p) => `${X(p.t).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ');
    const banded = pts.some((p) => p.lo !== undefined && (p.lo !== p.v || p.hi !== p.v));
    const band = banded ? `<polygon points="${pts.map((p) => `${X(p.t).toFixed(1)},${Y(p.hi ?? p.v).toFixed(1)}`).join(' ')} ${[...pts].reverse().map((p) => `${X(p.t).toFixed(1)},${Y(p.lo ?? p.v).toFixed(1)}`).join(' ')}" fill="${color}" opacity=".18"/>` : '';
    shape = `${band}<polygon points="${X(pts[0].t).toFixed(1)},${H} ${line} ${X(pts.at(-1).t).toFixed(1)},${H}" fill="${color}" opacity=".08"/>
      <polyline points="${line}" fill="none" stroke="${color}" stroke-width="2.25" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
  }
  return `<div class="st-plot" data-st-plot data-lo="${lo}" data-hi="${hi}">
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${grid}${shape}</svg>${labels}
      <i class="st-cursor"></i><i class="st-dot" style="background:${color}"></i><span class="st-tip"></span>
    </div>${axis(data)}`;
}

export function scrubChart(ev, data, unit) {
  const plot = ev.target.closest?.('[data-st-plot]');
  if (!plot || !data?.points?.length) return;
  const rect = plot.getBoundingClientRect();
  if (!rect.width) return;
  const frac = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
  const t = data.from + frac * (data.to - data.from);
  const p = data.points.reduce((best, q) => (Math.abs(q.t - t) < Math.abs(best.t - t) ? q : best));
  const lo = Number(plot.dataset.lo), hi = Number(plot.dataset.hi);
  const x = ((p.t - data.from) / (data.to - data.from)) * 100;
  const y = ((hi - p.v) / (hi - lo || 1)) * 100;
  const cursor = plot.querySelector('.st-cursor'), dot = plot.querySelector('.st-dot'), tip = plot.querySelector('.st-tip');
  const digits = Math.abs(p.v) >= 100 ? 0 : Math.abs(p.v) >= 10 ? 1 : 2;
  const when = data.kind === 'bars' ? new Date(p.t).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }) : fmtWhen(new Date(p.t).toISOString());
  cursor.style.cssText = `display:block;left:${x}%`;
  dot.style.cssText = `display:block;left:${x}%;top:${Math.max(0, Math.min(100, y))}%;background:${dot.style.background}`;
  tip.textContent = `${fmtNumber(p.v, digits)}${unit ? ` ${unit}` : ''} · ${when}`;
  tip.style.cssText = `display:block;left:${Math.max(18, Math.min(82, x))}%`;
}

export function renderHistory({ store, model, route, ui = {} }) {
  const st = ui.history ?? { q: '', area: null, period: '24h', data: null };
  if (!model.history?.rows.length) return '<p class="placeholder">Nessuna entità con storico.</p>';
  if (route.entity) return renderDetail({ store, model, route, st });
  const { rows, areas } = model.history;
  const words = plain(st.q).split(/\s+/).filter(Boolean);
  const matches = rows.filter((r) => (!st.area || r.area === st.area) && words.every((w) => r.hay.includes(w)));
  const shown = matches.slice(0, MAX_ROWS);
  const found = matches.length;
  const chips = [['', 'Tutte'], ...areas.map((a) => [a.id, a.name])]
    .map(([id, label]) => `<button data-st-area="${esc(id)}" class="${(st.area ?? '') === id ? 'on' : ''}">${esc(label)}</button>`)
    .join('');
  const list = shown.length
    ? shown
        .map((r) => `<button class="st-row" data-open="#funzioni/storico/${esc(r.id)}" data-replace><span class="txt"><span class="n">${esc(r.name)}</span><span class="a">${esc(r.areaName || r.id)}</span></span><span class="v">${esc(currentText(r.id, store.get(r.id)))}</span>${icon('mdi:chevron-right')}</button>`)
        .join('')
    : '<p class="st-note">Nessun risultato.</p>';
  return `
    <div class="st-search">
      <input id="st-q" type="search" data-keyboard inputmode="${ui.kbd ? 'none' : 'search'}" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="Cerca un sensore o un dispositivo" aria-label="Cerca un sensore o un dispositivo">
      <div class="st-chips" data-hscroll>${chips}</div>
    </div>
    <div class="st-list">${list}</div>
    ${found > shown.length ? `<p class="st-note">Primi ${shown.length} di ${found}: scrivi qualcosa per restringere.</p>` : ''}`;
}

function renderDetail({ store, model, route, st }) {
  const id = route.entity;
  const state = store.get(id);
  const row = model.history.rows.find((r) => r.id === id);
  const back = `<button class="st-back" data-open="#funzioni/storico" data-replace>${icon('mdi:chevron-left')}Tutti i sensori</button>`;
  if (!state) return `${back}<p class="placeholder">Entità non trovata.</p>`;
  const numeric = isNumericEntity(id, state);
  const unit = state.attributes.unit_of_measurement ?? '';
  const now = numeric
    ? `<span class="now">${fmtNumber(state.state, decimals(state.state))}${unit ? `<small> ${esc(unit)}</small>` : ''}</span>`
    : `<span class="now txt">${esc(currentText(id, state))}</span>`;
  const head = `<div class="st-head"><div class="t"><span class="n">${esc(model.name(id))}</span><span class="a">${esc(row?.areaName ? `${row.areaName} · ${id}` : id)}</span></div>${now}</div>`;
  const periods = `<div class="st-periods">${PERIODS.map(([p, label]) => `<button data-st-period="${p}" class="${st.period === p ? 'on' : ''}">${label}</button>`).join('')}</div>`;

  const d = st.data && st.data.entity === id && st.data.period === st.period ? st.data : null;
  let body;
  if (!d) body = '<p class="st-wait">Caricamento…</p>';
  else if (d.kind === 'error') body = '<p class="st-wait">Non riesco a leggere lo storico.</p>';
  else if (d.kind === 'empty') body = '<p class="st-wait">Nessun dato in questo periodo.</p>';
  else if (d.kind === 'timeline') body = renderTimeline(d, id, state);
  else {
    const color = LINE_COLORS[state.attributes.device_class] ?? 'var(--bc-blue)';
    const s = d.stats;
    const spanV = s.max - s.min;
    const digits = spanV >= 50 ? 0 : spanV >= 5 ? 1 : 2;
    const u = unit ? `<small> ${esc(unit)}</small>` : '';
    const tile = (label, v, when) => `<span>${label}<b>${fmtNumber(v, digits)}${u}</b><i>${when ? esc(when) : ''}</i></span>`;
    const whenOf = (t) => fmtWhen(new Date(t).toISOString());
    const bars = d.kind === 'bars';
    const total = bars ? d.points.reduce((sum, p) => sum + p.v, 0) : null;
    body = `<div class="st-card">${chart(d, color)}</div>
      <div class="st-stats">${bars ? `${tile('Totale', total, '')}${tile('Media', total / d.points.length, d.period === '7d' ? 'per ora' : 'al giorno')}${tile('Massimo', s.max, whenOf(s.maxT))}` : `${tile('Minimo', s.min, whenOf(s.minT))}${tile('Media', s.avg, '')}${tile('Massimo', s.max, whenOf(s.maxT))}`}</div>
      <p class="st-src">${bars ? 'Variazione del contatore per periodo' : d.source === 'stats' ? 'Medie orarie o giornaliere (fascia: minimo e massimo)' : 'Letture registrate da Home Assistant'} · tocca il grafico per vedere i valori.</p>`;
  }
  return `${back}${head}${periods}${body}`;
}

function renderTimeline(d, id, state) {
  const colors = stateColors(d.totals);
  const total = d.to - d.from;
  const label = (s) => stateLabel(id, s, state.attributes.device_class);
  const band = d.segs.map((s) => `<span title="${esc(label(s.state))}" style="width:${(((s.to - s.from) / total) * 100).toFixed(3)}%;background:${colors.get(s.state)}"></span>`).join('');
  const share = d.totals
    .map(([s, ms]) => `<div><span class="sw" style="background:${colors.get(s)}"></span><span class="l">${esc(label(s))}</span><span class="d">${esc(fmtElapsed(ms))} · ${fmtNumber((ms / total) * 100, ms / total < 0.1 ? 1 : 0)}%</span></div>`)
    .join('');
  const changes = [...d.segs]
    .reverse()
    .slice(0, 12)
    .map((s) => {
      const first = s.from <= d.from;
      return `<div><span class="sw" style="background:${colors.get(s.state)}"></span><span class="l">${esc(label(s.state))}</span><span class="d">${first ? 'già così a inizio periodo' : esc(fmtWhen(new Date(s.from).toISOString()))} · ${esc(fmtElapsed(s.to - s.from))}</span></div>`;
    })
    .join('');
  return `<div class="st-card"><div class="st-band">${band}</div>${axis(d, true)}<div class="st-share">${share}</div></div>
    <section><h3>Ultimi cambi</h3><div class="st-changes">${changes}</div></section>`;
}
