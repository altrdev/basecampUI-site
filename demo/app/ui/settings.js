// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { cap, dayLabel, esc, fmtNumber, isUnavailable, longDay, pad2 } from '../core/format.js';
import { batteryIcon } from './bc-security.js';

export const SETTINGS_STYLES = `
  .settings { display: flex; flex-direction: column; gap: 10px; }
  .setting { display: flex; align-items: center; gap: 14px; width: 100%; min-height: 72px; padding: 12px 16px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); text-align: left; }
  .setting > .icon { flex: none; width: 26px; height: 26px; color: var(--bc-text-2); }
  .setting.on > .icon { color: var(--bc-green); }
  .setting .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .setting .n { font-size: 16px; font-weight: 600; }
  .setting .d { font-size: 12px; color: var(--bc-text-2); }
  .setting .knob { flex: none; width: 48px; height: 28px; border-radius: 14px; background: var(--bc-border); position: relative; }
  .setting .knob::after { content: ''; position: absolute; top: 4px; left: 4px; width: 20px; height: 20px; border-radius: 50%; background: var(--bc-text-2); transition: transform .15s; }
  .setting.on .knob { background: var(--bc-green); }
  .setting.on .knob::after { transform: translateX(20px); background: var(--bc-bg); }
  .setting .ro { flex: none; font-size: 13px; font-weight: 500; color: var(--bc-text-2); }
  .setting.on .ro { color: var(--bc-green); }
  .setting:disabled { opacity: .55; }
  .setting:not(:disabled):active { filter: brightness(1.15); }
  .end { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .end-row { display: flex; align-items: center; gap: 14px; width: 100%; min-height: var(--bc-touch); text-align: left; }
  .end-row > .icon { flex: none; width: 22px; height: 22px; color: var(--bc-text-2); }
  .end-row .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .end-row .n { font-size: 15px; font-weight: 600; }
  .end-row .d { font-size: 12px; color: var(--bc-text-2); }
  .end-row .chev { flex: none; width: 18px; height: 18px; color: var(--bc-text-2); }
  .end-pick { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .end-pick input { min-height: var(--bc-touch); padding: 0 12px; border-radius: 12px; border: 1px solid var(--bc-border); background: var(--bc-bg); color: var(--bc-text); font: inherit; }
  .end-pick button { min-height: var(--bc-touch); padding: 0 16px; border-radius: 12px; background: var(--bc-border); font-weight: 500; }
  .end-pick button.primary { background: var(--bc-text); color: var(--bc-bg); }
  .adv { margin-top: 14px; }
  .adv summary { cursor: pointer; min-height: var(--bc-touch); display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--bc-text-2); list-style: none; }
  .adv summary::-webkit-details-marker { display: none; }
  .adv .chev { width: 18px; height: 18px; transition: transform .15s; }
  .adv[open] .chev { transform: rotate(90deg); }
  .adv .settings { margin-top: 6px; }
  .batt-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin: 22px 4px 10px; }
  .batt-head h3 { margin: 0; font: 600 13px/1.2 var(--bc-font-display); letter-spacing: .08em; text-transform: uppercase; color: var(--bc-text-2); }
  .batt-head .sum { font-size: 12px; color: var(--bc-text-2); }
  .batt { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 8px; }
  .batt-row { display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 8px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .batt-row .icon { flex: none; width: 22px; height: 22px; color: var(--bc-text-2); }
  .batt-row .n { flex: 1; min-width: 0; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .batt-row .v { flex: none; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .batt-row.low .icon, .batt-row.low .v { color: var(--bc-red); }
  .batt-row.mid .icon, .batt-row.mid .v { color: var(--bc-amber); }
  .batt-row.off { opacity: .55; }
  .version { margin: 14px 4px 0; font-size: 12px; color: var(--bc-text-2); font-variant-numeric: tabular-nums; }
`;

