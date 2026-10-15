// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { cap, dayLabel, esc, longDay } from '../core/format.js';
import { pausedUntil } from '../core/schedules.js';
import { windForecast } from '../core/awning-wind.js';
import { featureDialog, featureSection, minDateAhead, openerRow } from './feature-dialog.js';

export const COVER_AUTO_STYLES = `
  .cauto { display: flex; flex-direction: column; gap: 10px; padding-top: 14px; border-top: 1px solid var(--bc-border); }
  .cauto:first-of-type { padding-top: 0; border-top: 0; }
  .cauto-head { display: flex; align-items: center; gap: 10px; min-height: 32px; }
  .cauto-head > .icon { width: 22px; height: 22px; flex: none; color: var(--bc-text-2); }
  .cauto-head .n { flex: 1; font-size: 16px; font-weight: 500; }
  .cauto-head .s { font-size: 14px; color: var(--bc-text-2); text-align: right; }
  .cauto.paused .s, .cauto.paused .cauto-head > .icon { color: var(--bc-amber); }
  .cauto .hint { margin: 0; }
  .cauto-next { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .cauto-next .k { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--bc-text-2); }
  .cauto-next .v { font-size: 15px; font-weight: 500; }
  .cauto-next .s { font-size: 14px; color: var(--bc-text-2); }
  .cauto-next.act { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--bc-amber) 55%, transparent); }
  .cauto-next.act .k { color: var(--bc-amber); }
  .cauto-next .data { margin-top: 4px; font-size: 13px; color: var(--bc-text-2); }
`;

export const coverAutoItem = (model, id) => (model.coverAutomations ?? []).find((i) => i.id === id) ?? null;

 
export const coverAutoItems = (store, list) => (list ?? []).filter((i) => store.get(i.automation) && store.get(i.pause));

export const coverAutoWatchedIds = (list) => (list ?? []).flatMap((i) => [
  i.automation, i.pause, ...Object.values(i.forecast ?? {}).filter((v) => typeof v === 'string'), ...(i.forecast?.stale?.entities ?? []),
]).filter(Boolean);

 
export function coverAutoState(store, item, now = new Date()) {
  const st = store.get(item.automation);
  const available = Boolean(st) && st.state !== 'unavailable';
  return { available, on: available && st.state === 'on', until: pausedUntil(store, item.pause, now) };
}

 
function summary(entries, now) {
  const paused = entries.filter((e) => e.state.available && e.state.on && e.state.until);
  const off = entries.filter((e) => !e.state.available || !e.state.on);
  if (!paused.length && !off.length) return { cls: '', text: 'Tutte attive' };
  if (paused.length === 1 && !off.length) return { cls: 'paused', text: `${paused[0].item.name} in pausa · riprende ${dayLabel(paused[0].state.until, now)}` };
  if (paused.length && !off.length) return { cls: 'paused', text: `${paused.length} in pausa` };
  return { cls: 'off', text: off.length === 1 ? `${off[0].item.name}: spenta in Home Assistant` : `${off.length} spente in Home Assistant` };
}

 
export function coverAutoSection({ store, model, now = new Date() }) {
  const items = coverAutoItems(store, model.coverAutomations);
  if (!items.length) return '';
  const { cls, text } = summary(items.map((item) => ({ item, state: coverAutoState(store, item, now) })), now);
  const button = openerRow({ attr: 'data-cover-auto-open', cls, label: 'Tende automatiche', text, glyph: 'mdi:weather-windy' });
  return featureSection('Tende automatiche', button, 'Ritirano la tenda da sole con vento, pioggia o poca luce. Qui si sospendono.');
}

 
function actions(item, { until, can, picking, now }) {
  const attr = (action) => `data-cover-auto="${action}" data-id="${esc(item.id)}"`;
  if (until) return `<button class="primary" ${can ? attr('resume') : 'disabled'}>Riprendi ora</button>`;
  const hold = icon('mdi:gesture-tap-hold', 'icon');
  const btn = (action, text) => {
    if (!can) return `<button disabled>${text}</button>`;
    return item.hold
      ? `<button data-hold="${esc(item.pause)}" data-hold-event="${esc(item.id)}:${action}" aria-label="${esc(text)}, tieni premuto 1 secondo">${text}${hold}</button>`
      : `<button ${attr(action)}>${text}</button>`;
  };
  const minDate = minDateAhead(now, 2);
  const pick = can ? `<button ${attr('pick')} aria-expanded="${picking}">Scegli la data…</button>` : '<button disabled>Scegli la data…</button>';
  const date = picking && can
    ? `<label class="hint" for="cover-auto-date">Riprende il</label><input type="date" id="cover-auto-date" min="${minDate}" value="${minDate}">${btn('date', 'Sospendi').replace('<button', '<button class="primary"')}`
    : '';
  return `${btn('tomorrow', 'Fino a domani')}${btn('week', 'Una settimana')}${pick}${date}`;
}

 
function forecastCard(item, state, { store, now }) {
  if (!item.forecast || !state.available || !state.on) return '';
  const f = windForecast(store, item.forecast, now);
  if (!f) return '';
  
  if (state.until) {
    return `<div class="cauto-next"><span class="k">Cosa farà</span><span class="v">Niente, finché è in pausa</span><span class="s">Interviene solo l'emergenza (raffica grezza oltre 35 km/h).</span><span class="data">${esc(f.data)}</span></div>`;
  }
  return `<div class="cauto-next ${f.tone}"><span class="k">Cosa farà</span><span class="v">${esc(f.title)}</span>${f.lines.map((l) => `<span class="s">${esc(l)}</span>`).join('')}<span class="data">${esc(f.data)}</span></div>`;
}

function entry(item, { store, services, ui, now }) {
  const state = coverAutoState(store, item, now);
  let cls = '';
  let text = 'Attiva';
  if (!state.available) [cls, text] = ['off', 'Non disponibile'];
  else if (!state.on) [cls, text] = ['off', 'Spenta in Home Assistant'];
  else if (state.until) [cls, text] = ['paused', `In pausa · riprende ${dayLabel(state.until, now)}`];
  const can = state.available && state.on && services.canControl(item.pause);
  const picking = Boolean(ui.picking && ui.id === item.id);
  return `
        <div class="cauto schedule-sec ${cls}">
          <div class="cauto-head">${icon(item.icon)}<span class="n">${esc(item.name)}</span><span class="s">${esc(text)}</span></div>
          ${forecastCard(item, state, { store, now })}
          <div class="schedule-acts">${actions(item, { until: state.until, can, picking, now })}</div>
          ${item.note ? `<p class="hint">${esc(item.note)}</p>` : ''}
        </div>`;
}

 
export function renderCoverAutoDialog(ui, { store, model, services, now = new Date() }) {
  if (!ui) return '';
  const items = coverAutoItems(store, model.coverAutomations);
  if (!items.length) return '';
  return featureDialog({
    closeAttr: 'data-cover-auto-close', label: 'Tende automatiche', title: 'Tende automatiche',
    subtitle: 'Vento, pioggia e luce: si sospendono qui, restano accese in Home Assistant.',
    body: items.map((item) => entry(item, { store, services, ui, now })).join(''),
  });
}
