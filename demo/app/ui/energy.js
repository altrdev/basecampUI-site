// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { ICONS } from './icons.js';
import { esc, fmtNumber, stateNumber, stateValue } from '../core/format.js';
import { isolationThresholds } from '../core/alerts.js';
import { loadPunStats, punCard, punWatchedIds } from './energy-pun.js';

export const ENERGY_STYLES = `
  .e-flows { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .e-flow { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .e-flow .k { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--bc-text-2); }
  .e-flow .k .icon { width: 18px; height: 18px; }
  .e-flow .v { font: 500 30px/1.1 var(--bc-font-display); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .e-flow .v small { font-size: 14px; color: var(--bc-text-2); font-weight: 400; }
  .e-flow.solar .v, .e-flow.solar .icon { color: var(--bc-amber); }
  .e-flow.home .v, .e-flow.home .icon { color: var(--bc-blue); }
  .e-flow.export .v, .e-flow.export .icon { color: var(--bc-green); }
  .e-flow.import .v, .e-flow.import .icon { color: var(--bc-red); }
  .e-flowmap { display: block; flex: none; width: 100%; max-width: 480px; margin: 0 auto; height: auto; }
  .e-flowmap .fl-base { fill: none; stroke: var(--bc-border-strong); stroke-width: 2; }
  .e-flowmap .fl-dots { fill: none; stroke-width: 6; stroke-linecap: round; stroke-dasharray: 0 18; animation: fl-move var(--d) linear infinite; }
  @keyframes fl-move { to { stroke-dashoffset: -36; } }
  @media (prefers-reduced-motion: reduce) { .e-flowmap .fl-dots { animation: none; } }
  .e-flowmap .fl-node { fill: var(--bc-surface); stroke-width: 3; }
  .e-flowmap text { text-anchor: middle; font-family: var(--bc-font-display); }
  .e-flowmap .fl-v { font-size: 19px; font-weight: 500; fill: var(--bc-text); font-variant-numeric: tabular-nums; }
  .e-flowmap .fl-v.sm { font-size: 13px; }
  .e-flowmap .fl-v.sm .fl-u { font-size: 9px; }
  .e-flowmap .fl-u { font-size: 11px; fill: var(--bc-text-2); font-weight: 400; }
  .e-flowmap .fl-l { font-size: 12px; fill: var(--bc-text-2); letter-spacing: .04em; }
  .e-flowmap .fl-edge { font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; }
  .e-chart { background: var(--bc-surface); border-radius: var(--bc-radius-inner); padding: 12px 14px 8px; }
  .e-chart h3 { margin-bottom: 8px; }
  .e-chart .plot { position: relative; padding-left: 30px; touch-action: pan-y; user-select: none; -webkit-user-select: none; }
  .e-chart .scrub { position: absolute; left: 30px; right: 0; top: 0; bottom: 0; pointer-events: none; }
  .e-chart .e-cursor { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px solid var(--bc-text); opacity: .5; display: none; }
  .e-chart .e-dot { position: absolute; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; border: 2px solid var(--bc-bg); display: none; }
  .e-chart .e-tip { position: absolute; top: 2px; padding: 5px 9px; border-radius: 10px; background: var(--bc-bg); border: 1px solid var(--bc-border-strong); font-size: 12px; line-height: 1.35; white-space: pre; font-variant-numeric: tabular-nums; display: none; }
  .e-chart svg { display: block; width: 100%; height: 120px; }
  .e-chart .ref { position: absolute; left: 0; transform: translateY(-50%); font-size: 10px; color: var(--bc-text-2); opacity: .8; }
  .e-chart .legend { display: flex; justify-content: space-between; padding-left: 30px; margin-top: 4px; font-size: 12px; color: var(--bc-text-2); }
  .e-keys { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 8px; font-size: 12px; color: var(--bc-text-2); }
  .e-keys i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
  .e-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .e-tile { background: var(--bc-surface); border-radius: var(--bc-radius-inner); padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; }
  .e-tile .k { display: flex; align-items: center; gap: 6px; font: 500 11px var(--bc-font-display); letter-spacing: .08em; text-transform: uppercase; color: var(--bc-text-2); }
  .e-tile .k .icon { width: 16px; height: 16px; }
  .e-tile .v { font: 500 26px var(--bc-font-display); font-variant-numeric: tabular-nums; }
  .e-tile .v small { font-size: 13px; color: var(--bc-text-2); font-weight: 400; }
  .e-tile .s { font-size: 12px; color: var(--bc-text-2); }
  .e-tile .s b { color: var(--bc-text); font-weight: 500; font-variant-numeric: tabular-nums; }
  .e-tile .s.ok { color: var(--bc-green); }
  .e-tile .s.warn { color: var(--bc-amber); }
  .e-totals { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 12px; font-size: 12px; color: var(--bc-text-2); }
  .e-totals b { display: block; font: 500 17px var(--bc-font-display); font-variant-numeric: tabular-nums; color: var(--bc-text); }
  .e-totals .solar { color: var(--bc-amber); }
  .e-totals .home { color: var(--bc-blue); }
  .e-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; align-items: end; }
  .e-day { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; color: var(--bc-text-2); }
  .e-day .bars { display: flex; align-items: flex-end; gap: 3px; height: 90px; }
  .e-day .bars span { width: 12px; border-radius: 3px 3px 0 0; min-height: 2px; }
  .e-day .bars .p { background: var(--bc-amber); }
  .e-day .bars .c { background: var(--bc-blue); opacity: .75; }
  .e-day .n { font: 500 13px var(--bc-font-display); font-variant-numeric: tabular-nums; color: var(--bc-amber); }
  .e-tile.wide { grid-column: 1 / -1; }
  .e-keys i.dash { width: 14px; height: 0; border-radius: 0; border-top: 2px dashed var(--bc-amber); opacity: .8; vertical-align: 3px; }
  .e-fc { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .e-inv { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px 12px; font-size: 12px; color: var(--bc-text-2); }
  .e-inv > span { min-width: 0; }
  .e-inv b { display: block; font: 500 17px var(--bc-font-display); font-variant-numeric: tabular-nums; color: var(--bc-text); white-space: nowrap; }
  .e-inv b small { font-size: 12px; color: var(--bc-text-2); font-weight: 400; }
  .e-inv i { font-style: normal; }
  
  .e-inv .text b { white-space: normal; overflow-wrap: anywhere; line-height: 1.25; }
  .e-inv .ok b, .e-inv .ok i { color: var(--bc-green); }
  .e-inv .warn b, .e-inv .warn i { color: var(--bc-amber); }
  .e-inv .alert b, .e-inv .alert i { color: var(--bc-red); }
  .e-period { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .e-dev { display: flex; flex-direction: column; gap: 8px; }
  .e-dev-row { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) 128px; align-items: center; gap: 10px; font-size: 14px; }
  .e-dev-row .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .e-dev-row .bar { height: 6px; border-radius: 3px; background: var(--bc-border-strong); overflow: hidden; }
  .e-dev-row .bar span { display: block; height: 100%; border-radius: 3px; background: var(--bc-blue); }
  .e-dev-row .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .e-dev-row .num small { margin-left: 6px; font-size: 12px; color: var(--bc-text-2); }
  .e-src { font-size: 12px; color: var(--bc-text-2); }
  .e-wait { font-size: 13px; color: var(--bc-text-2); padding: 8px 0; }
  @media (max-width: 600px) {
    .e-flows { gap: 6px; }
    .e-flow { padding: 10px; }
    .e-flow .v { font-size: 22px; }
    .e-flow .v small { font-size: 12px; }
    .e-tile .v { font-size: 22px; }
    .e-day .bars { height: 70px; }
    .e-inv { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .e-day .bars span { width: 9px; }
  }
`;

