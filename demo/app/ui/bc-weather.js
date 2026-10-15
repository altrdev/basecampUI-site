// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { BcElement, icon } from './base.js';
import { esc, fmtNumber, isUnavailable } from '../core/format.js';

export const CONDITIONS = {
  'clear-night': ['mdi:weather-night', 'Sereno'],
  cloudy: ['mdi:weather-cloudy', 'Nuvoloso'],
  exceptional: ['mdi:alert-circle-outline', 'Eccezionale'],
  fog: ['mdi:weather-fog', 'Nebbia'],
  hail: ['mdi:weather-hail', 'Grandine'],
  lightning: ['mdi:weather-lightning', 'Temporale'],
  'lightning-rainy': ['mdi:weather-lightning-rainy', 'Temporale'],
  partlycloudy: ['mdi:weather-partly-cloudy', 'Poco nuvoloso'],
  pouring: ['mdi:weather-pouring', 'Pioggia forte'],
  rainy: ['mdi:weather-rainy', 'Pioggia'],
  snowy: ['mdi:weather-snowy', 'Neve'],
  'snowy-rainy': ['mdi:weather-snowy-rainy', 'Nevischio'],
  sunny: ['mdi:weather-sunny', 'Sereno'],
  windy: ['mdi:weather-windy', 'Vento'],
  'windy-variant': ['mdi:weather-windy-variant', 'Vento'],
};

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
export const cardinal = (deg) => (Number.isFinite(deg) ? CARDINALS[Math.round(deg / 45) % 8] : '');

class BcWeather extends BcElement {
  static styles = `
    
    button.card { width: 100%; display: block; text-align: left; }
    button.card:active { background: var(--bc-surface); }
    .card-title .more { width: 18px; height: 18px; color: var(--bc-text-2); }
    .now { display: flex; align-items: center; gap: 12px; }
    .now .icon { width: clamp(30px, 14cqi, 40px); height: clamp(30px, 14cqi, 40px); color: var(--bc-amber); }
    .temp { font-size: clamp(30px, 15cqi, 40px); font-weight: 500; line-height: 1; white-space: nowrap; }
    
    .temp small { font-size: .5em; vertical-align: top; position: relative; top: .08em; margin-left: .04em; color: var(--bc-text-2); }
    .side { display: flex; flex-direction: column; gap: 2px; font-size: clamp(11.5px, 4.9cqi, 13px); color: var(--bc-text-2); white-space: nowrap; min-width: 0; }
    .side > span { overflow: hidden; text-overflow: ellipsis; }
    .side .cond { color: var(--bc-text); font-size: 14px; font-weight: 500; }
    
    .side .mm { display: flex; align-items: center; gap: 0; }
    .side .mm .icon, .now .side .mm .icon { display: inline-block; flex: none; width: 13px; height: 13px; margin-right: -2px; color: inherit; position: relative; top: 2px; }
    .side .mm .lo { color: var(--bc-blue); }
    .side .mm .hi { color: var(--bc-heat); }
    .side .mm .sep { margin: 0 5px; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
    .stat {
      display: flex; align-items: baseline; gap: 6px; min-height: 36px; padding: 8px clamp(6px, 3.6cqi, 10px); white-space: nowrap; overflow: hidden;
      border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 14px;
    }
    .stat .icon { width: 18px; height: 18px; color: var(--bc-text-2); align-self: center; }
    .stat.rain { color: var(--bc-blue); }
    .stat.rain .icon { color: var(--bc-blue); }
    .unit { color: var(--bc-text-2); font-size: 12px; }
    
    @container (max-width: 250px) {
      .now .icon { display: none; }
      .extra { display: none; }
    }
  `;

  watchedIds() {
    return [...Object.values(this.model.weather), 'sun.sun'];
  }

  value(role) {
    const s = this.store.get(this.model.weather[role]);
    return isUnavailable(s) ? null : Number(s.state);
  }

  render() {
    const w = this.model.weather;
    const condState = this.store.get(w.condition)?.state;
    let [condIcon, condLabel] = CONDITIONS[condState] ?? ['mdi:weather-partly-cloudy', ''];
    if (condState === 'partlycloudy' && this.store.get('sun.sun')?.state === 'below_horizon') {
      condIcon = 'mdi:weather-night-partly-cloudy';
    }

    const rate = this.value('rain_rate');
    const raining = rate > 0;
    const wind = this.value('wind');
    const gust = this.value('gust');
    
    const showGust = gust >= 20 && gust > wind;
    const dir = cardinal(this.value('wind_direction'));
    const min = this.value('min_today');
    const max = this.value('max_today');

    return `
      <button class="card" data-open="#meteo" aria-label="Meteo, apri i dettagli">
        <h2 class="card-title"><span>Meteo</span>${icon('mdi:chevron-right', 'icon more')}</h2>
        <div class="now">
          ${icon(condIcon)}
          <span class="temp num">${fmtNumber(this.value('temperature'))}<small>°</small></span>
          <span class="side">
            <span class="cond">${esc(condLabel)}</span>
            <span>Percepita <span class="num">${fmtNumber(this.value('feels_like'))}°</span></span>
            ${min !== null || max !== null ? `<span class="mm num"><span class="lo">${icon('mdi:arrow-down')}</span>${fmtNumber(min)}°<span class="sep">·</span><span class="hi">${icon('mdi:arrow-up')}</span>${fmtNumber(max)}°</span>` : ''}
          </span>
        </div>
        <div class="stats">
          <span class="stat">${icon('mdi:water-percent')}<span class="num">${fmtNumber(this.value('humidity'), 0)}%</span><span class="unit extra">umidità</span></span>
          <span class="stat">${icon('mdi:weather-windy')}<span class="num">${fmtNumber(wind, 0)}</span><span class="unit">${showGust ? `raff. <span class="num">${fmtNumber(gust, 0)}</span>` : 'km/h'} ${esc(dir)}</span></span>
          <span class="stat ${raining ? 'rain' : ''}">${icon('mdi:weather-rainy')}${
            raining
              ? `<span class="num">${fmtNumber(rate)}</span><span class="unit">mm/h</span>`
              : `<span class="num">${fmtNumber(this.value('rain_today'))}</span><span class="unit">mm<span class="extra"> oggi</span></span>`
          }</span>
          <span class="stat">${icon('mdi:sun-wireless-outline')}<span class="unit">UV</span><span class="num">${fmtNumber(this.value('uv'), 0)}</span></span>
        </div>
      </button>`;
  }
}

customElements.define('bc-weather', BcWeather);
