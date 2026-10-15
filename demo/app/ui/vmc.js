// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { esc, fmtNumber, fmtTime, isUnavailable } from '../core/format.js';
import { vmcHealth } from '../core/vmc.js';
import { icon, powerButton } from './base.js';

export const VMC_STYLES = `
  .vmc-hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
  .vmc-hero .level { font: 500 36px/1 var(--bc-font-display); }
  .vmc-hero .mode { margin-top: 6px; font-size: 14px; color: var(--bc-text-2); }
  .vmc-hero .mode.auto { color: var(--bc-green); }
  .vmc-hero .power { font-size: 14px; color: var(--bc-text-2); }
  .vmc-hero .hero-end { display: flex; align-items: center; gap: 14px; }
  .segmented { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 6px; }
  
  .segmented.speeds > :first-child { position: relative; margin-right: 10px; }
  .segmented.speeds > :first-child::after { content: ''; position: absolute; right: -9px; top: 20%; bottom: 20%; width: 1px; background: var(--bc-border-strong); }
  .segmented button.current { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--bc-blue) 60%, transparent); color: var(--bc-blue); }
  .segmented button {
    min-height: var(--bc-touch); padding: 0 4px; border-radius: var(--bc-radius-inner); background: var(--bc-surface);
    text-align: center; font-size: 14px; font-weight: 500; color: var(--bc-text-2);
  }
  .segmented button:not(:disabled):active { background: var(--bc-border); }
  .segmented button.active { background: var(--bc-blue); color: var(--bc-bg); }
  .segmented button.active.warn { background: var(--bc-amber); }
  .segmented button.stop { color: var(--bc-red); }
  .hint { margin-top: 6px; font-size: 12px; color: var(--bc-text-2); }
  .hint.warn { color: var(--bc-amber); }
  .switch-row .row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%;
    min-height: var(--bc-touch); padding: 4px 4px 4px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface);
    font-size: 14px;
  }

  .diagram { margin: 0 -8px; }
  .diagram svg { display: block; width: 100%; height: auto; overflow: visible; }
  .diagram .port-name { font: 500 10px var(--bc-font-display); letter-spacing: .06em; text-transform: uppercase; fill: var(--bc-text-2); }
  .diagram .port-temp { font: 500 20px var(--bc-font-display); font-variant-numeric: tabular-nums; fill: var(--bc-text); }
  .diagram .port-sub { font: 400 11px var(--bc-font-text); font-variant-numeric: tabular-nums; fill: var(--bc-text-2); }
  .diagram .side { font: 500 9px var(--bc-font-display); letter-spacing: .12em; fill: var(--bc-text-2); opacity: .7; }
  .diagram .unit-text { font: 500 11px var(--bc-font-text); fill: var(--bc-text-2); font-variant-numeric: tabular-nums; }
  .diagram .unit-text.effect { font-weight: 600; font-size: 12px; }
  .diagram .flow-dash { stroke-dasharray: 3 11; animation: vmc-flow var(--dur, 2s) linear infinite; }
  .diagram .idle { opacity: .25; }
  @keyframes vmc-flow { to { stroke-dashoffset: -28; } }
  @media (prefers-reduced-motion: reduce) { .diagram .flow-dash { animation: none; } }
`;

const SPEEDS = { Away: 'Assente', Low: 'Bassa', Medium: 'Media', High: 'Alta' };
const MODES = { Auto: 'Automatica', Manual: 'Manuale' };

const modeLabel = (mode) =>
  MODES[mode] ?? String(mode ?? '').replace(/^Manual/, 'Manuale').replace(/\(limited\)/, '(limitata)').replace(/^Auto\b/, 'Automatica');
const BALANCE = { Bilanciato: 'Bilanciato', 'Solo Mandata': 'Solo mandata', 'Solo Ripresa': 'Solo ripresa' };

const PROFILES = { Normale: 'Normale', Freddo: 'Freddo', Caldo: 'Caldo' };

