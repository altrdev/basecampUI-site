// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { airBadge, ensureVocUsual } from '../core/air.js';
import { BcElement, icon } from './base.js';
import { esc, fmtNumber } from '../core/format.js';

class BcZoneCard extends BcElement {
  static styles = `
    :host { height: 100%; }
    button.card {
      position: relative; overflow: hidden; isolation: isolate;
      width: 100%; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;
      min-height: 140px; transition: background-color .4s, border-color .4s;
    }
    button.card.heat { --tint: var(--bc-amber); }
    button.card.cool { --tint: var(--bc-blue); }
    button.card.heat, button.card.cool {
      background: radial-gradient(120% 90% at 100% 100%, color-mix(in srgb, var(--tint) 22%, transparent), transparent 70%), var(--bc-card);
      border-color: color-mix(in srgb, var(--tint) 45%, var(--bc-border));
    }
    
    .spark { position: absolute; left: 0; right: 0; bottom: 0; height: 38%; z-index: -1; pointer-events: none; }
    .spark svg { display: block; width: 100%; height: 100%; }
    .spark .line { fill: none; stroke: var(--tint, var(--bc-text-2)); stroke-width: 1.5; vector-effect: non-scaling-stroke; opacity: .55; }
    .spark .area { fill: var(--tint, var(--bc-text-2)); opacity: .07; }
    
    button.card:has(.badge) .spark { opacity: .3; }
    
    button.card { justify-content: flex-start; }
    .badges { margin-top: auto; }
    button.card:active { background: var(--bc-surface); }
    .title { display: flex; align-items: center; gap: 8px; font: 500 16px/1.2 var(--bc-font-display); }
    .title .icon { color: var(--bc-text-2); }
    .title .name { flex: 1; min-width: 0; }
    
    .title .more { width: 18px; height: 18px; }
    .climate { display: flex; align-items: baseline; gap: 12px; }
    .temp { font-size: 40px; font-weight: 500; line-height: 1; }
    
    .temp small { font-size: .5em; vertical-align: top; position: relative; top: .08em; margin-left: .04em; color: var(--bc-text-2); }
    .hum { font-size: 15px; }
    .badges { display: flex; flex-wrap: wrap; gap: 6px; min-height: 24px; }
    @media (max-width: 600px) {
      button.card { min-height: 0; padding: 12px; gap: 8px; }
      .badges:empty { display: none; }
      .title { font-size: 14px; }
      .temp { font-size: 30px; }
      .climate { flex-wrap: wrap; gap: 4px 8px; }
    }
  `;

  set zone(zone) {
    this._zone = zone;
    if (this._ctx) this.ctx = this._ctx;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#loadTrend();
    this._trendTimer = setInterval(() => this.#loadTrend(), 30 * 60_000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._trendTimer);
  }

  set ctx(ctx) {
    super.ctx = ctx;
    if (!this._trend) this.#loadTrend();
  }

  get ctx() {
    return super.ctx;
  }

  
  async #loadTrend() {
    const id = this._zone?.tempSensor;
    const conn = this._ctx?.getHass?.()?.connection;
    if (!id || !conn || this._loadingTrend) return;
    this._loadingTrend = true;
    try {
      const res = await conn.sendMessagePromise({
        type: 'recorder/statistics_during_period',
        start_time: new Date(Date.now() - 24 * 3600_000).toISOString(),
        statistic_ids: [id],
        period: 'hour',
        types: ['mean'],
      });
      this._trend = (res[id] ?? []).map((p) => p.mean).filter((v) => Number.isFinite(v));
      this.update();
    } catch {
      
    } finally {
      this._loadingTrend = false;
    }
  }

   
  spark(current) {
    const pts = [...(this._trend ?? [])];
    if (Number.isFinite(current)) pts.push(current);
    if (pts.length < 3) return '';
    const min = Math.min(...pts), max = Math.max(...pts);
    
    const span = Math.max(2, max - min), lo = (min + max) / 2 - span / 2;
    const xy = pts.map((v, i) => [(i / (pts.length - 1)) * 100, 22 - ((v - lo) / span) * 18]);
    const line = xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    return `<span class="spark" aria-hidden="true"><svg viewBox="0 0 100 24" preserveAspectRatio="none">
      <polygon class="area" points="0,24 ${line} 100,24"/><polyline class="line" points="${line}"/>
    </svg></span>`;
  }

  watchedIds() {
    const z = this._zone;
    return z ? [z.climate, z.zoneSwitch, ...z.lights, ...z.windows, ...z.demand, z.air?.pm25, z.air?.voc].filter(Boolean) : [];
  }

  render() {
    const z = this._zone;
    if (!z) return '';
    const climate = this.store.get(z.climate);
    const attrs = climate?.attributes ?? {};
    const on = (ids) => ids.filter((id) => this.store.get(id)?.state === 'on').length;

    const badges = [];
    const openWindows = on(z.windows);
    if (openWindows) badges.push(['red', 'mdi:window-open-variant', openWindows > 1 ? `${openWindows} aperte` : 'Aperta']);
    if (attrs.hvac_action === 'heating') badges.push(['amber', 'mdi:radiator', 'Riscalda']);
    if (attrs.hvac_action === 'cooling') badges.push(['blue', 'mdi:snowflake', 'Raffresca']);
    const zoneOn = this.store.get(z.zoneSwitch)?.state === 'on';
    if (zoneOn && !['heating', 'cooling'].includes(attrs.hvac_action)) badges.push(['', 'mdi:thermostat', 'Clima acceso']);
    
    if (z.air?.voc) ensureVocUsual(this.ctx.getHass?.()?.connection, z.air.voc, this._onAir ??= () => this.update());
    const air = airBadge(this.store, z.air);
    if (air) badges.push(air);
    const lightsOn = on(z.lights);
    if (lightsOn) badges.push(['amber', 'mdi:lightbulb', lightsOn > 1 ? `${lightsOn} luci` : '1 luce']);

    return `
      <button class="card ${attrs.hvac_action === 'heating' ? 'heat' : attrs.hvac_action === 'cooling' ? 'cool' : ''}" data-open="#zona/${esc(z.id)}">
        ${this.spark(Number(attrs.current_temperature))}
        <span class="title">${icon(z.icon)}<span class="name">${esc(z.name)}</span>${icon('mdi:chevron-right', 'icon more')}</span>
        <span class="climate">
          <span class="temp num">${fmtNumber(attrs.current_temperature)}<small>°</small></span>
          <span class="hum num muted">${fmtNumber(attrs.current_humidity, 0)}%</span>
        </span>
        <span class="badges">
          ${badges.map(([color, ic, text]) => `<span class="badge ${color}">${icon(ic)}${esc(text)}</span>`).join('')}
        </span>
      </button>
    `;
  }
}

customElements.define('bc-zone-card', BcZoneCard);
