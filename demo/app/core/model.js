// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const LABEL_HIDDEN = 'dash_nascosta';
const LABEL_QUICK = 'dash_rapidi';
const LABEL_ACTIVITY = 'dash_attivita';
const WINDOW_CLASSES = ['window', 'door', 'opening'];

const PLANT_METRICS = {
  moisture: 'soil_moisture',
  conductivity: 'conductivity',
  temperature: 'temperature',
  illuminance: 'illuminance',
  humidity: 'air_humidity',
  dli: 'dli',
};

import { buildHistoryList } from './history.js';

 
function buildOmada(registry, platform, deviceName, getState, excluded = []) {
  const mine = registry.entities.filter((e) => e.platform === platform);
  const ofDevice = (deviceId, test) => mine.find((e) => e.device_id === deviceId && test(e.entity_id))?.entity_id ?? null;
  const devices = mine
    .filter((e) => e.domain === 'sensor' && e.entity_id.endsWith('_stato_del_dispositivo'))
    .filter((e) => !excluded.includes(deviceName.get(e.device_id)))
    .map((e) => ({
      name: deviceName.get(e.device_id) ?? e.entity_id,
      state: e.entity_id,
      cpu: ofDevice(e.device_id, (id) => id.endsWith('_utilizzo_cpu')),
      memoria: ofDevice(e.device_id, (id) => id.endsWith('_utilizzo_della_memoria')),
      firmware: ofDevice(e.device_id, (id) => id.startsWith('update.') && id.endsWith('_firmware')),
      poe: mine
        .filter((x) => x.device_id === e.device_id && x.domain === 'sensor' && x.entity_id.endsWith('_poe_power'))
        .map((x) => {
          const n = Number(x.entity_id.match(/port_(\d+)_/)?.[1]);
          const label = getState(x.entity_id)?.attributes.friendly_name?.match(/\(([^)]+)\)/)?.[1] ?? null;
          return { entity: x.entity_id, door: n, name: label };
        })
        .sort((a, b) => a.door - b.door),
    }))
    
    .sort((a, b) => kind(a.name) - kind(b.name) || a.name.localeCompare(b.name, 'it'));
  return { devices: devices };
}
 
