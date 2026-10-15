// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon, powerBadge, powerButton } from './base.js';
import { esc, fmtNumber, fmtRemaining, fmtTime, isUnavailable, stateValue } from '../core/format.js';

export const LAB_STYLES = `
  
  :host { --bambu: #00AE42; }
  .plugs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .plug {
    display: flex; flex-direction: column; justify-content: space-between; gap: 10px; min-height: 84px; padding: 12px 14px; text-align: left;
    border-radius: var(--bc-radius-inner); border: 1px solid transparent; background: var(--bc-surface);
  }
  .plug .top { display: flex; align-items: center; gap: 10px; }
  .plug .top .icon { color: var(--bc-text-2); }
  .plug .n { flex: 1; min-width: 0; font-size: 15px; font-weight: 500; line-height: 1.25; }
  .plug .st { font-size: 13px; color: var(--bc-text-2); }
  .plug .meas { display: flex; gap: 12px; font-size: 13px; color: var(--bc-text-2); flex-wrap: wrap; }
  .plug .meas .st { flex: 1; }
  .plug .meas b { font-weight: 500; color: var(--bc-text); }
  .plug:not(:disabled):active { background: var(--bc-border); }
  .plug:disabled { cursor: default; opacity: .5; }
  .plug.on { color: var(--bc-text); background: color-mix(in srgb, var(--bc-green) 12%, var(--bc-surface)); border-color: color-mix(in srgb, var(--bc-green) 45%, transparent); }
  .plug.on .top .icon, .plug.on .st { color: var(--bc-green); }
  .printer { display: flex; flex-direction: column; gap: 12px; }
  .printer-head { display: flex; align-items: center; gap: 14px; }
  .printer-head .img { flex: none; width: 72px; height: 72px; border-radius: var(--bc-radius-inner); background: var(--bc-surface) center / contain no-repeat; display: flex; align-items: center; justify-content: center; color: var(--bc-text-2); }
  .printer-head .img .icon { width: 32px; height: 32px; }
  .printer-head .txt { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .printer-head .state { font: 600 20px/1.2 var(--bc-font-display); }
  .printer-head .state.run { color: var(--bambu); }
  .printer-head .state.ok { color: var(--bc-green); }
  .printer-head .state.bad { color: var(--bc-red); }
  .printer-head .job { font-size: 14px; color: var(--bc-text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .confirm-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 13px; color: var(--bc-amber); }
  .confirm-row span { flex-basis: 100%; }
  .confirm-row button { flex: 1; min-height: var(--bc-touch); border-radius: var(--bc-radius-inner); background: var(--bc-surface); color: var(--bc-text); font-weight: 500; text-align: center; justify-content: center; }
  .confirm-row .danger { background: var(--bc-red); color: var(--bc-bg); }
  .p-cam { margin: 0; aspect-ratio: 16 / 9; border-radius: var(--bc-radius-inner); overflow: hidden; background: #000; }
  .p-cam-foot { margin: 0; text-align: center; font: 500 15px var(--bc-font-display); color: var(--bambu); }
  .p-cam img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .printer-head { justify-content: space-between; }
  .p-btns { display: flex; gap: 8px; flex: none; }
  .p-btn { flex: none; width: var(--bc-touch); height: var(--bc-touch); border-radius: 12px; border: 1px solid var(--bc-border-strong); display: flex; align-items: center; justify-content: center; color: var(--bc-text-2); }
  .p-btn:disabled { opacity: .4; cursor: default; }
  .p-btn.on { color: var(--bambu); border-color: color-mix(in srgb, var(--bambu) 55%, transparent); background: color-mix(in srgb, var(--bambu) 14%, transparent); }
  .printer-diagram svg { display: block; width: 100%; height: auto; overflow: visible; }
  .printer-diagram .p-body { fill: var(--bc-surface); stroke: var(--bc-border-strong); }
  .printer-diagram .p-window { fill: #0E0F12; stroke: var(--bc-border); }
  .printer-diagram .p-window.lit { fill: #22201A; }
  .printer-diagram .p-base { fill: var(--bc-card); }
  .printer-diagram .p-bar-bg { fill: var(--bc-border); }
  .printer-diagram .p-bar { fill: var(--bambu); }
  .printer-diagram .p-rail { fill: var(--bc-border-strong); }
  .printer-diagram .p-toolhead { fill: #3A3D45; stroke: var(--bc-border-strong); }
  .printer-diagram .p-fan { fill: none; stroke: var(--bc-blue); stroke-width: 1.5; stroke-dasharray: 3 2; }
  .printer-diagram .p-nozzle { fill: var(--bc-text-2); }
  .printer-diagram .p-nozzle.hot { fill: var(--bambu); }
  .printer-diagram .p-bed { fill: var(--bc-border-strong); }
  .printer-diagram .p-bed.hot { fill: var(--bambu); }
  .printer-diagram .p-lead { stroke: var(--bc-border-strong); stroke-width: 1; stroke-dasharray: 2 3; }
  .printer-diagram .p-name { font: 500 10px var(--bc-font-display); letter-spacing: .06em; text-transform: uppercase; fill: var(--bc-text-2); }
  .printer-diagram .p-val { font: 500 20px var(--bc-font-display); font-variant-numeric: tabular-nums; fill: var(--bc-text); }
  .printer-diagram .p-val.hot { fill: var(--bambu); }
  .printer-diagram .p-sub { font: 400 11px var(--bc-font-text); font-variant-numeric: tabular-nums; fill: var(--bc-text-2); }
  .printer-diagram .p-foot { font: 500 15px var(--bc-font-display); font-variant-numeric: tabular-nums; fill: var(--bambu); }
  
  .printer-diagram.off svg { opacity: .45; filter: grayscale(1); }
  
  .printer-diagram.printing .p-head { animation: p-head 3.2s ease-in-out infinite alternate; }
  @keyframes p-head { from { transform: translateX(-22px); } to { transform: translateX(22px); } }
  @media (prefers-reduced-motion: reduce) { .printer-diagram.printing .p-head { animation: none; } }
  .printer ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .printer li { display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 2px; padding: 10px 12px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .printer li .k { font-size: 12px; color: var(--bc-text-2); }
  .printer li .v { font-size: 15px; font-weight: 500; }
  .printer .off { font-size: 14px; color: var(--bc-text-2); }
  .ams { display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .ams-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .ams-title { font: 500 11px var(--bc-font-display); letter-spacing: .08em; text-transform: uppercase; color: var(--bc-text-2); }
  .ams-env { display: flex; gap: 12px; font-size: 13px; color: var(--bc-text-2); }
  .ams-env > span { display: inline-flex; align-items: center; gap: 3px; }
  .ams-env .icon { width: 16px; height: 16px; }
  .spools { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 8px; }
  .spool { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; padding: 8px 4px; border-radius: 12px; border: 1px solid transparent; text-align: center; }
  .spool.active { border-color: var(--bambu); background: color-mix(in srgb, var(--bambu) 10%, transparent); }
  .spool .disc { width: 44px; height: 44px; border-radius: 50%; background: var(--c, transparent); border: 2px solid color-mix(in srgb, var(--c, #555) 70%, #000); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 6px rgb(0 0 0 / .18); }
  .spool.empty .disc { border: 2px dashed var(--bc-border-strong); box-shadow: none; }
  .spool .hole { width: 12px; height: 12px; border-radius: 50%; background: var(--bc-surface); border: 1px solid rgb(0 0 0 / .3); }
  .spool .s-type { font-size: 13px; font-weight: 600; }
  .spool .s-name { font-size: 11px; color: var(--bc-text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .spool.empty .s-type, .spool.empty .s-name { color: var(--bc-text-2); }
  .printer .hms { color: var(--bc-amber); font-size: 14px; display: flex; align-items: center; gap: 8px; }
`;

