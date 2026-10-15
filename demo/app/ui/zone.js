// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { bslider, icon, sliderText } from './base.js';
import { esc, fmtNumber, isUnavailable } from '../core/format.js';
import { seasonLabel } from './climate.js';
import { EAQI_PM25, VOC_INDEX, airBand, airBandPos, airValue, vocScale } from '../core/air.js';

export const COVER_STYLES = `
  .cover { background: var(--bc-surface); border-radius: 14px; padding: 6px 16px 10px; display: flex; flex-direction: column; gap: 2px; }
  .cover .toggle {
    display: flex; align-items: center; gap: 10px; min-height: var(--bc-touch); width: 100%; text-align: left;
  }
  .cover .toggle .icon { color: var(--bc-text-2); }
  .cover .toggle .n { flex: 1; min-width: 0; font-size: 15px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cover .toggle .st { font-size: 14px; color: var(--bc-text-2); white-space: nowrap; }
  .cover .toggle .st.moving { color: var(--bc-amber); }
  .cover-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .cover-grid > :only-child { grid-column: 1 / -1; }
  .sec-head .actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
  .presets { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
  .presets .lbl { font-size: 13px; color: var(--bc-text-2); }
  .seg { display: inline-flex; border: 1px solid var(--bc-border-strong); border-radius: 12px; overflow: hidden; }
  .seg button { min-height: var(--bc-touch); padding: 0 16px; font-size: 14px; font-weight: 500; }
  .seg button + button { border-left: 1px solid var(--bc-border-strong); }
  .seg button:active { background: var(--bc-border); }
  .seg button.active { color: var(--bc-green); background: color-mix(in srgb, var(--bc-green) 14%, transparent); }
  
  .presets .seg button.active { color: var(--bc-cover); background: color-mix(in srgb, var(--bc-cover) 16%, transparent); }
`;

