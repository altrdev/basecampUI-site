// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const DOMAINS = ['sensor', 'binary_sensor', 'climate', 'light', 'switch', 'cover', 'lock', 'input_boolean', 'person', 'alarm_control_panel'];
export const plain = (text) => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

 
export function buildHistoryList(registry, name, hasState) {
  const areaName = new Map(registry.areas.map((a) => [a.area_id, a.name]));
  const rows = registry.entities
    .filter((e) => !e.disabled_by && e.hidden_by !== 'user' && DOMAINS.includes(e.domain) && hasState(e.entity_id))
    .map((e) => {
      const label = name(e.entity_id);
      const area = e.area_id ?? null;
      return { id: e.entity_id, name: label, area, areaName: areaName.get(area) ?? '', hay: plain(`${label} ${e.entity_id} ${areaName.get(area) ?? ''}`) };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'it'));
  const areas = registry.areas.filter((a) => rows.some((r) => r.area === a.area_id)).map((a) => ({ id: a.area_id, name: a.name })).sort((a, b) => a.name.localeCompare(b.name, 'it'));
  return { rows, areas };
}