const PRINT_STATES = {
  idle: ['Pronta', 'ok'], init: ['Avvio', 'run'], prepare: ['In preparazione', 'run'], slicing: ['Slicing', 'run'],
  running: ['In stampa', 'run'], pause: ['In pausa', 'run'], finish: ['Stampa completata', 'ok'],
  failed: ['Stampa fallita', 'bad'], offline: ['Non in linea', ''], unknown: ['Sconosciuto', ''],
};
const ACTIVE = ['running', 'prepare', 'pause', 'slicing', 'init'];

export function labWatchedIds(model) {
  const l = model.lab ?? {};
  return [
    ...(l.outlets ?? []).flatMap((p) => [p.entity, p.power, p.energy]),
    ...Object.entries(l.printer ?? {}).filter(([k]) => !['name', 'ams'].includes(k)).map(([, v]) => v),
    ...Object.entries(l.printer?.ams ?? {}).filter(([k]) => k !== 'name').flatMap(([, v]) => v),
  ].filter((id) => typeof id === 'string');
}

 
export function labSummary(store, model) {
  const l = model.lab ?? {};
  const on = (l.outlets ?? []).filter((p) => store.get(p.entity)?.state === 'on').length;
  const p = l.printer ?? {};
  const st = store.get(p.state);
  const printing = st && ACTIVE.includes(st.state);
  const pct = Number(store.get(p.progress)?.state);
  return [
    on ? `${on} ${on === 1 ? 'presa accesa' : 'prese accese'}` : 'Prese spente',
    printing ? `${PRINT_STATES[st.state][0]}${Number.isFinite(pct) ? ` ${Math.round(pct)}%` : ''}` : null,
  ].filter(Boolean).join(' · ');
}