const DAY = 86_400_000;
const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function energyWatchedIds(model) {
  const { grid_positive, flows = [], ...ids } = model.energy ?? {};
  return [...Object.values(ids), ...punWatchedIds(model.energy), ...flows.flatMap((l) => [l.power, l.only_if])].filter((id) => typeof id === 'string');
}

export function loadEnergy(conn, model, onData) {
  const e = model.energy ?? {};
  const data = { hours: null, days: null, forecast: null, devices: null, pun: null };
  let alive = true;
  const done = () => alive && onData(data);
  const stats = (ids, start, period, types) =>
    conn.sendMessagePromise({ type: 'recorder/statistics_during_period', start_time: start.toISOString(), statistic_ids: ids, period, types, units: { energy: 'kWh', power: 'W' } });

  const today = startOfDay();
  stats([e.production, e.consumption].filter(Boolean), today, 'hour', ['mean'])
    .then((res) => {
      const hour = (id) => Object.fromEntries((res[id] ?? []).map((p) => [new Date(p.start).getHours(), p.mean]));
      data.hours = { solar: hour(e.production), home: hour(e.consumption) };
      done();
    })
    .catch(() => {});

  const yearStart = new Date(today.getFullYear(), 0, 1);
  const daily = [e.produced_today, e.imported_total, e.exported_total].filter(Boolean);
  if (daily.length === 3) {
    stats(daily, yearStart, 'day', ['change'])
      .then((res) => {
        const byDay = new Map();
        const put = (id, key) => {
          for (const p of res[id] ?? []) {
            const k = startOfDay(new Date(p.start)).getTime();
            byDay.set(k, { ...(byDay.get(k) ?? { start: k }), [key]: Math.max(0, p.change ?? 0) });
          }
        };
        put(e.produced_today, 'solar');
        put(e.imported_total, 'imported');
        put(e.exported_total, 'exported');
        data.days = [...byDay.values()].sort((a, b) => a.start - b.start).map(cleanDay);
        done();
      })
      .catch(() => {});
  }

  conn
    .sendMessagePromise({ type: 'energy/solar_forecast' })
    .then((res) => {
      
      
      
      const wh = new Map();
      for (const f of Object.values(res ?? {})) {
        for (const [t, v] of Object.entries(f.wh_hours ?? {})) {
          const d = new Date(Date.parse(t) - 1);
          d.setMinutes(0, 0, 0);
          wh.set(d.getTime(), (wh.get(d.getTime()) ?? 0) + v);
        }
      }
      data.forecast = wh;
      done();
    })
    .catch(() => {});

  
  conn
    .sendMessagePromise({ type: 'energy/get_prefs' })
    .then((prefs) => {
      const list = (prefs.device_consumption ?? []).filter((d) => d.stat_consumption);
      if (!list.length) return null;
      return stats(list.map((d) => d.stat_consumption), new Date(today.getTime() - 6 * DAY), 'day', ['change']).then((res) => {
        const t0 = today.getTime();
        data.devices = list.map((d) => {
          const days = res[d.stat_consumption] ?? [];
          const sum = (arr) => arr.reduce((s, p) => s + Math.max(0, p.change ?? 0), 0);
          return { id: d.stat_consumption, name: d.name, kwh: sum(days), today: sum(days.filter((p) => p.start >= t0)) };
        });
        done();
      });
    })
    .catch(() => {});

  
  loadPunStats(conn, model, (pun) => {
    data.pun = pun;
    done();
  });

  return () => {
    alive = false;
  };
}

