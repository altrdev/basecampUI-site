// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { esc, fmtNumber, fmtWhen, stateNumber, stateValue } from '../core/format.js';
import { fmtSpan } from '../core/gate.js';
import { backupAgeHours, omadaState, upsState } from '../core/rack.js';

export const RACK_STYLES = `
  .rack { display: flex; flex-direction: column; gap: 26px; }
  .rk-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin: 0 4px 10px; }
  .rk-head h3 { margin: 0; font: 600 13px/1.2 var(--bc-font-display); letter-spacing: .08em; text-transform: uppercase; color: var(--bc-text-2); }
  .rk-head .sum { font-size: 12px; color: var(--bc-text-2); font-variant-numeric: tabular-nums; }
  .rk-hero { display: flex; align-items: center; gap: 16px; padding: 14px 16px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .rk-hero > .icon { flex: none; width: 40px; height: 40px; color: var(--bc-green); }
  .rk-hero .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .rk-hero .state { font: 600 22px/1.15 var(--bc-font-display); }
  .rk-hero .sub { font-size: 13px; color: var(--bc-text-2); }
  .rk-hero .big { flex: none; text-align: right; font: 600 26px/1.1 var(--bc-font-display); font-variant-numeric: tabular-nums; }
  .rk-hero .big small { display: block; margin-top: 2px; font: 400 12px var(--bc-font-text); color: var(--bc-text-2); }
  .rk-hero.warn > .icon, .rk-hero.warn .state { color: var(--bc-amber); }
  .rk-hero.bad > .icon, .rk-hero.bad .state { color: var(--bc-red); }
  .rk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; margin-top: 8px; }
  .rk-stat { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); min-width: 0; }
  .rk-stat .k { font-size: 12px; color: var(--bc-text-2); }
  .rk-stat .v { font: 600 17px/1.2 var(--bc-font-display); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .rk-stat .v small { font: 400 12px var(--bc-font-text); color: var(--bc-text-2); }
  .rk-stat.warn .v { color: var(--bc-amber); }
  .rk-stat.bad .v { color: var(--bc-red); }
  .rk-bar { height: 5px; margin-top: 4px; border-radius: 3px; background: var(--bc-border); overflow: hidden; }
  .rk-bar > i { display: block; height: 100%; border-radius: 3px; background: var(--bc-green); }
  .rk-stat.warn .rk-bar > i { background: var(--bc-amber); }
  .rk-stat.bad .rk-bar > i { background: var(--bc-red); }
  .rk-lines { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
  .rk-line { display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 8px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 14px; }
  .rk-line .icon { flex: none; width: 20px; height: 20px; color: var(--bc-green); }
  .rk-line .n { flex: 1; min-width: 0; }
  .rk-line .v { flex: none; font-size: 13px; color: var(--bc-text-2); }
  .rk-line.off .icon { color: var(--bc-text-2); }
  .rk-line.bad .icon, .rk-line.bad .v { color: var(--bc-red); }
  .rk-line.warn .icon, .rk-line.warn .v { color: var(--bc-amber); }
  
  .rk-wan { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding-bottom: 28px; }
  .rk-wan .rk-line { position: relative; }
  .rk-wan .rk-line::after { content: ''; position: absolute; left: 50%; bottom: -14px; width: 2px; height: 14px; background: var(--bc-border-strong); }
  .rk-wan::before { content: ''; position: absolute; left: 25%; right: 25%; bottom: 14px; height: 2px; background: var(--bc-border-strong); }
  .rk-wan::after { content: ''; position: absolute; left: 50%; bottom: 0; width: 2px; height: 14px; background: var(--bc-border-strong); }
  .rk-wan.single::before { display: none; }
  .rk-wan.single .rk-line::after { display: none; }
  .rk-kids { margin-left: 18px; padding-left: 16px; }
  .rk-row { position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px; align-items: start; }
  .rk-row.one { grid-template-columns: minmax(0, 1fr); }
  .rk-tree > .rk-row { margin-top: 0; }
  .rk-kids > .rk-row::before { content: ''; position: absolute; left: -16px; top: 24px; width: 16px; height: 2px; background: var(--bc-border-strong); }
  .rk-kids > .rk-row::after { content: ''; position: absolute; left: -16px; top: -8px; bottom: 0; width: 2px; background: var(--bc-border-strong); }
  .rk-kids > .rk-row:last-child::after { bottom: auto; height: 32px; }
  .rk-item { min-width: 0; }
  .rk-item > .rk-kids { margin-left: 12px; padding-left: 12px; }
  .rk-item > .rk-kids > .rk-row::before { left: -12px; width: 12px; }
  .rk-item > .rk-kids > .rk-row::after { left: -12px; }
  .rk-node { display: flex; align-items: flex-start; gap: 10px; padding: 8px 12px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); border: 1px solid transparent; }
  .rk-node .ico { flex: none; position: relative; width: 32px; height: 32px; border-radius: 10px; background: var(--bc-card); display: flex; align-items: center; justify-content: center; color: var(--bc-text-2); }
  .rk-node .ico .icon { width: 20px; height: 20px; }
  .rk-node .ico::after { content: ''; position: absolute; right: -3px; top: -3px; width: 10px; height: 10px; border-radius: 50%; background: var(--bc-green); border: 2px solid var(--bc-surface); }
  .rk-node.bad { border-color: color-mix(in srgb, var(--bc-red) 55%, transparent); }
  .rk-node.bad .ico { color: var(--bc-red); }
  .rk-node.bad .ico::after { background: var(--bc-red); }
  .rk-node.off .ico::after { background: var(--bc-text-2); }
  .rk-node .t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .rk-node .n { font-size: 14px; font-weight: 600; line-height: 1.25; }
  .rk-node .m { font-size: 12px; color: var(--bc-text-2); font-variant-numeric: tabular-nums; }
  .rk-node .m .upd, .rk-node .m.warn { color: var(--bc-amber); }
  .rk-node .m.bad { color: var(--bc-red); }
  .rk-node .w { flex: none; text-align: right; font: 600 14px/1.25 var(--bc-font-display); font-variant-numeric: tabular-nums; }
  .rk-node .w small { display: block; font: 400 11px var(--bc-font-text); color: var(--bc-text-2); }
  .rk-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .rk-chip { display: inline-flex; gap: 6px; align-items: baseline; padding: 3px 10px; border-radius: 999px; background: var(--bc-card); font-size: 12px; color: var(--bc-text-2); white-space: nowrap; }
  .rk-chip i { font: 600 11px var(--bc-font-display); font-style: normal; font-variant-numeric: tabular-nums; color: var(--bc-text-2); min-width: 14px; text-align: center; }
  .rk-chip b { font-weight: 600; color: var(--bc-text); font-variant-numeric: tabular-nums; }
  .rk-sub { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin: 16px 4px 0; font-size: 12px; color: var(--bc-text-2); }
  .rk-sub > span:first-child { font: 600 11px/1.2 var(--bc-font-display); letter-spacing: .08em; text-transform: uppercase; }
  .rk-vms { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px; }
  .rk-vm { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); min-width: 0; }
  .rk-vm .ico { flex: none; position: relative; width: 32px; height: 32px; border-radius: 10px; background: var(--bc-card); display: flex; align-items: center; justify-content: center; color: var(--bc-text-2); }
  .rk-vm .ico .icon { width: 18px; height: 18px; }
  .rk-vm .ico::after { content: ''; position: absolute; right: -3px; top: -3px; width: 10px; height: 10px; border-radius: 50%; background: var(--bc-green); border: 2px solid var(--bc-surface); }
  .rk-vm.stopped .ico::after { background: var(--bc-text-2); }
  .rk-vm.warn .ico::after { background: var(--bc-amber); }
  .rk-vm.stopped .n { color: var(--bc-text-2); }
  .rk-vm .t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .rk-vm .top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; min-width: 0; }
  .rk-vm .up { flex: none; font-size: 11px; color: var(--bc-text-2); font-variant-numeric: tabular-nums; }
  .rk-vm .n { min-width: 0; font-size: 14px; font-weight: 600; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rk-vm .n small { font: 400 11px var(--bc-font-text); color: var(--bc-text-2); margin-left: 4px; font-variant-numeric: tabular-nums; }
  .rk-vm .m { font-size: 12px; color: var(--bc-text-2); }
  .rk-vm .bars { display: flex; flex-direction: column; gap: 4px; }
  .rk-vm .b { display: flex; flex-direction: column; gap: 2px; }
  .rk-vm .b .l { display: flex; justify-content: space-between; font-size: 11px; color: var(--bc-text-2); }
  .rk-vm .b .l b { font-weight: 600; color: var(--bc-text); font-variant-numeric: tabular-nums; }
  .rk-vm .rk-bar { margin-top: 0; height: 4px; }
  .rk-stat .s { font-size: 11px; color: var(--bc-text-2); font-variant-numeric: tabular-nums; }
  .rk-tabs { display: flex; border: 1px solid var(--bc-border-strong); border-radius: 12px; overflow: hidden; flex: none; }
  .rk-tabs button { flex: 1; min-height: var(--bc-touch); font-size: 14px; font-weight: 500; color: var(--bc-text-2); text-align: center; }
  .rk-tabs button + button { border-left: 1px solid var(--bc-border-strong); }
  .rk-tabs button.active { color: var(--bc-text); background: color-mix(in srgb, #9AA7C7 18%, transparent); }
  .rk-sums { display: flex; flex-direction: column; gap: 8px; }
  .rk-sum { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 56px; padding: 8px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); text-align: left; }
  .rk-sum > .icon { flex: none; width: 22px; height: 22px; color: var(--bc-green); }
  .rk-sum .t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .rk-sum .n { font-size: 15px; font-weight: 600; }
  .rk-sum .m { font-size: 13px; color: var(--bc-text-2); }
  .rk-sum .more { color: var(--bc-text-2); }
  .rk-sum.warn > .icon:first-child { color: var(--bc-amber); }
  .rk-sum.bad > .icon:first-child { color: var(--bc-red); }
  .rk-sum:active { background: var(--bc-border); }
  .rk-note { margin: 8px 4px 0; font-size: 12px; color: var(--bc-text-2); }
  .rk-note.warn { color: var(--bc-amber); }
`;

