// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const NOW = () => Date.now();
const iso = (ms) => new Date(ms).toISOString();

const AREAS = [
  ['living', 'Zona giorno'], ['bath', 'Bagno'], ['master', 'Camera'],
  ['kids', 'Cameretta'], ['office', 'Studio'], ['laundry', 'Lavanderia'],
].map(([area_id, name]) => ({ area_id, name, icon: null, floor_id: null, labels: [], aliases: [], picture: null }));

const devices = [];
const entities = [];
const states = {};

function device(id, name, area_id = null, extra = {}) {
  devices.push({ id, name, name_by_user: null, area_id, model: null, manufacturer: null, identifiers: [], ...extra });
}
function entity(entity_id, { device_id = null, area_id = null, labels = [], name = null, icon = null, entity_category = null, platform = 'demo', state = 'unknown', attrs = {} } = {}) {
  entities.push({ entity_id, device_id, area_id, labels, name, original_name: name, has_entity_name: false, icon, entity_category, platform, disabled_by: null, hidden_by: null });
  states[entity_id] = { entity_id, state: String(state), attributes: { friendly_name: name ?? entity_id, ...attrs } };
}

const ZONES = {
  living:  { temp: 22.4, hum: 47, target: 22, action: 'heating', lights: [['Lampadario', 'on', 180], ['Divano', 'on', 110], ['Cucina', 'off']], covers: [['Soggiorno', 60]], window: false, air: true },
  bath:    { temp: 23.1, hum: 58, target: 23, action: 'idle', lights: [['Specchio', 'off']], covers: [], window: false },
  master:  { temp: 20.8, hum: 49, target: 20, action: 'idle', lights: [['Comodini', 'off'], ['Soffitto', 'off']], covers: [['Camera', 100]], window: true },
  kids:    { temp: 21.2, hum: 51, target: 21, action: 'idle', lights: [['Lampada', 'off']], covers: [['Cameretta', 100]], window: false },
  office:  { temp: 22.0, hum: 44, target: 22, action: 'heating', lights: [['Scrivania', 'on', 220], ['Soffitto', 'off']], covers: [['Studio', 40]], window: false },
  laundry: { temp: 21.6, hum: 55, target: 20, action: 'off', lights: [['Soffitto', 'off']], covers: [], window: false },
};
for (const [area, z] of Object.entries(ZONES)) {
  const dev = `dev_${area}`;
  device(dev, `Termostato ${area}`, area);
  entity(`climate.${area}`, {
    device_id: dev, area_id: area, state: z.action === 'off' ? 'off' : 'heat',
    attrs: { current_temperature: z.temp, current_humidity: z.hum, temperature: z.target, hvac_action: z.action, hvac_modes: ['off', 'heat', 'cool', 'fan_only'], min_temp: 15, max_temp: 28, target_temp_step: 0.5, supported_features: 1 },
  });
  entity(`switch.${area}_zone`, { device_id: dev, area_id: area, state: z.action === 'off' ? 'off' : 'on', name: 'Zona' });
  entity(`sensor.${area}_temperature`, { device_id: dev, area_id: area, state: z.temp, attrs: { device_class: 'temperature', unit_of_measurement: '°C', state_class: 'measurement' } });
  z.lights.forEach(([label, st, bright], i) => entity(`light.${area}_light_${i + 1}`, {
    area_id: area, state: st, name: label,
    attrs: { supported_color_modes: ['brightness'], color_mode: st === 'on' ? 'brightness' : null, brightness: st === 'on' ? bright : null },
  }));
  z.covers.forEach(([label, pos], i) => entity(`cover.${area}_shutter${i ? `_${i + 1}` : ''}`, {
    area_id: area, name: label, state: pos > 0 ? 'open' : 'closed',
    attrs: { device_class: 'shutter', current_position: pos, supported_features: 15 },
  }));
  if (z.window !== undefined) entity(`binary_sensor.${area}_window`, { area_id: area, state: z.window ? 'on' : 'off', name: 'Finestra', attrs: { device_class: 'window' } });
  if (z.air) {
    entity('sensor.living_pm25', { area_id: area, state: 6, name: 'PM2.5', attrs: { device_class: 'pm25', unit_of_measurement: 'µg/m³', state_class: 'measurement' } });
    entity('sensor.living_voc_index', { area_id: area, state: 74, name: 'Indice VOC', attrs: { device_class: 'aqi', state_class: 'measurement' } });
  }
}

entities.find((e) => e.entity_id === 'cover.living_shutter').labels = [];

