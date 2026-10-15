// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { musicPillData } from './music.js';
import { BcElement, icon } from './base.js';
import { dayLabel, esc, fmtDate, fmtNumber, fmtRemaining, fmtTime, isUnavailable, programLabel, runningPhase, stateValue } from '../core/format.js';
import { pumpActivityLabel } from './climate.js';
import { MENU_COLORS } from './menu.js';
import { dogsLickScreen, onLongPress } from './easteregg.js';

const PUMP_IDLE = new Set(['off', 'none', 'unavailable', 'unknown']);

class BcHeader extends BcElement {
  static styles = `
    header { display: flex; align-items: center; gap: 16px; min-height: 56px; padding: 0 4px; }
    .home { display: flex; flex-direction: column; gap: 2px; }
    .home h1 { margin: 0; font: 600 20px/1.2 var(--bc-font-display); user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
    .home .date { font-size: 13px; color: var(--bc-text-2); }
    .date::first-letter { text-transform: uppercase; }
    .pills { flex: 1; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
    .pill {
      --tint: var(--bc-amber);
      display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 4px 18px 4px 14px;
      border-radius: 999px; background: var(--bc-card); border: 1px solid var(--bc-border);
    }
    .pill .icon { flex: none; color: var(--tint); }
    .pill .txt { display: flex; flex-direction: column; min-width: 0; line-height: 1.2; }
    .pill .name { font-size: 14px; font-weight: 500; color: var(--tint); white-space: nowrap; }
    .pill .info { font-size: 12px; color: var(--bc-text-2); white-space: nowrap; font-variant-numeric: tabular-nums; }
    .pill.tint-blue { --tint: var(--bc-blue); }
    .pill.tint-green { --tint: var(--bc-green); }
    .pill.tint-red { --tint: var(--bc-red); }
    .pill.tint-violet { --tint: var(--bc-violet); }
    .pill.tint-pink { --tint: var(--bc-music); }
    
    .pill.tint-auto { --tint: ${MENU_COLORS.auto}; }
    .pill.tint-impostazioni { --tint: ${MENU_COLORS.impostazioni}; }
    button.pill { text-align: left; }
    .pill.has-cover { padding-left: 5px; }
    .pill .cover { position: relative; flex: none; width: 34px; height: 34px; display: grid; place-items: center; }
    .pill .cover img { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 9px; object-fit: cover; background: var(--bc-surface); }
    .pill .info { max-width: 260px; overflow: hidden; text-overflow: ellipsis; }
    
    .pill .info.marquee {
      max-width: 120px; text-overflow: clip;
      mask-image: linear-gradient(90deg, transparent, #000 var(--fade, 0px), #000 calc(100% - var(--fade, 0px)), transparent);
    }
    .pill .info.marquee > span { display: inline-block; animation: pill-marquee var(--dur, 0s) ease-in-out infinite alternate; }
    @keyframes pill-marquee { 0%, 18% { transform: translateX(0); } 82%, 100% { transform: translateX(var(--shift, 0px)); } }
    @media (prefers-reduced-motion: reduce) {
      .pill .info.marquee { text-overflow: ellipsis; mask-image: none; }
      .pill .info.marquee > span { display: inline; animation: none; }
    }
    
    .menu-button {
      flex: none; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
      border-radius: var(--bc-radius-inner); background: var(--bc-card); border: 1px solid var(--bc-border);
    }
    .menu-button .icon { width: 26px; height: 26px; }
    .menu-button:active { background: var(--bc-surface); }
    .clock { font: 500 28px/1 var(--bc-font-display); font-variant-numeric: tabular-nums; }
    .menu { flex: none; width: var(--bc-touch); height: var(--bc-touch); margin-left: -8px; display: flex; align-items: center; justify-content: center; border-radius: 12px; color: var(--bc-text-2); }
    .menu:active { background: var(--bc-surface); }
    @media (min-width: 1001px) and (max-height: 790px) {
      header { min-height: 44px; }
      .menu-button { width: 44px; height: 44px; }
    }
    
    @media (max-width: 1000px) { .clock { display: none; } }
    
    @media (max-width: 1000px) {
      header { flex-wrap: wrap; gap: 8px 12px; }
      .home { flex: 1; }
      
      .pills { order: 3; flex-basis: 100%; width: 0; min-width: 100%; justify-content: flex-start; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; overscroll-behavior-x: contain; }
      .pills::-webkit-scrollbar { display: none; }
      .pills.dragging { cursor: grabbing; user-select: none; }
      .pills > .pill { flex: none; }
      .pills:empty { display: none; }
    }
    @media (max-width: 600px) {
      .clock { font-size: 22px; }
    }
  `;