const val = stateValue;
const num = (store, id) => stateNumber(store, id) ?? NaN;

export const rackWatchedIds = (model) => {
  const r = model.rack ?? {};
  return [
    ...Object.entries(r.ups ?? {}).filter(([k]) => k !== 'name').map(([, v]) => v),
    ...Object.entries(r.server ?? {}).filter(([k]) => !['name', 'machine'].includes(k)).map(([, v]) => v),
    ...Object.entries(r.backup ?? {}).filter(([k]) => k !== 'destination').map(([, v]) => v),
    model.alerts?.internet?.main,
    model.alerts?.internet?.backup,
    r.network?.main_link,
    r.network?.backup_link,
    ...(r.network?.devices ?? []).flatMap((d) => [d.state, d.cpu, d.memoria, d.firmware, ...d.poe.map((p) => p.entity)]),
    ...proxmoxIds(r.proxmox),
  ].filter((id) => typeof id === 'string');
};

 
export const proxmoxIds = (px) => [
  ...[px?.node, ...(px?.guest ?? [])].filter(Boolean).flatMap((d) => [d.state, d.cpu, d.memoria, d.start, d.memoria_max]),
  ...(px?.storage ?? []).flatMap((s) => [s.active, s.percent, s.used, s.total]),
].filter(Boolean);