entity('light.garden', { labels: ['dash_rapidi'], state: 'off', name: 'Giardino', attrs: { supported_color_modes: ['onoff'] } });
entity('light.stairs', { labels: ['dash_rapidi'], state: 'on', name: 'Scala', attrs: { supported_color_modes: ['onoff'] } });
entity('script.good_morning', { labels: ['dash_rapidi'], state: 'off', name: 'Buongiorno' });
entity('script.good_night', { labels: ['dash_rapidi'], state: 'off', name: 'Buonanotte' });
entity('sensor.washer_state', { labels: ['dash_attivita'], state: 'spinning', name: 'Lavatrice' });
entity('sensor.washer_remaining', { state: iso(NOW() + 24 * 60_000), name: 'Lavatrice tempo rimanente', attrs: { device_class: 'timestamp' } });

entity('alarm_control_panel.home', { state: 'disarmed', name: 'Allarme', attrs: { code_arm_required: false, code_format: 'number', supported_features: 63 } });
device('dev_lock_front', 'Serratura casa');
entity('lock.front_door', { device_id: 'dev_lock_front', state: 'locked', name: 'Casa' });
entity('sensor.front_lock_battery', { device_id: 'dev_lock_front', state: 86, attrs: { device_class: 'battery', unit_of_measurement: '%' } });
device('dev_lock_studio', 'Serratura studio');
entity('lock.studio_door', { device_id: 'dev_lock_studio', state: 'locked', name: 'Studio' });
entity('sensor.studio_lock_battery', { device_id: 'dev_lock_studio', state: 72, attrs: { device_class: 'battery', unit_of_measurement: '%' } });
entity('cover.garage_door', { state: 'closed', name: 'Garage', attrs: { device_class: 'garage', supported_features: 3 } });
entity('button.gate_pedestrian', { state: iso(NOW() - 5 * 3600_000), name: 'Pedonale' });
entity('button.gate_car', { state: iso(NOW() - 2 * 3600_000), name: 'Carraio' });
for (const [id, name, st] of [['door_front', 'Porta ingresso', 'off'], ['window_living', 'Soggiorno', 'off'], ['window_kitchen', 'Cucina', 'off'], ['window_bedroom', 'Camera', 'off']]) {
  entity(`binary_sensor.${id}`, { state: st, name, attrs: { device_class: id.startsWith('door') ? 'door' : 'window' } });
}
entity('person.anna', { state: 'home', name: 'Anna' });
entity('person.marco', { state: 'home', name: 'Marco' });
entity('sensor.anna_phone_battery', { state: 78, attrs: { device_class: 'battery', unit_of_measurement: '%' } });
entity('sensor.marco_phone_battery', { state: 54, attrs: { device_class: 'battery', unit_of_measurement: '%' } });

const num = (id, state, unit, extra = {}) => entity(`sensor.${id}`, { state, name: id, attrs: { unit_of_measurement: unit, state_class: 'measurement', ...extra } });
entity('weather.home', {
  state: 'partlycloudy', name: 'Casa',
  attrs: { temperature: 17.8, humidity: 61, pressure: 1016, wind_speed: 9, wind_bearing: 220, temperature_unit: '°C', supported_features: 3 },
});
entity('sun.sun', { state: 'above_horizon', name: 'Sole', attrs: { elevation: 34, azimuth: 168 } });
num('outdoor_temperature', 17.8, '°C', { device_class: 'temperature' });
num('outdoor_feels_like', 17.1, '°C', { device_class: 'temperature' });
num('outdoor_temperature_min', 9.6, '°C', { device_class: 'temperature' });
num('outdoor_temperature_max', 19.2, '°C', { device_class: 'temperature' });
num('outdoor_humidity', 61, '%', { device_class: 'humidity' });
num('wind_speed', 9, 'km/h');
num('wind_gust', 15, 'km/h');
num('wind_gust_max', 22, 'km/h');
num('wind_direction', 220, '°');
num('rain_today', 0, 'mm');
num('rain_rate', 0, 'mm/h');
num('uv_index', 3, 'UV index');
num('dew_point', 10.2, '°C', { device_class: 'temperature' });
num('pressure', 1016, 'hPa', { device_class: 'pressure' });
num('solar_radiation', 410, 'W/m²');
num('solar_lux', 38200, 'lx');

num('solar_power', 3480, 'W', { device_class: 'power' });
num('home_power', 1230, 'W', { device_class: 'power' });
num('grid_power', 2250, 'W', { device_class: 'power' });
num('solar_yield_today', 14.2, 'kWh', { device_class: 'energy', state_class: 'total_increasing' });
num('grid_import_today', 1.9, 'kWh', { device_class: 'energy', state_class: 'total_increasing' });
num('grid_export_today', 7.8, 'kWh', { device_class: 'energy', state_class: 'total_increasing' });
num('grid_import_total', 4120, 'kWh', { device_class: 'energy', state_class: 'total_increasing' });
num('grid_export_total', 6390, 'kWh', { device_class: 'energy', state_class: 'total_increasing' });
num('solar_yield_total', 11840, 'kWh', { device_class: 'energy', state_class: 'total_increasing' });
num('forecast_today', 21.4, 'kWh', { device_class: 'energy' });
num('forecast_remaining', 7.2, 'kWh', { device_class: 'energy' });
num('forecast_tomorrow', 18.9, 'kWh', { device_class: 'energy' });
num('solar_peak_today', 4210, 'W', { device_class: 'power' });
num('inverter_temperature', 41, '°C', { device_class: 'temperature' });
entity('sensor.inverter_status', { state: 'On-grid', name: 'Stato inverter' });
num('heat_pump_power', 540, 'W', { device_class: 'power' });
num('vmc_power', 38, 'W', { device_class: 'power' });
num('wallbox_power', 0, 'W', { device_class: 'power' });