function cleanDay(d) {
  const solar = d.solar > 240 ? null : d.solar ?? null;
  const exported = solar === null ? null : Math.min(d.exported ?? 0, solar);
  const imported = d.imported > 240 ? null : d.imported ?? null;
  const home = solar === null || imported === null ? null : solar - exported + imported;
  return { start: d.start, solar, exported, imported, home };
}

 
function totals(days) {
  const ok = days.filter((d) => d.home !== null);
  const sum = (k) => ok.reduce((s, d) => s + d[k], 0);
  const solar = sum('solar'), home = sum('home'), exported = sum('exported'), imported = sum('imported');
  return {
    solar, home, exported, imported, n: ok.length,
    self: solar > 0 ? (solar - exported) / solar : null,
    cover: home > 0 ? (home - imported) / home : null,
  };
}

const STANDBY = { 'no irradiation': 'niente sole', initializing: 'avvio', 'detecting irradiation': 'rileva il sole', 'detecting insulation resistance': 'verifica isolamento' };
function inverterStatus(status) {
  if (status === null) return ['Non disponibile', '', ''];
  if (/^on-grid/i.test(status)) return ['In rete', 'ok', ''];
  const m = /^standby(?::\s*(.*))?$/i.exec(status);
  if (m) return ['In attesa', '', m[1] ? STANDBY[m[1].toLowerCase()] ?? m[1] : ''];
  const [head, ...rest] = status.split(/:\s*/);
  return [head, 'warn', rest.join(': ')];
}

const fmtW = (w) => (w === null ? ['—', ''] : Math.abs(w) < 1000 ? [fmtNumber(w, 0), 'W'] : [fmtNumber(w / 1000, 2), 'kW']);

