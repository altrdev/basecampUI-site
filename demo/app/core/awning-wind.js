// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const num = (store, id) => {
  const v = Number(store.get(id)?.state);
  return store.get(id) && Number.isFinite(v) ? v : null;
};
const minutesSince = (iso, now) => (iso ? (now.getTime() - new Date(iso).getTime()) / 60000 : null);
const fmt = (n) => (Math.round(n * 10) / 10).toString().replace('.', ',');

export function windForecast(store, cfg, now = new Date()) {
  const cover = store.get(cfg.cover);
  const pos = Number(cover?.attributes?.current_position);
  const limit = num(store, cfg.limit);
  if (!cover || ['unavailable', 'unknown'].includes(cover.state) || !Number.isFinite(pos) || limit === null || limit < 0) return null;

  const gust = num(store, cfg.gust_corrected);
  const mean = num(store, cfg.mean_corrected);
  const data = [
    gust !== null ? `raffica corretta ${fmt(gust)} km/h` : null,
    mean !== null ? `vento medio ${fmt(mean)} km/h` : null,
    `limite ${limit}%`,
  ].filter(Boolean).join(' · ');

  const flag = store.get(cfg.flag)?.state === 'on';
  const before = num(store, cfg.before) ?? 0;
  const set = num(store, cfg.set) ?? 0;
  const result = (tone, title, ...lines) => ({ tone, title, lines: lines.filter(Boolean), data });

  if (store.get(cfg.shadow)?.state === 'on') return result('off', 'Modalità ombra', 'Registra cosa farebbe, ma non muove la tenda.');

  
  
  const stale = cfg.stale;
  if (stale?.entities?.length) {
    const seen = stale.entities.map((id) => store.get(id)).filter(Boolean).map((st) => new Date(st.last_updated ?? st.last_changed ?? 0).getTime());
    const age = seen.length ? (now.getTime() - Math.max(...seen)) / 60000 : 0;
    if (age >= stale.after_min) {
      const cap = Math.min(limit, stale.limit);
      const why = `I dati del vento sono fermi da ${Math.floor(age)} min: la v2 usa un limite prudenziale del ${stale.limit}% e non riapre finché non tornano.`;
      if (cover.state === 'open' && pos > cap) return result('act', cap === 0 ? 'Chiuderà la tenda' : `Abbasserà la tenda al ${cap}%`, why);
      return result('wait', pos === 0 ? 'Resta chiusa' : `Resta al ${pos}%`, why);
    }
  }

  
  if (cover.state === 'open' && pos > limit) {
    return result('act', limit === 0 ? 'Chiuderà la tenda' : `Abbasserà la tenda al ${limit}%`, `Ora è al ${pos}%, sopra il limite del vento.`);
  }

  if (flag) {
    
    if (Math.abs(pos - set) > 2) return result('', 'Non la riaprirà', `L'hai mossa tu (${pos}%, il vento l'aveva messa al ${set}%).`);
    const target = Math.min(before, limit);
    if (target <= pos) return result('wait', pos === 0 ? 'Resta chiusa' : `Resta al ${pos}%`, `Il vento tiene il limite al ${limit}%.`);
    
    const r = cfg.reopen;
    const missing = [];
    const stable = minutesSince(store.get(cfg.limit)?.last_changed, now);
    if (stable !== null && stable < r.stable_min) missing.push(`il limite resti fermo ancora ${Math.ceil(r.stable_min - stable)} min`);
    const last = store.get(cfg.last_action)?.attributes?.timestamp;
    const idle = Number.isFinite(Number(last)) ? (now.getTime() / 1000 - Number(last)) / 60 : null;
    if (idle !== null && idle <= r.guard_min) missing.push(`passino ${Math.ceil(r.guard_min - idle)} min dall'ultimo intervento`);
    const raw = num(store, cfg.gust_raw);
    if (raw !== null && raw >= r.gust_below) missing.push(`la raffica scenda sotto ${r.gust_below} km/h (ora ${fmt(raw)})`);
    const rain = num(store, cfg.rain);
    const dry = minutesSince(store.get(cfg.rain)?.last_changed, now);
    if (rain !== null && rain > 0) missing.push('smetta di piovere');
    else if (dry !== null && dry <= r.rain_min) missing.push(`non piova da ${r.rain_min} min`);
    const lux = num(store, cfg.lux);
    if (lux !== null && lux <= r.lux_above) missing.push(`ci sia luce (oltre ${r.lux_above} lx, ora ${Math.round(lux)})`);
    const sun = Number(store.get(cfg.sun)?.attributes?.elevation);
    if (Number.isFinite(sun) && sun <= r.sun_above) missing.push(`il sole superi ${r.sun_above}° (ora ${fmt(sun)}°)`);
    if (!missing.length) return result('act', `La riporterà al ${target}%`, 'Entro 5 minuti, al prossimo controllo.');
    return result('wait', `La riporterà al ${target}% quando`, ...missing.map((m) => `· ${m}`));
  }

  
  if (pos === 0) return result('', 'Nessun intervento previsto', 'La tenda è chiusa.');

  
  const i = cfg.levels.indexOf(limit);
  const g = cfg.gust_steps[i];
  const m = cfg.mean_steps[i];
  const next = i >= 0 && g !== undefined
    ? `Il limite scende al ${cfg.levels[i + 1]}% se la raffica corretta supera ${g} km/h o il vento medio supera ${m} km/h.`
    : '';
  return result('', 'Nessun intervento previsto', `La tenda è aperta al ${pos}%, il limite del vento è ${limit}%.`, next);
}
