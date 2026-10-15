// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { heatingState } from '../climate-heating.js';

export function heatingAction(sheet, action) {
  const cfg = sheet.model.climate?.heating;
  if (!cfg) return;
  const services = sheet.ctx.services;
  if (action === 'toggle') {
    const on = heatingState(sheet.store, cfg).on;
    return (on ? services.turnOff(cfg.switch) : services.turnOn(cfg.switch)).catch(() => {});
  }
  if (action === 'save') {
    const ini = sheet.shadowRoot.querySelector('#heating-start')?.value;
    const end = sheet.shadowRoot.querySelector('#heating-end')?.value;
    if (!/^\d{2}:\d{2}$/.test(ini ?? '') || !/^\d{2}:\d{2}$/.test(end ?? '')) return;
    const cur = heatingState(sheet.store, cfg);
    const jobs = [];
    if (ini !== cur.start) jobs.push(services.setTime(cfg.start, `${ini}:00`));
    if (end !== cur.end) jobs.push(services.setTime(cfg.end, `${end}:00`));
    Promise.all(jobs).catch(() => {});
    sheet.update();
  }
}

export async function setOperatingMode(sheet, id) {
  const climate = sheet.model.climate;
  const mode = climate?.operating_mode?.find((f) => f.id === id);
  sheet._pick = null;
  sheet.update();
  if (!mode || !climate.heat_pump?.mode) return;
  try {
    await sheet.ctx.services.selectOption(climate.heat_pump.mode, mode.heat_pump);
    await sheet.ctx.services.selectOption(climate.season, mode.airzone);
  } catch {
    
  }
}
