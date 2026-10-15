// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { cap, dayLabel, esc, longDay } from '../core/format.js';
import { featureConfig, switchState } from '../core/feature.js';
import { pausedUntil } from '../core/schedules.js';
import { featureDialog, featureSection, infoCard, minDateAhead, noteSection, openerRow, pauseActions, stateSection, suspendSection } from './feature-dialog.js';

 
export function autoAirState(store, cfg, now = new Date()) {
  return { ...switchState(store, cfg.switch), until: pausedUntil(store, cfg.pause, now) };
}

export const autoAirWatchedIds = (climate) => [climate?.auto_air?.switch, climate?.auto_air?.pause, climate?.heat_pump?.mode].filter(Boolean);

const cfgOf = (climate, store) => featureConfig(store, climate?.auto_air, ['switch', 'pause'], climate);

 
export function autoAirSection({ store, climate, now = new Date() }) {
  const cfg = cfgOf(climate, store);
  if (!cfg) return '';
  const state = autoAirState(store, cfg, now);
  let cls = '';
  let text;
  if (!state.available) text = 'Non disponibile';
  else if (!state.on) [cls, text] = ['off', 'Spenta'];
  else if (state.until) [cls, text] = ['paused', `In pausa · riprende ${dayLabel(state.until, now)}`];
  else text = 'Attiva';
  const button = openerRow({ attr: 'data-auto-air-open', cls, label: 'Aria automatica', text, glyph: 'mdi:air-conditioner' });
  return featureSection('Aria automatica', button, 'Accende e propone di spegnere il raffrescamento in base al solare.');
}

 
export function renderAutoAirDialog(ui, { store, climate, services, now = new Date() }) {
  const cfg = ui ? cfgOf(climate, store) : null;
  if (!cfg) return '';
  const state = autoAirState(store, cfg, now);
  const can = state.available && services.canControl(cfg.switch) && services.canControl(cfg.pause);

  let next;
  if (!state.available) next = infoCard('off', 'Non disponibile', 'Interruttore non raggiungibile');
  else if (!state.on) next = infoCard('off', 'Spenta', 'Non accende e non propone', 'Riaccendila con l\'interruttore in alto.');
  else if (state.until) {
    
    const label = dayLabel(state.until, now);
    next = infoCard('pause', 'In pausa', `Riprende ${esc(label)}`, label === longDay(state.until) ? '' : esc(cap(longDay(state.until))));
  } else next = infoCard('', 'Attiva', 'Può accendere l\'aria', 'Se c\'è abbastanza solare, in casa fa caldo e le finestre sono chiuse.');

  const acts = pauseActions({
    attr: 'data-auto-air', until: state.until, can, enabled: Boolean(can && state.on), picking: ui.picking,
    quick: { action: 'tomorrow', label: 'Fino a domani' }, dateId: 'auto-air-date', dateLabel: 'Riprende il', minDate: minDateAhead(now, 2),
  });
  return featureDialog({
    closeAttr: 'data-auto-air-close', label: 'Aria automatica', title: 'Aria automatica',
    subtitle: 'Raffrescamento acceso dal solare, se la pompa di calore è in raffreddamento.',
    body: stateSection({ attr: 'data-auto-air', can, on: state.on, onLabel: 'Attiva', offLabel: 'Spenta', card: next })
      + suspendSection(acts)
      + noteSection('Vale per le automazioni di Home Assistant «Aria condizionata accesa automaticamente» e «Proposta spegnimento aria». Lo spegnimento durante la produzione di acqua calda e il consiglio sulle finestre non vengono sospesi.'),
  });
}