export const ZONE_STYLES = `
  ${COVER_STYLES}
  .alert-banner {
    display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px;
    background: color-mix(in srgb, var(--bc-red) 14%, transparent); color: var(--bc-red); font-size: 14px; font-weight: 500;
  }
  .alert-banner.warn { background: color-mix(in srgb, var(--bc-amber) 14%, transparent); color: var(--bc-amber); }
  .sec-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .sec-head h3 { margin: 0; }
  .ghost {
    min-height: var(--bc-touch); padding: 0 14px; border-radius: 12px; border: 1px solid var(--bc-border-strong);
    font-size: 14px; font-weight: 500;
  }
  .ghost:disabled { opacity: .35; cursor: default; }
  .ghost.icon-only { width: var(--bc-touch); padding: 0; display: inline-flex; align-items: center; justify-content: center; }
  
  .climate {
    --st: var(--bc-text-2); container-type: inline-size;
    background: var(--bc-surface); border: 1px solid transparent; border-radius: 16px; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .climate.working { border-color: color-mix(in srgb, var(--st) 38%, transparent); }
  .climate-row { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }
  .climate-power {
    width: var(--bc-touch); height: var(--bc-touch); border-radius: 12px; display: grid; place-items: center; flex: none;
    border: 1px solid var(--bc-border-strong); color: var(--bc-text-2);
  }
  .climate-power:disabled { opacity: .35; cursor: default; }
  .climate.active .climate-power {
    color: var(--st); border-color: color-mix(in srgb, var(--st) 50%, transparent);
    background: color-mix(in srgb, var(--st) 16%, transparent);
  }
  .climate-info { flex: 1 1 150px; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .climate-state { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font: 600 16px/1.2 var(--bc-font-display); }
  .climate-state::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--st); }
  .climate-state small { font: 400 14px/1.2 var(--bc-font-text); color: var(--bc-text-2); }
  .climate:not(.active) .climate-state { color: var(--bc-text-2); }
  .climate-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 13px; color: var(--bc-text-2); font-variant-numeric: tabular-nums; }
  .climate-season { display: inline-flex; align-items: center; gap: 3px; min-height: 28px; color: var(--bc-text); }
  .climate-season .icon { width: 15px; height: 15px; }
  .climate-season .icon:last-child { color: var(--bc-text-2); margin-left: -2px; }
  .stepper { display: flex; align-items: center; gap: 10px; }
  .step {
    width: var(--bc-touch); height: var(--bc-touch); display: grid; place-items: center; border-radius: 12px;
    border: 1px solid var(--bc-border-strong); background: var(--bc-card);
  }
  .step:active { background: var(--bc-border); }
  .step:disabled { opacity: .35; cursor: default; }
  .target { display: flex; flex-direction: column; align-items: center; min-width: 78px; }
  .target small { font-size: 12px; color: var(--bc-text-2); }
  .target span { font: 600 26px/1.05 var(--bc-font-display); font-variant-numeric: tabular-nums; }
  .climate:not(.active) .target span { color: var(--bc-text-2); }
  .target span.pending { color: var(--bc-amber); }
  @container (max-width: 520px) { .stepper { flex-basis: 100%; justify-content: space-between; } }
  
  .rail { position: relative; height: 14px; }
  .rail::before { content: ''; position: absolute; inset: 5px 0; border-radius: 2px; background: var(--bc-border-strong); }
  .rail .gap { position: absolute; top: 5px; height: 4px; border-radius: 2px; background: var(--st); opacity: .75; }
  .rail .goal { position: absolute; top: 0; width: 3px; height: 14px; margin-left: -1.5px; border-radius: 2px; background: var(--bc-text); }
  .rail .now { position: absolute; top: 2px; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: var(--st); box-shadow: 0 0 0 3px var(--bc-surface); }
  .climate:not(.active) .rail .gap { display: none; }
  .climate:not(.active) .rail .goal { background: var(--bc-text-2); }
  .climate-fan { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
  .climate-fan .lbl { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--bc-text-2); margin-right: auto; }
  .climate-fan .seg button.active { color: var(--bc-blue); background: color-mix(in srgb, var(--bc-blue) 14%, transparent); }
  .climate-fan .seg button:disabled { opacity: .35; cursor: default; }
  
  .air { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 10px; }
  .air > :only-child { grid-column: 1 / -1; }
  .air-cell { --c: var(--bc-text-2); background: var(--bc-surface); border-radius: 14px; padding: 8px 14px 12px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .air-cell .line { display: flex; align-items: baseline; flex-wrap: wrap; gap: 0 7px; font-size: 13px; color: var(--bc-text-2); font-variant-numeric: tabular-nums; }
  .air-cell .line b { font: 500 18px/1.3 var(--bc-font-display); color: var(--bc-text); }
  .air-cell .line .j { font-weight: 500; color: var(--c); }
  .air-cell .line small { font-size: 12px; margin-left: -3px; }
  
  
  .climate .air { margin-top: 0; padding-top: 12px; border-top: 1px solid var(--bc-border-strong); gap: 10px 24px; }
  .climate .air-cell { background: none; border-radius: 0; padding: 0; }
  .air-cell[data-measure-open] { cursor: pointer; }
  .air-cell .row { display: flex; align-items: flex-start; gap: 8px; }
  .air-cell .line { flex: 1; min-width: 0; }
  .air-cell .vs { flex: none; margin-top: 8px; width: 10px; height: 10px; border-radius: 50%; background: var(--bc-green); }
  .air-cell .vs.worse { background: var(--bc-red); }
  .air-bar { position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 2px; height: 4px; margin-top: auto; }
  .air-bar span { opacity: .85; }
  .air-bar span:first-child { border-radius: 2px 0 0 2px; }
  .air-bar span:nth-last-child(2) { border-radius: 0 2px 2px 0; }
  .air-bar i { position: absolute; top: -3px; width: 3px; height: 10px; margin-left: -1.5px; border-radius: 2px; background: var(--bc-text); box-shadow: 0 0 0 2px var(--bc-surface); }
  .light-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .light {
    border-radius: 14px; border: 1px solid #2F3138; background: var(--bc-surface);
    display: flex; flex-direction: column; gap: 4px; padding: 0 10px 10px;
  }
  .light:not(:has(.bslider)) { padding-bottom: 0; }
  .light .main { min-height: 60px; padding: 0 4px; display: flex; align-items: center; gap: 12px; text-align: left; width: 100%; }
  .light .main:disabled { cursor: default; }
  .light .icon { color: var(--bc-text-2); }
  .light.on { background: color-mix(in srgb, var(--bc-amber) 14%, transparent); border-color: color-mix(in srgb, var(--bc-amber) 55%, transparent); }
  .light.on .icon { color: var(--bc-amber); }
  .light.unavailable { opacity: .5; }
  
  .light.wall-off { opacity: .7; }
  .light .txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .light .n { font-size: 15px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .light .s { font-size: 13px; color: var(--bc-text-2); }
  .light.on .s { color: var(--bc-amber); }
  .light-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; }
  .light-actions .lbl { font-size: 13px; color: var(--bc-text-2); margin-right: 4px; }
  .swatches { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .swatch {
    width: 44px; height: 44px; border-radius: 50%; padding: 0; flex: none;
    background: var(--c); border: 2px solid var(--bc-border); box-shadow: inset 0 0 0 3px var(--bc-card);
  }
  .swatch.active { border-color: var(--bc-text); }
  .swatch:disabled { opacity: .35; cursor: default; }
  .light-colors { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 10px 12px; margin-top: 12px; }
  .light-colors .lbl { font-size: 13px; color: var(--bc-text-2); }
  .light-colors .hint { grid-column: 1 / -1; margin: 0; }
  .light-actions .hint { flex-basis: 100%; margin: 0; }
  .light-actions .ghost.active { color: var(--bc-amber); border-color: color-mix(in srgb, var(--bc-amber) 55%, transparent); background: color-mix(in srgb, var(--bc-amber) 14%, transparent); }
`;

