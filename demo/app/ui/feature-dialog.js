// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { esc, pad2 } from '../core/format.js';

export const FEATURE_DIALOG_STYLES = `
  .schedule-open { width: 100%; display: flex; align-items: center; gap: 12px; min-height: 48px; margin-top: 8px; padding: 6px 12px 6px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); text-align: left; }
  .schedule-open > .icon:first-child { width: 22px; height: 22px; flex: none; color: var(--bc-text-2); }
  .schedule-open .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .schedule-open .n { font-size: 15px; font-weight: 500; }
  .schedule-open .s { font-size: 14px; color: var(--bc-text-2); }
  .schedule-open .chev { width: 20px; height: 20px; flex: none; color: var(--bc-text-2); }
  .schedule-open:active { background: var(--bc-border); }
  .schedule-open.paused .s, .schedule-open.paused > .icon:first-child { color: var(--bc-amber); }
  .schedule-open.off .s { color: var(--bc-text-2); }
  .zdlg.schedule { width: min(640px, 100%); }
  .schedule-sec { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  .schedule-sec h4 { margin: 0; font-size: 13px; font-weight: 500; color: var(--bc-text-2); }
  .schedule-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .schedule-sw { display: inline-flex; align-items: center; gap: 10px; min-height: 48px; font-size: 14px; font-weight: 500; }
  .schedule-sw i { width: 46px; height: 26px; border-radius: 13px; background: var(--bc-border-strong); position: relative; transition: background .15s; }
  .schedule-sw i::after { content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: var(--bc-text); transition: transform .15s; }
  .schedule-sw[aria-pressed="true"] i { background: var(--bc-green); }
  .schedule-sw[aria-pressed="true"] i::after { transform: translateX(20px); background: var(--bc-bg); }
  .schedule-sw:disabled { opacity: .5; }
  .schedule-next { background: var(--bc-surface); border-radius: var(--bc-radius-inner); padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }
  .schedule-next .k { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--bc-text-2); }
  .schedule-next .v { font: 600 20px/1.2 var(--bc-font-display); }
  .schedule-next .s { font-size: 14px; color: var(--bc-text-2); }
  .schedule-next.pause { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--bc-amber) 55%, transparent); }
  .schedule-next.pause .k { color: var(--bc-amber); }
  .schedule-next.off .v { color: var(--bc-text-2); }
  .schedule-acts { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .schedule-acts button { min-height: 48px; padding: 0 16px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 15px; font-weight: 500; }
  .schedule-acts button:not(:disabled):active { background: var(--bc-border); }
  .schedule-acts button:disabled { color: var(--bc-text-2); opacity: .5; cursor: default; }
  .schedule-acts button.primary:not(:disabled) { background: var(--bc-green); color: var(--bc-bg); }
  .schedule-acts input[type="date"] { min-height: 48px; padding: 0 12px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); border: 1px solid var(--bc-border-strong); color: var(--bc-text); font: inherit; color-scheme: dark; }
`;

 
export function openerRow({ attr, cls = '', label, text, glyph = 'mdi:calendar-clock', trailing = '' }) {
  return `
    <button class="schedule-open ${cls}" ${attr} aria-label="${label}: ${esc(text)}">
      ${icon(glyph)}
      <span class="txt"><span class="s num">${esc(text)}${trailing}</span></span>
      ${icon('mdi:chevron-right', 'icon chev')}
    </button>`;
}

 
export const featureSection = (title, button, hint) => `
    <section>
      <h3>${title}</h3>
      ${button}
      <div class="hint">${hint}</div>
    </section>`;

 
export function featureDialog({ closeAttr, label, title, subtitle, body }) {
  return `
    <div class="zdlg-overlay">
      <div class="zdlg-backdrop" ${closeAttr}></div>
      <div class="zdlg schedule" role="dialog" aria-modal="true" aria-label="${label}">
        <div class="zdlg-head">
          <div class="t"><h3>${title}</h3><p>${subtitle}</p></div>
          <button class="zclose" ${closeAttr} aria-label="Chiudi">${icon('mdi:close')}</button>
        </div>
        ${body}
      </div>
    </div>`;
}

 
export function stateSection({ attr, title = 'Stato', can, on, onLabel, offLabel, card, after = '' }) {
  return `
        <div class="schedule-sec">
          <div class="schedule-head"><h4>${title}</h4>
            <button class="schedule-sw" ${can ? `${attr}="toggle"` : 'disabled'} aria-pressed="${on}"><span>${on ? onLabel : offLabel}</span><i></i></button></div>
          ${card}${after}
        </div>`;
}

 
export const infoCard = (cls, k, v, s = '') => `<div class="schedule-next${cls ? ` ${cls}` : ''}"><span class="k">${k}</span><span class="v">${v}</span>${s ? `<span class="s">${s}</span>` : ''}</div>`;

 
export const suspendSection = (acts) => `
        <div class="schedule-sec"><h4>Sospendi</h4><div class="schedule-acts">${acts}</div></div>`;

 
export const noteSection = (text) => `
        <div class="schedule-sec">
          <p class="hint">${text}</p>
        </div>`;

 
export function minDateAhead(now, daysAhead) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function pauseActions({ attr, until, can, enabled, quick, picking, dateId, dateLabel, minDate }) {
  if (until) return `<button class="primary" ${can ? `${attr}="resume"` : 'disabled'}>Riprendi ora</button>`;
  const btn = (action, text, extra = '') => `<button ${enabled ? `${attr}="${action}"` : 'disabled'}${extra}>${text}</button>`;
  return `${btn(quick.action, quick.label)}
       ${btn('week', 'Una settimana')}
       ${btn('pick', 'Scegli la data…', ` aria-expanded="${Boolean(picking)}"`)}
       ${picking && enabled ? `<label class="hint" for="${dateId}">${dateLabel}</label><input type="date" id="${dateId}" min="${minDate}" value="${minDate}"><button class="primary" ${attr}="date">Sospendi</button>` : ''}`;
}
