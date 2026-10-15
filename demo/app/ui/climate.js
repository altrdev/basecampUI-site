// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { esc, fmtNumber, isUnavailable, stateNumber, stateValue } from '../core/format.js';
import { autoAirSection, autoAirWatchedIds } from './climate-auto-air.js';
import { heatingSection, heatingWatchedIds } from './climate-heating.js';

export const CLIMATE_STYLES = `
  .confirm { display: flex; gap: 6px; margin-top: 6px; }
  .confirm button {
    flex: 1; min-height: var(--bc-touch); border-radius: var(--bc-radius-inner);
    background: var(--bc-surface); font-size: 14px; font-weight: 500; text-align: center;
  }
  .confirm button.go { background: var(--bc-amber); color: var(--bc-bg); }
  .segmented.two { grid-template-columns: 1fr 1fr; }
  
  .segmented button.active[data-tone="heat"] { background: var(--bc-heat); color: var(--bc-bg); }
  .segmented button.active[data-tone="cool"] { background: var(--bc-blue); color: var(--bc-bg); }
  .segmented button.active[data-tone="air"] { background: color-mix(in srgb, var(--bc-blue) 45%, var(--bc-text-2)); color: var(--bc-bg); }
  .segmented button.active[data-tone="neutral"] { background: var(--bc-text-2); color: var(--bc-bg); }
  .segmented button.chosen { box-shadow: 0 0 0 2px var(--bc-text); }
  .stepper { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 6px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .stepper button { min-width: 64px; min-height: var(--bc-touch); border-radius: var(--bc-radius-inner); background: var(--bc-border); font: 500 24px var(--bc-font-display); }
  .stepper button:disabled { opacity: .35; }
  .stepper button:not(:disabled):active { background: var(--bc-border-strong); }
  .stepper b { font: 600 24px var(--bc-font-display); font-variant-numeric: tabular-nums; }
  .stepper b.chosen { color: var(--bc-amber); }
  .segmented.wrap { grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); }
  .adv { margin-top: 18px; }
  .adv summary { cursor: pointer; min-height: var(--bc-touch); display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--bc-text-2); list-style: none; }
  .adv summary::-webkit-details-marker { display: none; }
  .adv .chev { width: 18px; height: 18px; transition: transform .15s; }
  .adv[open] .chev { transform: rotate(90deg); }
  .adv section { margin-top: 18px; }
  .hp-hero { display: flex; align-items: center; gap: 14px; margin-top: 10px; padding: 14px 16px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .hp-hero > .icon { flex: none; width: 34px; height: 34px; color: var(--bc-text-2); }
  .hp-hero.run > .icon { color: var(--bc-amber); }
  .hp-hero.cool > .icon { color: var(--bc-blue); }
  .hp-hero .txt { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .hp-hero .a { font: 500 20px var(--bc-font-display); }
  .hp-hero .b { font-size: 13px; color: var(--bc-text-2); }
  .hp-hero .w { text-align: right; font: 500 20px var(--bc-font-display); font-variant-numeric: tabular-nums; }
  .hp-hero .w small { display: block; font-size: 12px; font-weight: 400; color: var(--bc-text-2); }
  .cl-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 10px; }
  .cl-tile { display: flex; flex-direction: column; gap: 3px; padding: 12px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 12px; color: var(--bc-text-2); min-width: 0; }
  .cl-tile .k { display: flex; align-items: center; gap: 6px; }
  .cl-tile .k .icon { width: 16px; height: 16px; }
  .cl-tile b { font: 500 22px var(--bc-font-display); font-variant-numeric: tabular-nums; color: var(--bc-text); white-space: nowrap; }
  .cl-tile b small { font-size: 13px; color: var(--bc-text-2); font-weight: 400; }
  .cl-tile.warm .k .icon { color: var(--bc-amber); }
  .cl-tile.cold .k .icon { color: var(--bc-blue); }
  .cl-tile.alert b { color: var(--bc-red); }
  .cl-tile.good b, .cl-tile.good .k .icon { color: var(--bc-green); }
  .cl-tile .code { font-size: 13px; font-weight: 500; color: var(--bc-text); white-space: normal; }
  .dhw { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 16px; align-items: center; margin-top: 4px; }
  .dhw-tank { width: 100%; height: auto; display: block; }
  .dhw-tank text { font: 500 15px var(--bc-font-display); fill: var(--bc-text); text-anchor: middle; font-variant-numeric: tabular-nums; }
  .dhw-tank text.l { font-size: 10px; font-weight: 400; fill: var(--bc-text-2); }
  .dhw-side { display: flex; flex-direction: column; gap: 8px; }
  .dhw-row { display: flex; justify-content: space-between; gap: 10px; font-size: 14px; color: var(--bc-text-2); }
  .dhw-row b { color: var(--bc-text); font-weight: 500; font-variant-numeric: tabular-nums; }
  .dhw-row .on { color: var(--bc-amber); }
  .dhw-row .ok { color: var(--bc-green); }
  .dhw-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
  .dhw-btns button { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: var(--bc-touch); border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 14px; font-weight: 500; }
  .dhw-btns button .icon { width: 20px; height: 20px; color: var(--bc-text-2); }
  .dhw-btns button.on { background: color-mix(in srgb, var(--bc-amber) 18%, var(--bc-surface)); color: var(--bc-amber); }
  .dhw-btns button.on .icon { color: var(--bc-amber); }
  @media (max-width: 600px) {
    .cl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    
    .cl-grid > .cl-tile:last-child:nth-child(odd) { grid-column: 1 / -1; }
    .dhw { grid-template-columns: 96px minmax(0, 1fr); gap: 12px; }
  }
`;