export function zoneWatchedIds(z, model) {
  const actionIds = z.lights.flatMap((id) => model.lightActions(id).flatMap((a) => [a.switch, a.turn_off_first]));
  const air = z.air ? [z.air.pm25, z.air.voc, model.weather?.pm25] : [];
  return [z.climate, z.zoneSwitch, ...z.demand, ...z.lights, ...z.covers, ...z.windows, model.climate?.season, ...actionIds, ...air].filter(Boolean);
}

export function zoneSubtitle(z, store) {
  const a = store.get(z.climate)?.attributes;
  if (!a) return '';
  return `${fmtNumber(a.current_temperature)}° · umidità ${fmtNumber(a.current_humidity, 0)}%`;
}

const ACTION = {
  cooling: ['Raffresca', 'var(--bc-blue)'],
  heating: ['Riscalda', 'var(--bc-amber)'],
  fan: ['Ventila', 'var(--bc-blue)'],
  drying: ['Deumidifica', 'var(--bc-blue)'],
  idle: ['In attesa', 'var(--bc-green)'],
  off: ['Spento', 'var(--bc-text-2)'],
};
const SEASON_ICON = { cool: 'mdi:snowflake', heat: 'mdi:fire' };
const FAN_MODE = { auto: 'Auto', low: 'Bassa', medium: 'Media', high: 'Alta' };

 
function airCell({ label, value, unit, hint, scale, top, outside = null, chart = null }) {
  
  const band = scale ? airBand(scale, value) : null;
  const pos = scale ? airBandPos(scale, value, top) : null;
  const judgement = value === null ? 'non disponibile' : band ? band[1] : '';
  const worse = value !== null && outside !== null && value > outside;
  const vs = value === null || outside === null ? '' : `${worse ? 'peggio' : 'meglio'} che fuori (${fmtNumber(outside, 0)})`;
  const text = `${label}: ${value === null ? judgement : [`${fmtNumber(value, 0)} ${unit ?? hint ?? ''}`.trim(), judgement, vs].filter(Boolean).join(', ')}`;
  return `
    <div class="air-cell" style="--c:${band ? band[2] : 'var(--bc-text-2)'}" title="${esc(text)}"${chart ? ` data-measure-open="${chart[0]}" data-entity="${esc(chart[1])}" role="button" tabindex="0" aria-label="${esc(label)}, apri il grafico"` : ''}>
      <div class="row"><div class="line"><span>${esc(label)}</span><b>${value === null ? '—' : fmtNumber(value, 0)}</b>${unit && value !== null ? `<small>${esc(unit)}</small>` : ''}<span class="j">${esc(judgement)}</span></div>${vs ? `<span class="vs ${worse ? 'worse' : ''}" role="img" aria-label="${esc(vs)}"></span>` : ''}</div>
      <div class="air-bar">${(scale ?? VOC_INDEX).map(([, , c]) => `<span style="background:${c}"></span>`).join('')}${pos === null ? '' : `<i style="left:${pos.toFixed(1)}%"></i>`}</div>
    </div>`;
}

 
export function renderZone({ store, model, services, ui = {} }, z) {
  const s = (id) => store.get(id);
  const can = (id) => id && services.canControl(id) && !isUnavailable(s(id));
  const parts = [];

  
  const open = z.windows.filter((id) => s(id)?.state === 'on');
  if (open.length) {
    const names = open.map((id) => model.shortName(id).replace(/^Allarme\s+/i, '')).join(', ');
    parts.push(`<div class="alert-banner">${icon('mdi:window-open-variant')}Finestra aperta${open.length > 1 || names ? ` · ${esc(names)}` : ''}</div>`);
  }

  
  
  let air = '';
  if (z.air) {
    const outside = airValue(store, model.weather?.pm25);
    const cells = [];
    if (z.air.pm25) cells.push(airCell({ label: 'PM2.5', value: airValue(store, z.air.pm25), unit: 'µg/m³', scale: EAQI_PM25, top: 200, outside, chart: ['zone_pm25', z.air.pm25] }));
    if (z.air.voc) {
      const scale = vocScale(z.air.voc);
      const typical = scale?.typical ? `di indice (di solito tra ${fmtNumber(scale.typical[0], 0)} e ${fmtNumber(scale.typical[1], 0)})` : 'di indice';
      cells.push(airCell({ label: 'VOC', value: airValue(store, z.air.voc), hint: typical, scale, top: 500, chart: ['zone_voc', z.air.voc] }));
    }
    air = `<div class="air">${cells.join('')}</div>`;
  }

  
  const climate = s(z.climate);
  if (climate || z.zoneSwitch) {
    const a = climate?.attributes ?? {};
    const sw = s(z.zoneSwitch);
    const on = sw ? sw.state === 'on' : climate?.state !== 'off';
    const [statusTxt, statusColor] = ACTION[a.hvac_action] ?? ACTION[on ? 'idle' : 'off'];
    const season = s(model.climate?.season)?.state;
    const demand = z.demand
      .filter((id) => s(id)?.state === 'on')
      .map((id) => (/pavimento/i.test(id) ? 'pavimento' : /aria/i.test(id) ? 'aria' : model.name(id)));

    const working = ['cooling', 'heating', 'fan', 'drying'].includes(a.hvac_action);
    const current = Number(a.current_temperature);
    
    
    const floorOnly = season === 'cool' && z.demand.length > 0 && !z.demand.some((id) => /aria/i.test(id));
    const powerLocked = floorOnly && !on;

    const power = z.zoneSwitch
      ? `<button class="climate-power" ${can(z.zoneSwitch) && !powerLocked ? `data-toggle="${esc(z.zoneSwitch)}"` : 'disabled'} aria-pressed="${on}" aria-label="${powerLocked ? 'Accensione non disponibile in Freddo' : `${on ? 'Spegni' : 'Accendi'} il termostato`}">${icon('mdi:power')}</button>`
      : '';
    const seasonLink = season
      ? `<button class="climate-season" data-open="#funzioni/clima" aria-label="Stagione ${esc(seasonLabel(season))}, apri Clima">${SEASON_ICON[season] ? icon(SEASON_ICON[season]) : ''}${esc(seasonLabel(season))}${icon('mdi:chevron-right')}</button>`
      : '';
    const meta = [Number.isFinite(current) ? `<span>Ora ${fmtNumber(current)}°</span>` : '', seasonLink].filter(Boolean).join('<span>·</span>');
    const info = `
      <div class="climate-info">
        <div class="climate-state">${esc(statusTxt)}${demand.length ? `<small>· ${esc(demand.join(' e '))}</small>` : ''}</div>
        ${powerLocked ? '<div class="climate-meta">Solo pavimento: non raffresca</div>' : ''}
        ${meta ? `<div class="climate-meta">${meta}</div>` : ''}
      </div>`;

    let stepper = '';
    let rail = '';
    if (climate && a.temperature !== undefined) {
      const pending = ui.targets?.[z.climate];
      const value = pending ?? a.temperature;
      const step = a.target_temp_step ?? 0.5;
      const enabled = can(z.climate);
      const min = a.min_temp ?? 5, max = a.max_temp ?? 35;
      const btn = (delta, ic, label, limit) =>
        `<button class="step" ${enabled && (delta < 0 ? value > limit : value < limit) ? `data-temp="${esc(z.climate)}" data-delta="${delta * step}"` : 'disabled'} aria-label="${label}">${icon(ic)}</button>`;
      stepper = `
        <div class="stepper">
          ${btn(-1, 'mdi:minus', 'Abbassa temperatura obiettivo', min)}
          <span class="target"><span class="${pending !== undefined ? 'pending' : ''}">${fmtNumber(value)}°</span><small>Obiettivo</small></span>
          ${btn(1, 'mdi:plus', 'Alza temperatura obiettivo', max)}
        </div>`;
      if (Number.isFinite(current) && max > min) {
        const pos = (v) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));
        const from = Math.min(pos(current), pos(value));
        rail = `
          <div class="rail" aria-hidden="true">
            <span class="gap" style="left:${from}%;width:${Math.abs(pos(current) - pos(value))}%"></span>
            <span class="goal" style="left:${pos(value)}%"></span>
            <span class="now" style="left:${pos(current)}%"></span>
          </div>`;
      }
    }

    
    
    let fan = '';
    if (season === 'cool' && a.fan_modes?.length) {
      const enabled = on && can(z.climate);
      fan = `
        <div class="climate-fan">
          <span class="lbl">${icon('mdi:fan')}Ventola</span>
          <div class="seg" role="group" aria-label="Velocità della ventola">
            ${a.fan_modes
              .map((m) => `<button class="${m === a.fan_mode ? 'active' : ''}" ${enabled ? `data-climate-fan="${esc(z.climate)}" data-option="${esc(m)}"` : 'disabled'} aria-pressed="${m === a.fan_mode}">${esc(FAN_MODE[m] ?? m)}</button>`)
              .join('')}
          </div>
        </div>`;
    }

    parts.push(`
      <section>
        <h3>Clima</h3>
        <div class="climate ${on ? 'active' : ''} ${working ? 'working' : ''}" style="--st:${statusColor}">
          <div class="climate-row">${power}${info}${stepper}</div>
          ${rail}${fan}${air}
        </div>
      </section>`);
  } else if (air) {
    parts.push(`<section>${air}</section>`);
  }

  
  if (z.lights.length) {
    const lit = z.lights.filter((id) => s(id)?.state === 'on');
    const tiles = z.lights.map((id) => {
      const st = s(id);
      const lightOn = st?.state === 'on';
      const bri = lightOn && st.attributes.brightness ? Math.round((st.attributes.brightness / 255) * 100) : null;
      
      const offText = st?.state === 'unavailable' ? model.offText(id) : null;
      const stateTxt = offText ?? (isUnavailable(st) ? 'Non disponibile' : lightOn ? (bri !== null ? sliderText('light', bri) : 'Accesa') : 'Spenta');
      const attrs = can(id) ? `data-toggle="${esc(id)}" aria-pressed="${lightOn}"` : 'disabled';
      const name = model.shortName(id);
      
      const dimmable = (st?.attributes.supported_color_modes ?? []).some((m) => m !== 'onoff');
      const fill = lightFill(st);
      return `<div class="light ${lightOn ? 'on' : ''} ${offText ? 'wall-off' : isUnavailable(st) ? 'unavailable' : ''}" data-slider-scope>
        <button class="main" ${attrs} aria-label="${lightOn ? 'Spegni' : 'Accendi'} ${esc(name)}">
          ${icon(lightOn ? 'mdi:lightbulb' : 'mdi:lightbulb-outline')}
          <span class="txt"><span class="n">${esc(name)}</span><span class="s" data-slider-value="light">${esc(stateTxt)}</span></span>
        </button>
        ${dimmable && !offText ? bslider({ entity: esc(id), action: 'light-brightness', value: bri ?? 0, label: `Luminosità ${esc(name)}`, enabled: can(id), fill }) : ''}
      </div>`;
    });
    
    const extras = lit
      .map((id) => {
        const buttons = model.lightActions(id).map((a, i) => {
          const active = a.switch && s(a.switch)?.state === 'on';
          const enabled = a.switch ? can(a.switch) : can(id);
          return `<button class="ghost ${active ? 'active' : ''}" ${enabled ? `data-light-action="${esc(id)}" data-index="${i}"` : 'disabled'} aria-pressed="${active}">${esc(a.label)}</button>`;
        });
        
        const busy = model.lightActions(id).find((a) => a.switch && s(a.switch)?.state === 'on');
        const colors = colorSwatches(s(id), id, can(id) && (!busy || can(busy.switch)), busy?.switch);
        
        const open = colors && ui.palette === id;
        if (colors) {
          buttons.push(
            `<button class="ghost icon-only ${open ? 'active' : ''}" data-palette="${esc(id)}" aria-pressed="${open}" aria-label="Colore ${esc(model.shortName(id))}" title="Colore">${icon('mdi:palette-outline')}</button>`,
          );
        }
        const rows = [
          buttons.length ? `<div class="light-actions"><span class="lbl">${esc(model.shortName(id))}</span>${buttons.join('')}</div>` : '',
          open
            ? `<div class="light-colors">${colors}</div>`
            : '',
        ];
        return rows.join('');
      })
      .join('');
    const offAll = lit.filter(can);
    parts.push(`
      <section>
        <div class="sec-head"><h3>Luci</h3>
          <button class="ghost" ${offAll.length ? `data-off-all="${esc(offAll.join(','))}"` : 'disabled'}>Spegni tutte</button>
        </div>
        <div class="light-grid" style="margin-top:12px">${tiles.join('')}</div>
        ${extras}
      </section>`);
  }

  
  
  const isShade = (id) => isShadeClass(s(id)?.attributes.device_class);
  parts.push(coverSection('Tapparelle', z.covers.filter((id) => !isShade(id)), { s, can, model, ui, presets: ui.coverPresets }));
  parts.push(coverSection('Tende', z.covers.filter(isShade), { s, can, model, ui, presets: ui.shadePresets }));

  return parts.join('');
}

