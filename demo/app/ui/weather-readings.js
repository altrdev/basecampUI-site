// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { esc, fmtNumber, fmtTime } from '../core/format.js';
import { EAQI_PM25, airBand } from '../core/air.js';
import { TEMP_COLORS } from './weather.js';

export const MEASURES_STYLES = `
  .m-tile[data-measure-open] { cursor: pointer; }
  .m-tile[data-measure-open]:active { background: var(--bc-border); }
  .m-hero[data-measure-open] { cursor: pointer; }
  .m-hero[data-measure-open] > .chev { margin-left: auto; align-self: flex-start; width: 18px; height: 18px; color: var(--bc-text-2); }
  .m-tile[data-measure-open] .k .chev { margin-left: auto; width: 18px; height: 18px; }
  .zdlg.measure { width: min(640px, 100%); }
  .measure-seg { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 8px; }
  .measure-seg button { min-height: 44px; border-radius: var(--bc-radius-inner); border: 1px solid var(--bc-border-strong); background: var(--bc-surface); font-size: 14px; font-weight: 500; text-align: center; }
  .measure-seg button.on { background: var(--bc-text); border-color: var(--bc-text); color: var(--bc-bg); font-weight: 600; }
  .measure-stats { display: grid; gap: 10px; }
  .measure-stats > span { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 12px; color: var(--bc-text-2); min-width: 0; }
  .measure-stats b { font: 500 22px/1.15 var(--bc-font-display); color: var(--bc-text); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .measure-stats b small { font-size: 12px; color: var(--bc-text-2); font-weight: 400; }
  .measure-stats i { font-style: normal; min-height: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .measure-card { background: var(--bc-surface); border-radius: var(--bc-radius-inner); padding: 14px 14px 10px; }
  .measure-plot { position: relative; margin-left: 40px; height: 150px; touch-action: pan-y; user-select: none; -webkit-user-select: none; }
  .measure-plot svg { display: block; width: 100%; height: 100%; }
  .measure-plot .ref { position: absolute; left: -40px; width: 34px; transform: translateY(-50%); font-size: 10px; text-align: right; color: var(--bc-text-2); opacity: .85; font-variant-numeric: tabular-nums; pointer-events: none; }
  .measure-plot .g-cursor { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px solid var(--bc-text); opacity: .5; pointer-events: none; display: none; }
  .measure-plot .g-dot { position: absolute; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; border: 2px solid var(--bc-bg); pointer-events: none; display: none; }
  .measure-plot .g-tip { position: absolute; top: 2px; padding: 5px 9px; border-radius: 10px; background: var(--bc-bg); border: 1px solid var(--bc-border-strong); font-size: 12px; line-height: 1.35; white-space: pre; pointer-events: none; font-variant-numeric: tabular-nums; display: none; }
  .measure-axis { position: relative; height: 16px; margin: 6px 0 0 40px; font-size: 11px; color: var(--bc-text-2); }
  .measure-axis span { position: absolute; top: 0; white-space: nowrap; }
  .measure-keys { display: flex; gap: 14px; margin: 8px 0 0 40px; font-size: 12px; color: var(--bc-text-2); }
  .measure-keys i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }
  .measure-updated { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 13px; color: var(--bc-text-2); font-variant-numeric: tabular-nums; }
  .measure-updated .icon { width: 16px; height: 16px; }
  
  .measure-wait { margin: 0; box-sizing: border-box; min-height: 293px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 14px; color: var(--bc-text-2); }
`;