function buildProxmox(registry, cfg, deviceName) {
  const deviceById = new Map(registry.devices.map((d) => [d.id, d]));
  const mine = registry.entities.filter((e) => e.platform === (cfg.platform ?? 'proxmoxve') && e.device_id);
  const ids = new Map();
  for (const e of mine) (ids.get(e.device_id) ?? ids.set(e.device_id, []).get(e.device_id)).push(e);
  const pick = (list, domain, suffix) => list.find((e) => e.domain === domain && e.entity_id.endsWith(suffix))?.entity_id ?? null;
  const out = { node: null, guest: [], storage: [] };
  for (const [deviceId, list] of ids) {
    const nome = deviceName.get(deviceId) ?? '';
    if (/^storage \(/i.test(nome)) {
      out.storage.push({ name: nome.replace(/^storage \(|\)$/gi, ''), active: pick(list, 'binary_sensor', '_storage_active'), percent: pick(list, 'sensor', '_storage_usage_percentage'), used: pick(list, 'sensor', '_used_storage'), total: pick(list, 'sensor', '_total_storage') });
      continue;
    }
    const dev = deviceById.get(deviceId);
    const vmid = (dev?.identifiers ?? []).map((i) => String(i[1]).match(/_(?:vm|container)_(\d+)$/)?.[1]).find(Boolean) ?? null;
    const item = { name: nome, type: dev?.model === 'VM' ? 'vm' : 'ct', vmid, state: pick(list, 'sensor', '_status'), cpu: pick(list, 'sensor', '_cpu_usage'), memoria: pick(list, 'sensor', '_memory_usage_percentage'), start: pick(list, 'sensor', '_tempo_di_attivita'), memoria_max: pick(list, 'sensor', '_max_memory_usage') };
    if (nome.toLowerCase() === String(cfg.node ?? 'pve').toLowerCase()) out.node = item;
    else if (item.state) out.guest.push(item);
  }
  
  out.guest.sort((a, b) => (a.type === b.type ? 0 : a.type === 'vm' ? -1 : 1) || Number(a.vmid ?? 1e9) - Number(b.vmid ?? 1e9) || a.name.localeCompare(b.name, 'it'));
  out.storage.sort((a, b) => a.name.localeCompare(b.name, 'it'));
  return out;
}
const kind = (name) => (/^router/i.test(name) ? 0 : /^switch/i.test(name) ? 1 : 2);

export function buildModel(registry, config, getState) {
  const overrides = config.entities ?? {};
  const overrideOrder = Object.keys(overrides);
  const byId = new Map(registry.entities.map((e) => [e.entity_id, e]));
  
  
  const usable = registry.entities.filter(
    (e) => !e.disabled_by && e.hidden_by !== 'user' && !e.entity_category && !e.labels.includes(LABEL_HIDDEN),
  );

  const name = (id) =>
    overrides[id]?.name ?? byId.get(id)?.name ?? getState(id)?.attributes.friendly_name ?? id;
  const deviceName = new Map(registry.devices.map((d) => [d.id, d.name_by_user ?? d.name]));
  
  const shortName = (id) => {
    if (overrides[id]?.name) return overrides[id].name;
    const e = byId.get(id);
    const base = e?.name ?? e?.original_name ?? (e?.has_entity_name ? deviceName.get(e.device_id) : null) ?? name(id);
    const trimmed = base.replace(/^(luce|luci|dimmer|lampadario|tenda|tende|tapparella|tapparelle)\s+/i, '');
    return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : base;
  };
  const deviceClass = (id) => getState(id)?.attributes.device_class;
  const isGroup = (id) => Array.isArray(getState(id)?.attributes.entity_id);
  const rank = (id) => {
    const i = overrideOrder.indexOf(id);
    return i < 0 ? Infinity : i;
  };
  
  const sorted = (ids) => [...ids].sort((a, b) => rank(a) - rank(b) || name(a).localeCompare(name(b), 'it'));
  const withLabel = (label) => sorted(usable.filter((e) => e.labels.includes(label)).map((e) => e.entity_id));
  const sameDevice = (id) => {
    const deviceId = byId.get(id)?.device_id;
    return deviceId ? registry.entities.filter((e) => e.device_id === deviceId && e.entity_id !== id) : [];
  };

  const zones = (config.zones ?? []).map((zone) => {
    const inArea = usable.filter((e) => e.area_id === zone.area);
    const ids = (domain) => inArea.filter((e) => e.domain === domain).map((e) => e.entity_id);
    const climate = ids('climate')[0] ?? null;
    const climateDevice = climate ? byId.get(climate).device_id : null;
    const onClimateDevice = (domain) =>
      inArea.filter((e) => e.domain === domain && climateDevice && e.device_id === climateDevice).map((e) => e.entity_id);
    return {
      ...zone,
      climate,
      zoneSwitch: onClimateDevice('switch')[0] ?? null,
      
      tempSensor: onClimateDevice('sensor').find((id) => deviceClass(id) === 'temperature') ?? null,
      demand: onClimateDevice('binary_sensor').filter((id) => deviceClass(id) === 'running'),
      lightGroups: sorted(ids('light').filter(isGroup)),
      lights: sorted(ids('light').filter((id) => !isGroup(id))),
      coverGroups: sorted(ids('cover').filter(isGroup)),
      covers: sorted(ids('cover').filter((id) => !isGroup(id))),
      windows: sorted(ids('binary_sensor').filter((id) => WINDOW_CLASSES.includes(deviceClass(id)))),
      
      air: (() => {
        const pm25 = ids('sensor').find((id) => deviceClass(id) === 'pm25') ?? null;
        const voc = ids('sensor').find((id) => deviceClass(id) === 'aqi' && /voc/i.test(id)) ?? null;
        return pm25 || voc ? { pm25, voc } : null;
      })(),
    };
  });

  const access = (config.access ?? [])
    .filter((id) => byId.has(id) || getState(id))
    .map((id) => ({
      id,
      battery:
        sameDevice(id).find((e) => e.domain === 'sensor' && deviceClass(e.entity_id) === 'battery')?.entity_id ?? null,
    }));

  return {
    zones,
    quick: withLabel(LABEL_QUICK),
    activities: withLabel(LABEL_ACTIVITY),
    
    activityDetails: (id) => overrides[id]?.details ?? {},
    access,
    
    covers: [...new Set(zones.flatMap((z) => z.covers))],
    alarm: usable.find((e) => e.domain === 'alarm_control_panel')?.entity_id ?? null,
    
    weather: config.weather ?? {},
    energy: config.energy ?? {},
    car: config.car ?? {},
    settings: config.settings ?? [],
    appliances: config.appliances ?? [],
    vmc: config.vmc ?? null,
    climate: config.climate ?? null,
    coverAutomations: config.cover_automations ?? [],
    guestWifi: config.guest_wifi ?? null,
    
    get history() {
      return (this._history ??= buildHistoryList(registry, name, (id) => Boolean(getState(id))));
    },
    music: config.music ?? null,
    security: config.security ?? null,
    alerts: config.alerts ?? null,
    
    seenGates: Object.entries(config.entities ?? {}).filter(([, e]) => e.seen).map(([id, e]) => ({ id, sensor: e.seen })),
    batteryVoltages: config.battery_voltages ?? [],
    lab: config.lab ?? null,
    
    rack: config.rack ? { ...config.rack, proxmox: config.rack.proxmox ? { ...config.rack.proxmox, ...buildProxmox(registry, config.rack.proxmox, deviceName) } : null, network: { ...config.rack.network, ...buildOmada(registry, config.rack.network?.platform ?? 'tplink_omada', deviceName, getState, config.rack.network?.excluded) } } : null,
    
    batteries: (() => {
      const a = config.alerts ?? {};
      const skipPlatforms = a.battery_excluded_integrations ?? [];
      const skip = a.battery_excluded ?? [];
      return sorted(
        
        registry.entities
          .filter((e) => !e.disabled_by && !e.labels.includes(LABEL_HIDDEN))
          .filter((e) => e.domain === 'sensor' && deviceClass(e.entity_id) === 'battery')
          .filter((e) => !skipPlatforms.includes(e.platform) && !skip.includes(e.entity_id))
          .map((e) => e.entity_id),
      );
    })(),
    intercom: config.intercom ?? null,
    
    
    robot: config.robot
      ? {
          ...config.robot,
          rooms: (() => {
            const mapping = registry.options?.[config.robot.vacuum]?.vacuum?.area_mapping ?? {};
            return registry.areas.filter((a) => mapping[a.area_id]?.length).map((a) => ({ id: a.area_id, name: a.name }));
          })(),
        }
      : null,
    
    
    plants: sorted(usable.filter((e) => e.domain === 'plant').map((e) => e.entity_id)).map((id) => {
      const siblings = sameDevice(id).filter((e) => !e.disabled_by);
      const find = (domain, suffix) => siblings.find((e) => e.domain === domain && e.entity_id.endsWith(suffix))?.entity_id ?? null;
      const metrics = Object.fromEntries(
        Object.entries(PLANT_METRICS).map(([kind, key]) => [
          kind,
          { sensor: find('sensor', `_${key}`), min: find('number', `_min_${key}`), max: find('number', `_max_${key}`) },
        ]),
      );
      return { id, moisture: metrics.moisture.sensor, metrics };
    }),
    name,
    shortName,
    
    icon: (id) => overrides[id]?.icon ?? byId.get(id)?.icon ?? null,
    
    
    gateSensor: (id) => overrides[id]?.seen ?? null,
    verb: (id) => overrides[id]?.verb ?? 'aprire',
    
    lightActions: (id) => overrides[id]?.actions ?? [],
    
    offText: (id) => overrides[id]?.if_unavailable ?? null,
    panel: (id) => overrides[id]?.panel ?? null,
    
    color: (id) => overrides[id]?.color ?? null,
  };
}
