// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const DENIED_DOMAINS = new Set();
const LOCK_SERVICES = new Set(['lock', 'unlock']);

const ALARM_SERVICES = new Set(['alarm_arm_home', 'alarm_arm_night', 'alarm_arm_away', 'alarm_disarm']);
const VACUUM_SERVICES = new Set(['start', 'pause', 'return_to_base', 'set_fan_speed', 'clean_area']);

const AUTOMATION_SERVICES = new Set(['turn_on', 'turn_off']);
const ALLOWED_DOMAINS = new Set(['light']);

const domainOf = (entityId) => entityId.split('.')[0];

export function createServices({ getHass, notify, allowedEntities = () => [], holdEntities = () => [], intercom = () => ({}), longPresses = () => ({}), appliances = () => [], confirmEntities = () => [] }) {
  const requiresHold = (entityId) => holdEntities().includes(entityId);
  const canControl = (entityId) => {
    const domain = domainOf(entityId);
    return (
      !DENIED_DOMAINS.has(domain) &&
      (ALLOWED_DOMAINS.has(domain) || allowedEntities().includes(entityId) || requiresHold(entityId))
    );
  };

  async function call(entityId, service, data = {}, { held = false, quiet = false, domain: serviceDomain } = {}) {
    if (!canControl(entityId)) throw new Error(`${entityId} non abilitata ai comandi`);
    const domain = domainOf(entityId);
    
    const directLock = domain === 'lock' && service === 'lock';
    if (requiresHold(entityId) && !held && !directLock) throw new Error(`${entityId} richiede la pressione prolungata`);
    if (domain === 'alarm_control_panel' && !ALARM_SERVICES.has(service)) {
      throw new Error(`servizio ${service} non ammesso sull'allarme`);
    }
    if (serviceDomain && !(serviceDomain === 'roborock' && domain === 'vacuum' && service === 'set_vacuum_zoned_cleaning')) throw new Error(`servizio ${serviceDomain}.${service} non ammesso`);
    if (domain === 'vacuum' && !serviceDomain && !VACUUM_SERVICES.has(service)) throw new Error(`servizio ${service} non ammesso sul robot`);
    if (domain === 'automation' && !AUTOMATION_SERVICES.has(service)) throw new Error(`servizio ${service} non ammesso sulle automazioni`);
    if (domain === 'number' && service !== 'set_value') throw new Error(`servizio ${service} non ammesso sui numeri`);
    if (domain === 'input_datetime' && service !== 'set_datetime') throw new Error(`servizio ${service} non ammesso sull'helper`);
    if (domain === 'lock' && !LOCK_SERVICES.has(service)) throw new Error(`servizio ${service} non ammesso sulle serrature`);
    try {
      
      await getHass().callService(serviceDomain ?? domainOf(entityId), service, data, { entity_id: entityId }, false);
    } catch (err) {
      if (!quiet) notify(`Comando non riuscito: ${err?.message ?? err}`);
      throw err;
    }
  }

  
  const START = { script: 'turn_on', button: 'press', lock: 'unlock' };

  return {
    canControl,
    requiresHold,
    hold: (entityId) => {
      const service = START[domainOf(entityId)];
      if (!service) return Promise.reject(new Error(`${entityId}: dominio non avviabile`));
      return call(entityId, service, {}, { held: true });
    },
    
    
    confirmed: (entityId) => {
      if (!confirmEntities().includes(entityId) || domainOf(entityId) !== 'button') {
        return Promise.reject(new Error(`${entityId}: conferma con popup non ammessa`));
      }
      return call(entityId, 'press', {}, { held: true });
    },
    toggle: (entityId) => call(entityId, 'toggle'),
    lockDoor: (entityId) => call(entityId, 'lock'),
    armAlarm: (entityId, mode) => {
      if (!['home', 'night', 'away'].includes(mode)) return Promise.reject(new Error(`modalità allarme sconosciuta: ${mode}`));
      return call(entityId, `alarm_arm_${mode}`);
    },
    
    disarmAlarm: (entityId, code) => call(entityId, 'alarm_disarm', { code: String(code) }, { quiet: true }),
    turnOff: (entityId) => call(entityId, 'turn_off'),
    turnOn: (entityId, data = {}) => call(entityId, 'turn_on', data),
    setCoverPosition: (entityId, position) => call(entityId, 'set_cover_position', { position }),
    cover: (entityId, action) => {
      const service = { open: 'open_cover', close: 'close_cover', stop: 'stop_cover' }[action];
      if (!service) return Promise.reject(new Error(`azione tapparella sconosciuta: ${action}`));
      return call(entityId, service);
    },
    setTemperature: (entityId, temperature) => call(entityId, 'set_temperature', { temperature }),
    
    setFanMode: (entityId, fanMode) => {
      if (domainOf(entityId) !== 'climate') return Promise.reject(new Error(`${entityId} non è un termostato`));
      return call(entityId, 'set_fan_mode', { fan_mode: fanMode });
    },
    selectOption: (entityId, option) => call(entityId, 'select_option', { option }),
    press: (entityId) => call(entityId, 'press'),
    
    appliance: async (applianceId, action, { held = false } = {}) => {
      const a = appliances().find((x) => x.id === applianceId);
      if (!a) throw new Error(`elettrodomestico sconosciuto: ${applianceId}`);
      if (action === 'stop' && !held) throw new Error('lo stop richiede la pressione prolungata');
      let domain, service, data = {}, entity;
      if (action === 'power') [domain, service, entity] = ['switch', 'toggle', a.power_supply];
      else if (a.operation) [domain, service, entity, data] = ['select', 'select_option', a.operation, { option: action === 'stop' ? 'stop' : 'start' }];
      else if (action === 'start') [domain, service, entity] = ['button', 'press', a.start];
      else if (action === 'stop') [domain, service, entity] = ['button', 'press', a.stop];
      if (!entity || !['start', 'stop', 'power'].includes(action)) throw new Error(`${applianceId}: azione ${action} non disponibile`);
      try {
        await getHass().callService(domain, service, data, { entity_id: entity }, false);
      } catch (err) {
        notify(`Comando non riuscito: ${err?.message ?? err}`);
        throw err;
      }
    },
    
    longPressService: (entityId) => longPresses()[entityId] ?? null,
    longPress: async (entityId) => {
      const service = longPresses()[entityId];
      const [domain, name] = String(service ?? '').split('.');
      if (!domain || !name) throw new Error(`${entityId}: nessuna azione per la pressione prolungata`);
      try {
        await getHass().callService(domain, name, {}, undefined, false);
      } catch (err) {
        notify(`Comando non riuscito: ${err?.message ?? err}`);
        throw err;
      }
    },
    
    intercomCancelCall: async () => {
      const camera = intercom().camera;
      if (!camera) throw new Error('camera del citofono non configurata');
      try {
        await getHass().callService('dahua', 'vto_cancel_call', {}, { entity_id: camera }, false);
      } catch (err) {
        notify(`Comando non riuscito: ${err?.message ?? err}`);
        throw err;
      }
    },
    vacuum: (entityId, action) => {
      if (!['start', 'pause', 'return_to_base'].includes(action)) return Promise.reject(new Error(`azione robot sconosciuta: ${action}`));
      return call(entityId, action);
    },
    setFanSpeed: (entityId, fanSpeed) => call(entityId, 'set_fan_speed', { fan_speed: fanSpeed }),
    cleanArea: (entityId, areaIds) => call(entityId, 'clean_area', { cleaning_area_id: areaIds }),
    
    setAutomation: (entityId, on) => (domainOf(entityId) === 'automation' ? call(entityId, on ? 'turn_on' : 'turn_off') : Promise.reject(new Error(`${entityId} non è un'automazione`))),
    setDatetime: (entityId, datetime) => {
      if (domainOf(entityId) !== 'input_datetime' || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime)) return Promise.reject(new Error('data non valida'));
      return call(entityId, 'set_datetime', { datetime });
    },
    
    setTime: (entityId, time) => {
      if (domainOf(entityId) !== 'input_datetime' || !/^\d{2}:\d{2}:\d{2}$/.test(time)) return Promise.reject(new Error('ora non valida'));
      return call(entityId, 'set_datetime', { time });
    },
    
    setNumber: (entityId, value) => {
      if (domainOf(entityId) !== 'number' || !Number.isFinite(value)) return Promise.reject(new Error('valore non valido'));
      return call(entityId, 'set_value', { value });
    },
    
    vacuumPosition: async (entityId) => {
      if (domainOf(entityId) !== 'vacuum' || !canControl(entityId)) throw new Error(`${entityId} non abilitata ai comandi`);
      const reply = await getHass().connection.sendMessagePromise({
        type: 'call_service', domain: 'roborock', service: 'get_vacuum_current_position', target: { entity_id: entityId }, return_response: true,
      });
      const { x, y } = reply?.response?.[entityId] ?? {};
      if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('posizione del robot non disponibile');
      return { x, y };
    },
    
    cleanZone: (entityId, { x1, y1, x2, y2 }) => {
      if (domainOf(entityId) !== 'vacuum') return Promise.reject(new Error(`${entityId} non è un aspirapolvere`));
      if (![x1, y1, x2, y2].every((n) => Number.isFinite(n) && Math.abs(n) < 100000)) return Promise.reject(new Error('zona non valida'));
      return call(entityId, 'set_vacuum_zoned_cleaning', { x1: Math.round(x1), y1: Math.round(y1), x2: Math.round(x2), y2: Math.round(y2), repeats: 0 }, { domain: 'roborock' });
    },
  };
}
