// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const REGISTRY_EVENTS = [
  'area_registry_updated',
  'device_registry_updated',
  'entity_registry_updated',
  'label_registry_updated',
];

export async function loadRegistry(connection, detailed = []) {
  const call = (type) => connection.sendMessagePromise({ type });
  const [areas, devices, entities, labels, details] = await Promise.all([
    call('config/area_registry/list'),
    call('config/device_registry/list'),
    call('config/entity_registry/list'),
    call('config/label_registry/list'),
    
    Promise.resolve(detailed).then((ids) =>
      Promise.all(ids.map((id) => connection.sendMessagePromise({ type: 'config/entity_registry/get', entity_id: id }).catch(() => null))),
    ),
  ]);
  const options = Object.fromEntries(details.filter(Boolean).map((d) => [d.entity_id, d.options ?? {}]));
  const deviceById = new Map(devices.map((d) => [d.id, d]));
  return {
    areas,
    devices,
    labels,
    options,
    entities: entities.map((e) => ({
      ...e,
      domain: e.entity_id.split('.')[0],
      
      area_id: e.area_id ?? deviceById.get(e.device_id)?.area_id ?? null,
      labels: e.labels ?? [],
    })),
  };
}

const CACHE_KEY = 'basecamp:registro:v2';
const ENTITY_FIELDS = ['entity_id', 'domain', 'device_id', 'area_id', 'labels', 'disabled_by', 'hidden_by', 'entity_category', 'platform', 'name', 'original_name', 'has_entity_name', 'icon'];
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

 
export function compactRegistry(registry) {
  return {
    areas: registry.areas.map((a) => pick(a, ['area_id', 'name', 'icon', 'floor_id'])),
    
    devices: registry.devices.map((d) => ({ ...pick(d, ['id', 'area_id', 'name', 'name_by_user', 'model']), ...((d.identifiers ?? []).some((i) => i[0] === 'proxmoxve') ? { identifiers: d.identifiers.filter((i) => i[0] === 'proxmoxve') } : {}) })),
    labels: registry.labels.map((l) => pick(l, ['label_id', 'name'])),
    options: registry.options,
    
    entities: registry.entities.filter((e) => !e.disabled_by).map((e) => pick(e, ENTITY_FIELDS)),
  };
}

export function readCachedRegistry() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

 
export function saveRegistry(registry) {
  const json = JSON.stringify(compactRegistry(registry));
  try {
    if (localStorage.getItem(CACHE_KEY) === json) return false;
    localStorage.setItem(CACHE_KEY, json);
  } catch {}
  return true;
}

 
export function watchRegistry(connection, callback, delay = 1000) {
  let timer;
  const trigger = () => {
    clearTimeout(timer);
    timer = setTimeout(callback, delay);
  };
  const unsubs = REGISTRY_EVENTS.map((type) => connection.subscribeEvents(trigger, type));
  return async () => {
    clearTimeout(timer);
    for (const unsub of await Promise.all(unsubs)) unsub();
  };
}