const SEASONS = { cool: 'Freddo', fan: 'Ventilazione', heat: 'Caldo', stop: 'Stop', dry: 'Deumidifica', auto: 'Auto' };
const PUMP_MODES = { off: 'Off', auto: 'Auto', riscaldamento: 'Riscaldamento', raffreddamento: 'Raffreddamento' };
const ACTIVITY = {
  off: 'Ferma', heating: 'Riscaldamento', riscaldamento: 'Riscaldamento', cooling: 'Raffreddamento',
  raffreddamento: 'Raffreddamento', 'hot water': 'Acqua calda', 'acqua calda': 'Acqua calda', defrost: 'Sbrinamento',
  sbrinamento: 'Sbrinamento', pool: 'Piscina',
};

export const pumpActivityLabel = (value) => ACTIVITY[String(value).toLowerCase()] ?? value;
export const seasonLabel = (value) => SEASONS[value] ?? value ?? '—';

export function climateWatchedIds(climate) {
  if (!climate) return [];
  const { averages = {}, ...pump } = climate.heat_pump ?? {};
  const avgIds = Object.values(averages).flatMap((m) => [m.delivered, ...(m.consumed ?? [])]);
  return [climate.season, ...autoAirWatchedIds(climate), ...heatingWatchedIds(climate), ...(climate.hot_water?.settings ?? []).map((i) => i.entity), ...Object.values(pump), ...avgIds, ...Object.values(climate.hot_water ?? {})].filter((id) => typeof id === 'string');
}

export function climateSummary(store, climate) {
  if (!climate) return 'Non configurato';
  
  const operating_mode = currentOperatingMode(store, climate);
  if (operating_mode) return operating_mode.name;
  const season = store.get(climate.season)?.state;
  const pump = store.get(climate.heat_pump?.mode)?.state;
  return [season && seasonLabel(season), pump && (PUMP_MODES[pump] ?? pump)].filter(Boolean).join(' · ');
}

function confirmSelect({ store, services, ui }, entity, labels, cls = '', ask = null) {
  const state = store.get(entity);
  if (!state) return '<p class="placeholder">Entità non trovata.</p>';
  const current = state.state;
  const options = state.attributes.options ?? Object.keys(labels);
  const enabled = services.canControl(entity) && state.state !== 'unavailable';
  const [pickEntity, pickOption] = String(ui.pick ?? '').split('=');
  const picked = pickEntity === entity ? pickOption : null;

  const buttons = options
    .map((option) => {
      const active = picked ? picked === option : current === option;
      const attrs = !enabled || option === current ? 'disabled' : `data-pick="${esc(entity)}=${esc(option)}"`;
      return `<button class="${active ? 'active' : ''} ${picked === option ? 'warn' : ''}" ${attrs} aria-pressed="${active}">${esc(labels[option] ?? option)}</button>`;
    })
    .join('');
  const confirm = picked
    ? `<div class="hint warn">${ask ? ask(labels[picked] ?? picked, picked) : `Passare a «${esc(labels[picked] ?? picked)}»? Vale per tutta la casa.`}</div>
       <div class="confirm">
         <button data-pick="">Annulla</button>
         <button class="go" data-select="${esc(entity)}" data-option="${esc(picked)}" data-clear-pick>Conferma</button>
       </div>`
    : '';
  return `<div class="segmented ${cls}">${buttons}</div>${confirm}`;
}

 
export function currentOperatingMode(store, climate) {
  const season = store.get(climate.season)?.state;
  const pump = store.get(climate.heat_pump?.mode)?.state;
  return (climate.operating_mode ?? []).find((f) => f.airzone === season && f.heat_pump === pump) ?? null;
}