const pm25Color = (v) => airBand(EAQI_PM25, v)[2];
export const MEASURES = {
  temperature: {
    title: 'Temperatura', gradient: true, below: 'Fuori casa: media oraria; nei 30 giorni la fascia tra minima e massima di ogni giorno.', unit: '°C', dec: 1, scale: 'stretta', minimum: { hour: 8, day: 8 },
    series: [{ role: 'temperature', type: 'mean', name: 'Media', color: 'var(--bc-text)' }],
    
    band: [{ role: 'temperature', type: 'min', name: 'Minima', color: 'var(--bc-blue)' }, { role: 'temperature', type: 'max', name: 'Massima', color: 'var(--bc-heat)' }],
    step: { '24h': 'hour', '7g': 'hour', '30g': 'day' },
    cells: [{ k: 'Media', f: 'avg' }, { k: 'Minima', f: 'min', s: (h) => (h ? 0 : 1) }, { k: 'Massima', f: 'max', s: (h) => (h ? 0 : 2) }],
  },
  rain: {
    title: 'Pioggia', below: 'Quanta ne è caduta, dalla stazione meteo.', unit: 'mm', dec: 1, bars: true, scale: 'zero', minimum: { hour: 1, day: 5 },
    series: [{ role: 'rain_today', type: 'change', name: 'Pioggia', color: 'var(--bc-blue)' }], step: { '24h': 'hour', '7g': 'day', '30g': 'day' },
    cells: [{ k: 'Totale', f: 'sum' }, { k: (h) => (h ? 'Ora più intensa' : 'Giorno più piovoso'), f: 'max' }],
  },
  wind: {
    title: 'Vento', below: 'Media e raffica massima di ogni ora o giorno.', unit: 'km/h', dec: 1, scale: 'zero', minimum: { hour: 10, day: 10 },
    series: [{ role: 'wind', type: 'mean', name: 'Media', color: 'var(--bc-blue)' }, { role: 'gust', type: 'max', name: 'Raffica', color: 'var(--bc-amber)' }],
    cells: [{ k: 'Vento medio', f: 'avg', s: 0 }, { k: 'Raffica massima', f: 'max', s: 1 }],
  },
  humidity: {
    title: 'Umidità', below: 'Umidità relativa dell\'aria, media oraria o giornaliera.', unit: '%', dec: 0, scale: 'stretta', limits: [0, 100], minimum: { hour: 20, day: 20 },
    series: [{ role: 'humidity', type: 'mean', name: 'Umidità', color: 'var(--bc-blue)' }],
    cells: [{ k: 'Media', f: 'avg' }, { k: 'Minima', f: 'min' }, { k: 'Massima', f: 'max' }],
  },
  pressure: {
    title: 'Pressione', below: 'Pressione relativa al livello del mare.', unit: 'hPa', dec: 1, scale: 'stretta', minimum: { hour: 8, day: 8 },
    series: [{ role: 'pressure', type: 'mean', name: 'Pressione', color: 'var(--bc-violet)' }],
    cells: [{ k: 'Media', f: 'avg' }, { k: 'Minima', f: 'min' }, { k: 'Massima', f: 'max' }],
  },
  sun: {
    title: 'Sole e UV', below: 'Indice UV e radiazione solare.',
    metrics: [
      { id: 'uv', name: 'UV', unit: '', dec: 1, scale: 'zero', minimum: { hour: 6, day: 6 }, series: [{ role: 'uv', type: 'max', name: 'UV massimo', color: 'var(--bc-amber)' }], cells: [{ k: 'Massimo', f: 'max' }, { k: 'Media', f: 'avg' }] },
      { id: 'radiation', name: 'Radiazione', unit: 'W/m²', dec: 0, scale: 'zero', minimum: { hour: 400, day: 400 }, series: [{ role: 'radiation', type: 'mean', name: 'Radiazione', color: 'var(--bc-amber)' }], cells: [{ k: 'Massima', f: 'max' }, { k: 'Media', f: 'avg' }] },
    ],
  },
  pm25: {
    title: 'Aria · PM2.5', below: 'Polveri sottili, media oraria o giornaliera. Il colore segue l\'indice europeo.', unit: 'µg/m³', dec: 0, bars: true, scale: 'zero', minimum: { hour: 15, day: 15 },
    series: [{ role: 'pm25', type: 'mean', name: 'PM2.5', color: 'var(--bc-green)', colorFor: pm25Color }],
    cells: [{ k: 'Media', f: 'avg' }, { k: 'Massima', f: 'max' }],
  },
  
  zone_pm25: {
    title: 'Aria · PM2.5', below: 'Polveri sottili nella stanza, media oraria o giornaliera. Il colore segue l\'indice europeo.', unit: 'µg/m³', dec: 0, bars: true, scale: 'zero', minimum: { hour: 15, day: 15 },
    series: [{ role: 'self', type: 'mean', name: 'PM2.5', color: 'var(--bc-green)', colorFor: pm25Color }],
    cells: [{ k: 'Media', f: 'avg' }, { k: 'Massima', f: 'max' }],
  },
  zone_voc: {
    title: 'Aria · VOC', below: 'Indice VOC nella stanza (1–500, relativo: più basso è meglio), media oraria o giornaliera.', unit: '', dec: 0, scale: 'zero', minimum: { hour: 150, day: 150 },
    series: [{ role: 'self', type: 'mean', name: 'Indice VOC', color: 'var(--bc-violet)' }],
    cells: [{ k: 'Media', f: 'avg' }, { k: 'Massimo', f: 'max' }, { k: 'Minimo', f: 'min' }],
  },
};

