// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { batteryIcon } from './bc-security.js';
import { zoneButton } from './robot-zone.js';
import { scheduleRow, scheduleWatchedIds } from './robot-schedules.js';
import { ULTIMA_STYLES, ultimaSection, ultimaWatchedIds } from './robot-last-clean.js';
import { esc, fmtNumber, fmtWhen, isUnavailable, stateValue } from '../core/format.js';
import { maintenanceRows, robotErrorText } from '../core/robot.js';

export const ROBOT_STYLES = `
  ${ULTIMA_STYLES}
  .robot { display: flex; flex-direction: column; gap: 22px; }
  .robot-hero { display: flex; align-items: center; gap: 16px; }
  .robot-hero > .icon { width: 44px; height: 44px; color: var(--bc-green); flex: none; }
  .robot-hero .state { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
  .robot-hero .label { font: 600 24px/1.1 var(--bc-font-display); }
  .robot-hero .detail { font-size: 14px; color: var(--bc-text-2); }
  .robot-hero .detail.alert { color: var(--bc-red); }
  .robot-hero .battery { display: flex; align-items: center; gap: 4px; font-size: 15px; color: var(--bc-text-2); }
  .robot-hero .battery .icon { width: 20px; height: 20px; }
  .robot-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .robot-actions button, .rooms-go {
    display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px;
    border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 15px; font-weight: 500;
  }
  .robot-actions button:not(:disabled):active, .rooms button:not(:disabled):active { background: var(--bc-border); }
  .robot-actions button:disabled, .rooms-go:disabled { color: var(--bc-text-2); opacity: .5; cursor: default; }
  .robot-actions button.primary:not(:disabled) { background: var(--bc-green); color: var(--bc-bg); }
  
  .dock-btns { display: flex; gap: 8px; flex: none; }
  .dock-btns button {
    width: var(--bc-touch); height: var(--bc-touch); border-radius: 50%; background: var(--bc-surface);
    display: inline-flex; align-items: center; justify-content: center; color: var(--bc-text-2);
  }
  .dock-btns button .icon { width: 22px; height: 22px; }
  .dock-btns button:not(:disabled):active { background: var(--bc-border); }
  .dock-btns button:disabled { opacity: .35; cursor: default; }
  .dock-btns button.active:disabled { opacity: 1; }
  .dock-btns button.active { color: var(--bc-green); box-shadow: inset 0 0 0 1.5px var(--bc-green); }
  
  @media (max-width: 480px) {
    .robot-hero { flex-wrap: wrap; }
    .dock-btns { order: 5; flex: 1 0 100%; }
    .dock-btns button { flex: 1; width: auto; border-radius: var(--bc-radius-inner); }
  }
  .rooms { display: flex; flex-wrap: wrap; gap: 8px; }
  .rooms button {
    min-height: var(--bc-touch); padding: 0 16px; border-radius: 999px; background: var(--bc-surface);
    border: 1px solid transparent; font-size: 14px; color: var(--bc-text-2);
  }
  .rooms button.active { border-color: var(--bc-green); color: var(--bc-green); }
  .rooms-go { width: 100%; margin-top: 10px; }
  .rooms-go:not(:disabled) { background: var(--bc-green); color: var(--bc-bg); }
  
  .maint { display: flex; flex-direction: column; gap: 6px; }
  .maint-row { display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 8px 8px 8px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .maint-row > .icon { width: 24px; height: 24px; flex: none; color: var(--bc-text-2); }
  .maint-row .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .maint-row .n { font-size: 15px; font-weight: 500; }
  .maint-row .left { font-size: 13px; color: var(--bc-text-2); }
  .maint-row .track { height: 4px; border-radius: 2px; background: var(--bc-border); overflow: hidden; }
  .maint-row .track > span { display: block; height: 100%; background: var(--bc-green); }
  .maint-row.m-presto .left, .maint-row.m-presto > .icon { color: var(--bc-amber); }
  .maint-row.m-presto .track > span { background: var(--bc-amber); }
  .maint-row.m-scaduta .left, .maint-row.m-scaduta > .icon { color: var(--bc-red); }
  .maint-row.m-scaduta .track > span { background: var(--bc-red); }
  .maint-row .reset {
    width: var(--bc-touch); height: var(--bc-touch); flex: none; display: grid; place-items: center; border-radius: 50%;
    background: var(--bc-bg); color: var(--bc-text-2);
  }
  .maint-row .reset { --hold-color: var(--bc-green); }
  .maint-row .reset:disabled { opacity: .35; cursor: default; }
  .robot-settings h4 { margin: 14px 0 8px; font-size: 13px; font-weight: 500; color: var(--bc-text-2); }
  .robot-settings h4:first-child { margin-top: 0; }
  .robot .segmented button.active { background: var(--bc-green); }
  .robot .segmented button.active.washes { background: var(--bc-amber); }
  
  @media (max-width: 420px) { .robot .segmented button { padding: 0 2px; font-size: 13px; } }
`;