const fmtSize = (gib) => (!Number.isFinite(gib) ? '—' : gib >= 1024 ? `${fmtNumber(gib / 1024, 1)} TiB` : `${fmtNumber(gib, 0)} GiB`);

const fmtMinutes = (s) => (!Number.isFinite(s) ? '—' : s < 5400 ? `${Math.round(s / 60)} min` : `${Math.floor(s / 3600)} h ${String(Math.round((s % 3600) / 60)).padStart(2, '0')}`);

const stat = (k, v, { tone = '', bar = null } = {}) =>
  `<div class="rk-stat ${tone}"><span class="k">${esc(k)}</span><span class="v">${v}</span>${bar === null ? '' : `<span class="rk-bar"><i style="width:${Math.max(0, Math.min(100, bar))}%"></i></span>`}</div>`;
const withUnit = (value, unit, digits = 0) => (Number.isFinite(value) ? `${fmtNumber(value, digits)} <small>${unit}</small>` : '—');

function renderUps({ store, model }) {
  const u = model.rack.ups;
  if (!u) return '';
  const st = upsState(val(store, u.state));
  const raw = val(store, u.state);
  const runtime = num(store, u.range);
  const charge = num(store, u.charge);
  const load = num(store, u.load);
  return `<section>
    <div class="rk-head"><h3>${esc(u.name ?? 'UPS')}</h3></div>
    <div class="rk-hero ${st.tone}">${icon(st.icon)}
      <span class="txt"><span class="state">${esc(raw === null ? 'Non disponibile' : st.label)}</span><span class="sub">${esc(st.detail)}</span></span>
      <span class="big">${fmtMinutes(runtime)}<small>autonomia</small></span></div>
    <div class="rk-grid">
      ${stat('Carica', withUnit(charge, '%'), { bar: charge, tone: charge < 20 ? 'bad' : charge < 50 ? 'warn' : '' })}
      ${stat('Carico', withUnit(load, '%'), { bar: load, tone: load > 90 ? 'bad' : load > 75 ? 'warn' : '' })}
      ${stat('Ingresso', withUnit(num(store, u.input_voltage), 'V', 0))}
      ${stat('Uscita', withUnit(num(store, u.output_voltage), 'V', 0))}
    </div></section>`;
}

