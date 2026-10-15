// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { fmtNumber, fmtTime, isUnavailable } from './format.js';
import { fmtSpan, gateSeen } from './gate.js';
import { backupAgeHours, omadaState, upsState } from './rack.js';
import { dockErrorText, maintenanceRows, robotErrorText } from './robot.js';
import { nextRun, scheduleState } from './schedules.js';
import { FILTER_ERRORS, vmcAlertIds, vmcHealth } from './vmc.js';

const minutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
};

 
function isNight(date, [from = '23:00', to = '06:00'] = []) {
  const now = date.getHours() * 60 + date.getMinutes();
  const a = minutes(from), b = minutes(to);
  return a <= b ? now >= a && now < b : now >= a || now < b;
}

 
export function importantEntities(model) {
  return [
    ...model.access.map((a) => a.id),
    model.alarm,
    ...model.zones.map((z) => z.climate),
    model.vmc?.controls?.speed,
    model.intercom?.camera,
  ].filter(Boolean);
}

 
export function gridVoltageIds(model) {
  const e = model.energy ?? {};
  return [e.grid_voltage_a, e.grid_voltage_b, e.grid_voltage_c].filter(Boolean);
}

 
export function rackAlertIds(model) {
  const r = model.rack ?? {};
  const px = r.proxmox ?? {};
  return [r.ups?.state, r.backup?.last, ...(r.network?.devices ?? []).flatMap((d) => [d.state, d.firmware]), px.node?.state, ...(px.guest ?? []).map((g) => g.state), ...(px.storage ?? []).map((x) => x.percent)].filter(Boolean);
}

 
export function isolationThresholds(model) {
  const t = model.alerts?.insulation ?? {};
  return [t.warning ?? 1, t.critical ?? 0.1];
}

export function plantLevel(store, metric) {
  const st = metric?.sensor ? store.get(metric.sensor) : null;
  const v = isUnavailable(st) ? NaN : Number(st.state);
  const min = Number(store.get(metric?.min)?.state), max = Number(store.get(metric?.max)?.state);
  if (!Number.isFinite(v) || !Number.isFinite(min) || !Number.isFinite(max)) return null;
  return v < min ? 'low' : v > max ? 'high' : 'ok';
}

export function alertsWatchedIds(model) {
  const a = model.alerts ?? {};
  return [
    a.internet?.main,
    a.internet?.backup,
    ...(a.rcds ?? []).flatMap((d) => d.entity ?? []),
    ...importantEntities(model),
    model.climate?.heat_pump?.activity,
    model.climate?.heat_pump?.last_error,
    model.energy?.insulation,
    ...gridVoltageIds(model),
    a.tablet?.entity,
    ...(a.weather_stale?.entities ?? []),
    ...rackAlertIds(model),
    model.security?.siren,
    ...(model.robot?.dock_problems ?? []).map((p) => p.entity),
    ...(model.robot?.maintenance ?? []).map((m) => m.entity),
    model.robot?.error,
    model.robot?.dock_error,
    model.robot?.schedules?.automation,
    model.robot?.schedules?.pause,
    model.robot?.vacuum,
    model.robot?.last_clean,
    ...model.zones.flatMap((z) => z.windows),
    ...model.batteries,
    ...(model.batteryVoltages ?? []).map((b) => b.entity),
    model.vmc?.filter_days,
    ...vmcAlertIds(model.vmc),
    a.missed_call?.entity,
    model.intercom?.do_not_disturb,
    ...(model.seenGates ?? []).map((g) => g.sensor),
    ...model.plants.flatMap((p) => [p.id, p.metrics?.moisture?.sensor, p.metrics?.moisture?.min]),
  ].filter(Boolean);
}

