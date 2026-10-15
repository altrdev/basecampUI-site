// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { EAQI_PM25, airBand, airBandPos } from '../core/air.js';
import { icon } from './base.js';
import { esc, fmtNumber, fmtTime, isUnavailable } from '../core/format.js';
import { CONDITIONS, cardinal } from './bc-weather.js';

export const WEATHER_STYLES = `
  .m-hero { display: flex; align-items: center; gap: 18px; }
  .m-hero > .icon { width: 64px; height: 64px; color: var(--bc-amber); }
  .m-hero .t { font: 500 60px/1 var(--bc-font-display); font-variant-numeric: tabular-nums; }
  .m-hero .t small { font-size: .45em; vertical-align: top; color: var(--bc-text-2); }
  .m-hero .side { display: flex; flex-direction: column; gap: 3px; font-size: 14px; color: var(--bc-text-2); }
  .m-hero .side b { color: var(--bc-text); font-weight: 500; }
  .m-hero .pair { white-space: nowrap; color: var(--bc-text-2); }
  .m-hero .pair .icon { display: inline-block; width: 15px; height: 15px; margin-right: -3px; vertical-align: -3px; }
  .m-hero .pair.lo .icon { color: var(--bc-blue); }
  .m-hero .pair.hi .icon { color: var(--bc-heat); }
  .m-chart { background: var(--bc-surface); border-radius: var(--bc-radius-inner); padding: 12px 14px 8px; }
  .m-chart h3 { margin-bottom: 8px; }
  .m-chart .plot { position: relative; padding-left: 30px; touch-action: pan-y; user-select: none; -webkit-user-select: none; }
  .m-chart .scrub { position: absolute; left: 30px; right: 0; top: 0; bottom: 0; pointer-events: none; }
  .m-chart .m-cursor { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px solid var(--bc-text); opacity: .5; display: none; }
  .m-chart .m-dot { position: absolute; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; border: 2px solid var(--bc-bg); background: var(--bc-text); display: none; }
  .m-chart .m-tip { position: absolute; top: -4px; transform: translate(-50%, -100%); padding: 5px 9px; border-radius: 10px; background: var(--bc-bg); border: 1px solid var(--bc-border-strong); font-size: 12px; white-space: nowrap; font-variant-numeric: tabular-nums; display: none; }
  .m-chart svg { display: block; width: 100%; height: 110px; }
  .m-chart .ref { position: absolute; left: 0; transform: translateY(-50%); font-size: 10px; color: var(--bc-text-2); opacity: .8; }
  .m-chart .legend { padding-left: 30px; }
  .m-chart .legend { display: flex; justify-content: space-between; font-size: 12px; color: var(--bc-text-2); margin-top: 4px; }
  .m-hours { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 6px; }
  .m-h { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 0; border-radius: 12px; background: var(--bc-surface); font-size: 12px; color: var(--bc-text-2); }
  .m-h .icon { width: 24px; height: 24px; color: var(--bc-text); }
  .m-h .tt { font: 500 15px var(--bc-font-display); color: var(--bc-text); }
  .m-h .rr { color: var(--bc-blue); min-height: 15px; }
  .m-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .m-tile { background: var(--bc-surface); border-radius: var(--bc-radius-inner); padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; min-height: 120px; }
  .m-tile .k { display: flex; align-items: center; gap: 6px; font: 500 11px var(--bc-font-display); letter-spacing: .08em; text-transform: uppercase; color: var(--bc-text-2); }
  .m-tile .k .icon { width: 16px; height: 16px; }
  .m-tile .v { font: 500 26px var(--bc-font-display); font-variant-numeric: tabular-nums; }
  .m-tile .v small { font-size: 13px; color: var(--bc-text-2); font-weight: 400; }
  .m-tile .s { font-size: 12px; color: var(--bc-text-2); }
  .m-tile .s.rain { color: var(--bc-blue); }
  .m-tile .s.warn { color: var(--bc-amber); }
  .m-wind { display: flex; align-items: center; gap: 14px; }
  .m-rose { width: 84px; height: 84px; flex: none; }
  
  .m-rain-now { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .m-rain-now .side { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; text-align: right; }
  .m-rain-now .side b { font-weight: 500; color: var(--bc-text); font-variant-numeric: tabular-nums; }
  .m-rain { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: auto; gap: 4px; font-size: 12px; color: var(--bc-text-2); }
  .m-rain b { display: block; font: 500 15px var(--bc-font-display); font-variant-numeric: tabular-nums; color: var(--bc-text); }
  .m-uv { height: 8px; border-radius: 4px; position: relative; margin-top: 4px;
    background: linear-gradient(90deg, #8CC79A 0%, #E8D23D 27%, #E8A33D 45%, #EF8A6F 64%, #B57AD6 100%); }
  .m-uv i { position: absolute; top: -4px; width: 4px; height: 16px; border-radius: 2px; background: var(--bc-text); }
  .m-days { display: flex; flex-direction: column; gap: 6px; }
  .m-tile .v small.aq { font-size: 14px; font-weight: 500; }
  .m-aq { position: relative; display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; height: 8px; margin-top: 4px; }
  .m-aq span:first-child { border-radius: 4px 0 0 4px; }
  .m-aq span:nth-last-child(2) { border-radius: 0 4px 4px 0; }
  .m-aq i { position: absolute; top: -4px; width: 4px; height: 16px; margin-left: -2px; border-radius: 2px; background: var(--bc-text); }
  .m-d { display: grid; grid-template-columns: 52px 28px minmax(0, 1fr) 64px; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 12px; background: var(--bc-surface); font-size: 14px; }
  .m-d .icon { width: 24px; height: 24px; }
  .m-range { display: flex; align-items: center; gap: 8px; font: 500 14px var(--bc-font-display); font-variant-numeric: tabular-nums; }
  .m-range .bar { flex: 1; height: 6px; border-radius: 3px; background: var(--bc-border-strong); position: relative; }
  .m-range .bar span { position: absolute; top: 0; bottom: 0; border-radius: 3px; background: linear-gradient(90deg, var(--bc-blue), var(--bc-amber)); }
  .m-range .lo { color: var(--bc-text-2); width: 30px; text-align: right; }
  .m-d .p { color: var(--bc-blue); font-size: 13px; text-align: right; }
  .m-src { font-size: 12px; color: var(--bc-text-2); }
  .m-wait { font-size: 13px; color: var(--bc-text-2); padding: 8px 0; }
  @media (max-width: 600px) {
    .m-hours { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .m-hours .m-h:nth-child(n + 7) { display: none; }
    .m-hero .t { font-size: 48px; }
    .m-wind { gap: 10px; }
    .m-rose { width: 60px; height: 60px; }
    .m-tile .v { font-size: 22px; }
    .m-rain { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 10px; }
    .m-rain-now { flex-wrap: wrap; }
    .m-rain-now .side { align-items: flex-start; text-align: left; }
  }
`;