const tempColor = (v) => {
  const st = TEMP_COLORS;
  if (v <= st[0][0]) return st[0][1];
  if (v >= st.at(-1)[0]) return st.at(-1)[1];
  const i = st.findIndex(([t]) => t > v);
  const [t0, c0] = st[i - 1], [t1, c1] = st[i];
  const f = (v - t0) / (t1 - t0), h = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
  const a = h(c0), b = h(c1);
  return `rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * f)).join(',')})`;
};

export const MEASURE_PERIODS = [['24h', '24 ore'], ['7g', '7 giorni'], ['30g', '30 giorni']];
const HOUR = 3600_000;
const dayStartOf = (t) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
const dayWord = (t, now) => {
  const days = Math.round((dayStartOf(t) - dayStartOf(now)) / 86400_000);
  return days === 0 ? 'oggi' : days === -1 ? 'ieri' : new Date(t).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '');
};
const hourText = (t) => `${new Date(t).getHours()}:00`;
 
export const activeMeasure = (state) => {
  const m = MEASURES[state.id];
  return m.metrics ? m.metrics.find((x) => x.id === state.metric) ?? m.metrics[0] : m;
};

 
export async function loadMeasure(conn, model, state, now = new Date()) {
  const m = activeMeasure(state);
  const users = (MEASURES[state.id].step ?? { '24h': 'hour', '7g': 'hour', '30g': 'day' })[state.period];
  const hourly = users === 'hour';
  const series = m.band && !hourly ? [...m.series, ...m.band] : m.series;
  const ids = series.map((s) => (s.role === 'self' ? state.entity : model.weather?.[s.role]));
  if (ids.some((i) => !i)) throw new Error('sensore non configurato');
  const n = state.period === '24h' ? 24 : state.period === '7g' ? (hourly ? 168 : 7) : 30;
  const starts = hourly
    ? Array.from({ length: n }, (_, i) => Math.floor(now.getTime() / HOUR) * HOUR - (n - 1 - i) * HOUR)
    : Array.from({ length: n }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1 - i)).getTime());
  const res = await conn.sendMessagePromise({
    type: 'recorder/statistics_during_period',
    start_time: new Date(starts[0]).toISOString(),
    statistic_ids: [...new Set(ids)],
    period: hourly ? 'hour' : 'day',
    types: [...new Set(series.map((s) => s.type))],
  });
  const maps = series.map((s, i) => new Map((res[ids[i]] ?? []).filter((p) => Number.isFinite(p[s.type])).map((p) => [hourly ? Math.round(new Date(p.start).getTime() / HOUR) * HOUR : dayStartOf(new Date(p.start).getTime()), p[s.type]])));
  return { hourly, series, slots: starts.map((t) => ({ t, v: series.map((s, i) => maps[i].get(t) ?? (s.type === 'change' ? 0 : null)) })) };
}

const nice = (range, target = 4) => {
  const raw = range / target, p = 10 ** Math.floor(Math.log10(raw || 1)), f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
};
const num = (v, dec) => fmtNumber(v, dec);
const stamp = (t, hourly, now) => (hourly ? `${dayWord(t, now) === 'oggi' ? '' : `${dayWord(t, now)} `}${hourText(t)}` : dayWord(t, now));