const VERSION = import.meta.url.match(/\/v\/([0-9a-f]+)\//)?.[1] ?? 'sviluppo';
const versionLine = () => `<p class="version">Versione ${esc(VERSION)}</p>`;

const visibleSettings = (store, model) => (model.settings ?? []).filter((s) => !s.only_if_pump || store.get(model.climate?.heat_pump?.mode)?.state === s.only_if_pump);

export const settingsWatchedIds = (model) => [...(model.settings ?? []).flatMap((s) => [s.entity, s.end]), model.climate?.heat_pump?.mode, ...(model.batteries ?? []), ...(model.batteryVoltages ?? []).map((b) => b.entity)].filter(Boolean);

function batteryName(model, id) {
  const who = model.name(id).replace(/\s*\b(livello batteria|battery level|batteria|battery)\b\s*/gi, ' ').trim();
  return who ? who.charAt(0).toUpperCase() + who.slice(1) : model.name(id);
}

 
function renderBatteries({ store, model }) {
  const ids = model.batteries ?? [];
  const volts = model.batteryVoltages ?? [];
  if (!ids.length && !volts.length) return '';
  const critical = model.alerts?.battery_below ?? 10;
  const rows = ids
    .map((id) => {
      const st = store.get(id);
      const level = isUnavailable(st) ? NaN : Number(st?.state);
      return { name: batteryName(model, id), level };
    })
    .sort((a, b) => (Number.isFinite(a.level) ? a.level : Infinity) - (Number.isFinite(b.level) ? b.level : Infinity) || a.name.localeCompare(b.name, 'it'));
  
  const voltRows = volts.map((b) => {
    const st = store.get(b.entity);
    const v = isUnavailable(st) ? NaN : Number(st?.state);
    const tone = !Number.isFinite(v) ? 'off' : b.alert_below && v < b.alert_below ? 'low' : b.warning_below && v < b.warning_below ? 'mid' : '';
    return `<div class="batt-row ${tone}">${icon('mdi:battery')}<span class="n">${esc(b.name)}</span><span class="v">${Number.isFinite(v) ? `${fmtNumber(v, 2)} V` : '—'}</span></div>`;
  });
  const low = rows.filter((r) => r.level <= 20).length;
  const tone = (l) => (!Number.isFinite(l) ? 'off' : l <= critical ? 'low' : l <= 20 ? 'mid' : '');
  return `<div class="batt-head"><h3>Batterie</h3><span class="sum">${rows.length + voltRows.length} dispositivi${low ? ` · ${low} sotto il 20%` : ''}</span></div>
    <div class="batt">${rows
      .map((r) => `<div class="batt-row ${tone(r.level)}">${icon(batteryIcon(r.level))}<span class="n">${esc(r.name)}</span><span class="v">${Number.isFinite(r.level) ? `${fmtNumber(r.level, 0)}%` : '—'}</span></div>`)
      .concat(voltRows)
      .join('')}</div>`;
}

 
export function settingsSummary(store, model) {
  const on = visibleSettings(store, model).filter((s) => store.get(s.entity)?.state === 'on').map((s) => s.short ?? s.name);
  return on.length ? `Attive: ${on.join(', ')}` : 'Nessuna attiva';
}

 
const localInput = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const hhmm = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

 
function endRow(s, { store, model, services, ui, now = new Date() }) {
  const st = store.get(s.end);
  if (!st || isUnavailable(st)) return '';
  const ts = Number(st.attributes?.timestamp);
  const end = Number.isFinite(ts) && ts * 1000 > now.getTime() ? new Date(ts * 1000) : null;
  const can = services.canControl(s.end);
  const picking = Boolean(ui?.end?.picking) && can;
  let text = 'Nessuna data di fine';
  let hint = 'La vacanza finisce quando la spegni tu.';
  if (end) {
    text = `Finisce ${dayLabel(end, now)} alle ${hhmm(end)}`;
    
    const ini = Number(store.get(model.climate?.heating?.start)?.attributes?.timestamp);
    const early = Number.isFinite(ini) ? new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1, Math.floor(ini / 3600), Math.floor((ini % 3600) / 60)) : null;
    const back = !early ? 'il giorno prima' : early <= now ? 'subito' : `${dayLabel(early, now)} alle ${hhmm(early)}`;
    hint = `${longDay(end) !== dayLabel(end, now) ? `${cap(longDay(end))}. ` : ''}Il flag si spegne da solo; con il riscaldamento acceso le zone tornano ai valori di prima ${back}.`;
  }
  const def = end ?? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 18, 0);
  return `<div class="end">
    <button class="end-row" ${can ? 'data-end="pick"' : 'disabled'} aria-expanded="${picking}">${icon('mdi:calendar-end')}
      <span class="txt"><span class="n">${esc(text)}</span><span class="d">${esc(hint)}</span></span>${icon('mdi:chevron-right', 'icon chev')}</button>
    ${picking ? `<div class="end-pick"><input type="datetime-local" id="end-dt" value="${localInput(def)}"><button class="primary" data-end="set">Imposta</button>${end ? '<button data-end="clear">Togli</button>' : ''}</div>` : ''}
  </div>`;
}

export function renderSettings({ store, model, services, ui }) {
  const batt = renderBatteries({ store, model });
  const list = visibleSettings(store, model);
  if (!list.length) return `<p class="placeholder">Nessuna impostazione in config.json.</p>${batt}${versionLine()}`;
  const row = (s) => {
    const st = store.get(s.entity);
    const on = st?.state === 'on';
    const off = isUnavailable(st);
    const desc = off ? 'Non disponibile' : s.description ?? '';
    if (s.read_only) {
      return `<div class="setting ${on ? 'on' : ''}">${icon(s.icon ?? 'mdi:cog-outline')}
          <span class="txt"><span class="n">${esc(s.name)}</span><span class="d">${esc(desc)}</span></span>
          <span class="ro">${off ? '—' : on ? 'Attiva' : 'Spenta'}</span></div>`;
    }
    const can = !off && services.canControl(s.entity);
    return `<button class="setting ${on ? 'on' : ''}" ${can ? `data-toggle="${esc(s.entity)}" aria-pressed="${on}"` : 'disabled'}>${icon(s.icon ?? 'mdi:cog-outline')}
        <span class="txt"><span class="n">${esc(s.name)}</span><span class="d">${esc(desc)}</span></span>
        <span class="knob"></span></button>${s.end ? endRow(s, { store, model, services, ui }) : ''}`;
  };
  const manual = list.filter((s) => s.manual);
  const main = list.filter((s) => !s.manual);
  return `<div class="settings">${main.map(row).join('')}</div>${batt}${
    manual.length
      ? `<details class="adv"><summary>${icon('mdi:chevron-right', 'icon chev')}Controlli manuali</summary><div class="settings">${manual.map(row).join('')}</div></details>`
      : ''
  }${versionLine()}`;
}
