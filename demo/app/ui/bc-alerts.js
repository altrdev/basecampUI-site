// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { BcElement, icon } from './base.js';
import { esc, fmtTime } from '../core/format.js';
import { alertsWatchedIds, computeAlerts } from '../core/alerts.js';

const SHOWN = 2;

export const ALERT_ROW_STYLES = `
  .alert-row { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .alert-row > .icon { flex: none; color: var(--lv); }
  .alert-row .txt { display: flex; flex-direction: column; min-width: 0; }
  .alert-row .t { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .alert-row .d { font-size: 12px; color: var(--bc-text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .alert-row .go { margin-left: auto; flex: none; width: 18px; height: 18px; color: var(--bc-text-2); }
  button.alert-row { width: 100%; text-align: left; color: inherit; font: inherit; border: 0; cursor: pointer; }
  button.alert-row:active { background: var(--bc-card) !important; }
  .alert-row.high { --lv: var(--bc-red); }
  .alert-row.medium { --lv: var(--bc-amber); }
`;

export const alertRow = (a, withDetail = false) => {
  const inner = `${icon(a.icon)}<span class="txt"><span class="t">${esc(a.text)}</span>${withDetail && a.detail ? `<span class="d">${esc(a.detail)}</span>` : ''}</span>`;
  return withDetail && a.open
    ? `<button class="alert-row ${a.level}" data-open="${esc(a.open)}"${a.seen ? ` data-seen="${esc(a.seen)}"` : ''}>${inner}${icon('mdi:chevron-right', 'icon go')}</button>`
    : `<div class="alert-row ${a.level}">${inner}</div>`;
};

export const MISSED_CALL_STYLES = `
  .missed-photo { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: var(--bc-radius-inner); background: #000; }
  .missed-when { margin: 12px 0 0; font-size: 15px; color: var(--bc-text-2); }
`;

 
export function renderMissedCall({ store, model, hassUrl, ui }) {
  const cfg = model.alerts?.missed_call ?? {};
  const st = store.get(cfg.entity);
  const since = ui.missedSince ?? (st?.state === 'on' ? new Date(st.last_changed) : null);
  if (!cfg.photo) return '<p class="placeholder">Nessuno snapshot configurato.</p>';
  
  const src = hassUrl(`${cfg.photo}${since ? `?t=${since.getTime()}` : ''}`);
  const when = since ? `${since.toDateString() === new Date().toDateString() ? 'Oggi' : since.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })} alle ${fmtTime(since)}` : '';
  return `<img class="missed-photo" src="${esc(src)}" alt="Snapshot dell'ultima chiamata al citofono">${when ? `<p class="missed-when">${esc(when)}: nessuno ha risposto.</p>` : ''}`;
}

class BcAlerts extends BcElement {
  static styles = `
    :host { display: block; }
    button.card { width: 100%; display: flex; flex-direction: column; gap: 10px; text-align: left; }
    button.card:active { background: var(--bc-surface); }
    .head { display: flex; align-items: center; gap: 8px; }
    .head .card-title { margin: 0; flex: 1; }
    .head .count { min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; background: var(--lv); color: var(--bc-bg); }
    .head .more { width: 18px; height: 18px; color: var(--bc-text-2); }
    .list { display: flex; flex-direction: column; gap: 8px; }
    
    :host { height: 100%; }
    .card.empty { height: 100%; cursor: default; }
    .card.empty:active { background: var(--bc-card); }
    .ok { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 15px; color: var(--bc-green); }
    .ok .icon { width: 32px; height: 32px; }
    .rest { font-size: 12px; color: var(--bc-text-2); }
    ${ALERT_ROW_STYLES}
    
    @media (min-width: 1001px) and (max-height: 790px) {
      button.card { gap: 8px; }
      .list { gap: 6px; }
      .rest { display: none; }
    }
    
    @media (min-width: 1001px) {
      :host { container-type: size; min-height: 0; }
      button.card { height: 100%; min-height: 0; overflow: hidden; }
      @container (max-height: 120px) {
        button.card { gap: 6px; padding-top: 10px; padding-bottom: 10px; }
        .ok { flex-direction: row; gap: 8px; font-size: 14px; }
        .ok .icon { width: 22px; height: 22px; }
      }
      
      @container (max-height: 100px) {
        .list .alert-row:nth-child(n + 2) { display: none; }
        .rest { display: none; }
      }
      @container (max-height: 60px) {
        .ok, .list { display: none; }
      }
    }
  `;

  watchedIds() {
    return alertsWatchedIds(this.model);
  }

  connectedCallback() {
    super.connectedCallback();
    
    this._tick = setInterval(() => this.update(), 60_000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._tick);
  }

  render() {
    const alerts = computeAlerts(this.store, this.model, { offlineSince: this.ctx.offlineSince });
    
    this.toggleAttribute('empty', !alerts.length);
    const top = alerts[0]?.level === 'high' ? 'var(--bc-red)' : 'var(--bc-amber)';
    return `
      <button class="card ${alerts.length ? '' : 'empty'}" ${alerts.length ? 'data-open="#avvisi"' : 'tabindex="-1"'} aria-label="Avvisi: ${alerts.length || 'nessuno'}">
        <span class="head">
          <h2 class="card-title">Avvisi</h2>
          ${alerts.length ? `<span class="count" style="--lv:${top}">${alerts.length}</span>${icon('mdi:chevron-right', 'icon more')}` : ''}
        </span>
        ${
          alerts.length
            ? `<span class="list">${alerts.slice(0, SHOWN).map((a) => alertRow(a)).join('')}</span>${
                alerts.length > SHOWN ? `<span class="rest">e altri ${alerts.length - SHOWN}</span>` : ''
              }`
            : `<span class="ok">${icon('mdi:check-circle-outline')}Tutto a posto</span>`
        }
      </button>`;
  }
}

customElements.define('bc-alerts', BcAlerts);
