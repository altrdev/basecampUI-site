// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { BcElement, icon } from './base.js';
import { esc, isUnavailable } from '../core/format.js';
import { coverIcon, isShadeClass } from './zone.js';
import { isCoverOpen } from './covers.js';

class BcQuick extends BcElement {
  static styles = `
    :host { height: 100%; }
    section.card { display: flex; flex-direction: column; }
    
    .grid { container-type: inline-size; flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: minmax(80px, 1fr); gap: 8px; }
    
    .tile {
      position: relative; display: flex; align-items: center; justify-content: center;
      min-height: 0; padding: 0; border-radius: var(--bc-radius-inner); background: var(--bc-surface);
    }
    .tile .main { width: 36px; height: 36px; }
    .tile ha-icon.main { --mdc-icon-size: 36px; }
    .tile.on { color: var(--bc-amber); }
    .tile:not(:disabled):active { background: var(--bc-border); }
    .tile:disabled { cursor: default; }
    .tile.off-line { color: var(--bc-text-2); opacity: .6; }
    .tile.tone-air-low { color: #8FA9C2; }
    .tile.tone-air { color: var(--bc-blue); }
    .tile.tone-air-high { color: #4DA6FF; }
    .tile.tone-muted { color: var(--bc-text-2); }
    .tile.tone-alert { color: var(--bc-red); opacity: 1; }
    
    .tile .more { position: absolute; top: 8px; right: 8px; width: 16px; height: 16px; color: var(--bc-text-2); }
    .tile.tint-amber { --tint: var(--bc-amber); }
    .tile.tint-blue { --tint: var(--bc-blue); }
    .tile.tint-green { --tint: var(--bc-green); }
    .tile.tint-red { --tint: var(--bc-red); }
    .tile.tint-violet { --tint: var(--bc-violet); }
    .tile[class*='tint-'] { color: var(--tint); background: color-mix(in srgb, var(--tint) 16%, var(--bc-surface)); }
    .tile[class*='tint-'] { --hold-color: var(--tint); }
    .tile.plants .main { color: var(--bc-green); }
    .tile.covers .main { color: var(--bc-cover); }
    @media (min-width: 1001px) and (max-height: 790px) { .grid { grid-auto-rows: minmax(56px, 1fr); gap: 6px; } }
    
    @media (max-width: 600px) {
      .grid { grid-template-columns: repeat(var(--n, 6), minmax(0, 1fr)); grid-auto-rows: auto; gap: 6px; }
      .tile { aspect-ratio: 1; min-height: 44px; }
      .tile .main { width: 28px; height: 28px; }
      .tile .more { top: 4px; right: 4px; width: 12px; height: 12px; }
    }
  `;

  watchedIds() {
    const c = this.model.vmc?.controls ?? {};
    return [...this.model.quick, c.speed, c.power_supply, this.model.vmc?.level, ...this.model.covers].filter(Boolean);
  }

  

  vmcTone(id, state) {
    const vmc = this.model.vmc ?? {};
    const c = vmc.controls ?? {};
    if (this.store.get(c.power_supply)?.state === 'off' || isUnavailable(state)) return 'tone-alert';
    const level = this.store.get(vmc.level)?.state;
    const speed = level && !isUnavailable(this.store.get(vmc.level)) ? level : this.store.get(c.speed)?.state;
    if (speed === 'Away') return 'tone-muted';
    return { Low: 'tone-air-low', Medium: 'tone-air', High: 'tone-air-high' }[speed] ?? 'tone-air';
  }

   
  visibleQuick() {
    const pairs = this.ctx.config.quick_alternates ?? [];
    const lastRun = (id) => Date.parse(this.store.get(id)?.attributes.last_triggered ?? '') || 0;
    const hidden = new Set();
    for (const [a, b] of pairs) {
      
      hidden.add(lastRun(a) >= lastRun(b) && lastRun(a) > 0 ? a : b);
    }
    return this.model.quick.filter((id) => !hidden.has(id));
  }

  render() {
    const tile = (id) => {
      const state = this.store.get(id);
      const on = state?.state === 'on';
      const panel = this.model.panel(id);
      const tone = panel === 'vmc' ? this.vmcTone(id, state) : null;
      const holdOnly = this.ctx.services.requiresHold(id);
      
      const longPress = this.ctx.services.longPressService(id);
      const hold = holdOnly || Boolean(longPress);
      let attrs = 'disabled';
      if (panel) attrs = `data-open="#${esc(panel)}"`;
      else if (holdOnly && !isUnavailable(state)) attrs = `data-hold="${esc(id)}"`;
      else if (this.ctx.services.canControl(id) && !isUnavailable(state)) {
        attrs = `data-toggle="${esc(id)}" aria-pressed="${on}"${longPress ? ` data-hold="${esc(id)}" data-hold-call` : ''}`;
      }
      const name = this.model.name(id);
      const label = holdOnly ? `${name}, tieni premuto` : longPress ? `${name}; tieni premuto: ${this.ctx.config.entities?.[id]?.long_press_name ?? 'azione prolungata'}` : name;
      return `
        <button class="tile ${tone ?? (on ? 'on' : '')} ${!tone && isUnavailable(state) ? 'off-line' : ''} ${this.model.color(id) ? `tint-${esc(this.model.color(id))}` : ''}" ${attrs} aria-label="${esc(label)}" title="${esc(label)}">
          ${icon(this.model.icon(id), 'icon main')}${panel ? icon('mdi:chevron-right', 'icon more') : hold ? icon('mdi:gesture-tap-hold', 'icon more') : ''}
        </button>`;
    };
    
    const paired = new Set((this.ctx.config.quick_alternates ?? []).flat());
    const quick = this.visibleQuick();
    const tiles = quick.filter((id) => !paired.has(id)).map(tile);
    
    if (this.model.plants.length) {
      tiles.push(`
      <button class="tile plants" data-open="#funzioni/piante" aria-label="Piante" title="Piante">
        ${icon('mdi:sprout', 'icon main')}${icon('mdi:chevron-right', 'icon more')}
      </button>`);
    }
    
    
    if (this.model.covers.length) {
      const classOf = (id) => this.store.get(id)?.attributes.device_class;
      const shades = this.model.covers.filter((id) => isShadeClass(classOf(id)));
      const shown = shades.length ? shades : this.model.covers;
      const open = shown.some((id) => isCoverOpen(this.store.get(id)));
      tiles.push(`
      <button class="tile covers" data-open="#tapparelle" aria-label="Tende e tapparelle" title="Tende e tapparelle">
        ${icon(this.model.icon(shown[0]), 'icon main', shades.length ? 'mdi:awning' : coverIcon(classOf(shown[0]), open))}${icon('mdi:chevron-right', 'icon more')}
      </button>`);
    }
    tiles.push(...quick.filter((id) => paired.has(id)).map(tile));
    return `<section class="card"><h2 class="card-title">Comandi rapidi</h2><div class="grid" style="--n:${tiles.length}">${tiles.join('')}</div></section>`;
  }
}

customElements.define('bc-quick', BcQuick);