function operatingModeSection({ store, services, ui }, climate) {
  const modes = climate.operating_mode ?? [];
  if (!modes.length || !store.get(climate.season) || !store.get(climate.heat_pump?.mode)) return '';
  const enabled = [climate.season, climate.heat_pump.mode].every((id) => services.canControl(id) && !isUnavailable(store.get(id)));
  const current = currentOperatingMode(store, climate);
  const [pickKey, pickId] = String(ui.pick ?? '').split('=');
  const picked = pickKey === 'operating-mode' ? modes.find((f) => f.id === pickId) : null;
  const buttons = modes
    .map((f) => {
      const active = picked ? picked.id === f.id : current?.id === f.id;
      const attrs = !enabled || current?.id === f.id ? 'disabled' : `data-pick="operating-mode=${esc(f.id)}"`;
      return `<button class="${active ? 'active' : ''} ${picked?.id === f.id ? 'chosen' : ''}" data-tone="${esc(f.tone ?? '')}" ${attrs} aria-pressed="${active}">${esc(f.name)}</button>`;
    })
    .join('');
  const confirm = picked
    ? `<div class="hint warn">Passare a «${esc(picked.name)}»? Vale per tutta la casa: Airzone in ${esc(SEASONS[picked.airzone] ?? picked.airzone)}, pompa di calore in ${esc(PUMP_MODES[picked.heat_pump] ?? picked.heat_pump)}.</div>
       <div class="confirm">
         <button data-pick="">Annulla</button>
         <button class="go" data-mode-set="${esc(picked.id)}">Conferma</button>
       </div>`
    : '';
  const mismatch = !current && !picked
    ? `<div class="hint warn">Airzone (${esc(seasonLabel(store.get(climate.season).state))}) e pompa di calore (${esc(PUMP_MODES[store.get(climate.heat_pump.mode).state] ?? store.get(climate.heat_pump.mode).state)}) non sono allineati: i due selettori singoli sono in fondo.</div>`
    : '';
  return `
    <section>
      <h3>Funzionamento</h3>
      <div class="segmented">${buttons}</div>
      ${confirm}${mismatch}
      <div class="hint">Imposta insieme la stagione dell'impianto Airzone e la pompa di calore.</div>
    </section>`;
}