const eaqi = (v) => airBand(EAQI_PM25, v);

export const TEMP_COLORS = [[-5, '#8FB8F0'], [5, '#6EA8E0'], [12, '#8CC79A'], [20, '#E8C23D'], [26, '#E8A33D'], [32, '#EF8A6F'], [38, '#E0607A']];

const NIGHT = { sunny: 'mdi:weather-night', partlycloudy: 'mdi:weather-night-partly-cloudy' };
const condIcon = (cond, night) => (night && NIGHT[cond]) || (CONDITIONS[cond] ?? ['mdi:weather-partly-cloudy'])[0];

 
function nightAt(sun, date) {
  const rise = Date.parse(sun?.attributes.next_rising), set = Date.parse(sun?.attributes.next_setting);
  if (!Number.isFinite(rise) || !Number.isFinite(set)) return date.getHours() < 7 || date.getHours() >= 20;
  const t = date.getTime(), day = 86_400_000;
  
  const nextRise = rise + Math.ceil(Math.max(0, t - rise) / day) * day;
  const nextSet = set + Math.ceil(Math.max(0, t - set) / day) * day;
  return nextRise < nextSet;
}

export function weatherWatchedIds(model) {
  return [...Object.values(model.weather ?? {}), 'sun.sun'].filter((id) => typeof id === 'string');
}

 
export function loadWeather(conn, model, onData) {
  const w = model.weather ?? {};
  const data = { hourly: null, daily: null, temp24: null, press24: null };
  const unsubs = [];
  for (const type of ['hourly', 'daily']) {
    if (!w.condition) break;
    unsubs.push(
      conn
        .subscribeMessage((msg) => {
          data[type] = msg.forecast ?? [];
          onData(data);
        }, { type: 'weather/subscribe_forecast', entity_id: w.condition, forecast_type: type })
        .catch(() => null),
    );
  }
  const ids = [w.temperature, w.pressure].filter(Boolean);
  conn
    .sendMessagePromise({
      type: 'recorder/statistics_during_period',
      start_time: new Date(Date.now() - 24 * 3600_000).toISOString(),
      statistic_ids: ids,
      period: 'hour',
      types: ['mean'],
    })
    .then((res) => {
      const stats = (res[w.temperature] ?? []).filter((p) => Number.isFinite(p.mean));
      data.temp24 = stats.map((p) => p.mean);
      data.temp24t = stats.map((p) => new Date(p.start).getTime());
      data.press24 = (res[w.pressure] ?? []).map((p) => p.mean).filter(Number.isFinite);
      onData(data);
    })
    .catch(() => {});
  return () => unsubs.forEach((p) => p.then((u) => u?.()).catch(() => {}));
}

 
export function scrubWeather(ev) {
  const plot = ev.target.closest?.('[data-m-plot]');
  const svg = plot?.querySelector('svg');
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  if (!rect.width) return;
  let pts;
  try { pts = JSON.parse(plot.dataset.pts); } catch { return; }
  if (!pts.length) return;
  const frac = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
  const [label, x, y] = pts[Math.round(frac * (pts.length - 1))];
  const cursor = plot.querySelector('.m-cursor'), dot = plot.querySelector('.m-dot'), tip = plot.querySelector('.m-tip');
  cursor.style.cssText = `display:block;left:${x}%`;
  dot.style.cssText = `display:block;left:${x}%;top:${Math.max(0, Math.min(100, y))}%`;
  tip.textContent = label;
  tip.style.cssText = `display:block;left:${Math.max(18, Math.min(82, x))}%`;
}

