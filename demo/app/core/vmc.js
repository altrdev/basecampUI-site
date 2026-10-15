// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { isUnavailable } from './format.js';

 
export const STATUS_ERRORS = new Set([89, 96, 100]);
 
const HIGH_ERRORS = new Set([21, 22, 49, 50, 51, 52, 55, 56]);
 
export const FILTER_ERRORS = new Set([77, 78, 79]);

 
export function parseErrors(text) {
  const t = String(text ?? '').trim();
  if (!t || /^nessuno$/i.test(t)) return [];
  return t
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const m = /^(\d+)\s+(.*)$/.exec(p);
      return m ? { code: Number(m[1]), text: m[2] } : { code: null, text: p };
    });
}

const heldSince = new Map();
function held(key, condition, now, afterMs) {
  if (!condition) {
    heldSince.delete(key);
    return false;
  }
  if (!heldSince.has(key)) heldSince.set(key, now.getTime());
  return now.getTime() - heldSince.get(key) >= afterMs;
}

 
export function vmcAlertIds(vmc) {
  if (!vmc) return [];
  return [
    vmc.errors, vmc.fault, vmc.filter_change, vmc.error_reads,
    vmc.duty_supply, vmc.duty_extract, vmc.rpm_supply, vmc.rpm_extract,
    vmc.supply_flow, vmc.extract_flow, vmc.controls?.balance, vmc.clock, vmc.clock_offset,
    vmc.bypass, vmc.t_outdoor, vmc.t_supply, vmc.t_extract,
  ].filter(Boolean);
}

export function vmcHealth(store, model, now = new Date()) {
  const vmc = model.vmc;
  const a = model.alerts ?? {};
  const health = { errors: [], problems: [], filterChange: false, settling: false, readable: false, fault: false, verified: vmc?.errors_verified === true };
  if (!vmc) return health;
  const st = (id) => (id ? store.get(id) : undefined);
  const num = (id) => {
    const s = st(id);
    return isUnavailable(s) ? NaN : Number(s.state);
  };
  const min = (n) => n * 60_000;

  
  const change = st(vmc.filter_change);
  health.filterChange = change?.state === 'on';
  health.settling = health.filterChange || (change?.state === 'off' && now - new Date(change.last_changed ?? 0) < min(a.vmc_after_filter_change_min ?? 3));

  
  const text = st(vmc.errors);
  if (!isUnavailable(text)) {
    health.readable = true;
    health.errors = parseErrors(text.state).map((e) => ({ ...e, level: HIGH_ERRORS.has(e.code) ? 'high' : 'medium', state: STATUS_ERRORS.has(e.code) }));
  }
  health.fault = st(vmc.fault)?.state === 'on';

  
  const counter = st(vmc.error_reads);
  const unit = st(vmc.controls?.speed);
  const staleMin = a.vmc_reads_stalled_min ?? 5;
  if (counter && counter.state !== 'unavailable' && !isUnavailable(unit) && !health.settling && now - new Date(counter.last_changed ?? 0) >= min(staleMin)) {
    health.problems.push({ key: 'vmc:letture', level: 'medium', text: 'VMC: lettura errori ferma', detail: `L'unità non risponde alla richiesta degli errori da oltre ${staleMin} min: potrebbe segnalare un guasto senza che io lo veda.` });
  }

  
  
  const balanceMode = st(vmc.controls?.balance)?.state;
  const offOnPurpose = balanceMode === 'Solo Ripresa' ? 'mandata' : balanceMode === 'Solo Mandata' ? 'ripresa' : null;
  for (const [side, duty, rpm] of [['mandata', vmc.duty_supply, vmc.rpm_supply], ['ripresa', vmc.duty_extract, vmc.rpm_extract]]) {
    if (side === offOnPurpose) {
      heldSince.delete(`vmc:ventola:${side}`);
      continue;
    }
    const d = num(duty);
    const g = num(rpm);
    const bad = !health.settling && Number.isFinite(d) && Number.isFinite(g) && d >= 15 && g < 100;
    if (held(`vmc:ventola:${side}`, bad, now, min(a.vmc_fan_after_min ?? 3))) {
      health.problems.push({ key: `vmc:ventola:${side}`, level: 'high', text: `VMC: ventola di ${side} ferma`, detail: `Comandata al ${Math.round(d)}% ma gira a ${Math.round(g)} giri: controlla la VMC.` });
    }
  }

  
  const supply = num(vmc.supply_flow);
  const extract = num(vmc.extract_flow);
  const big = Math.max(supply, extract);
  const maxPct = a.vmc_imbalance_pct ?? 30;
  const unbalanced = !health.settling && st(vmc.controls?.balance)?.state === 'Bilanciato' && Number.isFinite(big) && big >= 20 && Math.abs(supply - extract) / big * 100 > maxPct;
  if (held('vmc:sbilanciata', unbalanced, now, min(a.vmc_imbalance_after_min ?? 10))) {
    health.problems.push({ key: 'vmc:sbilanciata', level: 'medium', text: 'VMC: portate sbilanciate', detail: `Mandata ${Math.round(supply)} e ripresa ${Math.round(extract)} m³/h con il bilanciamento attivo: controlla filtri e condotti.` });
  }

  
  
  
  
  const bypass = num(vmc.bypass);
  const tOut = num(vmc.t_outdoor);
  const tSupply = num(vmc.t_supply);
  const tExtract = num(vmc.t_extract);
  const recovery = Math.abs(tExtract - tOut) >= 3 ? ((tSupply - tOut) / (tExtract - tOut)) * 100 : NaN;
  const recoveryMax = a.vmc_bypass_recovery_pct ?? 90;
  const stuck = !health.settling && Number.isFinite(bypass) && bypass >= 90 && Number.isFinite(recovery) && recovery > recoveryMax;
  if (held('vmc:bypass', stuck, now, min(a.vmc_bypass_after_min ?? 30))) {
    health.problems.push({
      key: 'vmc:bypass', level: 'medium', text: 'VMC: bypass aperto ma non si vede',
      detail: `Segna ${Math.round(bypass)}% ma la mandata (${Math.round(tSupply * 10) / 10}°) è quasi quella di casa e lo scambiatore recupera ancora il ${Math.round(recovery)}%, con ${Math.round(tOut * 10) / 10}° fuori. La valvola potrebbe non essersi aperta: prova Chiuso e poi di nuovo Auto.`,
    });
  }

  
  
  const offset = num(vmc.clock_offset);
  const clockMin = a.vmc_clock_min ?? 3;
  const skewed = Number.isFinite(offset) && Math.abs(offset) > clockMin * 60;
  if (held('vmc:orologio', skewed, now, min(a.vmc_clock_after_min ?? 2))) {
    const mins = Math.round(Math.abs(offset) / 60);
    const size = mins >= 60 ? `${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60} min` : ''}` : `${mins} min`;
    const unitClock = st(vmc.clock);
    const shown = !isUnavailable(unitClock) ? ` Segna ${String(unitClock.state).slice(11, 16)}.` : '';
    health.problems.push({ key: 'vmc:orologio', level: 'medium', text: `VMC: orologio ${offset > 0 ? 'avanti' : 'indietro'} di ${size}`, detail: `I cambi di livello del programma orario scattano fuori orario.${shown} Rimettilo dal display della VMC.` });
  }

  return health;
}