function cellValue(slots, cell, hourly, now) {
  const s = typeof cell.s === 'function' ? cell.s(hourly) : cell.s ?? 0;
  const pts = slots.map((x) => ({ t: x.t, v: x.v[s] })).filter((x) => x.v !== null);
  if (!pts.length) return null;
  if (cell.f === 'sum') return { v: pts.reduce((a, x) => a + x.v, 0) };
  if (cell.f === 'avg') return { v: pts.reduce((a, x) => a + x.v, 0) / pts.length };
  const pick = pts.reduce((b, x) => ((cell.f === 'max' ? x.v > b.v : x.v < b.v) ? x : b), pts[0]);
  return pick.v > 0 || cell.f === 'min' ? { v: pick.v, when: stamp(pick.t, hourly, now) } : { v: pick.v };
}

 
function scrubPoints(m, data, geo, now) {
  const { n, Y, H } = geo;
  const ser = data.series;
  return data.slots.map((slot, i) => {
    const when = stamp(slot.t, data.hourly, now);
    const rows = ser.map((s, k) => (slot.v[k] === null ? null : `${ser.length > 1 ? `${s.name} ` : ''}${num(slot.v[k], m.dec)}${m.unit ? ` ${m.unit}` : ''}`));
    const text = ser.length > 1 ? `${when}\n${rows.filter(Boolean).join('\n') || '—'}` : `${when} · ${rows[0] ?? '—'}`;
    return [text, +(((m.bars ? i + 0.5 : i) / (m.bars ? n : n - 1 || 1)) * 100).toFixed(2), slot.v.map((v) => (v === null || m.bars ? null : +((Y(v) / H) * 100).toFixed(2))), slot.v.map((v) => (v !== null && m.gradient ? tempColor(v) : null))];
  });
}

 
function updatedText(st, now) {
  const iso = st?.last_updated ?? st?.last_changed;
  const t = iso ? new Date(iso).getTime() : NaN;
  if (!Number.isFinite(t)) return '';
  const min = Math.max(0, Math.floor((now.getTime() - t) / 60_000));
  const ago = min < 1 ? 'adesso' : min < 60 ? `${min} min fa` : min < 1440 ? `${Math.floor(min / 60)} h fa` : `${Math.floor(min / 1440)} g fa`;
  const day = dayStartOf(t) === dayStartOf(now.getTime()) ? '' : `${dayWord(t, now.getTime())} `;
  return `Ultimo aggiornamento: ${day}${fmtTime(new Date(t))} · ${ago}`;
}