function renderProxmox({ store, model }) {
  const px = model.rack.proxmox;
  if (!px || (!px.node && !px.guest.length)) return '';
  const n = px.node;
  const up = n ? num(store, n.start) * 3_600_000 : NaN;
  const cpu = n ? num(store, n.cpu) : NaN;
  const mem = n ? num(store, n.memoria) : NaN;
  const memMax = n ? num(store, n.memoria_max) : NaN;
  const offline = n && val(store, n.state) === 'offline';
  const running = px.guest.filter((g) => val(store, g.state) === 'running').length;
  const bar = (label, pct, tone, text) => `<span class="b"><span class="l">${label} <b>${text ?? (Number.isFinite(pct) ? `${fmtNumber(pct, pct < 10 ? 1 : 0)}%` : '—')}</b></span><span class="rk-bar"><i style="width:${Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0))}%"></i></span></span>`;
  const tile = (g) => {
    const st = val(store, g.state);
    const on = st === 'running';
    const gcpu = num(store, g.cpu);
    const gmem = num(store, g.memoria);
    const cls = st === null || st === 'stopped' ? 'stopped' : on ? '' : 'warn';
    const upH = num(store, g.start);
    const state = on ? '' : st === 'stopped' ? 'Fermo' : st === 'suspended' ? 'Sospeso' : 'Non disponibile';
    
    
    const inside = model.rack.server?.machine?.toLowerCase() === g.name.toLowerCase() ? model.rack.server : null;
    const free = inside ? num(store, inside.memory_free) : NaN;
    const total = num(store, g.memoria_max);
    const disk = inside ? num(store, inside.disk_used) : NaN;
    const diskFree = inside ? num(store, inside.disk_free) : NaN;
    const realMem = Number.isFinite(free) && total > 0 ? (1 - free / 1024 / total) * 100 : NaN;
    const bars = inside && Number.isFinite(realMem)
      ? `${bar('CPU', gcpu)}${bar('RAM', realMem, realMem > 90 ? 'bad' : '', `${fmtNumber(free / 1024, 1)} GiB liberi`)}${Number.isFinite(disk) ? bar('Disco', disk, disk > 90 ? 'bad' : '', `${fmtNumber(disk, 0)}%${Number.isFinite(diskFree) ? ` · ${fmtNumber(diskFree, 0)} GiB liberi` : ''}`) : ''}`
      : `${bar('CPU', gcpu)}${bar('RAM', gmem, gmem > 95 ? 'bad' : '')}`;
    return `<div class="rk-vm ${cls}"><span class="ico">${icon(px.icons?.[g.name] ?? (g.type === 'vm' ? 'mdi:monitor' : 'mdi:package-variant-closed'))}</span>
      <span class="t"><span class="top"><span class="n">${esc(g.name)}${g.vmid ? ` <small>${g.type === 'vm' ? 'VM ' : ''}${esc(g.vmid)}</small>` : ''}</span>${on && Number.isFinite(upH) ? `<span class="up" title="Acceso da">${fmtSpan(upH * 3_600_000)}</span>` : ''}</span>
      ${on ? `<span class="bars">${bars}</span>` : `<span class="m">${state}</span>`}</span></div>`;
  };
  const vms = px.guest.filter((g) => g.type === 'vm');
  const cts = px.guest.filter((g) => g.type !== 'vm');
  const group = (title, list) => (list.length ? `<div class="rk-sub"><span>${title}</span><span>${list.filter((g) => val(store, g.state) === 'running').length} di ${list.length} attive</span></div><div class="rk-vms">${list.map(tile).join('')}</div>` : '');
  const guests = [group('Macchine virtuali', vms), group('Container', cts)].filter(Boolean);
  const limit = model.alerts?.storage_full_pct ?? 85;
  const stores = px.storage.map((s) => {
    const pct = num(store, s.percent);
    const used = num(store, s.used);
    const total = num(store, s.total);
    return stat(`Archivio ${s.name}`, withUnit(pct, '%'), { bar: pct, tone: pct > 95 ? 'bad' : pct > limit ? 'warn' : '' }).replace('</div>', `<span class="s">${fmtSize(used)} di ${fmtSize(total)}</span></div>`);
  });
  return `<section>
    <div class="rk-head"><h3>Proxmox</h3><span class="sum">${offline ? 'minipc non raggiungibile' : `${running} di ${px.guest.length} attivi${Number.isFinite(up) ? ` · acceso da ${fmtSpan(up)}` : ''}`}</span></div>
    ${n ? `<div class="rk-grid">
      ${stat('Processore', withUnit(cpu, '%', 1), { bar: cpu, tone: cpu > 90 ? 'bad' : cpu > 70 ? 'warn' : '' })}
      ${stat('Memoria', withUnit(mem, '%'), { bar: mem, tone: mem > 95 ? 'bad' : mem > 85 ? 'warn' : '' }).replace('</div>', Number.isFinite(memMax) ? `<span class="s">su ${fmtNumber(memMax, 1)} GiB</span></div>` : '</div>')}
      ${stores.join('')}
    </div>` : ''}
    ${guests.join('')}
  </section>`;
}