export function vmcWatchedIds(vmc) {
  if (!vmc) return [];
  const { controls = {}, ...read } = vmc;
  const bp = controls.bypass ?? {};
  return [
    controls.power_supply, controls.speed, controls.automatic, controls.balance, controls.profile,
    ...Object.values(bp.open ?? {}), ...Object.values(bp.closed ?? {}),
    ...Object.values(read),
  ].filter(
    (x) => typeof x === 'string',
  );
}

 
function fmtGoDuration(text) {
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(text ?? '');
  if (!m || !text) return text;
  const [, h, min] = m.map(Number);
  return [h ? `${h} h` : '', min ? `${min} min` : ''].filter(Boolean).join(' ') || 'meno di 1 min';
}

const NEUTRAL_AIR = '#8C8A84';
function airEffect(supplyT, houseT) {
  if (!Number.isFinite(supplyT) || !Number.isFinite(houseT)) return { color: NEUTRAL_AIR, label: null };
  const delta = supplyT - houseT;
  if (delta <= -0.5) return { color: '#6EA8E0', label: `Raffresca −${fmtNumber(-delta)}°` };
  if (delta >= 0.5) return { color: '#E8A33D', label: `Riscalda +${fmtNumber(delta)}°` };
  return { color: NEUTRAL_AIR, label: 'Neutra' };
}

function diagram(v) {
  const num = (role) => {
    const x = v(role);
    return x === null ? null : Number(x);
  };
  const t = { est: num('t_outdoor'), man: num('t_supply'), rip: num('t_extract'), esp: num('t_exhaust') };
  const u = { est: num('humidity_outdoor'), man: num('humidity_supply'), rip: num('humidity_extract'), esp: num('humidity_exhaust') };
  const supply = num('supply_flow') ?? 0;
  const extract = num('extract_flow') ?? 0;
  const bypass = num('bypass');

  
  const dT = t.rip - t.est;
  const efficiency = bypass === 0 && Math.abs(dT) >= 3 ? ((t.man - t.est) / dT) * 100 : null;
  const effect = airEffect(t.man, t.rip);

  
  
  const anim = (flow) => `--dur:${Math.min(8, Math.max(0.6, 120 / flow)).toFixed(1)}s`;
  const line = (id, d, from, to, flow, x1, x2) => {
    const active = flow > 1;
    return `
      <defs>
        <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="0" x2="${x2}" y2="0">
          <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
        </linearGradient>
        <marker id="${id}-head" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="${to}"/>
        </marker>
      </defs>
      <g class="${active ? '' : 'idle'}">
        <path d="${d}" fill="none" stroke="url(#${id})" stroke-width="7" stroke-linejoin="round" stroke-opacity=".28"/>
        <path d="${d}" fill="none" stroke="url(#${id})" stroke-width="2.5" stroke-linejoin="round" marker-end="url(#${id}-head)"
          ${active ? `class="flow-dash" style="${anim(flow)}"` : ''}/>
      </g>`;
  };
  const port = (x, y, anchor, name, temp, hum, flow) => `
    <text x="${x}" y="${y}" text-anchor="${anchor}" class="port-name">${name}</text>
    <text x="${x}" y="${y + 22}" text-anchor="${anchor}" class="port-temp">${fmtNumber(temp)}°</text>
    <text x="${x}" y="${y + 38}" text-anchor="${anchor}" class="port-sub">${fmtNumber(hum, 0)}%${flow !== undefined ? ` · ${fmtNumber(flow, 0)} m³/h` : ''}</text>`;

  return `
    <div class="diagram">
      <svg viewBox="0 0 380 250" role="img" aria-label="Schema flussi VMC">
        <text x="4" y="10" class="side">FUORI</text>
        <text x="376" y="10" text-anchor="end" class="side">CASA</text>
        <rect x="130" y="52" width="120" height="146" rx="16" fill="var(--bc-surface)" stroke="var(--bc-border)"/>
        ${line('vmc-fresh', 'M4 92 H130 L250 158 H372', effect.color, effect.color, supply, 4, 372)}
        ${line('vmc-stale', 'M376 92 H250 L130 158 H8', NEUTRAL_AIR, NEUTRAL_AIR, extract, 376, 8)}
        <g transform="translate(190 125) rotate(45)">
          <rect x="-24" y="-24" width="48" height="48" rx="4" fill="var(--bc-card)" stroke="var(--bc-text-2)" stroke-opacity=".6"/>
          <path d="M-24 -8H24M-24 8H24M-8 -24V24M8 -24V24" stroke="var(--bc-text-2)" stroke-opacity=".35"/>
        </g>
        ${effect.label ? `<text x="190" y="72" text-anchor="middle" class="unit-text effect" style="fill:${effect.color}">${effect.label}</text>` : ''}
        ${
          efficiency !== null
            ? `<text x="190" y="188" text-anchor="middle" class="unit-text">Recupero ${fmtNumber(efficiency, 0)}%</text>`
            : bypass !== null
              ? `<text x="190" y="188" text-anchor="middle" class="unit-text">Bypass ${fmtNumber(bypass, 0)}%</text>`
              : ''
        }
        ${port(4, 34, 'start', 'Esterno', t.est, u.est)}
        ${port(376, 34, 'end', 'Ripresa', t.rip, u.rip, extract)}
        ${port(4, 186, 'start', 'Espulsione', t.esp, u.esp)}
        ${port(376, 186, 'end', 'Mandata', t.man, u.man, supply)}
      </svg>
    </div>`;
}