function flowDiagram(solar, home, grid, loads) {
  const S = Math.max(0, solar ?? 0), G = grid ?? 0;
  const toGrid = Math.max(0, G), fromGrid = Math.max(0, -G);
  const toHome = Math.max(0, S - toGrid);
  const ON = 2;
  const speed = (w) => `${Math.min(4, Math.max(0.5, 4 / (1 + w / 800))).toFixed(2)}s`;
  const edge = (d, w, color, lx, ly, anchor = 'middle') => {
    const on = w !== null && w >= ON;
    const [v, u] = fmtW(w);
    return `<path d="${d}" class="fl-base" style=""/>${on ? `<path d="${d}" class="fl-dots" style="stroke:${color};--d:${speed(w)}"/>${lx === null ? '' : `<text x="${lx}" y="${ly}" class="fl-edge" fill="${color}" style="text-anchor:${anchor}">${v} ${u}</text>`}` : ''}`;
  };
  const node = (x, y, ic, color, w, label, { r = 44, lx = x, ly = y + r + 20, anchor = 'middle', small = false } = {}) => {
    const [v, u] = fmtW(w);
    return `
    <circle cx="${x}" cy="${y}" r="${r}" class="fl-node" style="stroke:${color}"/>
    <svg x="${x - (small ? 9 : 12)}" y="${y - (small ? 22 : 32)}" width="${small ? 18 : 24}" height="${small ? 18 : 24}" viewBox="0 0 24 24"><path d="${ICONS[ic.replace(/^mdi:/, '')] ?? ''}" fill="${color}"/></svg>
    <text x="${x}" y="${y + (small ? 12 : 18)}" class="${small ? 'fl-v sm' : 'fl-v'}" style="">${v}<tspan class="fl-u"> ${u}</tspan></text>
    <text x="${lx}" y="${ly}" class="fl-l" style="text-anchor:${anchor}">${esc(label)}</text>`;
  };
  const gridColor = fromGrid >= ON ? 'var(--bc-red)' : toGrid >= ON ? 'var(--bc-green)' : 'var(--bc-text-2)';
  
  const right = loads.filter((l) => !l.temp).slice(0, 4);
  const below = [...loads.filter((l) => l.temp), ...loads.filter((l) => !l.temp).slice(4)].slice(0, 3);
  const ys = { 0: [], 1: [200], 2: [146, 254], 3: [96, 200, 304], 4: [70, 166, 262, 358] }[right.length];
  const rightH = { 4: 424, 3: 364, 2: 316 }[right.length] ?? 272;
  const by = right.length >= 4 ? 424 : 330;
  const bxs = { 1: [260], 2: [195, 325], 3: [150, 260, 370] }[below.length] ?? [];
  const devices = [
    ...right.map((l, i) => {
      const y = ys[i];
      return `${edge(`M304 200 C366 200 366 ${y} 406 ${y}`, l.w, l.color, null)}
      ${node(440, y, l.icon, l.color, l.w, l.name, { r: 36, small: true, ly: y + 52 })}`;
    }),
    ...below.map((l, i) => `${edge(`M260 244 C260 ${by - 70} ${bxs[i]} ${by - 70} ${bxs[i]} ${by - 36}`, l.w, l.color, null)}
      ${node(bxs[i], by, l.icon, l.color, l.w, l.name, { r: 36, small: true, ly: by + 52 })}`),
  ];
  const box = `0 0 520 ${below.length ? Math.max(rightH, by + 64) : rightH}`;
  return `<svg class="e-flowmap" viewBox="${box}" role="img" aria-label="Flussi di energia">
    ${edge('M216 60 Q80 60 80 156', toGrid, 'var(--bc-green)', 100, 70, 'end')}
    ${edge('M260 104 L260 156', toHome, 'var(--bc-amber)', 270, 136, 'start')}
    ${edge('M124 200 L216 200', fromGrid, 'var(--bc-red)', 170, 190)}
    ${devices.join('')}
    ${node(260, 60, 'solar-power', 'var(--bc-amber)', solar === null ? null : S, 'Solare', { lx: 314, ly: 65, anchor: 'start' })}
    ${node(80, 200, 'transmission-tower', gridColor, grid === null ? null : Math.abs(G), fromGrid >= ON ? 'Rete · prelievo' : toGrid >= ON ? 'Rete · immissione' : 'Rete')}
    ${node(260, 200, 'home-lightning-bolt-outline', 'var(--bc-blue)', home, 'Casa', below.length ? { lx: 212, ly: 250, anchor: 'end' } : {})}
  </svg>`;
}