  watchedIds() {
    const pump = this.model.climate?.heat_pump ?? {};
    return [
      ...this.model.activities.flatMap((id) => [id, ...Object.values(this.model.activityDetails(id))]),
      pump.activity,
      pump.power,
      ...this.carIds(),
      ...this.vacationIds(),
    ].filter(Boolean);
  }

   
  detail(id) {
    return stateValue(this.store, id);
  }

  activityPill(id) {
    const phase = runningPhase(this.store.get(id));
    if (phase === undefined) return null;
    const d = this.model.activityDetails(id);
    
    const program = phase === null && d.program ? programLabel(this.detail(d.program)) : null;
    const info = [phase ?? program ?? d.in_progress];
    
    if (phase === null) {
      info.push(this.detail(d.room));
      const progress = Number(this.detail(d.progress));
      if (d.progress && Number.isFinite(progress) && this.detail(d.progress) !== null) info.push(`${Math.round(progress)}%`);
    }
    info.push(fmtRemaining(this.detail(d.end)));
    return this.pill(this.model.icon(id), this.model.name(id), info, this.model.color(id), this.activityTarget(id));
  }

   
  activityTarget(id) {
    const cfg = this.ctx.config ?? {};
    if (id === cfg.robot?.vacuum) return '#funzioni/robot';
    if ((cfg.appliances ?? []).some((a) => a.state === id)) return '#funzioni/elettrodomestici';
    return null;
  }

   
  vacationCfg() {
    return (this.ctx.config?.settings ?? []).find((s) => s.end) ?? null;
  }

  vacationIds() {
    const v = this.vacationCfg();
    return v ? [v.entity, v.end] : [];
  }

   
  vacationPill() {
    const v = this.vacationCfg();
    if (!v || this.detail(v.entity) !== 'on') return null;
    const ts = Number(this.store.get(v.end)?.attributes?.timestamp);
    const now = new Date();
    const end = Number.isFinite(ts) && ts * 1000 > now.getTime() ? new Date(ts * 1000) : null;
    let info = null;
    if (end) {
      const label = dayLabel(end, now);
      info = label === 'oggi' || label === 'domani' ? `fino a ${label} alle ${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}` : `fino al ${end.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).replace('.', '')}`;
    }
    return this.pill('mdi:palm-tree', 'Vacanza', [info], 'impostazioni', '#funzioni/impostazioni');
  }

  pumpPill() {
    const pump = this.model.climate?.heat_pump ?? {};
    const activity = this.detail(pump.activity);
    if (!activity || PUMP_IDLE.has(activity.toLowerCase())) return null;
    const watt = Number(this.detail(pump.power));
    const power = Number.isFinite(watt) && watt > 0 ? `${fmtNumber(watt / 1000, 1)} kW` : null;
    return this.pill('mdi:heat-pump', 'Pompa di calore', [pumpActivityLabel(activity), power], 'violet', '#funzioni/clima');
  }

  carIds() {
    const car = this.model.car ?? {};
    return [car.charging, car.battery, car.charge_end, car.wallbox?.power];
  }

  
  