num('pun_fascia_f1', 0.1385, '€/kWh');
num('pun_fascia_f2', 0.1520, '€/kWh');
num('pun_fascia_f3', 0.1295, '€/kWh');
num('pun_mono_orario', 0.1450, '€/kWh');
entity('sensor.pun_fascia_corrente', { state: 'F1', name: 'Fascia corrente' });

device('dev_vmc', 'Ventilazione', null);
entity('select.vmc_fan_speed', { state: 'Medio', attrs: { options: ['Assente', 'Basso', 'Medio', 'Alto'] } });
entity('switch.vmc_auto', { state: 'on', name: 'Ventilazione automatica' });
entity('select.vmc_balance', { state: 'Bilanciato', attrs: { options: ['Bilanciato', 'Solo mandata', 'Solo estrazione'] } });
entity('select.vmc_profile', { state: 'Normale', attrs: { options: ['Normale', 'Freddo', 'Caldo'] } });
for (const id of ['boost_15', 'boost_30', 'boost_60', 'boost_off', 'bypass_auto', 'bypass_open_1h', 'bypass_open_12h', 'bypass_closed_1h', 'bypass_closed_12h']) entity(`button.vmc_${id}`, { state: 'unknown', name: id });
entity('switch.vmc_power', { state: 'on', name: 'Alimentazione VMC' });
entity('sensor.vmc_mode', { state: 'Auto' });
entity('sensor.vmc_level', { state: 'Medio' });
entity('sensor.vmc_next_change', { state: '2h 14m' });
num('vmc_supply_flow', 118, 'm³/h'); num('vmc_extract_flow', 121, 'm³/h');
num('vmc_t_outdoor', 11.2, '°C', { device_class: 'temperature' }); num('vmc_t_supply', 19.4, '°C', { device_class: 'temperature' });
num('vmc_t_extract', 22.1, '°C', { device_class: 'temperature' }); num('vmc_t_exhaust', 13.8, '°C', { device_class: 'temperature' });
num('vmc_h_outdoor', 68, '%'); num('vmc_h_supply', 44, '%'); num('vmc_h_extract', 48, '%'); num('vmc_h_exhaust', 71, '%');
entity('sensor.vmc_bypass', { state: '0' }); entity('sensor.vmc_bypass_mode', { state: 'auto' });
num('vmc_filter_days', 94, 'd'); num('vmc_rmot', 13.5, '°C'); num('vmc_target_profile', 21, '°C');
entity('sensor.vmc_errors', { state: 'Nessuno' }); entity('sensor.vmc_errors_raw', { state: '00 00 00 00' }); num('vmc_error_reads', 1432, '');
entity('sensor.vmc_clock', { state: iso(NOW()) }); num('vmc_clock_offset', 0, 's');
entity('binary_sensor.vmc_fault', { state: 'off', name: 'Guasto' }); entity('binary_sensor.vmc_filter_change', { state: 'off', name: 'Cambio filtri' });
num('vmc_rpm_supply', 1480, 'rpm'); num('vmc_rpm_extract', 1510, 'rpm'); num('vmc_duty_supply', 44, '%'); num('vmc_duty_extract', 46, '%');