export function renderLab({ store, model, services, hassUrl, ui = {} }) {
  const l = model.lab;
  if (!l) return '<p class="placeholder">Laboratorio non configurato in config.json.</p>';
  const v = (id) => stateValue(store, id);

  const plugs = (l.outlets ?? [])
    .map((p) => {
      const st = store.get(p.entity);
      const on = st?.state === 'on';
      const can = !isUnavailable(st) && services.canControl(p.entity);
      const power = Number(v(p.power));
      const energy = Number(v(p.energy));
      return `<button class="plug ${on ? 'on' : ''}" ${can ? `data-toggle="${esc(p.entity)}" aria-pressed="${on}"` : 'disabled'} aria-label="${on ? 'Spegni' : 'Accendi'} ${esc(model.shortName(p.entity))}">
        <span class="top">${icon(model.icon(p.entity) ?? (on ? 'mdi:power-plug' : 'mdi:power-plug-off-outline'))}<span class="n">${esc(model.shortName(p.entity))}</span>${powerBadge({ on })}</span>
        <span class="meas num"><span class="st">${isUnavailable(st) ? 'Non disponibile' : on ? 'Accesa' : 'Spenta'}</span>${p.power ? `<span><b>${Number.isFinite(power) ? fmtNumber(power, 0) : '—'}</b> W</span>` : ''}${p.energy ? `<span><b>${Number.isFinite(energy) ? fmtNumber(energy, 2) : '—'}</b> kWh</span>` : ''}</span>
      </button>`;
    })
    .join('');

  
  const p = l.printer ?? {};
  const state = v(p.state);
  
  const online = state && state !== 'offline' && v(p.online) !== 'off';
  const plugOn = store.get(p.outlet)?.state === 'on';
  const [label, cls] = online ? PRINT_STATES[state] ?? [state, ''] : [plugOn ? 'Non in linea' : 'Spenta', ''];
  const active = online && ACTIVE.includes(state);
  const w = Number(v(p.outlet_power));
  const sub = online ? v(p.activity) : plugOn ? 'In avvio o non raggiungibile' : 'Accendi la presa per usarla';
  const head = `
    <div class="printer-head">
      <span class="txt"><span class="state ${cls}">${esc(label)}</span><span class="job">${esc(sub ?? '')}${
        plugOn && Number.isFinite(w) ? `${sub ? ' · ' : ''}${fmtNumber(w, 0)} W` : ''
      }</span></span>
      <span class="p-btns">
        ${printerPower(store, p, services, active)}
        ${online ? printerCamButton(store, p, ui) : ''}
        ${online ? printerLight(store, p, services) : ''}
      </span>
    </div>
    ${
      ui.pick === 'presa-stampante'
        ? `<div class="confirm-row"><span>Sta stampando: spegnendo la presa la stampa va persa.</span>
            <button data-clear-pick>Annulla</button><button class="danger" data-toggle="${esc(p.outlet)}" data-clear-pick>Spegni</button></div>`
        : ''
    }`;
  let printer;
  if (!online) {
    
    printer = `${head}${printerDiagram({ v: () => null, p, state: null, active: false, pct: NaN, layer: null, layers: null, end: null, off: true })}`;
  } else {
    const pct = Number(v(p.progress));
    const end = v(p.end);
    const layer = v(p.layer), layers = v(p.layers);
    
    const cam = ui.printerCam ? printerCamera(store, p, hassUrl) : '';
    const foot = active
      ? `${Number.isFinite(pct) ? `${Math.round(pct)}%` : ''}${end ? ` · fine ${fmtTime(new Date(end))}${fmtRemaining(end) ? ` (${fmtRemaining(end)})` : ''}` : ''}${layer ? ` · strato ${layer}${layers ? `/${layers}` : ''}` : ''}`
      : '';
    const view = cam ? `${cam}${foot ? `<p class="p-cam-foot num">${esc(foot)}</p>` : ''}` : '';
    printer = `
      ${head}
      ${view || printerDiagram({ v, p, state, active, pct, layer, layers, end })}
      ${v(p.errors) === 'on' || v(p.print_error) === 'on' ? `<p class="hms">${icon('mdi:alert-circle-outline')}Errore segnalato dalla stampante: controlla l'app Bambu</p>` : ''}
      ${amsBlock(store, p)}`;
  }

  return `
    <section><h3>Prese</h3><div class="plugs">${plugs}</div></section>
    <section><h3>${esc(p.name ?? 'Stampante 3D')}</h3><div class="printer">${printer}</div></section>`;
}

function printerDiagram({ v, p, state, active, pct, layer, layers, end, off = false }) {
  const num = (id) => {
    const raw = v(id);
    const n = raw === null || raw === undefined || raw === '' ? NaN : Number(raw);
    return Number.isFinite(n) ? n : null;
  };
  const nozzle = num(p.nozzle), nozzleT = num(p.nozzle_target);
  const bed = num(p.bed), bedT = num(p.bed_target);
  const chamber = p.camera ? num(p.camera) : null;
  const fan = num(p.fan);
  const light = v(p.light) === 'on';
  const heatN = nozzleT > 0, heatB = bedT > 0;
  const lightLabel = light ? 'luce accesa' : '';
  const done = state === 'finish';
  
  const frac = done ? 1 : active && Number.isFinite(pct) ? Math.max(0.03, Math.min(1, pct / 100)) : 0;
  const objH = Math.round(66 * frac);
  
  const layerY = Math.min(150 - Math.max(8, objH / 2), 138);
  const deg = (n) => (n === null ? '—' : `${fmtNumber(n, 0)}°`);
  const target = (n) => (off ? 'non disponibile' : n > 0 ? `→ ${fmtNumber(n, 0)}°` : 'spento');
  const lbl = (x, y, anchor, name, value, sub, hot) => `
    <text class="p-name" x="${x}" y="${y}" text-anchor="${anchor}">${name}</text>
    <text class="p-val ${hot ? 'hot' : ''}" x="${x}" y="${y + 22}" text-anchor="${anchor}">${esc(value)}</text>
    ${sub ? `<text class="p-sub" x="${x}" y="${y + 38}" text-anchor="${anchor}">${esc(sub)}</text>` : ''}`;
  const line = (x1, y1, x2, y2) => `<line class="p-lead" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const footer = active
    ? `${Number.isFinite(pct) ? `${Math.round(pct)}%` : ''}${end ? ` · fine ${fmtTime(new Date(end))}${fmtRemaining(end) ? ` (${fmtRemaining(end)})` : ''}` : ''}`
    : done ? 'Stampa completata' : '';
  return `
    <div class="printer-diagram ${active ? 'printing' : ''} ${off ? 'off' : ''}">
      <svg viewBox="0 0 380 ${footer ? 262 : 236}" role="img" aria-label="Schema stampante 3D">
        <defs>
          <linearGradient id="bedGlow" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stop-color="var(--bambu)" stop-opacity=".45"/><stop offset="1" stop-color="var(--bambu)" stop-opacity="0"/>
          </linearGradient>
          <pattern id="layers" width="4" height="3" patternUnits="userSpaceOnUse">
            <rect width="4" height="3" fill="#00AE42"/><rect y="2.2" width="4" height=".8" fill="#000" opacity=".2"/>
          </pattern>
          <pattern id="layersDone" width="4" height="3" patternUnits="userSpaceOnUse">
            <rect width="4" height="3" fill="#8CC79A"/><rect y="2.2" width="4" height=".8" fill="#000" opacity=".2"/>
          </pattern>
        </defs>
        <!-- corpo, camera e base -->
        <rect class="p-body" x="110" y="10" width="160" height="214" rx="14"/>
        <rect class="p-window ${light ? 'lit' : ''}" x="122" y="22" width="136" height="150" rx="8"/>
        <rect class="p-base" x="122" y="182" width="136" height="30" rx="6"/>
        <rect class="p-bar-bg" x="134" y="194" width="112" height="6" rx="3"/>
        ${active && Number.isFinite(pct) ? `<rect class="p-bar" x="134" y="194" width="${(112 * Math.max(0, Math.min(100, pct))) / 100}" height="6" rx="3"/>` : ''}
        <!-- guida e carrello -->
        <rect class="p-rail" x="128" y="50" width="124" height="4" rx="2"/>
        <g class="p-head">
          <rect x="176" y="40" width="28" height="24" rx="5" class="p-toolhead"/>
          ${fan > 0 ? '<circle cx="190" cy="52" r="5" class="p-fan"/>' : ''}
          <path d="M185 64 h10 l-5 9 z" class="p-nozzle ${heatN ? 'hot' : ''}"/>
        </g>
        <!-- oggetto e piatto -->
        ${heatB ? '<rect x="138" y="120" width="104" height="30" fill="url(#bedGlow)"/>' : ''}
        ${objH ? `<rect x="170" y="${150 - objH}" width="40" height="${objH}" rx="2" fill="url(#${done ? 'layersDone' : 'layers'})"/>` : ''}
        <rect class="p-bed ${heatB ? 'hot' : ''}" x="138" y="150" width="104" height="7" rx="2"/>
        <!-- valori -->
        ${line(210, 52, 268, 52)}${lbl(282, 40, 'start', 'Ugello', deg(nozzle), target(nozzleT), heatN)}
        ${line(242, 153, 268, 153)}${lbl(282, 141, 'start', 'Piatto', deg(bed), target(bedT), heatB)}
        ${chamber !== null ? `${line(112, 52, 128, 52)}${lbl(98, 40, 'end', 'Camera', deg(chamber), lightLabel, false)}` : light ? `<text class="p-sub" x="98" y="56" text-anchor="end">luce accesa</text>` : ''}
        ${active && layer ? `${line(112, layerY, 170, layerY)}${lbl(98, layerY - 12, 'end', 'Strato', String(layer), layers ? `di ${layers}` : '', false)}` : ''}
        ${footer ? `<text class="p-foot" x="190" y="252" text-anchor="middle">${esc(footer)}</text>` : ''}
      </svg>
    </div>`;
}

function amsBlock(store, p) {
  const a = p.ams;
  if (!a) return '';
  const val = (id) => stateValue(store, id);
  const spool = (id, fallback) => {
    const st = store.get(id);
    if (!st) return '';
    const at = st.attributes ?? {};
    const empty = at.empty || st.state === 'Empty' || st.state === '?';
    const color = !empty && typeof at.color === 'string' ? at.color.slice(0, 7) : null;
    const name = empty ? 'Vuoto' : at.name ?? st.state;
    const type = empty ? '' : at.type ?? '';
    return `<div class="spool ${at.active ? 'active' : ''} ${empty ? 'empty' : ''}">
      <span class="disc" ${color ? `style="--c:${esc(color)}"` : ''}><span class="hole"></span></span>
      <span class="s-type">${esc(type || fallback)}</span>
      <span class="s-name">${esc(name)}</span>
    </div>`;
  };
  const slots = (a.slot ?? []).map((id, i) => spool(id, `Slot ${i + 1}`)).join('');
  const ext = store.get(p.external_spool);
  const extShown = ext && !ext.attributes?.empty && ext.state !== '?' ? spool(p.external_spool, 'Esterna') : '';
  
  const hum = val(a.humidity), temp = val(a.temperature);
  return `
    <div class="ams">
      <div class="ams-head"><span class="ams-title">${esc(a.name ?? 'AMS')}</span>
        <span class="ams-env num">${hum !== null ? `<span>${icon('mdi:water-percent')}${esc(hum)}%</span>` : ''}${
          temp !== null ? `<span>${icon('mdi:thermometer')}${fmtNumber(temp, 0)}°</span>` : ''
        }</span>
      </div>
      <div class="spools">${slots}${extShown}</div>
    </div>`;
}

function printerPower(store, p, services, printing) {
  const st = p.outlet ? store.get(p.outlet) : null;
  if (!st) return '';
  const on = st.state === 'on';
  const can = !isUnavailable(st) && services.canControl(p.outlet);
  const attrs = !can ? 'disabled' : on && printing ? 'data-pick="presa-stampante"' : `data-toggle="${esc(p.outlet)}" aria-pressed="${on}"`;
  return powerButton({ on, attrs, label: `${on ? 'Spegni' : 'Accendi'} la stampante` });
}

function printerCamButton(store, p, ui) {
  const st = p.camera_video ? store.get(p.camera_video) : null;
  if (!st || isUnavailable(st)) return '';
  return `<button class="p-btn ${ui.printerCam ? 'on' : ''}" data-printer-cam aria-pressed="${Boolean(ui.printerCam)}" aria-label="Camera" title="Camera">${icon(ui.printerCam ? 'mdi:video' : 'mdi:video-outline')}</button>`;
}

function printerLight(store, p, services) {
  const st = p.light ? store.get(p.light) : null;
  if (!st) return '';
  const on = st.state === 'on';
  const can = !isUnavailable(st) && services.canControl(p.light);
  return `<button class="p-btn ${on ? 'on' : ''}" ${can ? `data-toggle="${esc(p.light)}" aria-pressed="${on}"` : 'disabled'} aria-label="Luce stampante" title="Luce">${icon(on ? 'mdi:lightbulb' : 'mdi:lightbulb-outline')}</button>`;
}

function printerCamera(store, p, hassUrl) {
  const st = p.camera_video ? store.get(p.camera_video) : null;
  const pic = st && !isUnavailable(st) ? st.attributes.entity_picture : null;
  if (!pic) return '';
  
  return `<figure class="p-cam" data-keep data-src="${esc(hassUrl(pic))}"></figure>`;
}

const CAM_REFRESH_MS = 1000;

 
export function mountPrinterCamera(root) {
  const box = root.querySelector('.p-cam[data-src]');
  if (!box || box._camTimer) return;
  const img = document.createElement('img');
  img.alt = 'Camera stampante';
  box.append(img);
  let loading = false;
  const tick = () => {
    if (!box.isConnected || !box.dataset.src) {
      clearInterval(box._camTimer);
      return;
    }
    if (loading) return;
    loading = true;
    
    const url = `${box.dataset.src}${box.dataset.src.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const next = new Image();
    next.onload = () => {
      img.src = next.src;
      loading = false;
    };
    next.onerror = () => {
      loading = false;
    };
    next.src = url;
  };
  tick();
  box._camTimer = setInterval(tick, CAM_REFRESH_MS);
}
