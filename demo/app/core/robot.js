// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { isUnavailable } from './format.js';

const THRESHOLD_HOURS = 10;

 
export function maintenanceRows(store, robot, threshold = THRESHOLD_HOURS) {
  return (robot?.maintenance ?? []).flatMap((item) => {
    const st = store.get(item.entity);
    const hours = isUnavailable(st) ? NaN : Number(st.state);
    if (!Number.isFinite(hours)) return [];
    return [{ item, hours, status: hours <= 0 ? 'scaduta' : hours <= threshold ? 'presto' : 'ok' }];
  });
}

const ROBOT_ERRORS = {
  lidar_blocked: 'Sensore laser bloccato', bumper_stuck: 'Paraurti incastrato', wheels_suspended: 'Ruote sollevate',
  cliff_sensor_error: 'Sensore anticaduta in errore', main_brush_jammed: 'Spazzola principale incastrata', side_brush_jammed: 'Spazzola laterale incastrata',
  wheels_jammed: 'Ruote bloccate', robot_trapped: 'Robot intrappolato', no_dustbin: 'Contenitore della polvere mancante', strainer_error: 'Filtro o colino in errore',
  compass_error: 'Errore della bussola', low_battery: 'Batteria scarica', charging_error: 'Errore di ricarica', battery_error: 'Errore della batteria',
  wall_sensor_dirty: 'Sensore di parete sporco', robot_tilted: 'Robot inclinato', side_brush_error: 'Errore della spazzola laterale', fan_error: 'Errore della ventola',
  dock: 'Problema con la base', optical_flow_sensor_dirt: 'Sensore ottico sporco', vertical_bumper_pressed: 'Paraurti premuto', dock_locator_error: 'Base non trovata',
  return_to_dock_fail: 'Non riesce a tornare alla base', nogo_zone_detected: 'Zona vietata rilevata', visual_sensor: 'Sensore visivo in errore',
  light_touch: 'Sensore di contatto in errore', vibrarise_jammed: 'Mocio vibrante incastrato', robot_on_carpet: 'Robot sul tappeto', filter_blocked: 'Filtro intasato',
  invisible_wall_detected: 'Muro virtuale rilevato', cannot_cross_carpet: 'Non riesce a superare il tappeto', internal_error: 'Errore interno',
  collect_dust_error_3: 'Errore di svuotamento della polvere', collect_dust_error_4: 'Errore di svuotamento della polvere',
  mopping_roller_1: 'Rullo del mocio incastrato', mopping_roller_error_2: 'Rullo del mocio incastrato',
  clear_water_box_hoare: 'Serbatoio acqua pulita in errore', dirty_water_box_hoare: 'Serbatoio acqua sporca in errore', sink_strainer_hoare: 'Colino del dock da pulire',
  clear_water_box_exception: 'Serbatoio acqua pulita: problema', clear_brush_exception: 'Spazzola di pulizia del dock in errore', clear_brush_exception_2: 'Spazzola di pulizia del dock in errore',
  filter_screen_exception: 'Filtro del dock in errore', up_water_exception: 'Errore di carico dell\'acqua', drain_water_exception: 'Errore di scarico dell\'acqua',
  temperature_protection: 'Protezione termica: fermo per la temperatura', clean_carousel_exception: 'Rullo di lavaggio del dock in errore',
  clean_carousel_water_full: 'Acqua del rullo di lavaggio piena', water_carriage_drop: 'Serbatoio dell\'acqua caduto', check_clean_carouse: 'Controlla il rullo di lavaggio',
  audio_error: 'Errore audio',
};

const DOCK_ERRORS = {
  no_dustbin_or_filter: 'Contenitore o filtro del dock mancante', auto_empty_dock_fan_error: 'Ventola di svuotamento del dock in errore', duct_blockage: 'Condotto del dock intasato',
  auto_empty_dock_voltage_error: 'Errore di alimentazione dello svuotamento', maintenance_brush_jammed: 'Spazzola di manutenzione del dock incastrata',
  dirty_tank_latch_open: 'Gancio del serbatoio sporco aperto', no_dustbin: 'Contenitore del dock mancante', cleaning_tank_full_or_blocked: 'Serbatoio di pulizia pieno o intasato',
};
const DOCK_ERRORS_SKIPPED = new Set(['water_empty', 'waste_water_tank_full']);

 
export const robotErrorText = (code) => ROBOT_ERRORS[code] ?? String(code).replaceAll('_', ' ');

 
export function dockErrorText(code) {
  if (!code || ['ok', 'unknown', 'unavailable'].includes(code) || DOCK_ERRORS_SKIPPED.has(code)) return null;
  return DOCK_ERRORS[code] ?? String(code).replaceAll('_', ' ');
}