export function computeAlerts(store, model, { now = new Date(), offlineSince = null } = {}) {
  const a = model.alerts ?? {};
  const s = (id) => (id ? store.get(id) : undefined);
  const out = [];
  const val = (get, id) => { const st = id ? get(id) : null; return isUnavailable(st) ? null : st.state; };

  
  const main = s(a.internet?.main);
  const backup = s(a.internet?.backup);
  if (main && main.state === 'off') {
    if (backup?.state === 'on') out.push({ key: 'internet', level: 'medium', icon: 'mdi:signal-cellular-2', text: 'Internet su linea di backup', detail: 'La linea principale è giù, attiva la connessione di riserva.' });
    else out.push({ key: 'internet', level: 'high', icon: 'mdi:web-off', text: 'Internet assente', detail: 'Né la linea principale né quella di backup sono collegate.' });
  } else if (backup?.state === 'on') {
    out.push({ key: 'internet', level: 'medium', icon: 'mdi:signal-cellular-2', text: 'Internet su linea di backup', detail: 'È attiva la connessione di riserva.' });
  }

  
  
  const tripped = new Set();
  const after = (a.rcd_after_min ?? 2) * 60_000;
  for (const d of a.rcds ?? []) {
    const ids = d.entity ?? [];
    const down = ids.length > 0 && ids.every((id) => {
      const st = s(id);
      return st?.state === 'unavailable' && now - new Date(st.last_changed ?? 0) >= after;
    });
    if (down) {
      ids.forEach((id) => tripped.add(id));
      out.push({ key: `diff:${d.name}`, level: 'high', icon: 'mdi:flash-alert-outline', text: `Differenziale ${d.name} saltato?`, detail: `Non rispondono: ${ids.map((id) => model.name(id)).join(', ')}. Controlla il quadro.` });
    }
  }

  
  const offline = importantEntities(model).filter((id) => s(id)?.state === 'unavailable' && !tripped.has(id));
  
  const KIND = { lock: 'Serratura', climate: 'Termostato', camera: 'Telecamera', select: 'VMC' };
  const zoneOf = (id) => model.zones.find((z) => z.climate === id)?.name;
  for (const id of offline) {
    const domain = id.split('.')[0];
    const label = domain === 'climate' ? `Termostato ${zoneOf(id) ?? model.name(id)}` : domain === 'select' ? 'VMC' : KIND[domain] ? `${KIND[domain]} ${model.name(id)}` : model.name(id);
    out.push({ key: `off:${id}`, level: 'high', icon: 'mdi:lan-disconnect', text: `${label} offline`, detail: 'Non raggiungibile da Home Assistant.' });
  }

  
  
  const pump = model.climate?.heat_pump ?? {};
  const activity = s(pump.activity);
  const code = s(pump.last_error);
  if (activity?.state === 'unavailable') {
    out.push({ key: 'pompa', level: 'high', icon: 'mdi:heat-pump', text: 'Pompa di calore non risponde', detail: 'Possibile disfunzione: l\'attività non è disponibile.' });
  } else if (code && !isUnavailable(code) && /\d{2}:\d{2}\s*$/.test(code.state) && !code.state.includes(' - ')) {
    out.push({ key: 'pompa', level: 'high', icon: 'mdi:heat-pump', text: 'Errore pompa di calore', detail: code.state });
  }

  
  const insulation = s(model.energy?.insulation);
  const rv = isUnavailable(insulation) ? NaN : Number(insulation.state);
  const [warnAt, critAt] = isolationThresholds(model);
  if (Number.isFinite(rv) && rv < warnAt && now - new Date(insulation.last_changed ?? 0) >= (a.insulation?.after_min ?? 2) * 60_000) {
    const crit = rv < critAt;
    out.push({ key: 'isolamento', level: crit ? 'high' : 'medium', icon: 'mdi:flash-triangle-outline', text: `Isolamento inverter ${crit ? 'critico' : 'basso'}: ${rv.toLocaleString('it-IT', { maximumFractionDigits: 2 })} MΩ`, detail: crit ? 'Possibile dispersione verso terra sull\'impianto fotovoltaico: l\'inverter potrebbe fermarsi.' : `Sotto ${warnAt.toLocaleString('it-IT')} MΩ: tenere d'occhio l'impianto fotovoltaico.` });
  }

  
  for (const p of model.robot?.dock_problems ?? []) {
    if (s(p.entity)?.state === 'on') out.push({ key: `dock:${p.entity}`, level: 'medium', icon: 'mdi:robot-vacuum', open: '#funzioni/robot', text: p.text, detail: `Dock di ${model.robot.name ?? 'Robot'}: tocca per aprire il robot.` });
  }

  
  {
    const name = model.robot?.name ?? 'Robot';
    const err = s(model.robot?.error)?.state;
    const robotErr = err && !['none', 'unknown', 'unavailable'].includes(err) ? robotErrorText(err) : s(model.robot?.vacuum)?.state === 'error' ? 'errore segnalato' : null;
    if (robotErr) out.push({ key: 'robot:errore', level: 'medium', icon: 'mdi:robot-vacuum-alert', open: '#funzioni/robot', text: `${name}: ${robotErr.charAt(0).toLowerCase()}${robotErr.slice(1)}`, detail: 'Controlla il robot: tocca per aprire la pagina di Robot.' });
    const dockErr = dockErrorText(s(model.robot?.dock_error)?.state);
    if (dockErr) out.push({ key: 'robot:errore-dock', level: 'medium', icon: 'mdi:robot-vacuum-alert', open: '#funzioni/robot', text: `Dock di ${name}: ${dockErr.charAt(0).toLowerCase()}${dockErr.slice(1)}`, detail: 'Controlla la base: tocca per aprire la pagina di Robot.' });
  }

  
  for (const { item, status } of maintenanceRows({ get: s }, model.robot, a.robot_maintenance_hours)) {
    if (status !== 'scaduta') continue;
    out.push({
      key: `manutenzione:${item.entity}`, level: 'medium', icon: item.icon ?? 'mdi:robot-vacuum', open: '#funzioni/robot',
      text: `${item.subject ?? item.name} di ${model.robot.name ?? 'Robot'} da ${item.verb ?? 'controllare'}`,
      detail: 'Contatore a zero: dopo averlo fatto azzera il contatore da Funzioni › Robot.',
    });
  }

  
  const prog = model.robot?.schedules;
  if (prog && s(prog.automation) && !isUnavailable(s(prog.automation))) {
    const name = model.robot.name ?? 'Robot';
    const state = scheduleState({ get: s }, prog, now);
    const day = (d) => d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    
    if (state.on && state.until) {
      const next = nextRun(prog, state, now);
      out.push({ key: 'programmazioni:pausa', level: 'medium', icon: 'mdi:calendar-clock', open: '#funzioni/robot', text: `Programmazioni di ${name} in pausa${next ? ` fino a ${day(next.at)}` : ''}`, detail: 'Le pulizie automatiche sono sospese: tocca per aprire il robot e riprenderle.' });
    }
    
    const [h, m] = String(prog.time ?? '13:15').split(':').map(Number);
    const runAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const pausedAtRun = Number(s(prog.pause)?.attributes?.timestamp) * 1000 > runAt.getTime();
    const lastRun = new Date(s(prog.automation).attributes?.last_triggered ?? 0);
    const vacState = s(model.robot.vacuum)?.state;
    const cleanedSince = new Date(s(model.robot.last_clean)?.state ?? 0) >= runAt;
    const planned = (prog.plans ?? []).some((p) => p.days.includes(now.getDay()));
    if (state.on && planned && now - runAt >= (a.robot_clean_after_min ?? 15) * 60_000 && !pausedAtRun && !(lastRun >= runAt) && !cleanedSince && !['cleaning', 'returning', 'paused'].includes(vacState)) {
      out.push({ key: 'programmazioni:non-partita', level: 'medium', icon: 'mdi:robot-vacuum-alert', open: '#funzioni/robot', text: `La pulizia delle ${prog.time} di ${name} non è partita`, detail: 'Di solito il robot non era alla base: l\'automazione non ritenta. Tocca per aprire il robot.' });
    }
  }

  
  const ups = model.rack?.ups;
  if (ups && !isUnavailable(s(ups.state))) {
    const st = upsState(s(ups.state).state);
    if (st.tone === 'bad') out.push({ key: 'ups', level: 'high', icon: 'mdi:battery-alert-variant-outline', open: '#funzioni/rack', text: st.label === 'A batteria' ? 'UPS a batteria: manca la corrente' : `UPS: ${st.label.toLowerCase()}`, detail: 'Rack alimentato dalla batteria dell\'UPS: tocca per vedere l\'autonomia.' });
    else if (st.label === 'Batteria da sostituire') out.push({ key: 'ups', level: 'medium', icon: 'mdi:battery-heart-variant', open: '#funzioni/rack', text: 'UPS: batteria da sostituire', detail: 'L\'UPS segnala la batteria esaurita.' });
  }
  const bkAge = backupAgeHours(store, model, now.getTime());
  const bkMax = a.backup_hours ?? 36;
  if (bkAge !== null && bkAge > bkMax) {
    out.push({ key: 'backup', level: 'medium', icon: 'mdi:backup-restore', open: '#funzioni/rack', text: `Backup di Home Assistant vecchio di ${fmtSpan(bkAge * 3_600_000)}`, detail: `Nessun backup riuscito da oltre ${bkMax} ore: controlla la destinazione.` });
  }
  
  const px = model.rack?.proxmox;
  if (px) {
    if (px.node && val(s, px.node.state) === 'offline') out.push({ key: 'proxmox', level: 'high', icon: 'mdi:server-off', open: '#funzioni/rack', text: 'Proxmox non raggiungibile', detail: 'Il minipc risulta offline.' });
    const skip = (model.rack.proxmox.excluded ?? []).map((x) => x.toLowerCase());
    const stopped = (px.guest ?? []).filter((g) => val(s, g.state) === 'stopped' && !skip.includes(g.name.toLowerCase()) && now - new Date(s(g.state).last_changed ?? 0) >= 5 * 60_000);
    if (stopped.length) out.push({ key: 'vm-ferme', level: 'medium', icon: 'mdi:server-minus', open: '#funzioni/rack', text: stopped.length === 1 ? `${stopped[0].name} è fermo` : `${stopped.length} macchine ferme: ${stopped.map((g) => g.name).join(', ')}`, detail: 'Container o macchina virtuale di Proxmox spenti: tocca per aprire il rack.' });
    const full = a.storage_full_pct ?? 85;
    for (const x of px.storage ?? []) {
      const v = Number(val(s, x.percent));
      if (Number.isFinite(v) && v > full) out.push({ key: `storage:${x.name}`, level: 'medium', icon: 'mdi:harddisk', open: '#funzioni/rack', text: `Archivio ${x.name} al ${fmtNumber(v, 0)}%`, detail: `Sopra l'${full}% di spazio usato in Proxmox.` });
    }
  }

  const netAfter = (a.network_devices_after_min ?? 5) * 60_000;
  for (const d of model.rack?.network?.devices ?? []) {
    const st = s(d.state);
    if (st && !isUnavailable(st) && omadaState(st.state).bad && now - new Date(st.last_changed ?? 0) >= netAfter) {
      out.push({ key: `omada:${d.state}`, level: 'medium', icon: 'mdi:lan-disconnect', open: '#funzioni/rack', text: `${d.name} non collegato`, detail: `Omada lo segnala: ${omadaState(st.state).label.toLowerCase()}.` });
    }
  }
  const fw = (model.rack?.network?.devices ?? []).filter((d) => d.firmware && s(d.firmware)?.state === 'on');
  if (fw.length) {
    out.push({ key: 'firmware', level: 'medium', icon: 'mdi:update', open: '#funzioni/rack', text: fw.length === 1 ? `Aggiornamento firmware: ${fw[0].name}` : `${fw.length} apparati di rete da aggiornare`, detail: fw.map((d) => d.name).join(', ') });
  }

  
  if (s(model.security?.siren)?.state === 'on') {
    out.push({ key: 'sirena', level: 'high', icon: 'mdi:bullhorn-variant', open: '#sicurezza', text: 'Sirena dell\'allarme in funzione', detail: 'Controlla porte e finestre nel pannello Sicurezza.' });
  }

  
  const gv = a.grid ?? {};
  const volts = gridVoltageIds(model).map((id) => ({ id, st: s(id) })).filter(({ st }) => !isUnavailable(st) && Number(st.state) > 50);
  const badV = volts.filter(({ st }) => (Number(st.state) < (gv.voltage_min ?? 207) || Number(st.state) > (gv.voltage_max ?? 253)) && now - new Date(st.last_changed ?? 0) >= (gv.after_min ?? 2) * 60_000);
  if (badV.length) {
    const high = badV.some(({ st }) => Number(st.state) > (gv.voltage_max ?? 253));
    out.push({ key: 'rete', level: 'medium', icon: 'mdi:transmission-tower-off', text: `Tensione di rete ${high ? 'high' : 'bassa'}: ${badV.map(({ st }) => fmtNumber(Number(st.state), 0)).join(' / ')} V`, detail: `Fuori da ${gv.voltage_min ?? 207}–${gv.voltage_max ?? 253} V: l'inverter potrebbe fermarsi, gli elettrodomestici ne risentono.` });
  }

  
  const tablet = s(a.tablet?.entity);
  if (tablet?.state === 'off' && now - new Date(tablet.last_changed ?? 0) >= (a.tablet.after_min ?? 2) * 60_000) {
    out.push({ key: 'tablet', level: 'high', icon: 'mdi:power-plug-off', text: 'Tablet scollegato', detail: `Senza alimentazione dalle ${fmtTime(new Date(tablet.last_changed ?? 0))}: lo schermo a muro si spegne.` });
  }

  
  
  
  
  const wx = a.weather_stale;
  if (wx?.entities?.length && !offlineSince) {
    const seen = wx.entities.map((id) => s(id)).filter(Boolean).map((st) => new Date(st.last_updated ?? st.last_changed ?? 0).getTime());
    if (seen.length) {
      const age = now - Math.max(...seen);
      if (age >= (wx.after_min ?? 20) * 60_000) {
        const since = new Date(now - age);
        out.push({
          key: 'meteo:fermo', level: age >= (wx.high_after_min ?? 60) * 60_000 ? 'high' : 'medium', icon: 'mdi:weather-windy-variant', open: '#meteo',
          text: `Dati del vento fermi da ${fmtSpan(age)}`,
          detail: `La stazione esterna non aggiorna dalle ${fmtTime(since)}: vento, luce e temperatura sono vecchi e le tende da sole non seguono il vento vero.`,
        });
      }
    }
  }

  
  const winAfter = (a.window_open_min ?? 10) * 60_000;
  const MODE = { heat: 'riscaldamento', cool: 'raffrescamento', heat_cool: 'clima', auto: 'clima', dry: 'deumidificazione' };
  for (const z of model.zones) {
    const mode = MODE[s(z.climate)?.state];
    if (!mode) continue;
    const open = z.windows.filter((id) => s(id)?.state === 'on' && now - new Date(s(id).last_changed ?? 0) >= winAfter);
    if (!open.length) continue;
    const since = Math.min(...open.map((id) => new Date(s(id).last_changed ?? 0).getTime()));
    const names = open.map((id) => model.shortName(id).replace(/^Allarme\s+/i, '')).join(', ');
    out.push({ key: `finestra:${z.id ?? z.area}`, level: 'medium', icon: 'mdi:window-open-variant', text: `${z.name}: finestra aperta da ${fmtSpan(now - since)}`, detail: `${names} con il ${mode} acceso.` });
  }

  
  if (isNight(now, a.night)) {
    for (const { id } of model.access.filter((x) => x.id.startsWith('lock.'))) {
      if (['unlocked', 'open'].includes(s(id)?.state)) {
        out.push({ key: `lock:${id}`, level: 'high', icon: 'mdi:lock-open-variant-outline', text: `Porta ${model.name(id)} sbloccata`, detail: 'È notte e la porta non è bloccata.' });
      }
    }
    for (const { id } of model.access.filter((x) => x.id.startsWith('cover.'))) {
      if (['open', 'opening', 'closing'].includes(s(id)?.state)) {
        out.push({ key: `cover:${id}`, level: 'high', icon: 'mdi:garage-open', text: `Serranda ${model.name(id)} aperta`, detail: 'È notte e la serranda non è chiusa.' });
      }
    }
  }

  
  const openAfter = (a.gate_open_min ?? 15) * 60_000;
  for (const { id, sensor } of model.seenGates ?? []) {
    const seen = gateSeen(store, sensor, now.getTime());
    if (seen.state === 'aperto' && seen.since && now - seen.since >= openAfter) {
      out.push({ key: `gate:${id}`, level: isNight(now, a.night) ? 'high' : 'medium', icon: 'mdi:gate-open', text: `Cancello ${model.name(id).toLowerCase()} aperto da ${fmtSpan(now - seen.since)}`, detail: `Visto aperto dalla telecamera alle ${fmtTime(new Date(seen.since))}.` });
    }
  }

  
  const limit = a.battery_below ?? 10;
  for (const id of model.batteries) {
    const st = s(id);
    const v = Number(st?.state);
    if (!isUnavailable(st) && Number.isFinite(v) && v < limit) {
      
      const who = model.name(id).replace(/\s*\b(livello batteria|battery level|batteria|battery)\b\s*/gi, ' ').trim();
      const dev = who ? who.charAt(0).toUpperCase() + who.slice(1) : model.name(id);
      out.push({ key: `bat:${id}`, level: 'medium', icon: 'mdi:battery-alert-variant-outline', text: `${dev}: ${Math.round(v)}%`, detail: 'Batteria quasi scarica, da sostituire o ricaricare.' });
    }
  }

  
  for (const b of model.batteryVoltages ?? []) {
    const st = s(b.entity);
    const v = Number(st?.state);
    if (b.alert_below && !isUnavailable(st) && Number.isFinite(v) && v < b.alert_below) {
      out.push({ key: `bat:${b.entity}`, level: 'medium', icon: 'mdi:battery-alert-variant-outline', text: `${b.name}: ${fmtNumber(v, 2)} V`, detail: 'Batteria quasi scarica, da sostituire.' });
    }
  }

  
  const filter = s(model.vmc?.filter_days);
  const days = Number(filter?.state);
  if (!isUnavailable(filter) && Number.isFinite(days) && days <= (a.filter_days_below ?? 7)) {
    out.push({ key: 'filtro', level: 'medium', icon: 'mdi:air-filter', text: days <= 0 ? 'Filtro VMC da cambiare' : `Filtro VMC tra ${Math.round(days)} giorni`, detail: 'Sostituisci i filtri della ventilazione.' });
  }

  
  
  
  {
    const health = vmcHealth(store, model, now);
    const filterShown = out.some((x) => x.key === 'filtro');
    for (const e of health.errors) {
      if (e.state || (FILTER_ERRORS.has(e.code) && filterShown)) continue;
      out.push({ key: `vmc:errore:${e.code ?? e.text}`, level: e.level, icon: 'mdi:fan-alert', open: '#vmc', text: `VMC: ${e.text}`, detail: e.code ? `Errore ${e.code} segnalato dall'unità: tocca per aprire la VMC.` : 'Segnalato dall\'unità: tocca per aprire la VMC.' });
    }
    
    if (health.fault && !health.errors.length) {
      out.push({ key: 'vmc:errore', level: 'medium', icon: 'mdi:fan-alert', open: '#vmc', text: 'VMC: l\'unità segnala un errore', detail: 'Il codice non è leggibile: guarda il display dell\'unità.' });
    }
    for (const p of health.problems) out.push({ ...p, icon: 'mdi:fan-alert', open: '#vmc' });
  }

  
  
  
  const dryAfter = (a.plants_after_min ?? 30) * 60_000;
  const dry = model.plants.filter((p) => plantLevel(store, p.metrics?.moisture) === 'low' && now - new Date(s(p.metrics.moisture.sensor)?.last_changed ?? 0) >= dryAfter);
  if (dry.length) {
    out.push({ key: 'piante', level: 'medium', icon: 'mdi:watering-can-outline', text: dry.length === 1 ? `${model.name(dry[0].id)} da innaffiare` : `${dry.length} piante da innaffiare`, detail: dry.map((p) => model.name(p.id)).join(', ') });
  }

  
  
  const missed = s(a.missed_call?.entity);
  if (missed?.state === 'on') {
    const since = new Date(missed.last_changed ?? 0);
    if (now - since < (a.missed_call.hours ?? 12) * 3_600_000) {
      const today = since.toDateString() === now.toDateString();
      const day = since.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
      out.push({ key: 'citofono', level: 'medium', icon: 'mdi:doorbell-video', open: '#avvisi/citofono', seen: a.missed_call.entity, text: 'Chiamata al citofono persa', detail: `${today ? 'Oggi' : day} alle ${fmtTime(since)}: nessuno ha risposto.` });
    }
  }

  
  const dnd = s(model.intercom?.do_not_disturb);
  if (dnd?.state === 'on') {
    const since = new Date(dnd.last_changed ?? 0);
    const today = since.toDateString() === now.toDateString();
    const day = since.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    out.push({ key: 'non_disturbare', level: 'medium', icon: 'mdi:bell-off', open: '#citofono', text: 'Citofono in non disturbare', detail: `Attivo da ${today ? 'oggi' : day} alle ${fmtTime(since)}: tocca per aprire il citofono e disattivarlo.` });
  }

  const rank = { high: 0, medium: 1 };
  out.sort((x, y) => rank[x.level] - rank[y.level]);
  if (offlineSince) {
    out.unshift({ key: 'connessione', level: 'high', icon: 'mdi:server-off', text: 'Disconnesso da Home Assistant', detail: `Dati fermi alle ${fmtTime(offlineSince)}: i comandi non partono finché non torna il collegamento.` });
  }
  return out;
}