function dhwSettings({ store, services, ui }, dhw) {
  const items = (dhw?.settings ?? []).filter((i) => store.get(i.entity));
  if (!items.length) return '';
  const [pickEntity, pickOption] = String(ui.pick ?? '').split('=');
  const blocks = items.map((i) => {
    const st = store.get(i.entity);
    const enabled = services.canControl(i.entity) && !isUnavailable(st);
    const warning = (option) => i.alerts?.[option] ?? (option === 'off' ? i.off_warning : null);
    const ask = (label, option) => `Impostare «${esc(i.name)}» su «${esc(label)}»?${warning(option) ? ` ${esc(warning(option))}` : ''}`;
    if (i.entity.startsWith('number.')) {
      
      const current = Number(st.state);
      const step = i.passo ?? 1;
      const pending = pickEntity === i.entity ? Number(pickOption) : null;
      const shown = pending !== null && Number.isFinite(pending) && pending !== current ? pending : current;
      const unit = i.unit ?? '';
      const can = enabled && Number.isFinite(current);
      const next = (d) => Math.round((shown + d * step) * 100) / 100;
      const btn = (d, label) => {
        const v = next(d);
        return `<button ${can && v >= i.min && v <= i.max ? `data-pick="${esc(i.entity)}=${v}"` : 'disabled'} aria-label="${d < 0 ? 'Diminuisci' : 'Aumenta'}">${label}</button>`;
      };
      const changed = shown !== current;
      const confirm = changed
        ? `<div class="hint warn">Impostare «${esc(i.name)}» a ${esc(fmtNumber(shown, 0))}${esc(unit)}?</div>
           <div class="confirm"><button data-pick="">Annulla</button><button class="go" data-number-set="${esc(i.entity)}" data-value="${shown}">Conferma</button></div>`
        : '';
      return `<section><h3>${esc(i.name)}</h3><div class="stepper">${btn(-1, '−')}<b class="num ${changed ? 'chosen' : ''}">${Number.isFinite(shown) ? esc(fmtNumber(shown, 0)) : '—'}${esc(unit)}</b>${btn(1, '+')}</div>${confirm}</section>`;
    }
    if (i.entity.startsWith('switch.')) {
      const labels = { on: 'Acceso', off: 'Spento' };
      const picked = pickEntity === i.entity ? pickOption : null;
      const buttons = ['on', 'off']
        .map((o) => {
          const active = picked ? picked === o : st.state === o;
          const attrs = !enabled || st.state === o ? 'disabled' : `data-pick="${esc(i.entity)}=${o}"`;
          return `<button class="${active ? 'active' : ''} ${picked === o ? 'chosen' : ''}" data-tone="${o === 'on' ? '' : 'neutral'}" ${attrs} aria-pressed="${active}">${labels[o]}</button>`;
        })
        .join('');
      const confirm = picked
        ? `<div class="hint warn">${ask(labels[picked], picked)}</div>
           <div class="confirm"><button data-pick="">Annulla</button><button class="go" data-toggle="${esc(i.entity)}" data-clear-pick>Conferma</button></div>`
        : '';
      return `<section><h3>${esc(i.name)}</h3><div class="segmented two">${buttons}</div>${confirm}</section>`;
    }
    const labels = i.labels ?? {};
    const many = (st.attributes.options ?? []).length > 5;
    return `<section><h3>${esc(i.name)}</h3>${confirmSelect({ store, services, ui }, i.entity, labels, many ? 'wrap' : '', ask)}</section>`;
  });
  return `
    <details class="adv">
      <summary>${icon('mdi:chevron-right', 'icon chev')}Impostazioni acqua calda</summary>
      ${blocks.join('')}
    </details>`;
}

const waterColor = (t) => (t === null ? 'var(--bc-border-strong)' : t < 35 ? '#6EA8E0' : t < 42 ? '#E8C23D' : t < 50 ? '#E8A33D' : '#EF8A6F');