export function renderWeather({ store, model, ui }) {
  const w = model.weather ?? {};
  const d = ui.weather ?? {};
  const raw = (role) => {
    const s = w[role] ? store.get(w[role]) : null;
    return isUnavailable(s) ? null : s.state;
  };
  const n = (role) => {
    const v = Number(raw(role));
    return raw(role) === null || !Number.isFinite(v) ? null : v;
  };
  const sun = store.get('sun.sun');
  const now = new Date();
  const cond = store.get(w.condition)?.state;
  const temp = n('temperature');

  
  let chart = '<p class="m-wait">Caricamento…</p>';
  const past = [...(d.temp24 ?? []), ...(temp !== null ? [temp] : [])];
  const pastT = [...(d.temp24t ?? []), ...(temp !== null ? [now.getTime()] : [])];
  const nextH = (d.hourly ?? []).filter((h) => Date.parse(h.datetime) > now.getTime() && Number.isFinite(h.temperature)).slice(0, 24);
  const next = nextH.map((h) => h.temperature);
  const nextT = nextH.map((h) => Date.parse(h.datetime));
  if (past.length > 1) {
    const all = [...past, ...next];
    const lo = Math.min(...all) - 0.5, hi = Math.max(...all) + 0.5;
    const W = 520, H = 100, last = past.length + next.length - 1 || 1;
    const X = (i) => (i / last) * W, Y = (v) => H - 8 - ((v - lo) / (hi - lo)) * (H - 22);
    const pts = (arr, off) => arr.map((v, i) => `${X(i + off).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    const nowX = X(past.length - 1);
    
    
    const stops = TEMP_COLORS.map(([t, c]) => `<stop offset="${Math.max(0, Math.min(1, (Y(t) - 0) / H)).toFixed(3)}" stop-color="${c}"/>`).reverse().join('');
    
    
    const step = hi - lo > 8 ? 5 : 2;
    const refs = [];
    for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) refs.push(t);
    const refLines = refs.map((t) => `<line x1="0" x2="${W}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" stroke="var(--bc-text-2)" stroke-width="1" stroke-dasharray="2 4" opacity=".25" vector-effect="non-scaling-stroke"/>`).join('');
    const refLabels = refs.map((t) => `<span class="ref num" style="top:${((Y(t) / H) * 100).toFixed(1)}%">${t}°</span>`).join('');
    
    const dayWord = (t) => {
      const days = Math.round((new Date(t).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 86400000);
      return days < 0 ? 'ieri' : days > 0 ? 'domani' : 'oggi';
    };
    const times = [...pastT, ...nextT];
    const scrub = [...past, ...next].map((v, i) => [
      i === past.length - 1 ? `ora · ${fmtNumber(v)}°` : `${dayWord(times[i])} ${fmtTime(new Date(times[i]))} · ${fmtNumber(v)}°`,
      +((i / last) * 100).toFixed(2),
      +((Y(v) / H) * 100).toFixed(2),
    ]);
    chart = `<div class="plot" data-m-plot data-pts="${esc(JSON.stringify(scrub))}">${refLabels}<div class="scrub"><i class="m-cursor"></i><i class="m-dot"></i><span class="m-tip"></span></div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      ${refLines}
      <defs><linearGradient id="tempGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${H}">${stops}</linearGradient></defs>
      <polygon points="0,${H} ${pts(past, 0)} ${nowX},${H}" fill="url(#tempGrad)" opacity=".14"/>
      <polyline points="${pts(past, 0)}" fill="none" stroke="url(#tempGrad)" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      ${next.length ? `<polyline points="${pts([past.at(-1), ...next], past.length - 1)}" fill="none" stroke="url(#tempGrad)" stroke-width="2" stroke-dasharray="4 4" opacity=".6" vector-effect="non-scaling-stroke"/>` : ''}
      <line x1="${nowX}" x2="${nowX}" y1="0" y2="${H}" stroke="var(--bc-text)" stroke-width="1" opacity=".35" vector-effect="non-scaling-stroke"/>
    </svg></div>
    <div class="legend"><span>ieri ${fmtTime(now)}</span><span>ora</span>${next.length ? `<span>domani ${fmtTime(now)}</span>` : '<span></span>'}</div>`;
  }

  const hours = (d.hourly ?? []).filter((h) => Date.parse(h.datetime) > now.getTime()).slice(0, 8)
    .map((h) => {
      const t = new Date(h.datetime);
      return `<div class="m-h"><span>${t.getHours()}:00</span>${icon(condIcon(h.condition, nightAt(sun, t)))}<span class="tt">${fmtNumber(h.temperature, 0)}°</span><span class="rr">${h.precipitation > 0 ? `${fmtNumber(h.precipitation, 1)} mm` : ''}</span></div>`;
    })
    .join('');

  const days = (d.daily ?? []).slice(0, 6);
  const dLo = Math.min(...days.map((x) => x.templow)), dHi = Math.max(...days.map((x) => x.temperature));
  const dayRows = days
    .map((x, i) => {
      const name = i === 0 ? 'Oggi' : new Date(x.datetime).toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '');
      const span = dHi - dLo || 1;
      const l = ((x.templow - dLo) / span) * 100, r = ((x.temperature - dLo) / span) * 100;
      return `<div class="m-d"><span>${esc(name.charAt(0).toUpperCase() + name.slice(1))}</span>${icon(condIcon(x.condition, false))}<span class="m-range"><span class="lo">${fmtNumber(x.templow, 0)}°</span><span class="bar"><span style="left:${l}%;right:${100 - r}%"></span></span><span>${fmtNumber(x.temperature, 0)}°</span></span><span class="p">${x.precipitation > 0 ? `${fmtNumber(x.precipitation, 1)} mm` : ''}</span></div>`;
    })
    .join('');

  
  
  const wd = n('wind_direction');
  const rose = `<svg class="m-rose" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="none" stroke="var(--bc-border-strong)" stroke-width="2"/>
    ${['N', 'E', 'S', 'O'].map((t, i) => { const a = (i * Math.PI) / 2; return `<text x="${(42 + Math.sin(a) * 30).toFixed(1)}" y="${(46 - Math.cos(a) * 30).toFixed(1)}" text-anchor="middle" font-size="10" fill="var(--bc-text-2)" font-family="Sora, sans-serif">${t}</text>`; }).join('')}
    ${wd !== null ? `<g transform="rotate(${wd + 180} 42 42)"><path d="M42 16 L49 44 L42 39 L35 44 Z" fill="var(--bc-blue)"/></g>` : ''}</svg>`;

  
  const pNow = n('pressure');
  const press = d.press24 ?? [];
  const dp = pNow !== null && press.length >= 3 ? pNow - press[press.length - 3] : null;
  const trend = dp === null ? '' : Math.abs(dp) < 0.5 ? 'stabile' : dp > 0 ? 'in salita' : 'in calo';

  const uv = n('uv');
  const uvLabel = uv === null ? '' : uv < 3 ? 'basso' : uv < 6 ? 'moderato' : uv < 8 ? 'alto' : uv < 11 ? 'molto alto' : 'estremo';
  
  const mm = (v) => fmtNumber(v, v !== null && v >= 100 ? 0 : 1);
  const raining = raw('raining') === 'on' || n('rain_rate') > 0;
  const pm = n('pm25');

  return `
    <div class="m-hero" data-measure-open="temperature" role="button" tabindex="0" aria-label="Temperatura, apri il grafico">${icon(condIcon(cond, sun?.state === 'below_horizon'))}<span class="t">${fmtNumber(temp)}<small>°</small></span>
      <span class="side"><b>${esc((CONDITIONS[cond] ?? ['', cond ?? ''])[1])}</b>
        <span class="num">Percepita ${fmtNumber(n('feels_like'))}° · Rugiada ${fmtNumber(n('dew_point'))}°</span>
        <span class="num"><span class="pair lo">${icon('mdi:arrow-down')}${fmtNumber(n('min_today'))}°</span> · <span class="pair hi">${icon('mdi:arrow-up')}${fmtNumber(n('max_today'))}°</span></span></span>
    ${icon('mdi:chevron-right', 'icon chev')}</div>
    <div class="m-chart"><h3>Temperatura · ultime 24 h e prossime 24 h</h3>${chart}</div>
    ${hours ? `<section><h3>Prossime ore</h3><div class="m-hours">${hours}</div></section>` : ''}
    <div class="m-grid">
      <div class="m-tile" data-measure-open="wind" role="button" tabindex="0" aria-label="Vento, apri il grafico"><span class="k">${icon('mdi:weather-windy')}Vento${icon('mdi:chevron-right', 'icon chev')}</span><div class="m-wind">${rose}<div>
        <div class="v">${fmtNumber(n('wind'))} <small>km/h</small></div>
        <div class="s">${wd !== null ? `da ${cardinal(wd)}` : ''}</div>
        <div class="s">raffica ${fmtNumber(n('gust'))} · max ${fmtNumber(n('max_gust'))}</div></div></div></div>
      <div class="m-tile" data-measure-open="rain" role="button" tabindex="0" aria-label="Pioggia, apri il grafico"><span class="k">${icon('mdi:umbrella-outline')}Pioggia${icon('mdi:chevron-right', 'icon chev')}</span>
        <div class="m-rain-now"><div class="v">${fmtNumber(n('rain_rate'))} <small>mm/h</small></div>
          <div class="side"><span class="s ${raining ? 'rain' : ''}">${raining ? 'Sta piovendo' : 'Non piove'}</span><span class="s">ultima ora <b>${fmtNumber(n('rain_hour'))}</b> mm</span></div></div>
        <div class="m-rain"><span>oggi<b>${mm(n('rain_today'))}</b></span><span>sett.<b>${mm(n('rain_week'))}</b></span><span>mese<b>${mm(n('rain_month'))}</b></span><span>anno<b>${mm(n('rain_year'))}</b></span></div></div>
      <div class="m-tile" data-measure-open="humidity" role="button" tabindex="0" aria-label="Umidità, apri il grafico"><span class="k">${icon('mdi:water-percent')}Umidità${icon('mdi:chevron-right', 'icon chev')}</span>
        <div class="v">${fmtNumber(n('humidity'), 0)} <small>%</small></div>
        <div class="s">Punto di rugiada ${fmtNumber(n('dew_point'))}°</div>
        <div class="s">Deficit vapore ${fmtNumber(n('vapor_deficit'))} hPa</div></div>
      <div class="m-tile" data-measure-open="pressure" role="button" tabindex="0" aria-label="Pressione, apri il grafico"><span class="k">${icon('mdi:gauge')}Pressione${icon('mdi:chevron-right', 'icon chev')}</span>
        <div class="v">${fmtNumber(pNow, 0)} <small>hPa</small></div>
        ${trend ? `<div class="s">${trend} (${dp > 0 ? '+' : ''}${fmtNumber(dp)} in 3 h)</div>` : ''}</div>
      <div class="m-tile" data-measure-open="sun" role="button" tabindex="0" aria-label="Sole e UV, apri il grafico"><span class="k">${icon('mdi:white-balance-sunny')}Sole e UV${icon('mdi:chevron-right', 'icon chev')}</span>
        <div class="v">UV ${fmtNumber(uv, 0)} <small>${uvLabel}</small></div>
        ${uv !== null ? `<div class="m-uv"><i style="left:${Math.min(98, (uv / 11) * 100)}%"></i></div>` : ''}
        <div class="s">Radiazione ${fmtNumber(n('radiation'), 0)} W/m² · ${fmtNumber(n('lux'), 0)} lx</div></div>
      <div class="m-tile" data-measure-open="pm25" role="button" tabindex="0" aria-label="Aria PM2.5, apri il grafico"><span class="k">${icon('mdi:air-filter')}Aria · PM2.5${icon('mdi:chevron-right', 'icon chev')}</span>${
        pm === null
          ? `<div class="v" style="color:var(--bc-text-2)">—</div><div class="s warn">${n('pm25_battery') !== null && n('pm25_battery') < 10 ? `Sensore scarico (batteria ${fmtNumber(n('pm25_battery'), 0)}%)` : 'Sensore non disponibile'}</div>`
          : (() => {
              
              const band = eaqi(pm), pos = airBandPos(EAQI_PM25, pm, 200);
              const avg = eaqi(n('pm25_average'));
              return `<div class="v">${fmtNumber(pm, 0)} <small>µg/m³</small> <small class="aq" style="color:${band[2]}">${band[1]}</small></div>
                <div class="m-aq">${EAQI_PM25.map(([, , c]) => `<span style="background:${c}"></span>`).join('')}<i style="left:${pos.toFixed(1)}%"></i></div>
                <div class="s">media 24 h ${fmtNumber(n('pm25_average'), 0)}${avg ? ` · ${avg[1]}` : ''} · indice europeo</div>`;
            })()
      }</div>
    </div>
    ${dayRows ? `<section><h3>Prossimi giorni</h3><div class="m-days">${dayRows}</div></section>` : ''}
    <p class="m-src">Misure: stazione meteo · Previsioni: met.no</p>`;
}
