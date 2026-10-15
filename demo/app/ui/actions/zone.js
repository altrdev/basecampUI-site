// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const TEMP_DEBOUNCE_MS = 900;

export function bumpTemperature(sheet, entity, delta) {
  const a = sheet.store.get(entity)?.attributes ?? {};
  const step = a.target_temp_step ?? 0.5;
  const base = sheet._targets[entity] ?? a.temperature;
  const next = Math.round(Math.min(a.max_temp ?? 35, Math.max(a.min_temp ?? 5, base + delta)) / step) * step;
  sheet._targets[entity] = next;
  sheet.update();
  clearTimeout(sheet._tempTimers[entity]);
  sheet._tempTimers[entity] = setTimeout(() => {
    const drop = () => {
      delete sheet._targets[entity];
      sheet.update();
    };
    sheet.ctx.services.setTemperature(entity, next).catch(drop);
    
    setTimeout(() => sheet._targets[entity] === next && drop(), 6000);
  }, TEMP_DEBOUNCE_MS);
}

 
export function applyPreset(sheet, button) {
  for (const pair of button.dataset.preset.split(',')) {
    const [id, pos] = pair.split(':');
    sheet.onSliderCommit(id, 'cover-position', Number(pos));
    sheet.ctx.services.setCoverPosition(id, Number(pos)).catch(() => {});
  }
  
  return sheet.update();
}

 
export function moveCovers(sheet, button) {
  const ids = button.dataset.cover ? [button.dataset.cover] : button.dataset.covers.split(',');
  for (const id of ids) sheet.ctx.services.cover(id, button.dataset.action).catch(() => {});
}

export function runLightAction(sheet, lightId, index) {
  const action = sheet.model.lightActions(lightId)[index];
  const services = sheet.ctx.services;
  if (!action) return;
  if (action.switch) return services.toggle(action.switch).catch(() => {});
  if (action.turn_off_first && sheet.store.get(action.turn_off_first)?.state === 'on') {
    return services.toggle(action.turn_off_first).catch(() => {});
  }
  const data = {};
  if (action.kelvin) data.color_temp_kelvin = action.kelvin;
  if (action.brightness) data.brightness_pct = action.brightness;
  return services.turnOn(lightId, data).catch(() => {});
}

 
export function pickLightColor(sheet, swatch) {
  const { lightColor, kelvin, rgb, stop } = swatch.dataset;
  const data = kelvin ? { color_temp_kelvin: Number(kelvin) } : { rgb_color: rgb.split(',').map(Number) };
  const turnOn = () => sheet.ctx.services.turnOn(lightColor, data).catch(() => {});
  
  if (stop && sheet.store.get(stop)?.state === 'on') {
    return sheet.ctx.services.toggle(stop).then(() => setTimeout(turnOn, 1500), () => {});
  }
  return turnOn();
}

 
export function turnOffAll(sheet, button) {
  for (const id of button.dataset.offAll.split(',')) sheet.ctx.services.turnOff(id).catch(() => {});
}