entity('vacuum.robot', { state: 'cleaning', name: 'Robot', attrs: { fan_speed: 'balanced', battery_level: 71, supported_features: 12316 } });
entity('select.robot_mode', { state: 'vac_and_mop', attrs: { options: ['vacuum', 'vac_and_mop', 'mop', 'smart_mode'] } });
entity('select.robot_mop', { state: 'mild', attrs: { options: ['off', 'mild', 'moderate', 'intense'] } });
num('robot_battery', 71, '%', { device_class: 'battery' });
entity('sensor.robot_state', { state: 'cleaning' });
entity('sensor.robot_room', { state: 'Cucina' });
num('robot_progress', 58, '%');
entity('sensor.robot_last_clean', { state: iso(NOW() - 26 * 3600_000), attrs: { device_class: 'timestamp' } });
entity('sensor.robot_last_start', { state: iso(NOW() - 27 * 3600_000), attrs: { device_class: 'timestamp' } });
num('robot_clean_duration', 52, 'min'); num('robot_clean_area', 62, 'm²');
entity('sensor.robot_error', { state: 'none' }); entity('sensor.robot_dock_error', { state: 'ok' });
num('robot_drying', 0, 's');
for (const id of ['dock_empty', 'dock_wash', 'dock_dry']) entity(`switch.robot_${id}`, { state: 'off', name: id });
for (const [id, hours] of [['sensor_left', 14], ['filter_left', 96], ['main_brush_left', 188], ['side_brush_left', 121], ['dock_brush_left', 240], ['dock_strainer_left', 83]]) num(`robot_${id}`, hours, 'h');
for (const id of ['sensor', 'filter', 'main_brush', 'side_brush', 'dock_brush', 'dock_strainer']) entity(`button.robot_reset_${id}`, { state: 'unknown', name: id });
for (const id of ['clean_water', 'dirty_water', 'cleaning_fluid']) entity(`binary_sensor.robot_dock_${id}`, { state: 'off', name: id });
entity('image.robot_map', { state: iso(NOW()), name: 'Mappa', attrs: { entity_picture: 'assets/map.png' } });
entity('automation.robot_schedule', { state: 'on', name: 'Programmazione robot', attrs: { last_triggered: iso(NOW() - 20 * 3600_000) } });
entity('input_datetime.robot_pause', { state: '2000-01-01 00:00:00', name: 'Pausa robot', attrs: { has_date: true, has_time: true } });

entity('sensor.dishwasher_state', { state: 'Run', name: 'Lavastoviglie' });
entity('sensor.dishwasher_end', { state: iso(NOW() + 71 * 60_000), attrs: { device_class: 'timestamp' } });
num('dishwasher_progress', 38, '%');
entity('sensor.dishwasher_program', { state: 'Dishcare.Dishwasher.Program.Eco50' });
entity('binary_sensor.dishwasher_remote', { state: 'on', name: 'Avvio remoto' });
entity('binary_sensor.dishwasher_door', { state: 'off', name: 'Sportello', attrs: { device_class: 'door' } });
entity('switch.dishwasher_power', { state: 'on' }); entity('button.dishwasher_start', { state: 'unknown' }); entity('button.dishwasher_stop', { state: 'unknown' });
entity('select.dishwasher_delay', { state: '0', attrs: { options: ['0', '3600', '7200', '10800'] } });
num('dishwasher_water', 9.5, 'L'); num('dishwasher_energy', 0.87, 'kWh');
for (const id of ['extradry', 'hygiene', 'half', 'speed', 'silence']) entity(`switch.dishwasher_opt_${id}`, { state: id === 'hygiene' ? 'on' : 'off' });
entity('binary_sensor.washer_remote', { state: 'on' }); num('washer_total', 90, 'min'); entity('switch.washer_power', { state: 'on' });
entity('select.washer_operation', { state: 'ready', attrs: { options: ['ready', 'start', 'pause', 'stop'] } });
num('washer_cycles', 214, ''); num('washer_energy_month', 12400, 'Wh');
entity('sensor.dryer_state', { state: 'Ready', name: 'Asciugatrice' });
entity('sensor.dryer_remaining', { state: iso(NOW() - 60_000), attrs: { device_class: 'timestamp' } });
entity('binary_sensor.dryer_remote', { state: 'on' }); num('dryer_total', 120, 'min'); entity('switch.dryer_power', { state: 'on' });
entity('select.dryer_operation', { state: 'ready', attrs: { options: ['ready', 'start', 'pause', 'stop'] } });

entity('camera.intercom', { state: 'idle', name: 'Citofono' });
entity('input_boolean.doorbell_calling', { state: 'off' }); entity('input_boolean.intercom_talking', { state: 'off' });
entity('counter.intercom_repeat', { state: '0' }); entity('input_boolean.do_not_disturb', { state: 'off' });
entity('input_boolean.missed_call', { state: 'off' });
const call = (min, esito, n) => ({ t: iso(NOW() - min * 60_000), foto: `assets/call-${n}.svg`, esito });
entity('pyscript.intercom_calls', { state: iso(NOW()), attrs: { chiamate: [call(42, 'risposta', 1), call(260, 'persa', 2), call(1380, 'risposta', 3)] } });

num('car_battery', 64, '%', { device_class: 'battery' });
num('car_range', 187, 'km', { device_class: 'distance' });
num('car_energy_left', 25.6, 'kWh');
entity('sensor.car_wallbox_status', { state: 'standby' });

const LABELS = ['dash_rapidi', 'dash_attivita', 'dash_nascosta'].map((label_id) => ({ label_id, name: label_id, icon: null, color: null, description: null }));

export const registry = { areas: AREAS, devices, entities, labels: LABELS };
export const initialStates = states;