const WHITES = [['Bianco caldo', 2700], ['Bianco neutro', 4000], ['Bianco freddo', 6500]];
const COLORS = [
  ['Rosso', [255, 0, 0]], ['Arancio', [255, 120, 0]], ['Giallo', [255, 210, 0]], ['Verde', [0, 255, 60]],
  ['Azzurro', [0, 200, 255]], ['Blu', [0, 60, 255]], ['Viola', [150, 0, 255]], ['Rosa', [255, 0, 150]],
];
const COLOR_MODES = ['xy', 'hs', 'rgb', 'rgbw', 'rgbww'];

const kelvinCss = (k) => (k <= 3000 ? '#FFC98A' : k <= 4500 ? '#FFE9D2' : '#E6EEFF');

function colorSwatches(st, id, enabled, stop) {
  const a = st?.attributes ?? {};
  const modes = a.supported_color_modes ?? [];
  const hasColor = modes.some((m) => COLOR_MODES.includes(m));
  const hasTemp = modes.includes('color_temp');
  if (!hasColor) return '';
  const inColor = COLOR_MODES.includes(a.color_mode) && Array.isArray(a.rgb_color);
  
  const near = (rgb) => inColor && rgb.reduce((d, v, i) => d + (v - a.rgb_color[i]) ** 2, 0) < 60 ** 2 * 3;
  const btn = (label, css, data, active) =>
    `<button class="swatch ${active ? 'active' : ''}" style="--c:${css}" ${enabled ? `data-light-color="${esc(id)}" ${data}${stop ? ` data-stop="${esc(stop)}"` : ''}` : 'disabled'} aria-label="${label}" title="${label}" aria-pressed="${active}"></button>`;
  const clampK = (k) => Math.min(a.max_color_temp_kelvin ?? k, Math.max(a.min_color_temp_kelvin ?? k, k));
  const whites = hasTemp
    ? `<span class="lbl">Bianco</span><span class="swatches">${WHITES.map(([label, k]) => {
        const kk = clampK(k);
        return btn(label, kelvinCss(kk), `data-kelvin="${kk}"`, a.color_mode === 'color_temp' && Math.abs((a.color_temp_kelvin ?? 0) - kk) < 300);
      }).join('')}</span>`
    : '';
  const colors = COLORS.map(([label, rgb]) => btn(label, `rgb(${rgb.join(' ')})`, `data-rgb="${rgb.join(',')}"`, near(rgb))).join('');
  return `${whites}<span class="lbl">Colore</span><span class="swatches">${colors}</span>`;
}