function renderDhw({ store, services }, dhw) {
  if (!dhw) return '';
  const num = (id) => stateNumber(store, id);
  const on = (id) => store.get(id)?.state === 'on';
  const top = num(dhw.temperature), bottom = num(dhw.temperature_low), target = num(dhw.target);
  const charging = on(dhw.charging);
  const t = (v) => (v === null ? '—' : `${fmtNumber(v)}°`);
  
  
  const tank = `<svg class="dhw-tank" viewBox="0 0 120 200" role="img" aria-label="Bollitore: in alto ${t(top)}, in basso ${t(bottom)}">
    <defs>
      <linearGradient id="dhwWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0.12" stop-color="${waterColor(top)}"/><stop offset="0.9" stop-color="${waterColor(bottom ?? top)}"/></linearGradient>
      <linearGradient id="dhwShine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".3" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
    </defs>
    <path d="M94 34 H112" stroke="#EF8A6F" stroke-width="5" stroke-linecap="round"/>
    <path d="M94 156 H112" stroke="#6EA8E0" stroke-width="5" stroke-linecap="round"/>
    <path d="M30 176 v14 M90 176 v14" stroke="var(--bc-text-2)" stroke-width="5" stroke-linecap="round"/>
    <path d="M22 30 Q22 12 60 10 Q98 12 98 30 V164 Q98 180 60 182 Q22 180 22 164 Z" fill="url(#dhwWater)"/>
    <path d="M22 30 Q22 12 60 10 Q98 12 98 30 V164 Q98 180 60 182 Q22 180 22 164 Z" fill="url(#dhwShine)"/>
    <path d="M22 30 Q22 12 60 10 Q98 12 98 30 V164 Q98 180 60 182 Q22 180 22 164 Z" fill="none" stroke="var(--bc-text-2)" stroke-width="2" opacity=".7"/>
    <path d="M22 30 Q60 40 98 30 M22 164 Q60 174 98 164" fill="none" stroke="var(--bc-text-2)" stroke-width="1.5" opacity=".45"/>
    <rect x="44" y="18" width="32" height="10" rx="3" fill="var(--bc-bg)" opacity=".75"/>
    <circle cx="70" cy="23" r="2" fill="${charging ? 'var(--bc-amber)' : 'var(--bc-text-2)'}"/>
    <rect x="36" y="44" width="48" height="36" rx="10" fill="var(--bc-bg)" opacity=".55"/>
    <text x="60" y="58" class="l">in alto</text><text x="60" y="74">${t(top)}</text>
    <rect x="36" y="114" width="48" height="36" rx="10" fill="var(--bc-bg)" opacity=".55"/>
    <text x="60" y="128" class="l">in basso</text><text x="60" y="144">${t(bottom)}</text>
  </svg>`;
  const btn = (id, ic, label) => {
    if (!id) return '';
    const st = store.get(id);
    const enabled = services.canControl(id) && !isUnavailable(st);
    return `<button class="${on(id) ? 'on' : ''}" ${enabled ? `data-toggle="${esc(id)}"` : 'disabled'} aria-pressed="${on(id)}">${icon(ic)}${esc(label)}${on(id) ? ' attiva' : ''}</button>`;
  };
  return `
    <section><h3>Acqua calda sanitaria</h3>
      <div class="dhw">${tank}
        <div class="dhw-side">
          <div class="dhw-row"><span>Al rubinetto</span><b>${t(top)}</b></div>
          <div class="dhw-row"><span>Sensore di carica (basso)</span><b>${t(bottom)}</b></div>
          ${dhw.target ? `<div class="dhw-row"><span>Obiettivo</span><b>${t(target)}</b></div>` : ''}
          ${dhw.charging ? `<div class="dhw-row"><span>Stato</span><b class="${charging ? 'on' : ''}">${charging ? 'In carica' : 'Ferma'}</b></div>` : ''}
          ${dhw.recirculation && store.get(dhw.recirculation) ? `<div class="dhw-row"><span>Pompa di ricircolo</span><b class="${on(dhw.recirculation) ? 'on' : ''}">${isUnavailable(store.get(dhw.recirculation)) ? '—' : on(dhw.recirculation) ? 'In funzione' : 'Ferma'}</b></div>` : ''}
          <div class="dhw-btns">${btn(dhw.charge, 'mdi:water-boiler', 'Carica')}${btn(dhw.disinfection, 'mdi:bacteria-outline', 'Disinfezione')}</div>
        </div>
      </div>
    </section>`;
}