export function bypassState(store, bp, modeValue, percent) {
  const text = String(modeValue ?? '').toLowerCase();
  if (!text) return { mode: null, until: null };
  if (text.includes('auto')) return { mode: 'auto', until: null };
  let latest = null;
  for (const dir of ['open', 'closed']) {
    for (const [label, id] of Object.entries(bp[dir] ?? {})) {
      const at = new Date(store.get(id)?.state ?? '');
      const hours = Number(/(\d+)\s*h/.exec(label)?.[1]);
      if (Number.isNaN(at.getTime()) || !hours) continue;
      if (!latest || at > latest.at) latest = { dir, at, until: new Date(at.getTime() + hours * 3_600_000) };
    }
  }
  if (latest && latest.until > new Date()) return { mode: latest.dir, until: latest.until };
  return { mode: percent === null ? null : percent >= 50 ? 'open' : 'closed', until: null };
}

 
export function renderVmc({ store, model, services, ui = {} }) {
  const vmc = model.vmc;
  if (!vmc) return '<p class="placeholder">VMC non configurata in config.json.</p>';
  const c = vmc.controls ?? {};
  const raw = (id) => {
    const s = store.get(id);
    return isUnavailable(s) ? null : s.state;
  };
  const v = (role) => raw(vmc[role]);
  
  const can = (id) => id && services.canControl(id) && store.get(id) && store.get(id).state !== 'unavailable';

  const speed = raw(c.speed);
  const auto = raw(c.automatic) === 'on';
  
  const autoButton = c.automatic
    ? `<button class="${auto ? 'active' : ''}" ${can(c.automatic) ? `data-toggle="${esc(c.automatic)}"` : 'disabled'} aria-pressed="${auto}">Auto</button>`
    : '';
  const mode = v('mode');
  const next = v('next_change');

  
  const segmented = (entity, options, current, warnWhenNot, soft = false) =>
    Object.entries(options)
      .map(([option, label]) => {
        const attrs = can(entity) ? `data-select="${esc(entity)}" data-option="${esc(option)}"` : 'disabled';
        const active = current === option && !soft;
        const warn = active && warnWhenNot && option !== warnWhenNot;
        return `<button class="${active ? 'active' : ''} ${current === option && soft ? 'current' : ''} ${warn ? 'warn' : ''}" ${attrs} aria-pressed="${active}">${esc(label)}</button>`;
      })
      .join('');

  
  const balanceState = store.get(c.balance);
  const balance = isUnavailable(balanceState) ? null : balanceState.state;
  let balanceHint = '';
  if (balance && balance !== 'Bilanciato' && vmc.balance_return_min) {
    const left = Math.ceil(
      (new Date(balanceState.last_changed).getTime() + vmc.balance_return_min * 60_000 - Date.now()) / 60_000,
    );
    balanceHint = `<div class="hint warn">Torna a Bilanciato ${left > 0 ? `tra ${left} min` : 'a breve'}</div>`;
  }

  
  const profileState = store.get(c.profile);
  const profile = isUnavailable(profileState) ? null : profileState.state;
  const profileTarget = v('target_profile');
  let profileHint = '';
  if (profile && profile !== 'Normale') profileHint = `<div class="hint warn">Profilo ${esc(PROFILES[profile] ?? profile)}${profileTarget !== null ? `: obiettivo ${fmtNumber(profileTarget)}°` : ''}. Resta così finché non lo cambi.</div>`;
  else if (profile && profileTarget !== null) profileHint = `<div class="hint">Obiettivo ${fmtNumber(profileTarget)}°</div>`;

  const boostButtons = [
    ...Object.entries(c.boost ?? {}).map(([label, id]) => `<button ${can(id) ? `data-press="${esc(id)}"` : 'disabled'}>${esc(label)}</button>`),
    ...(c.boost_stop ? [`<button class="stop" ${can(c.boost_stop) ? `data-press="${esc(c.boost_stop)}"` : 'disabled'}>Stop</button>`] : []),
  ];

  
  const powerId = c.power_supply;
  const powerState = raw(powerId);
  const powered = powerState !== 'off';
  
  let powerButtonHtml = '';
  let powerConfirm = '';
  if (powerId) {
    const attrs = !can(powerId) ? 'disabled' : powered ? 'data-pick="vmc-power-off"' : `data-toggle="${esc(powerId)}"`;
    powerButtonHtml = powerButton({ on: powered, attrs, label: `${powered ? 'Spegni' : 'Accendi'} la presa della VMC` });
    if (ui.pick === 'vmc-power-off') {
      powerConfirm = `<section class="switch-row">
        <div class="hint warn">Togliere corrente alla VMC? Si ferma il ricambio d'aria finché non la riaccendi.</div>
        <div class="confirm"><button data-pick="">Annulla</button><button class="go" data-toggle="${esc(powerId)}" data-clear-pick>Spegni</button></div>
      </section>`;
    }
  }

  const infoRow = (label, value, cls = '') => `<li><span class="name">${esc(label)}</span><span class="num ${cls}">${esc(value)}</span></li>`;
  const filterDays = Number(v('filter_days'));

  
  const bp = c.bypass;
  let bypassSection = '';
  if (bp) {
    const percent = v('bypass') === null ? null : Number(v('bypass'));
    const { mode: current, until } = bypassState(store, bp, v('bypass_mode'), percent);
    const pick = ['open', 'closed'].includes(ui.pick) ? ui.pick : null;
    const choice = (key, label) => {
      const active = pick ? pick === key : current === key;
      const attrs = key === 'auto' ? (can(bp.auto) ? `data-press="${esc(bp.auto)}"` : 'disabled') : `data-pick="${key}"`;
      return `<button class="${active ? 'active' : ''} ${active && key !== 'auto' ? 'warn' : ''}" ${attrs} aria-pressed="${active}">${label}</button>`;
    };
    const durations = pick
      ? `<div class="segmented" style="margin-top:6px">${Object.entries(bp[pick] ?? {})
          .map(([label, id]) => `<button ${can(id) ? `data-press="${esc(id)}" data-clear-pick` : 'disabled'}>${esc(label)}</button>`)
          .join('')}<button data-pick="">Annulla</button></div>`
      : '';
    let hint = '';
    if (pick) hint = `<div class="hint">Per quanto tempo lo vuoi ${pick}?</div>`;
    else if (current && current !== 'auto') hint = `<div class="hint warn">${current === 'open' ? 'Aperto' : 'Chiuso'} a mano${until ? ` fino alle ${fmtTime(until)}` : ''}</div>`;
    else if (current === null && v('bypass_mode')) hint = `<div class="hint">Modalità: ${esc(v('bypass_mode'))}</div>`;
    bypassSection = `<section><h3>Bypass</h3><div class="segmented">${choice('auto', 'Auto')}${choice('open', 'Aperto')}${choice('closed', 'Chiuso')}</div>${durations}${hint}</section>`;
  }

  
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const alertBanner = (level, text, ic = 'mdi:fan-alert') => `<div class="alert-banner ${level === 'high' ? '' : 'warn'}">${icon(ic)}${esc(text)}</div>`;
  const banner = powerId && !powered ? alertBanner('medium', 'VMC senza alimentazione: la presa è spenta.', 'mdi:power-plug-off') : '';

  
  const health = vmcHealth(store, model);
  const faults = health.errors.filter((e) => !e.state);
  
  const unreadable = health.fault && !health.errors.length;
  const healthBanner = [
    ...faults.map((e) => ({ level: e.level, text: e.text })),
    ...health.problems.map((p) => ({ level: p.level, text: cap(p.text.replace(/^VMC: /, '')) })),
    ...(unreadable ? [{ level: 'medium', text: 'L\'unità segnala un errore · codice non leggibile' }] : []),
  ].map((p) => alertBanner(p.level, p.text)).join('');
  const errorRows = health.errors.map((e) => infoRow(e.text, e.code ? `n° ${e.code}` : '', e.state ? '' : 'warn')).join('');
  const problemRows = health.problems.map((p) => infoRow(cap(p.text.replace(/^VMC: /, '')), 'da controllare', 'warn')).join('');
  const errorsValue = unreadable ? 'Segnalato' : !health.readable ? '—' : faults.length ? `${faults.length} ${faults.length === 1 ? 'attivo' : 'attivi'}` : 'Nessuno';
  const errorsNote = !health.readable
    ? 'Lettura errori non disponibile.'
    : health.verified
      ? 'Errori letti dall\'unità ogni minuto.'
      : 'Errori letti dall\'unità ogni minuto. La lettura non è ancora stata provata con un errore vero: «Nessuno» non è una garanzia.';

  return `
    ${banner}
    ${healthBanner}
    <section class="vmc-hero">
      <div>
        <div class="level">${esc(SPEEDS[v('level')] ?? v('level') ?? '—')}</div>
        <div class="mode ${mode === 'Auto' ? 'auto' : ''}">${esc(modeLabel(mode))}${next && next !== 'n/a' ? ` · cambio tra ${esc(fmtGoDuration(next))}` : ''}</div>
      </div>
      <span class="hero-end"><span class="power num">${fmtNumber(v('power'), 0)} W</span>${powerButtonHtml}</span>
    </section>
    ${powerConfirm}
    ${diagram(v)}
    <section><h3>Velocità</h3><div class="segmented speeds">${autoButton}${segmented(c.speed, SPEEDS, speed, null, auto)}</div></section>
    ${c.balance ? `<section><h3>Bilanciamento</h3><div class="segmented">${segmented(c.balance, BALANCE, balance, 'Bilanciato')}</div>${balanceHint}</section>` : ''}
    ${c.profile ? `<section><h3>Profilo di temperatura</h3><div class="segmented">${segmented(c.profile, PROFILES, profile, 'Normale')}</div>${profileHint}</section>` : ''}
    <section><h3>Boost</h3><div class="segmented">${boostButtons.join('')}</div></section>
    ${bypassSection}
    <section><h3>Stato</h3><ul>
      ${infoRow('Errori', errorsValue, faults.length || unreadable ? 'warn' : '')}
      ${errorRows}
      ${problemRows}
      ${health.filterChange ? infoRow('Cambio filtri', 'in corso') : ''}
      ${infoRow('Filtro da cambiare tra', `${fmtNumber(filterDays, 0)} giorni`, filterDays <= 14 ? 'warn' : '')}
      ${vmc.rmot ? infoRow('RMOT (media esterna)', `${fmtNumber(v('rmot'))}°`) : ''}
    </ul><div class="hint">${esc(errorsNote)}</div></section>`;
}