function lightFill(st) {
  const a = st?.attributes ?? {};
  if (st?.state === 'on' && ['xy', 'hs', 'rgb', 'rgbw', 'rgbww'].includes(a.color_mode) && Array.isArray(a.rgb_color)) {
    const [r, g, b] = a.rgb_color;
    return `rgb(${r} ${g} ${b})`;
  }
  return 'var(--bc-amber)';
}

export const isShadeClass = (deviceClass) => ['shade', 'curtain', 'awning'].includes(deviceClass);

export function coverIcon(deviceClass, open) {
  if (deviceClass === 'shade') return open ? 'mdi:roller-shade' : 'mdi:roller-shade-closed';
  if (deviceClass === 'curtain') return open ? 'mdi:curtains' : 'mdi:curtains-closed';
  if (deviceClass === 'garage') return open ? 'mdi:garage-open' : 'mdi:garage';
  return open ? 'mdi:window-shutter-open' : 'mdi:window-shutter';
}

const MOVING = { opening: 'In apertura…', closing: 'In chiusura…' };

 
export function coverRow(id, { s, can, model, ui = {} }) {
  const st = s(id);
  const pos = st?.attributes.current_position;
  const moving = MOVING[st?.state];
  const txt = isUnavailable(st)
    ? 'Non disponibile'
    : moving ?? (pos === undefined ? (st.state === 'closed' ? 'Chiusa' : 'Aperta') : sliderText('cover', pos));
  const value = pos ?? (st?.state === 'closed' ? 0 : 100);
  const name = model.shortName(id);
  const enabled = can(id);
  const hint = moving ? 'Ferma' : value > 0 ? 'Chiudi' : 'Apri';
  const hasPosition = pos !== undefined && (st.attributes.supported_features & 4);
  return `
    <div class="cover" data-slider-scope>
      <button class="toggle" ${enabled ? `data-cover-toggle="${esc(id)}"` : 'disabled'} aria-label="${hint} ${esc(name)}">
        ${icon(model.icon(id), 'icon', coverIcon(st?.attributes.device_class, value > 0))}
        <span class="n">${esc(name)}</span><span class="st ${moving ? 'moving' : ''}" data-slider-value="cover">${esc(txt)}</span>
      </button>
      ${
        hasPosition
          ? bslider({
              entity: esc(id), action: 'cover-position', value, step: 5, label: `Posizione ${esc(name)}`, enabled,
              
              fill: 'var(--bc-cover)',
              
              mark: ui.coverTargets?.[id] !== undefined && ui.coverTargets[id] !== value ? ui.coverTargets[id] : null,
            })
          : ''
      }
    </div>`;
}