function renderNetwork({ store, model }) {
  const devices = model.rack.network?.devices ?? [];
  const net = model.alerts?.internet ?? {};
  const network = model.rack.network ?? {};
  const row = (name, ic, text, cls) => `<div class="rk-line ${cls}">${icon(ic)}<span class="n">${esc(name)}</span><span class="v">${esc(text)}</span></div>`;
  
  
  
  const main = net.main ? (val(store, net.main) === 'on' ? row('Fibra', 'mdi:web', 'Collegata', '') : row('Fibra', 'mdi:web-off', val(store, network.main_link) === 'off' ? 'Cavo scollegato' : 'Senza internet', 'bad')) : '';
  const backupOn = val(store, net.backup) === 'on';
  const backupCable = network.backup_link ? val(store, network.backup_link) : 'on';
  const backup = net.backup
    ? backupOn ? (val(store, net.main) === 'on' ? row('5G', 'mdi:signal-5g', 'Pronta', '') : row('5G', 'mdi:signal-5g', 'In uso', 'warn'))
    : backupCable === 'off' ? row('5G', 'mdi:signal-off', 'Cavo scollegato', 'bad')
    : row('5G', 'mdi:signal-5g', 'In riserva', 'off')
    : '';

  const byName = new Map(devices.map((d) => [d.name.toLowerCase(), d]));
  const placed = new Set();
  const watts = (id) => num(store, id);
  const KIND_ICON = { router: 'mdi:router-network', switch: 'mdi:switch', ap: 'mdi:access-point' };
  const kindOf = (name) => (/^router/i.test(name) ? 'router' : /^switch/i.test(name) ? 'switch' : 'ap');
  let totalW = 0;

  
  const node = (spec, parent) => {
    const d = byName.get(String(spec.name).toLowerCase());
    if (d) placed.add(d.name);
    const kids = spec.children ?? [];
    const usedPorts = new Set(kids.map((k) => k.door).filter(Boolean));
    const status = d ? val(store, d.state) : null;
    const om = status === null ? { bad: false } : omadaState(status);
    const cpu = d ? num(store, d.cpu) : NaN;
    const mem = d ? num(store, d.memoria) : NaN;
    const update = d?.firmware && val(store, d.firmware) === 'on';
    const metrics = [Number.isFinite(cpu) ? `CPU ${fmtNumber(cpu, 0)}%` : null, Number.isFinite(mem) ? `RAM ${fmtNumber(mem, 0)}%` : null].filter(Boolean).join(' · ');
    
    
    let w = NaN;
    let wLabel = '';
    if (parent && spec.door) {
      const port = parent.poe.find((p) => p.door === spec.door);
      w = port ? watts(port.entity) : NaN;
      wLabel = 'PoE';
    } else if (d?.poe.length) {
      w = d.poe.reduce((sum, p) => sum + (Number.isFinite(watts(p.entity)) ? watts(p.entity) : 0), 0);
      totalW += w;
      wLabel = 'PoE totale';
    }
    
    
    const chips = (d?.poe ?? [])
      .filter((p) => !usedPorts.has(p.door) && watts(p.entity) > 0)
      .map((p) => `<span class="rk-chip"><i>${p.door}</i>${esc(p.name ?? `Porta ${p.door}`)} <b>${fmtNumber(watts(p.entity), 1)} W</b></span>`)
      .join('');
    const line2 = !d ? 'Non in Omada' : status === null ? 'Non disponibile' : om.bad ? om.label : [parent && spec.door ? `porta ${spec.door}` : null, metrics].filter(Boolean).join(' · ');
    const cls = !d || status === null ? 'off' : om.bad ? 'bad' : '';
    const rows = [];
    
    for (const k of kids) rows.push([k]);
    const sub = kids.length ? `<div class="rk-kids">${rows.map((r) => `<div class="rk-row ${r.length === 1 ? 'one' : ''}">${r.map((k) => node(k, d)).join('')}</div>`).join('')}</div>` : '';
    return `<div class="rk-item"><div class="rk-node ${cls}"><span class="ico">${icon(KIND_ICON[kindOf(spec.name)])}</span>
      <span class="t"><span class="n">${esc(spec.name)}</span><span class="m ${om.bad ? 'bad' : ''}">${esc(line2)}${update ? ' · <span class="upd">aggiornamento</span>' : ''}</span>${chips ? `<span class="rk-chips">${chips}</span>` : ''}</span>
      ${Number.isFinite(w) && w > 0 ? `<span class="w">${fmtNumber(w, 1)} W<small>${wLabel}</small></span>` : ''}</div>${sub}</div>`;
  };

  
  const spec = { name: network.topology?.name ?? 'Router', children: [...(network.topology?.children ?? [])] };
  const names = new Set();
  const collect = (s) => { names.add(String(s.name).toLowerCase()); (s.children ?? []).forEach(collect); };
  collect(spec);
  for (const d of devices) if (!names.has(d.name.toLowerCase())) spec.children.push({ name: d.name });
  const tree = node(spec, null);

  const up = devices.filter((d) => val(store, d.state) !== null && !omadaState(val(store, d.state)).bad).length;
  const wan = [main, backup].filter(Boolean);
  return `<section>
    <div class="rk-head"><h3>Rete</h3><span class="sum">${up} di ${devices.length} apparati · PoE ${fmtNumber(totalW, 1)} W</span></div>
    ${wan.length ? `<div class="rk-wan ${wan.length === 1 ? 'single' : ''}">${wan.join('')}</div>` : ''}
    <div class="rk-tree"><div class="rk-row one">${tree}</div></div>
  </section>`;
}