export function renderClimate({ store, model, services, ui = {} }) {
  const climate = model.climate;
  if (!climate) return '<p class="placeholder">Clima non configurato in config.json.</p>';
  const pump = climate.heat_pump ?? {};
  const v = (id) => stateValue(store, id);
  const n = (id) => stateNumber(store, id);
  const temp = (id) => (n(id) === null ? '—' : `${fmtNumber(n(id))}°`);
  const activity = v(pump.activity);
  const act = ACTIVITY[String(activity).toLowerCase()] ?? activity ?? '—';
  const running = activity && activity !== 'off';
  const cooling = /raffredd|cool/i.test(String(activity));
  const power = n(pump.power);
  
  
  const compressor = Boolean(running);
  const code = v(pump.last_error);
  
  
  
  const thermal = n(pump.thermal_power);
  const watts = (w) => (w === null ? '—' : w >= 1000 ? `${fmtNumber(w / 1000, 2)} <small>kW</small>` : `${fmtNumber(w, 0)} <small>W</small>`);
  const liveCop = cooling ? n(pump.eer) : n(pump.cop);
  const copLabel = cooling ? 'EER' : 'COP';
  const avg = (mode) => {
    const m = pump.averages?.[mode];
    if (!m) return null;
    const out = n(m.delivered), used = (m.consumed ?? []).reduce((sum, id) => (sum === null || n(id) === null ? null : sum + n(id)), 0);
    return out > 0 && used > 0 ? out / used : null;
  };
  const MODE_OF = { riscaldamento: 'heating', 'acqua calda': 'hot_water', raffreddamento: 'cooling' };
  const activeMode = MODE_OF[String(activity).toLowerCase()] ?? null;
  const short = { heating: 'risc.', hot_water: 'ACS', cooling: 'raffr.' };
  const avgNote = activeMode && avg(activeMode) !== null
    ? `adesso · medio ${fmtNumber(avg(activeMode), 1)}`
    : Object.keys(short).filter((k) => avg(k) !== null).map((k) => `${short[k]} ${fmtNumber(avg(k), 1)}`).join(' · ');
  const powerRow = pump.power || pump.thermal_power
    ? `<div class="cl-grid">
        ${pump.thermal_power ? `<div class="cl-tile warm"><span class="k">${icon('mdi:fire')}Termica</span><b>${thermal === null ? '—' : watts(thermal * 1000)}</b><span>${cooling ? 'fredda resa' : 'calore reso'}</span></div>` : ''}
        ${pump.power ? `<div class="cl-tile cold"><span class="k">${icon('mdi:flash')}Elettrica</span><b>${watts(power)}</b><span>assorbita</span></div>` : ''}
        <div class="cl-tile ${liveCop !== null ? 'good' : ''}"><span class="k">${icon('mdi:gauge')}${copLabel}</span><b>${liveCop !== null ? fmtNumber(liveCop, 1) : '—'}</b><span>${liveCop !== null ? avgNote : avgNote || 'compressore fermo'}</span></div>
      </div>`
    : '';
  const tile = (ic, label, value, note = '', cls = '') =>
    `<div class="cl-tile ${cls}"><span class="k">${icon(ic)}${esc(label)}</span><b>${value}</b>${note ? `<span>${note}</span>` : ''}</div>`;

  return `
    ${operatingModeSection({ store, services, ui }, climate)}
    ${autoAirSection({ store, climate })}
    ${heatingSection({ store, climate })}
    <section>
      <h3>Pompa di calore</h3>
      <div class="hp-hero ${running ? (cooling ? 'cool' : 'run') : ''}">${icon('mdi:heat-pump')}
        <span class="txt"><span class="a">${esc(act)}</span><span class="b">Compressore ${compressor ? 'in funzione' : 'fermo'}</span></span>
      </div>
      ${powerRow}
      <div class="cl-grid">
        ${pump.outdoor ? tile('mdi:thermometer', 'Esterna', temp(pump.outdoor), pump.outdoor_damped ? `smorzata ${n(pump.outdoor_damped) === null ? '—' : `${fmtNumber(n(pump.outdoor_damped))}°`}` : 'sensore della pompa') : ''}
        ${pump.room ? tile('mdi:home-thermometer-outline', 'Ambiente', temp(pump.room), 'dal comando a muro') : ''}
        ${pump.supply ? tile('mdi:arrow-right-bold', 'Mandata', temp(pump.supply), pump.supply_target ? `obiettivo ${n(pump.supply_target) === null ? '—' : `${fmtNumber(n(pump.supply_target))}°`}` : '', 'warm') : ''}
        ${pump.return ? tile('mdi:arrow-left-bold', 'Ritorno', temp(pump.return), n(pump.supply) !== null && n(pump.return) !== null ? `Δ ${fmtNumber(n(pump.supply) - n(pump.return))}°` : '', 'cold') : ''}
        ${pump.starts ? tile('mdi:counter', 'Avvii compressore', n(pump.starts) === null ? '—' : fmtNumber(n(pump.starts), 0)) : ''}
        ${pump.last_error ? `<div class="cl-tile"><span class="k">${icon('mdi:alert-circle-outline')}Ultimo codice</span><span class="code">${esc(code ?? '—')}</span></div>` : ''}
      </div>
    </section>
    ${renderDhw({ store, services }, climate.hot_water)}
    ${dhwSettings({ store, services, ui }, climate.hot_water)}
    <details class="adv">
      <summary>${icon('mdi:chevron-right', 'icon chev')}Impostazioni singole</summary>
      <section>
        <h3>Stagione impianto (Airzone)</h3>
        ${confirmSelect({ store, services, ui }, climate.season, SEASONS)}
        <div class="hint">Nelle zone si accende e si spegne; la stagione vale per tutte.</div>
      </section>
      <section>
        <h3>Modalità pompa di calore</h3>
        ${pump.mode ? confirmSelect({ store, services, ui }, pump.mode, PUMP_MODES, 'two') : ''}
      </section>
    </details>`;
}