export function renderMeasureDialog(state, { now = new Date(), store = null, model = null } = {}) {
  if (!state) return '';
  const def = MEASURES[state.id];
  const m = activeMeasure(state);
  const seg = MEASURE_PERIODS.map(([id, label]) => `<button data-measure-period="${id}" class="${state.period === id ? 'on' : ''}">${label}</button>`).join('');
  const metrics = def.metrics ? `<div class="measure-seg">${def.metrics.map((x) => `<button data-measure-metric="${x.id}" class="${m.id === x.id ? 'on' : ''}">${esc(x.name)}</button>`).join('')}</div>` : '';
  const data = state.data;
  const sensor = state.entity ?? model?.weather?.[m.series[0].role];
  const updated = store && sensor ? updatedText(store.get(sensor), now) : '';
  let body = '<p class="measure-wait">Caricamento…</p>';
  if (data?.error) body = '<p class="measure-wait">Storico non disponibile.</p>';
  else if (data?.slots) {
    const slots = data.slots, n = slots.length, ser = data.series;
    const all = slots.flatMap((x) => x.v).filter((v) => v !== null);
    if (!all.length) body = '<p class="measure-wait">Nessun dato in questo periodo.</p>';
    else {
      const users = data.hourly ? 'hour' : 'day';
      const dMin = Math.min(...all), dMax = Math.max(...all);
      let lo = 0, hi = Math.max(dMax, m.minimum?.[users] ?? 1) * 1.1;
      if (m.scale === 'stretta') {
        const pad = Math.max((dMax - dMin) * 0.15, (m.minimum?.[users] ?? 4) / 4);
        lo = dMin - pad; hi = dMax + pad;
        if (hi - lo < (m.minimum?.[users] ?? 8)) { const mid = (hi + lo) / 2; lo = mid - (m.minimum?.[users] ?? 8) / 2; hi = mid + (m.minimum?.[users] ?? 8) / 2; }
        if (m.limits) { lo = Math.max(m.limits[0], lo); hi = Math.min(m.limits[1], hi); }
      }
      const step = nice(hi - lo);
      const W = 480, H = 150;
      const Y = (v) => H - 4 - ((v - lo) / (hi - lo || 1)) * (H - 8);
      const X = (i) => (m.bars ? (i + 0.5) * (W / n) : (i / (n - 1 || 1)) * W);
      const refs = [];
      for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) if (v > lo + step * 0.01 || m.scale !== 'zero') refs.push(v);
      const lines = refs.map((v) => `<line x1="0" x2="${W}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="var(--bc-text-2)" stroke-dasharray="2 4" opacity=".25" vector-effect="non-scaling-stroke"/>`).join('');
      const labels = refs.map((v) => `<span class="ref" style="top:${((Y(v) / H) * 100).toFixed(1)}%">${num(v, step < 1 ? 1 : 0)}</span>`).join('');
      const grad = m.gradient
        ? `<defs><linearGradient id="measureGradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${H}">${TEMP_COLORS.map(([t, c]) => `<stop offset="${Math.max(0, Math.min(1, Y(t) / H)).toFixed(3)}" stop-color="${c}"/>`).reverse().join('')}</linearGradient></defs>`
        : '';
      const paint = (col) => (m.gradient ? 'url(#measureGradient)' : col);
      let marks;
      if (m.bars) {
        const bw = W / n, col = m.series[0].colorFor;
        marks = slots.map((s, i) => {
          const v = s.v[0];
          if (v === null) return '';
          const fill = col ? col(v) : m.series[0].color;
          return v > 0
            ? `<rect x="${(i * bw + bw * 0.14).toFixed(1)}" y="${Y(v).toFixed(1)}" width="${(bw * 0.72).toFixed(1)}" height="${(H - 4 - Y(v) + 4).toFixed(1)}" rx="${n > 14 ? 1.5 : 3}" fill="${fill}"/>`
            : `<rect x="${(i * bw + bw * 0.14).toFixed(1)}" y="${H - 1.5}" width="${(bw * 0.72).toFixed(1)}" height="1.5" fill="var(--bc-text-2)" opacity=".3"/>`;
        }).join('');
      } else {
        const segs = (k) => {
          const out = []; let cur = [];
          slots.forEach((s, i) => { if (s.v[k] === null) { if (cur.length) out.push(cur); cur = []; } else cur.push(`${X(i).toFixed(1)},${Y(s.v[k]).toFixed(1)}`); });
          if (cur.length) out.push(cur);
          return out;
        };
        const band = ser.length === 3
          ? (() => {
              const up = [], down = [];
              const out = [];
              const flush = () => { if (up.length > 1) out.push(`<polygon points="${up.join(' ')} ${down.reverse().join(' ')}" fill="${paint('var(--bc-heat)')}" opacity=".26"/>`); up.length = 0; down.length = 0; };
              slots.forEach((sl, i) => { if (sl.v[1] === null || sl.v[2] === null) return flush(); up.push(`${X(i).toFixed(1)},${Y(sl.v[2]).toFixed(1)}`); down.push(`${X(i).toFixed(1)},${Y(sl.v[1]).toFixed(1)}`); });
              flush();
              return out.join('');
            })()
          : '';
        marks = band + ser.slice(0, ser.length === 3 ? 1 : ser.length).map((s, k) => segs(k).map((pts, j) => `${k === 0 && pts.length > 1 && ser.length !== 3 ? `<polygon points="${pts[0].split(',')[0]},${H} ${pts.join(' ')} ${pts.at(-1).split(',')[0]},${H}" fill="${paint(s.color)}" opacity=".14"/>` : ''}<polyline points="${pts.join(' ')}" fill="none" stroke="${paint(s.color)}" stroke-width="${k === 0 ? 2.5 : 1.8}" ${k > 0 ? 'stroke-dasharray="4 3" opacity=".85"' : ''} stroke-linejoin="round" vector-effect="non-scaling-stroke" data-j="${j}"/>`).join('')).join('');
      }
      
      let axis;
      const lab = (left, text, extra = '') => `<span style="left:${left}%;${extra}">${esc(text)}</span>`;
      if (data.hourly && state.period === '7g') {
        axis = slots.map((s, i) => (new Date(s.t).getHours() === 0 ? lab((i / n) * 100, new Date(s.t).toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '')) : '')).join('');
      } else if (data.hourly) {
        axis = lab(0, hourText(slots[0].t)) + lab(50, hourText(slots[Math.floor(n / 2)].t), 'transform:translateX(-50%)') + lab(100, 'ora', 'transform:translateX(-100%)');
      } else if (n <= 7) {
        axis = slots.map((s, i) => lab(((i + 0.5) / n) * 100, new Date(s.t).toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', ''), 'transform:translateX(-50%)')).join('');
      } else {
        const d = (t) => new Date(t).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).replace('.', '');
        axis = lab(0, d(slots[0].t)) + lab(50, d(slots[Math.floor(n / 2)].t), 'transform:translateX(-50%)') + lab(100, 'oggi', 'transform:translateX(-100%)');
      }
      const cells = m.cells.map((c) => {
        const r = cellValue(slots, c, data.hourly, now);
        const k = typeof c.k === 'function' ? c.k(data.hourly) : c.k;
        return `<span>${esc(k)}<b>${r ? num(r.v, c.f === 'sum' && r.v >= 100 ? 0 : m.dec) : '—'}${m.unit && r ? ` <small>${esc(m.unit)}</small>` : ''}</b><i>${esc(r?.when ?? '')}</i></span>`;
      }).join('');
      const keys = m.gradient ? (ser.length === 3 ? '<div class="measure-keys"><span>Linea: media del giorno</span><span>Fascia: minima e massima</span></div>' : '') : ser.length > 1 ? `<div class="measure-keys">${ser.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
      const geo = { n, Y, H };
      const dots = m.bars ? '' : ser.map((s) => `<i class="g-dot" style="background:${s.color}"></i>`).join('');
      body = `<div class="measure-stats" style="grid-template-columns:repeat(${m.cells.length},minmax(0,1fr))">${cells}</div>
        <div class="measure-card"><div class="measure-plot" data-g-plot data-pts="${esc(JSON.stringify(scrubPoints(m, data, geo, now)))}">${labels}<i class="g-cursor"></i>${dots}<span class="g-tip"></span>
          <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${grad}${lines}${marks}</svg></div><div class="measure-axis">${axis}</div>${keys}</div>`;
    }
  }
  return `
    <div class="zdlg-overlay">
      <div class="zdlg-backdrop" data-measure-close></div>
      <div class="zdlg schedule measure" role="dialog" aria-modal="true" aria-label="${esc(def.title)}">
        <div class="zdlg-head">
          <div class="t"><h3>${esc(def.title)}</h3><p>${esc(def.below)}</p></div>
          <button class="zclose" data-measure-close aria-label="Chiudi">${icon('mdi:close')}</button>
        </div>
        ${metrics}
        <div class="measure-seg">${seg}</div>
        ${body}
        ${updated ? `<p class="measure-updated">${icon('mdi:clock-outline')}${esc(updated)}</p>` : ''}
      </div>
    </div>`;
}

 
export function scrubMeasure(ev) {
  const plot = ev.target.closest?.('[data-g-plot]');
  const svg = plot?.querySelector('svg');
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  if (!rect.width) return;
  let pts;
  try { pts = JSON.parse(plot.dataset.pts); } catch { return; }
  if (!pts.length) return;
  const at = ((ev.clientX - rect.left) / rect.width) * 100;
  const [label, x, ys, cols] = pts.reduce((best, q) => (Math.abs(q[1] - at) < Math.abs(best[1] - at) ? q : best));
  const cursor = plot.querySelector('.g-cursor'), tip = plot.querySelector('.g-tip'), dots = plot.querySelectorAll('.g-dot');
  cursor.style.left = `${x}%`;
  cursor.style.display = 'block';
  dots.forEach((dot, i) => {
    const y = ys[i];
    dot.style.display = y === null || y === undefined ? 'none' : 'block';
    if (y !== null && y !== undefined) { dot.style.left = `${x}%`; dot.style.top = `${Math.max(0, Math.min(100, y))}%`; if (cols?.[i]) dot.style.background = cols[i]; }
  });
  tip.textContent = label;
  tip.style.left = `${x}%`;
  tip.style.transform = x < 50 ? 'translateX(10px)' : 'translateX(calc(-100% - 10px))';
  tip.style.display = 'block';
}
