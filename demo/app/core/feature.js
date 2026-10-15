// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


export function featureConfig(store, cfg, roles, climate = null) {
  if (!cfg || !roles.every((role) => store.get(cfg[role]))) return null;
  if (climate && cfg.only_if_pump && store.get(climate.heat_pump?.mode)?.state !== cfg.only_if_pump) return null;
  return cfg;
}

 
export function switchState(store, id) {
  const st = store.get(id);
  const available = Boolean(st) && st.state !== 'unavailable';
  return { available, on: available && st.state === 'on' };
}
