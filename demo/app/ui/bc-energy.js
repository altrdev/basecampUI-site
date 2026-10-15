// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { BcElement, icon } from './base.js';
import { fmtNumber, isUnavailable } from '../core/format.js';

class BcEnergy extends BcElement {
  static styles = `
    
    button.card { width: 100%; display: block; text-align: left; }
    button.card:active { background: var(--bc-surface); }
    .card-title .more { width: 18px; height: 18px; color: var(--bc-text-2); }
    .flows { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .flow { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .label { display: flex; align-items: center; gap: 4px; font-size: clamp(10.5px, 4.6cqi, 12px); color: var(--bc-text-2); white-space: nowrap; overflow: hidden; }
    .label .icon { flex: none; width: 16px; height: 16px; }
    .value { font-size: clamp(17px, 8.6cqi, 24px); font-weight: 500; line-height: 1.1; white-space: nowrap; }
    .value small { font-size: clamp(11px, 4.8cqi, 13px); color: var(--bc-text-2); font-weight: 400; }
    .solar .value, .solar .icon { color: var(--bc-amber); }
    .home .value, .home .icon { color: var(--bc-blue); }
    .export .value, .export .icon { color: var(--bc-green); }
    .import .value, .import .icon { color: var(--bc-red); }
    .bar { display: flex; height: 8px; margin: 14px 0 6px; border-radius: 4px; overflow: hidden; background: var(--bc-surface); }
    .bar span { display: block; }
    .bar .sun { background: var(--bc-amber); }
    .bar .grid { background: var(--bc-blue); opacity: .6; }
    .cover { font-size: 12px; color: var(--bc-text-2); }
    .today {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; padding-top: 12px;
      border-top: 1px solid var(--bc-border); font-size: clamp(10.5px, 4.6cqi, 12px); color: var(--bc-text-2);
    }
    .today > span { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .today .num { display: block; font-size: clamp(13px, 5.6cqi, 15px); color: var(--bc-text); }
    
    @container (max-width: 250px) { .label .icon { display: none; } }
  `;

  watchedIds() {
    const { grid_positive, flows, ...ids } = this.model.energy;
    return Object.values(ids).filter((id) => typeof id === 'string');
  }

  value(role) {
    const s = this.store.get(this.model.energy[role]);
    return isUnavailable(s) ? null : Number(s.state);
  }

  render() {
    const e = this.model.energy;
    const solar = this.value('production');
    const home = this.value('consumption');
    let grid = this.value('grid');
    
    if (grid !== null && e.grid_positive === 'prelievo') grid = -grid;
    const exporting = grid !== null && grid >= 0;
    const kw = (w) => (w === null ? '—' : fmtNumber(w / 1000, 2));

    
    const share = solar !== null && home > 0 ? Math.min(1, solar / home) : null;

    return `
      <button class="card" data-open="#energia" aria-label="Energia, apri i dettagli">
        <h2 class="card-title"><span>Energia</span>${icon('mdi:chevron-right', 'icon more')}</h2>
        <div class="flows">
          <div class="flow solar">
            <span class="label">${icon('mdi:solar-power')}Produzione</span>
            <span class="value num">${kw(solar)} <small>kW</small></span>
          </div>
          <div class="flow home">
            <span class="label">${icon('mdi:home-lightning-bolt-outline')}Consumo</span>
            <span class="value num">${kw(home)} <small>kW</small></span>
          </div>
          <div class="flow ${exporting ? 'export' : 'import'}">
            <span class="label">${icon('mdi:transmission-tower')}${exporting ? 'Immissione' : 'Prelievo'}</span>
            <span class="value num">${kw(grid === null ? null : Math.abs(grid))} <small>kW</small></span>
          </div>
        </div>
        ${
          share === null
            ? ''
            : `<div class="bar"><span class="sun" style="width:${share * 100}%"></span><span class="grid" style="width:${(1 - share) * 100}%"></span></div>
               <div class="cover">Solare copre il <span class="num">${fmtNumber(share * 100, 0)}%</span> del consumo</div>`
        }
        <div class="today">
          <span>Prodotti oggi<span class="num">${fmtNumber(this.value('produced_today'))} kWh</span></span>
          <span>Prelevati<span class="num">${fmtNumber(this.value('imported_today'))} kWh</span></span>
          <span>Immessi<span class="num">${fmtNumber(this.value('exported_today'))} kWh</span></span>
        </div>
      </button>`;
  }
}

customElements.define('bc-energy', BcEnergy);