function renderBackup({ store, model }) {
  const b = model.rack.backup;
  if (!b) return '';
  const age = backupAgeHours(store, model);
  const limit = model.alerts?.backup_hours ?? 36;
  const stale = age !== null && age > limit;
  const last = val(store, b.last);
  const next = val(store, b.next);
  const tried = val(store, b.attempted);
  const failed = last && tried && new Date(tried) > new Date(last) && Math.abs(new Date(tried) - new Date(last)) > 10 * 60_000;
  const working = val(store, b.state) && val(store, b.state) !== 'idle';
  return `<section>
    <div class="rk-head"><h3>Backup di Home Assistant</h3>${b.destination ? `<span class="sum">su ${esc(b.destination)}</span>` : ''}</div>
    <div class="rk-hero ${stale ? 'bad' : failed ? 'warn' : ''}">${icon(stale ? 'mdi:backup-restore' : 'mdi:cloud-check-outline')}
      <span class="txt"><span class="state">${last ? esc(fmtWhen(last)) : 'Nessun dato'}</span><span class="sub">${working ? 'Backup in corso…' : age === null ? 'Ultimo backup riuscito' : `Ultimo riuscito, ${fmtSpan(age * 3_600_000)} fa`}</span></span>
      <span class="big">${next ? esc(fmtWhen(next)) : '—'}<small>prossimo</small></span></div>
    ${stale ? `<p class="rk-note warn">Nessun backup riuscito da oltre ${limit} ore.</p>` : failed ? `<p class="rk-note warn">L'ultimo tentativo (${esc(fmtWhen(tried))}) non è andato a buon fine.</p>` : ''}
  </section>`;
}

const TABS = [['panoramica', 'Panoramica'], ['server', 'Server'], ['rete', 'Rete']];

 
function summaryRow(tab, ic, title, text, tone) {
  return `<button class="rk-sum ${tone}" data-rack-tab="${tab}">${icon(ic)}<span class="t"><span class="n">${esc(title)}</span><span class="m">${esc(text)}</span></span>${icon('mdi:chevron-right', 'icon more')}</button>`;
}

function renderSummary({ store, model }) {
  const r = model.rack;
  const rows = [];
  const px = r.proxmox;
  if (px && (px.node || px.guest.length)) {
    const skip = (px.excluded ?? []).map((x) => x.toLowerCase());
    const stopped = px.guest.filter((g) => val(store, g.state) !== 'running' && !skip.includes(g.name.toLowerCase()));
    const running = px.guest.filter((g) => val(store, g.state) === 'running').length;
    const limit = model.alerts?.storage_full_pct ?? 85;
    const full = (px.storage ?? []).filter((s) => num(store, s.percent) > limit);
    const offline = px.node && val(store, px.node.state) === 'offline';
    const bad = offline || stopped.length || full.length;
    const text = offline ? 'Minipc non raggiungibile' : [`${running} di ${px.guest.length} attivi`, stopped.length ? `fermi: ${stopped.map((g) => g.name).join(', ')}` : null, full.length ? `${full.map((s) => s.name).join(', ')} quasi pieno` : null].filter(Boolean).join(' · ');
    rows.push(summaryRow('server', 'mdi:server', 'Server', text, offline ? 'bad' : bad ? 'warn' : ''));
  }
  const devices = r.network?.devices ?? [];
  if (devices.length) {
    const down = devices.filter((d) => val(store, d.state) === null || omadaState(val(store, d.state)).bad);
    const net = model.alerts?.internet ?? {};
    const wan = net.main && val(store, net.main) !== 'on' ? 'internet assente' : null;
    const text = [`${devices.length - down.length} di ${devices.length} apparati`, down.length ? `fermi: ${down.map((d) => d.name).join(', ')}` : null, wan].filter(Boolean).join(' · ');
    rows.push(summaryRow('rete', 'mdi:lan', 'Rete', text, wan || down.length ? 'warn' : ''));
  }
  return rows.length ? `<section><div class="rk-head"><h3>In breve</h3></div><div class="rk-sums">${rows.join('')}</div></section>` : '';
}

export function renderRack(args) {
  if (!args.model.rack) return '<p class="placeholder">Rack non configurato in config.json.</p>';
  const tab = TABS.some(([id]) => id === args.ui?.rackTab) ? args.ui.rackTab : 'panoramica';
  const tabs = `<div class="rk-tabs" role="tablist">${TABS.map(([id, label]) => `<button class="${id === tab ? 'active' : ''}" data-rack-tab="${id}" role="tab" aria-selected="${id === tab}">${label}</button>`).join('')}</div>`;
  const body = tab === 'server' ? renderProxmox(args) : tab === 'rete' ? renderNetwork(args) : renderUps(args) + renderBackup(args) + renderSummary(args);
  return `<div class="rack">${tabs}${body}</div>`;
}

 
export function rackSummary(store, model) {
  const u = model.rack?.ups;
  if (!u) return 'Rack';
  const st = upsState(val(store, u.state));
  const runtime = num(store, u.range);
  return `UPS ${st.label.toLowerCase().replace(' · in carica', '')}${Number.isFinite(runtime) ? ` · ${fmtMinutes(runtime)}` : ''}`;
}