function presetButtons(presets = [], covers, { s, can }) {
  return presets
    .map((p) => {
      const targets = covers.filter((id) => p.positions?.[id] !== undefined && can(id));
      if (!targets.length) return '';
      const active = targets.every((id) => Math.abs((s(id)?.attributes.current_position ?? -99) - p.positions[id]) <= 2);
      const data = targets.map((id) => `${id}:${p.positions[id]}`).join(',');
      return `<button class="${active ? 'active' : ''}" data-preset="${esc(data)}" aria-pressed="${active}">${esc(p.label)}</button>`;
    })
    .join('');
}

 
export function coverSection(title, covers, { s, can, model, ui, presets }) {
  if (!covers.length) return '';
  {
    const rows = covers.map((id) => coverRow(id, { s, can, model, ui }));
    const all = covers.filter(can).join(',');
    
    const single = covers.length === 1;
    
    const segments = presetButtons(presets, covers, { s, can });
    const presetRow = segments ? `<div class="presets"><span class="lbl">Preset</span><div class="seg" role="group" aria-label="Preset ${esc(title)}">${segments}</div></div>` : '';
    return `
      <section>
        <div class="sec-head"><h3>${esc(title)}</h3>
          <div class="actions">
            <button class="ghost" ${all ? `data-covers="${esc(all)}" data-action="open"` : 'disabled'}>${single ? 'Apri' : 'Apri tutte'}</button>
            <button class="ghost" ${all ? `data-covers="${esc(all)}" data-action="close"` : 'disabled'}>${single ? 'Chiudi' : 'Chiudi tutte'}</button>
          </div>
        </div>
        ${presetRow}
        <div class="cover-grid" style="margin-top:12px">${rows.join('')}</div>
      </section>`;
  }
}