const pct = (v) => (v === null ? '—' : `${fmtNumber(v * 100, 0)}%`);
const kwh = (v) => fmtNumber(v, v !== null && v >= 100 ? 0 : 1);

 
export function scrubEnergy(ev) {
  const plot = ev.target.closest?.('[data-e-plot]');
  const svg = plot?.querySelector('svg');
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  if (!rect.width) return;
  let pts;
  try { pts = JSON.parse(plot.dataset.pts); } catch { return; }
  if (!pts.length) return;
  const at = ((ev.clientX - rect.left) / rect.width) * 100;
  const [label, x, ySol, yCon] = pts.reduce((best, q) => (Math.abs(q[1] - at) < Math.abs(best[1] - at) ? q : best));
  const cursor = plot.querySelector('.e-cursor'), dots = plot.querySelectorAll('.e-dot'), tip = plot.querySelector('.e-tip');
  cursor.style.left = `${x}%`;
  cursor.style.display = 'block';
  [ySol, yCon].forEach((y, i) => {
    dots[i].style.display = y === null ? 'none' : 'block';
    if (y !== null) { dots[i].style.left = `${x}%`; dots[i].style.top = `${Math.max(0, Math.min(100, y))}%`; }
  });
  tip.textContent = label;
  
  tip.style.left = `${x}%`;
  tip.style.transform = x < 50 ? 'translateX(10px)' : 'translateX(calc(-100% - 10px))';
  tip.style.display = 'block';
}