  carPill() {
    const car = this.model.car ?? {};
    if (!car.charging && !car.wallbox?.power) return null;
    const power = this.store.get(car.wallbox?.power);
    const watt = isUnavailable(power) ? NaN : Number(power.state) * (power.attributes.unit_of_measurement === 'kW' ? 1000 : 1);
    const charging = this.detail(car.charging) === 'on' || watt > (car.pill?.only_above_w ?? 100);
    if (!charging) return null;
    const soc = Number(this.detail(car.battery));
    const end = this.detail(car.charge_end);
    const info = [Number.isFinite(soc) && this.detail(car.battery) !== null ? `${Math.round(soc)}%` : null, end && end !== '00:00' ? `fine alle ${end}` : null];
    return this.pill('mdi:car-electric', car.name ?? 'Auto', info.some(Boolean) ? info : ['In carica'], 'auto', '#funzioni/auto');
  }

  
  musicPill() {
    const m = musicPillData(this.ctx.mass);
    if (!m) return null;
    
    const lead = `<span class="cover">${icon('mdi:music')}${m.cover ? `<img src="${esc(m.cover)}" alt="">` : ''}</span>`;
    return `<button class="pill tint-pink ${m.cover ? 'has-cover' : ''}" data-open="#funzioni/musica" aria-label="Musica: ${esc(m.name)}, ${esc(m.info)}">${lead}<span class="txt"><span class="name">${esc(m.name)}</span><span class="info marquee"><span>${esc(m.info)}</span></span></span></button>`;
  }

  
  pill(iconName, name, info, color, open = null) {
    const text = info.filter(Boolean).join(' · ');
    const tag = open ? 'button' : 'span';
    return `<${tag} class="pill ${color ? `tint-${esc(color)}` : ''}" ${open ? `data-open="${esc(open)}" aria-label="${esc(name)}: ${esc(text)}"` : ''}>${icon(iconName)}<span class="txt"><span class="name">${esc(name)}</span>${
      text ? `<span class="info">${esc(text)}</span>` : ''
    }</span></${tag}>`;
  }

  constructor() {
    super();
    this.shadowRoot.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-menu]')) this.ctx.toggleMenu();
    });
    
    this.shadowRoot.addEventListener('error', (ev) => ev.target.closest?.('.pill .cover img') && ev.target.remove(), true);
    onLongPress(this.shadowRoot, '.home h1', dogsLickScreen);
  }

  connectedCallback() {
    super.connectedCallback();
    
    const tick = () => {
      this.update();
      this._timer = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };
    this._timer = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }

  update() {
    super.update();
    this.#fitMarquee();
  }

  
  
  #fitMarquee() {
    for (const box of this.shadowRoot.querySelectorAll('.info.marquee')) {
      const text = box.firstElementChild;
      const over = text ? text.offsetWidth - box.clientWidth : 0;
      const set = (el, name, value) => {
        if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
      };
      if (over > 2) {
        set(text, '--shift', `${-(over + 8)}px`);
        set(text, '--dur', `${Math.max(5, Math.round(over / 25) + 4)}s`);
        set(box, '--fade', '8px');
      } else if (text) {
        for (const [el, name] of [[text, '--shift'], [text, '--dur'], [box, '--fade']]) el.style.removeProperty(name);
      }
    }
  }

  render() {
    const now = new Date();
    const pills = [this.vacationPill(), this.musicPill(), this.pumpPill(), ...this.model.activities.map((id) => this.activityPill(id)), this.carPill()].filter(Boolean).join('');
    return `
      <header>
        ${this.ctx.menu ? `<button class="menu" data-menu aria-label="Menu di Home Assistant">${icon('mdi:menu')}</button>` : ''}
        <div class="home">
          <h1>${esc(this.ctx.homeName)}</h1>
          <span class="date">${esc(fmtDate(now))}</span>
        </div>
        <div class="pills" data-hscroll>${pills}</div>
        <span class="clock">${fmtTime(now)}</span>
        <button class="menu-button" data-open="#funzioni" aria-label="Funzioni" title="Funzioni">${icon('mdi:dots-grid')}</button>
      </header>
    `;
  }
}

customElements.define('bc-header', BcHeader);
