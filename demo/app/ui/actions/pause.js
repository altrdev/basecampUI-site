// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { autoAirState } from '../climate-auto-air.js';
import { coverAutoItem } from '../cover-automations.js';
import { pauseTarget, scheduleState, toHaDatetime } from '../../core/schedules.js';

function pauseFeature(sheet, kind) {
  const { services } = sheet.ctx;
  if (kind === 'schedule') {
    return {
      cfg: sheet.model.robot?.schedules, key: '_schedule', dateField: '#schedule-date',
      state: (cfg) => scheduleState(sheet.store, cfg),
      toggle: (cfg, state) => services.setAutomation(cfg.automation, !state.on),
      target: (action, cfg, state, dateValue) => pauseTarget(action, cfg, state, new Date(), dateValue),
    };
  }
  if (kind === 'coverAuto') {
    return {
      cfg: coverAutoItem(sheet.model, sheet._coverAuto?.id), key: '_coverAuto', dateField: '#cover-auto-date',
      state: () => null,
      target: (action, cfg, state, dateValue) => pauseTarget(action, null, null, new Date(), dateValue),
    };
  }
  return {
    cfg: sheet.model.climate?.auto_air, key: '_autoAir', dateField: '#auto-air-date',
    state: (cfg) => autoAirState(sheet.store, cfg),
    toggle: (cfg, state) => (state.on ? services.turnOff(cfg.switch) : services.turnOn(cfg.switch)),
    target: (action, cfg, state, dateValue) => pauseTarget(action, null, null, new Date(), dateValue),
  };
}

 
export function pauseAction(sheet, kind, action) {
  const feature = pauseFeature(sheet, kind);
  const { cfg, key } = feature;
  if (!cfg) return;
  if (action === 'pick') {
    sheet[key] = { ...sheet[key], picking: !sheet[key]?.picking };
    return sheet.update();
  }
  const state = feature.state(cfg);
  if (action === 'toggle') return feature.toggle(cfg, state).catch(() => {});
  const when = feature.target(action, cfg, state, sheet.shadowRoot.querySelector(feature.dateField)?.value);
  if (!when) return;
  if (action === 'date') sheet[key] = { ...sheet[key], picking: false };
  sheet.ctx.services.setDatetime(cfg.pause, toHaDatetime(when)).catch(() => {});
  sheet.update();
}