export function renderEnergy({ store, model, ui }) {
  const e = model.energy ?? {};
  const d = ui.energy ?? {};
  const n = (id) => stateNumber(store, id);
  const raw = (id) => stateValue(store, id);
  const now = new Date();

  
  const solar = n(e.production), home = n(e.consumption);
  let grid = n(e.grid);
  if (grid !== null && e.grid_positive === 'prelievo') grid = -grid;
  const kw = (w) => (w === null ? '—' : fmtNumber(w / 1000, 2));
  
  const loads = (e.flows ?? [])
    .filter((l) => !l.only_if || store.get(l.only_if)?.state === 'on')
    
    .map((l) => ({ name: l.name ?? model.name(l.power), icon: l.icon ?? 'mdi:flash', color: l.color ?? 'var(--bc-blue)', w: n(l.power) === null ? null : n(l.power) * (store.get(l.power)?.attributes?.unit_of_measurement === 'kW' ? 1000 : 1), min: l.only_above_w, temp: Boolean(l.only_if) || l.only_above_w !== undefined }))
    .filter((l) => l.min === undefined || (l.w !== null && l.w > l.min));

  
  let chart = '<p class="e-wait">Caricamento…</p>';
  if (d.hours) {
    const nowH = now.getHours();
    const sol = Array.from({ length: 24 }, (_, h) => (h < nowH ? d.hours.solar[h] ?? null : h === nowH ? solar : null));
    const con = Array.from({ length: 24 }, (_, h) => (h < nowH ? d.hours.home[h] ?? null : h === nowH ? home : null));
    const today = startOfDay(now).getTime();
    const fc = Array.from({ length: 24 }, (_, h) => d.forecast?.get(today + h * 3600_000) ?? null);
    const max = Math.max(1000, ...sol, ...con, ...fc.map((v) => v ?? 0)) * 1.08;
    const W = 480, H = 110;
    const X = (h) => (h / 24) * W + W / 48, Y = (v) => H - 4 - (v / max) * (H - 10);
    const line = (arr) => arr.map((v, h) => (v === null ? null : `${X(h).toFixed(1)},${Y(v).toFixed(1)}`)).filter(Boolean).join(' ');
    const solPts = line(sol);
    const solIdx = sol.map((v, h) => (v === null ? -1 : h)).filter((h) => h >= 0);
    const area = solIdx.length > 1 ? `<polygon points="${X(solIdx[0]).toFixed(1)},${H} ${solPts} ${X(solIdx.at(-1)).toFixed(1)},${H}" fill="var(--bc-amber)" opacity=".22"/>` : '';
    
    const lit = (h) => fc[h] > 0 || fc[h - 1] > 0 || fc[h + 1] > 0;
    const fcPts = line(fc.map((v, h) => (lit(h) ? v ?? 0 : null)));
    const step = max > 6000 ? 2000 : 1000;
    const refs = [];
    for (let v = step; v < max; v += step) refs.push(v);
    const refLines = refs.map((v) => `<line x1="0" x2="${W}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="var(--bc-text-2)" stroke-dasharray="2 4" opacity=".25" vector-effect="non-scaling-stroke"/>`).join('');
    const refLabels = refs.map((v) => `<span class="ref num" style="top:${((Y(v) / H) * 100).toFixed(1)}%">${v / 1000} kW</span>`).join('');
    const nowX = X(nowH + now.getMinutes() / 60 - 0.5);
    
    const scrub = [];
    for (let h = 0; h < 24; h++) {
      const rows = [sol[h] !== null && ['Produzione', sol[h]], con[h] !== null && ['Consumo', con[h]], fc[h] > 0 && ['Previsione solare', fc[h]]].filter(Boolean);
      if (!rows.length) continue;
      scrub.push([`${h}:00\n${rows.map(([k, v]) => `${k} ${kw(v)} kW`).join('\n')}`, +((X(h) / W) * 100).toFixed(2), sol[h] === null ? null : +((Y(sol[h]) / H) * 100).toFixed(2), con[h] === null ? null : +((Y(con[h]) / H) * 100).toFixed(2)]);
    }
    chart = `<div class="plot" data-e-plot data-pts="${esc(JSON.stringify(scrub))}">${refLabels}<div class="scrub"><i class="e-cursor"></i><i class="e-dot" style="background:var(--bc-amber)"></i><i class="e-dot" style="background:var(--bc-blue)"></i><span class="e-tip"></span></div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      ${refLines}
      ${area}
      ${fcPts ? `<polyline points="${fcPts}" fill="none" stroke="var(--bc-amber)" stroke-width="2" stroke-dasharray="4 4" opacity=".6" vector-effect="non-scaling-stroke"/>` : ''}
      <polyline points="${solPts}" fill="none" stroke="var(--bc-amber)" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <polyline points="${line(con)}" fill="none" stroke="var(--bc-blue)" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <line x1="${nowX}" x2="${nowX}" y1="0" y2="${H}" stroke="var(--bc-text)" stroke-width="1" opacity=".35" vector-effect="non-scaling-stroke"/>
    </svg></div>
    <div class="legend"><span>0:00</span><span>6:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
    <div class="e-keys"><span><i style="background:var(--bc-amber)"></i>Produzione</span><span><i style="background:var(--bc-blue)"></i>Consumo</span>${fcPts ? '<span><i class="dash"></i>Previsione solare</span>' : ''}</div>`;
  }

  
  const pToday = n(e.produced_today), iToday = n(e.imported_today), xToday = n(e.exported_today);
  const hToday = pToday === null || iToday === null || xToday === null ? null : Math.max(0, pToday - Math.min(xToday, pToday) + iToday);
  const selfToday = pToday > 0 && xToday !== null ? (pToday - Math.min(xToday, pToday)) / pToday : null;
  const coverToday = hToday > 0 && iToday !== null ? (hToday - iToday) / hToday : null;

  
  const fToday = n(e.forecast_today), fLeft = n(e.forecast_remaining), fTomorrow = n(e.forecast_tomorrow);

  
  let fcPace = '';
  if (d.forecast?.size && pToday !== null) {
    const t0 = startOfDay(now).getTime(), nowH = now.getHours();
    const fc = (h) => d.forecast.get(t0 + h * 3600_000) ?? 0;
    let expected = fc(nowH) * (now.getMinutes() / 60);
    for (let h = 0; h < nowH; h++) expected += fc(h);
    if (expected >= 100) {
      const ratio = (pToday * 1000) / expected;
      fcPace = `<span class="s ${ratio >= 0.9 ? 'ok' : ratio < 0.6 ? 'warn' : ''}">finora <b>${kwh(pToday)}</b> kWh su <b>${kwh(expected / 1000)}</b> previsti a quest'ora (${fmtNumber(ratio * 100, 0)}%)</span>`;
    }
  }

  
  const days = d.days ?? null;
  let week = '<p class="e-wait">Caricamento…</p>';
  let period = '';
  if (days) {
    const todayKey = startOfDay(now).getTime();
    const past = days.filter((x) => x.start < todayKey);
    const todayRow = { start: todayKey, solar: pToday, exported: xToday === null ? null : Math.min(xToday, pToday ?? 0), imported: iToday, home: hToday };
    const last7 = [...past.slice(-6), todayRow];
    const max = Math.max(1, ...last7.flatMap((x) => [x.solar ?? 0, x.home ?? 0]));
    week = `<div class="e-days">${last7
      .map((x, i) => {
        const name = i === last7.length - 1 ? 'Oggi' : new Date(x.start).toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '');
        return `<div class="e-day"><span class="n">${fmtNumber(x.solar, 0)}</span><div class="bars"><span class="p" style="height:${((x.solar ?? 0) / max) * 100}%"></span><span class="c" style="height:${((x.home ?? 0) / max) * 100}%"></span></div><span>${esc(name.charAt(0).toUpperCase() + name.slice(1))}</span></div>`;
      })
      .join('')}</div>
      <div class="e-keys"><span><i style="background:var(--bc-amber)"></i>Prodotti (kWh)</span><span><i style="background:var(--bc-blue);opacity:.75"></i>Consumati</span></div>`;

    
    const all = [...past, todayRow];
    const month = totals(all.filter((x) => new Date(x.start).getMonth() === now.getMonth()));
    const year = totals(all);
    const since = days.length && days[0].start > new Date(now.getFullYear(), 0, 1).getTime()
      ? ` · dal ${new Date(days[0].start).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}`
      : '';
    const block = (title, t) => `<div class="e-tile"><span class="k">${icon('mdi:calendar-month-outline')}${esc(title)}</span>
      <div class="e-totals"><span>Prodotti<b class="solar">${kwh(t.solar)}</b></span><span>Consumati<b class="home">${kwh(t.home)}</b></span>
        <span>Prelevati<b>${kwh(t.imported)}</b></span><span>Immessi<b>${kwh(t.exported)}</b></span></div>
      <div class="s">Autosufficienza <b>${pct(t.cover)}</b> · autoconsumo <b>${pct(t.self)}</b></div></div>`;
    const monthName = now.toLocaleDateString('it-IT', { month: 'long' });
    period = `<div class="e-period">${block(monthName.charAt(0).toUpperCase() + monthName.slice(1), month)}${block(`${now.getFullYear()}${since}`, year)}</div>`;
  }

  
  let devices = '';
  if (d.devices) {
    const top = d.devices.filter((x) => x.kwh >= 0.05).sort((a, b) => b.kwh - a.kwh).slice(0, 8);
    const max = top[0]?.kwh || 1;
    devices = top.length
      ? `<section><h3>Consumi misurati · ultimi 7 giorni</h3><div class="e-dev">${top
          .map((x) => `<div class="e-dev-row"><span class="name">${esc(x.name ?? model.name(x.id))}</span><span class="bar"><span style="width:${(x.kwh / max) * 100}%"></span></span><span class="num">${kwh(x.kwh)} kWh<small>oggi ${kwh(x.today)}</small></span></div>`)
          .join('')}</div></section>`
      : '';
  }

  
  const optOn = n(e.optimizers_online), optAll = n(e.optimizers_total);
  const [statusText, statusTone, statusNote] = inverterStatus(raw(e.inverter_state));
  
  const asleep = statusText === 'In attesa';
  
  const insulation = n(e.insulation);
  const [warnAt, critAt] = isolationThresholds(model);
  const [insulationText, insulationTone] = insulation === null ? ['', ''] : insulation < critAt ? ['critico', 'alert'] : insulation < warnAt ? ['basso', 'warn'] : ['ok', 'ok'];
  const temp = n(e.inverter_temperature);
  
  const hz = n(e.grid_frequency);
  const volts = [e.grid_voltage_a, e.grid_voltage_b, e.grid_voltage_c].map(n).filter((v) => v !== null && v > 50);
  const gv = model.alerts?.grid ?? {};
  const vOut = volts.some((v) => v < (gv.voltage_min ?? 207) || v > (gv.voltage_max ?? 253));
  const vLow = Math.min(...volts), vHigh = Math.max(...volts);
  
  const co2 = n(e.grid_co2), fossil = n(e.grid_fossil);
  const co2Tile = co2 === null
    ? ''
    : `<div class="e-tile wide"><span class="k">${icon('mdi:molecule-co2')}Rete elettrica</span>
        <div class="e-fc"><span class="v">${fmtNumber(co2, 0)} <small>gCO₂/kWh</small></span>
          ${fossil === null ? '' : `<span class="s"><b>${fmtNumber(fossil, 0)}%</b> da fonti fossili · Electricity Maps</span>`}</div></div>`;
  const pun = punCard({ store, model, ui, now });
  const cell = (label, value, note = '', tone = '') => `<span class="${tone}">${esc(label)}<b>${value}</b>${note ? `<i>${esc(note)}</i>` : ''}</span>`;

  return `
    ${flowDiagram(solar, home, grid, loads)}
    <div class="e-chart"><h3>Oggi · potenza ora per ora</h3>${chart}</div>
    <div class="e-grid">
      <div class="e-tile"><span class="k">${icon('mdi:calendar-today')}Oggi</span>
        <div class="e-totals"><span>Prodotti<b class="solar">${kwh(pToday)}</b></span><span>Consumati<b class="home">${kwh(hToday)}</b></span>
          <span>Prelevati<b>${kwh(iToday)}</b></span><span>Immessi<b>${kwh(xToday)}</b></span></div>
        <div class="s">kWh</div></div>
      <div class="e-tile"><span class="k">${icon('mdi:home-battery-outline')}Autosufficienza</span>
        <div class="v">${pct(coverToday)}</div>
        <div class="s">del consumo coperto dal solare oggi</div>
        <div class="s">Autoconsumo <b>${pct(selfToday)}</b> della produzione</div></div>
      <div class="e-tile wide"><span class="k">${icon('mdi:weather-sunny')}Previsione solare</span>
        <div class="e-fc"><span class="v">${kwh(fToday)} <small>kWh oggi</small></span>
          <span class="s">ancora <b>${kwh(fLeft)}</b> kWh · domani <b>${kwh(fTomorrow)}</b> kWh</span></div>
        ${fcPace}</div>
      <div class="e-tile wide"><span class="k">${icon('mdi:solar-panel')}Inverter</span>
        <div class="e-inv">
          ${cell('Stato', esc(statusText), statusNote, `${statusTone} text`)}
          ${cell('Isolamento', insulation === null ? '—' : `${fmtNumber(insulation, 2)} <small>MΩ</small>`, insulationText, insulationTone)}
          ${cell('Tensione di rete', volts.length ? `${fmtNumber(vLow, 0)}${vHigh - vLow >= 1 ? `–${fmtNumber(vHigh, 0)}` : ''} <small>V</small>` : '—', volts.length ? 'tra le fasi' : '', vOut ? 'warn' : '')}
          ${cell('Frequenza', hz === null || hz < 40 ? '—' : `${fmtNumber(hz, 2)} <small>Hz</small>`, '', hz !== null && hz >= 40 && (hz < 49.5 || hz > 50.5) ? 'warn' : '')}
          ${cell('Temperatura', temp === null || (asleep && temp === 0) ? '—' : `${fmtNumber(temp, 0)}°`, '', temp !== null && temp >= 70 ? 'warn' : '')}
          ${cell('Picco oggi', `${kw(n(e.peak_today))} <small>kW</small>`)}
          ${cell('Ottimizzatori', `${fmtNumber(optOn, 0)}/${fmtNumber(optAll, 0)}`, 'online', !asleep && optOn !== null && optAll !== null && optOn < optAll ? 'warn' : '')}
          ${cell('Prodotti in totale', `${fmtNumber(n(e.produced_total), 0)} <small>kWh</small>`)}
          ${cell('Esportati in totale', `${fmtNumber(n(e.exported_total), 0)} <small>kWh</small>`)}
          ${cell('Importati in totale', `${fmtNumber(n(e.imported_total), 0)} <small>kWh</small>`)}
        </div></div>
    </div>
    <section><h3>Ultimi 7 giorni</h3>${week}</section>
    ${period}
    ${devices}
    ${pun || co2Tile ? `<div class="e-grid">${pun}${co2Tile}</div>` : ''}
    <p class="e-src">Inverter solare · Previsione: Forecast.Solar · Dispositivi: dashboard Energia di HA · Rack: stima dalla corrente dell'UPS</p>`;
}