const STATES = {
  cleaning: 'In pulizia', docked: 'Alla base', idle: 'Fermo', paused: 'In pausa',
  returning: 'Rientro alla base', error: 'Errore',
};

const DOCK_STATES = {
  charging: 'In carica', charging_complete: 'Carico', washing_the_mop: 'Lava il mocio',
  emptying_the_bin: 'Svuota il contenitore', going_to_wash_the_mop: 'Va a lavare il mocio', updating: 'Aggiornamento',
};

const WASHES = new Set(['vac_and_mop', 'mop']);
export const MODES = { vacuum: 'Aspira', vac_and_mop: 'Aspira e lava', mop: 'Lava', smart_mode: 'Smart' };
const FAN = { quiet: 'Silenziosa', balanced: 'Bilanciata', turbo: 'Turbo', max: 'Max', max_plus: 'Max+' };
const MOP = { mild: 'Bassa', standard: 'Media', intense: 'Alta', extreme: 'Massima' };

 
const fmtSecondsLeft = (sec) => {
  const min = Math.max(1, Math.round(sec / 60));
  return min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}` : `${min} min`;
};

const valueOf = stateValue;

export function robotWatchedIds(robot) {
  if (!robot) return [];
  const roles = Object.entries(robot).filter(([k, v]) => typeof v === 'string' && k !== 'name').map(([, v]) => v);
  return [
    ...roles,
    ...(robot.dock ?? []).map((d) => d.entity),
    ...(robot.dock_problems ?? []).map((p) => p.entity),
    ...(robot.maintenance ?? []).flatMap((m) => [m.entity, m.reset]),
    ...scheduleWatchedIds(robot),
    ...ultimaWatchedIds(robot),
  ];
}

 
export function robotSummary(store, robot) {
  const state = valueOf(store, robot.vacuum);
  const battery = valueOf(store, robot.battery);
  return [STATES[state] ?? state ?? 'Non disponibile', battery !== null ? `${fmtNumber(battery, 0)}%` : null].filter(Boolean).join(' · ');
}

 
export function robotZoneControls({ store, robot, services }) {
  const vac = store.get(robot.vacuum);
  const state = isUnavailable(vac) ? null : vac.state;
  const mode = valueOf(store, robot.mode);
  const can = robot.mode && services.canControl(robot.mode) && state !== null;
  const buttons = Object.entries(MODES)
    .map(([option, label]) => `<button class="${mode === option ? `active${WASHES.has(option) ? ' washes' : ''}` : ''}" ${can ? `data-select="${esc(robot.mode)}" data-option="${esc(option)}"` : 'disabled'} aria-pressed="${mode === option}">${esc(label)}</button>`)
    .join('');
  const fan = FAN[vac?.attributes.fan_speed];
  const mop = MOP[valueOf(store, robot.mop)];
  const rest = mode === 'smart_mode' ? 'Potenza e mocio li sceglie il robot' : [mode !== 'mop' && fan ? `Potenza ${fan.toLowerCase()}` : null, mode !== 'vacuum' && mop ? `Mocio ${mop.toLowerCase()}` : null].filter(Boolean).join(' · ');
  return { modes: robot.mode ? buttons : '', rest };
}

 
export function robotSettings({ store, robot, services }) {
  const v = (role) => valueOf(store, robot[role]);
  const vac = store.get(robot.vacuum);
  const state = isUnavailable(vac) ? null : vac.state;
  const can = (id) => id && services.canControl(id) && state !== null;
  
  const mode = v('mode');
  const fan = vac?.attributes.fan_speed;
  const mop = v('mop');
  
  const segmented = (options, current, attrs, extra = () => '') =>
    `<div class="segmented n${Object.keys(options).length}">${Object.entries(options)
      .map(([option, label]) => `<button class="${current === option ? `active${extra(option)}` : ''}" ${attrs(option)} aria-pressed="${current === option}">${esc(label)}</button>`)
      .join('')}</div>`;
  const selectAttrs = (id) => (option) => (can(id) ? `data-select="${esc(id)}" data-option="${esc(option)}"` : 'disabled');
  const fanAttrs = (option) => (can(robot.vacuum) ? `data-fan="${esc(robot.vacuum)}" data-option="${esc(option)}"` : 'disabled');
  return [
    robot.mode ? `<h4>Modalità</h4>${segmented(MODES, mode, selectAttrs(robot.mode), (o) => (WASHES.has(o) ? ' washes' : ''))}` : '',
    mode === 'smart_mode' ? '<p class="hint">In Smart potenza e mocio li sceglie il robot stanza per stanza.</p>' : '',
    mode !== 'smart_mode' && mode !== 'mop' ? `<h4>Potenza aspirazione</h4>${segmented(FAN, fan, fanAttrs)}` : '',
    robot.mop && mode !== 'smart_mode' && mode !== 'vacuum' ? `<h4>Intensità lavaggio</h4>${segmented(MOP, mop, selectAttrs(robot.mop))}` : '',
  ].join('');
}

export function renderRobot({ store, model, services, ui, hassUrl }) {
  const robot = model.robot;
  if (!robot) return '<p class="placeholder">Robot non configurato in config.json.</p>';
  const v = (role) => valueOf(store, robot[role]);
  const vac = store.get(robot.vacuum);
  const state = isUnavailable(vac) ? null : vac.state;
  const can = (id) => id && services.canControl(id) && state !== null;
  const battery = Number(v('battery'));
  const error = v('error');
  const hasError = state === 'error' || (error && error !== 'none');

  
  let detail;
  if (hasError) detail = error && error !== 'none' ? `Errore: ${robotErrorText(error).toLowerCase()}` : 'Controlla il robot';
  else if (state === 'cleaning') detail = [v('room'), v('progress') !== null ? `${fmtNumber(v('progress'), 0)}%` : null].filter(Boolean).join(' · ');
  
  else if (state === 'docked' && ['washing_the_mop', 'going_to_wash_the_mop', 'emptying_the_bin'].includes(v('state'))) detail = DOCK_STATES[v('state')];
  else if (state === 'docked' && Number(v('drying')) > 0) detail = `Asciuga il mocio · ${fmtSecondsLeft(Number(v('drying')))}`;
  else if (state === 'docked' && DOCK_STATES[v('state')]) detail = DOCK_STATES[v('state')];
  else if (v('last_clean')) detail = `Ultima pulizia ${fmtWhen(v('last_clean')) ?? '—'}`;

  const busy = state === 'cleaning' || state === 'returning';
  
  const dockWarn = (robot.dock_problems ?? []).filter((p) => store.get(p.entity)?.state === 'on').map((p) => p.text);
  const dockSent = (robot.dock ?? []).find((d) => ui.sent?.[d.entity])?.sent;
  let warnLine = false;
  if (!hasError && dockWarn.length) {
    detail = dockWarn.length > 1 ? `${dockWarn[0]} (+${dockWarn.length - 1})` : dockWarn[0];
    warnLine = true;
  }
  if (dockSent && !hasError) {
    detail = dockSent;
    warnLine = false;
  }
  const action = (name, label, ic, enabled, cls = '') =>
    `<button class="${cls}" ${can(robot.vacuum) && enabled ? `data-vacuum="${esc(robot.vacuum)}" data-action="${name}"` : 'disabled'}>${icon(ic)}${label}</button>`;

  
  const picked = ui.rooms ?? [];
  const rooms = robot.rooms.length
    ? `<div class="rooms">${robot.rooms
        .map((r) => `<button class="${picked.includes(r.id) ? 'active' : ''}" data-room="${esc(r.id)}" aria-pressed="${picked.includes(r.id)}">${esc(r.name)}</button>`)
        .join('')}${robot.map ? zoneButton(can(robot.vacuum) && !busy) : ''}</div>
       <button class="rooms-go" ${picked.length && can(robot.vacuum) && !busy ? `data-clean-rooms="${esc(robot.vacuum)}"` : 'disabled'}>${
         picked.length ? `Pulisci ${picked.length === 1 ? '1 stanza' : `${picked.length} stanze`}` : 'Scegli le stanze'
       }</button>`
    : '<p class="hint">Nessuna stanza associata: in HA apri le impostazioni di Robot e associa le aree alle stanze della mappa.</p>';

  const settings = robotSettings({ store, robot, services });

  
  
  const dock = (robot.dock ?? []).filter((d) => store.get(d.entity));
  const dockHtml = dock.length
    ? `<div class="dock-btns">${dock
        .map((d) => {
          const on = store.get(d.entity)?.state === 'on';
          const sent = ui.sent?.[d.entity];
          
          const running = (d.states ?? []).includes(v('state')) || (d.dry && Number(v('drying')) > 0);
          const enabled = can(d.entity) && !isUnavailable(store.get(d.entity)) && !running && (on || !busy);
          return `<button class="${on || sent || running ? 'active' : ''}" ${enabled ? `data-toggle="${esc(d.entity)}" data-sent="${esc(d.entity)}"` : 'disabled'} aria-pressed="${on || running}" aria-label="${esc(d.name)}" title="${esc(d.name)}">${icon(sent ? 'mdi:check' : d.icon ?? 'mdi:power')}</button>`;
        })
        .join('')}</div>`
    : '';

  
  
  const threshold = model.alerts?.robot_maintenance_hours;
  const maint = maintenanceRows(store, robot, threshold)
    .map(({ item, hours, status }) => {
      
      const reset = item.reset && store.get(item.reset) && store.get(item.reset).state !== 'unavailable' && services.canControl(item.reset);
      const left = status === 'scaduta' ? `Scaduto da ${fmtNumber(Math.abs(hours), 0)} h` : `Ancora ${fmtNumber(hours, 0)} h`;
      const pct = item.total ? Math.max(0, Math.min(100, (hours / item.total) * 100)) : null;
      return `
        <div class="maint-row m-${status}">
          ${icon(item.icon ?? 'mdi:wrench-outline')}
          <div class="txt"><span class="n">${esc(item.name)}</span><span class="left num">${esc(left)}</span>${pct !== null ? `<span class="track"><span style="width:${pct.toFixed(0)}%"></span></span>` : ''}</div>
          ${item.reset ? `<button class="reset" ${reset ? `data-hold="${esc(item.reset)}"` : 'disabled'} aria-label="Azzera ${esc(item.name)}: tieni premuto 1 secondo, dopo aver ${item.verb === 'sostituire' ? 'sostituito' : 'pulito'}" title="Azzera: tieni premuto">${icon('mdi:restore')}</button>` : ''}
        </div>`;
    })
    .join('');

  return `
    <div class="robot">
      <section class="robot-hero">
        ${icon('mdi:robot-vacuum')}
        <div class="state">
          <span class="label">${esc(STATES[state] ?? state ?? 'Non disponibile')}</span>
          ${detail ? `<span class="detail ${hasError || warnLine ? 'alert' : ''} num">${esc(detail)}</span>` : ''}
        </div>
        ${dockHtml}
        <span class="battery num">${icon(batteryIcon(battery))}${Number.isFinite(battery) ? `${fmtNumber(battery, 0)}%` : '—'}</span>
      </section>
      <section><div class="robot-actions">
        ${action('start', state === 'paused' ? 'Riprendi' : 'Avvia', 'mdi:play', state !== 'cleaning' && (state === 'paused' || !picked.length), 'primary')}
        ${action('pause', 'Pausa', 'mdi:pause', busy)}
        ${action('return_to_base', 'Base', 'mdi:home-import-outline', state !== 'docked' && state !== 'returning')}
      </div>${scheduleRow({ store, robot })}</section>
      <section><h3>Stanze</h3>${rooms}</section>
      <section class="robot-settings"><h3>Impostazioni</h3>${settings}</section>
      ${ultimaSection({ store, robot, hassUrl, refresh: ui.refresh, cleaning: state === 'cleaning' })}
      ${maint ? `<section><h3>Manutenzione</h3><div class="maint">${maint}</div><p class="hint">Dopo aver pulito o sostituito una parte, tieni premuto il pulsante per azzerare il contatore.</p></section>` : ''}
    </div>`;
}
