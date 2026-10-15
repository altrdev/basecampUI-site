// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0

import { isUnavailable } from './format.js';

 
export function upsState(raw) {
  const flags = String(raw ?? '').toUpperCase().split(/\s+/);
  if (flags.includes('LB')) return { label: 'Batteria quasi scarica', detail: 'Alimentato dalla batteria, sta per spegnersi', tone: 'bad', icon: 'mdi:battery-alert-variant-outline' };
  if (flags.includes('OB')) return { label: 'A batteria', detail: 'Manca la corrente: alimentato dalla batteria', tone: 'bad', icon: 'mdi:battery-arrow-down-outline' };
  if (flags.includes('RB')) return { label: 'Batteria da sostituire', detail: 'La batteria è esaurita', tone: 'warn', icon: 'mdi:battery-heart-variant' };
  if (flags.includes('OVER')) return { label: 'Sovraccarico', detail: 'Troppo carico collegato', tone: 'bad', icon: 'mdi:flash-alert-outline' };
  if (flags.includes('OL')) return { label: flags.includes('CHRG') ? 'Online · in carica' : 'Online', detail: flags.includes('CHRG') ? 'Alimentato dalla rete, batteria in carica' : 'Alimentato dalla rete', tone: '', icon: 'mdi:power-plug-battery-outline' };
  return { label: 'Stato sconosciuto', detail: 'Lo stato dell\'UPS non è leggibile', tone: 'warn', icon: 'mdi:power-plug-battery-outline' };
}

 
export function backupAgeHours(store, model, now = Date.now()) {
  const st = model.rack?.backup?.last ? store.get(model.rack.backup.last) : null;
  const v = isUnavailable(st) ? null : st.state;
  const t = v ? new Date(v).getTime() : NaN;
  return Number.isFinite(t) ? (now - t) / 3_600_000 : null;
}

const OMADA_BAD = { disconnected: 'Non connesso', heartbeat_missed: 'Non risponde', isolated: 'Isolato', adopt_failed: 'Adozione fallita' };
export const omadaState = (state) => (state in OMADA_BAD ? { label: OMADA_BAD[state], bad: true } : { label: state === 'pending' ? 'In attesa' : null, bad: false });
