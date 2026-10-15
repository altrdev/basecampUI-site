// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const D = {
  'Comando non riuscito: Demo: questo comando è disattivato': 'Command failed: this command is disabled in the demo',
  
  'Meteo': 'Weather', 'Poco nuvoloso': 'Partly cloudy', 'Percepita': 'Feels like', 'umidità': 'humidity', 'km/h SO': 'km/h SW', 'oggi': 'today',
  'Energia': 'Energy', 'Produzione': 'Production', 'Consumo': 'Usage', 'Immissione': 'Export', 'Solare copre il': 'Solar covers', 'del consumo': 'of consumption',
  'Prodotti oggi': 'Produced today', 'Prelevati': 'Imported', 'Immessi': 'Exported', 'Comandi rapidi': 'Quick actions',
  'Zona giorno': 'Living room', 'Riscalda': 'Heating', '2 luci': '2 lights', '1 luce': '1 light', 'Bagno': 'Bathroom', 'Clima acceso': 'Climate on', 'Camera': 'Bedroom',
  'Aperta': 'Open', 'Cameretta': 'Kids’ room', 'Studio': 'Study', 'Lavanderia': 'Laundry', 'Sicurezza': 'Security', 'Disinserito': 'Disarmed',
  'Nessuna zona sorvegliata': 'No zone armed', 'Casa': 'Home', 'Notte': 'Night', 'Fuori': 'Away', 'Accessi': 'Access', 'Bloccata': 'Locked', 'Garage': 'Garage', 'Tariffa indicizzata': 'Indexed tariff', 'Chiusa': 'Closed',
  'Pedonale': 'Pedestrian', 'Carraio': 'Driveway', 'Avvisi': 'Alerts', 'Tutto a posto': 'All clear', 'Soggiorno': 'Living room', 'Lavatrice': 'Washer',
  
  'Clima': 'Climate', 'Obiettivo': 'Target', 'discreta': 'moderate', 'nella norma': 'normal', 'Luci': 'Lights', 'Spegni tutte': 'All off', 'Cucina': 'Kitchen', 'Spenta': 'Off',
  'Divano': 'Sofa', 'Lampadario': 'Chandelier', 'Tapparelle': 'Shutters', 'Apri': 'Open', 'Chiudi': 'Close', 'Preset': 'Presets', 'Metà': 'Half', 'Aria': 'Air',
  
  'Pompa di calore': 'Heat pump', 'Ventilazione': 'Ventilation', 'Solare': 'Solar', 'Rete · immissione': 'Grid · export', 'Oggi · potenza ora per ora': 'Today · power by the hour',
  'Oggi': 'Today', 'Prodotti': 'Produced', 'Consumati': 'Consumed', 'Autosufficienza': 'Self-sufficiency', 'del consumo coperto dal solare oggi': 'of consumption covered by solar today',
  'Autoconsumo': 'Self-consumption', 'della produzione': 'of production', 'Previsione solare': 'Solar forecast', 'kWh oggi': 'kWh today', 'ancora': 'another', 'kWh · domani': 'kWh · tomorrow',
  'Inverter': 'Inverter', 'Stato': 'Status', 'In rete': 'On grid', 'Isolamento': 'Insulation', 'Tensione di rete': 'Grid voltage', 'Frequenza': 'Frequency', 'Temperatura': 'Temperature',
  'Picco oggi': 'Peak today', 'Ottimizzatori': 'Optimizers', 'online': 'online', 'Prodotti in totale': 'Total produced', 'Esportati in totale': 'Total exported', 'Importati in totale': 'Total imported',
  'Ultimi 7 giorni': 'Last 7 days', 'Ven': 'Fri', 'Sab': 'Sat', 'Dom': 'Sun', 'Lun': 'Mon', 'Mar': 'Tue', 'Mer': 'Wed', 'Gio': 'Thu', 'Prodotti (kWh)': 'Produced (kWh)', 'Consumati (kWh)': 'Consumed (kWh)',
  'Ottobre': 'October', '· autoconsumo': '· self-consumption', 'PUN · Ottobre': 'PUN · October', '€/kWh sui tuoi consumi': '€/kWh on your usage', 'ultimi 12 mesi': 'last 12 months', 'pareggio': 'break-even',
  'indicizzata costa meno': 'indexed costs less', 'Il fisso costa meno': 'Fixed costs less', 'Tariffa fissa 36 mesi sta rendendo': 'The 36-month fixed tariff is paying off',
  'Inverter solare · Previsione: Forecast.Solar · Dispositivi: dashboard Energia di HA · Rack: stima dalla corrente dell\'UPS': 'Solar inverter · Forecast: Forecast.Solar · Devices: Home Assistant Energy dashboard',
  
  'Bolletta di ottobre': 'October bill', 'Stima con la tariffa Tariffa indicizzata e il PUN del mese.': 'Estimate with the indexed tariff and this month’s PUN.', 'stima di ottobre': 'October estimate',
  'Quote fisse': 'Fixed charges', 'Rete e potenza': 'Network and power', 'Oneri di sistema': 'System charges', 'Accise': 'Excise duty', 'IVA 10%': 'VAT 10%', 'Totale bolletta': 'Bill total',
  'Canone RAI': 'TV licence fee', 'fuori da IVA': 'outside VAT', 'Totale da pagare': 'Total to pay', 'Mese scorso': 'Last month', 'Settembre': 'September', 'Con Tariffa fissa 36 mesi': 'With the fixed 36-month tariff',
  'Se il PUN finisse il mese 10% più basso o più alto: da': 'If the PUN ended the month 10% lower or higher: from', 'a': 'to', '. Con Tariffa fissa 36 mesi sarebbe': '. With the fixed 36-month tariff it would be',
  'Stima con i dati del mese chiuso, da confrontare con il totale da pagare in bolletta (compreso il canone RAI di 9,00 €).': 'Estimate from the closed month’s data, to compare with the total on the bill (including the 9.00 € TV licence fee).',
  'PUN del mese': 'PUN of the month', 'Monorario': 'Single rate', '€/kWh, media del mese finora (si assesta a fine mese). Sui tuoi consumi:': '€/kWh, month-to-date average (settles at month end). On your usage:',
  'Soglia di pareggio': 'Break-even threshold', 'ott': 'Oct', 'nov': 'Nov', 'dic': 'Dec', 'gen': 'Jan', 'feb': 'Feb', 'mar': 'Mar', 'apr': 'Apr', 'mag': 'May', 'giu': 'Jun', 'lug': 'Jul', 'ago': 'Aug', 'set': 'Sep',
  'PUN medio mese per mese sui tuoi consumi (azzurro; verde = sotto il pareggio': 'Average PUN month by month on your usage (blue; green = below break-even', ', linea ambra). Media degli ultimi 12 mesi:': ', amber line). Average of the last 12 months:', '€/kWh.': '€/kWh.',
  'Con gli stessi consumi, in questi mesi Tariffa indicizzata sarebbe costato': 'With the same usage, over these months the indexed tariff would have cost', 'e Tariffa fissa 36 mesi': 'and the fixed 36-month tariff',
  ': il fisso fa risparmiare 90 € (IVA e accise comprese; il canone RAI è uguale con entrambe).': ': the fixed one saves 90 € (VAT and excise included; the TV licence fee is the same with both).',
  'PUN: GME (integrazione pun_sensor). Consumi: contatore dell\'inverter con correzione 1,00. Rete, oneri e accise: bolletta di settembre 2026, da aggiornare ogni trimestre.': 'PUN: GME. Usage: inverter meter. Network, charges and excise: September 2026 bill, updated quarterly.',
  
  'Percepita 17,1° · Rugiada 10,2°': 'Feels like 17.1° · Dew point 10.2°', 'Temperatura · ultime 24 h e prossime 24 h': 'Temperature · last 24 h and next 24 h', 'ora': 'now', 'Prossime ore': 'Next hours',
  'Vento': 'Wind', 'N': 'N', 'E': 'E', 'S': 'S', 'O': 'W', 'da SO': 'from SW', 'Pioggia': 'Rain', 'Non piove': 'Not raining', 'ultima ora': 'last hour', 'sett.': 'week', 'mese': 'month', 'anno': 'year',
  'Umidità': 'Humidity', 'Pressione': 'Pressure', 'Sole e UV': 'Sun and UV', 'moderato': 'moderate', 'Aria · PM2.5': 'Air · PM2.5', 'Sensore non disponibile': 'Sensor unavailable', 'Prossimi giorni': 'Next days',
  'Misure: stazione meteo · Previsioni: met.no': 'Readings: weather station · Forecast: met.no',
  
  'Telecamere': 'Cameras', 'Fronte': 'Front', 'Ingresso': 'Entrance', 'Retro': 'Back', 'Porte e finestre': 'Doors and windows', 'Tutto chiuso': 'All closed', 'Porta ingresso': 'Front door',
  'Presenza': 'Presence', 'A casa': 'At home', 'Funzioni': 'Functions', 'Citofono': 'Intercom', 'Non disturbare': 'Do not disturb', 'Parla': 'Talk', 'Comandi': 'Controls',
  'Tieni premuto 1 secondo': 'Hold for 1 second', 'Ultime chiamate': 'Recent calls', 'Risposta': 'Answered', 'Persa': 'Missed',
  
  'Tende e tapparelle': 'Awnings and shutters', 'Tutte aperte': 'All open', 'Apri tutte': 'Open all', 'Chiudi tutte': 'Close all', 'VMC': 'Ventilation', 'Medio': 'Medium', 'FUORI': 'OUTSIDE', 'CASA': 'HOME',
  'Raffresca −2,7°': 'Cooling −2.7°', 'Recupero 75%': 'Recovery 75%', 'Esterno': 'Outdoor', 'Ripresa': 'Extract', 'Espulsione': 'Exhaust', 'Mandata': 'Supply', 'Velocità': 'Speed', 'Assente': 'Away', 'Bassa': 'Low', 'Media': 'Medium', 'Alta': 'High',
  'Bilanciamento': 'Balance', 'Bilanciato': 'Balanced', 'Solo mandata': 'Supply only', 'Solo ripresa': 'Extract only', 'Profilo di temperatura': 'Temperature profile', 'Normale': 'Normal', 'Freddo': 'Cool', 'Caldo': 'Warm',
  'Boost': 'Boost', '1 ora': '1 hour', 'Stop': 'Stop', 'Bypass': 'Bypass', 'Aperto': 'Open', 'Chiuso': 'Closed', 'Errori': 'Errors', 'Nessuno': 'None', 'Filtro da cambiare tra': 'Filter change in', '94 giorni': '94 days',
  'RMOT (media esterna)': 'RMOT (outdoor average)', 'Errori letti dall\'unità ogni minuto.': 'Errors read from the unit every minute.',
  
  'Robot': 'Robot', 'In pulizia': 'Cleaning', 'Avvia': 'Start', 'Pausa': 'Pause', 'Base': 'Dock', 'Stanze': 'Rooms', 'Disegna una zona': 'Draw a zone', 'Scegli le stanze': 'Choose rooms', 'Impostazioni': 'Settings',
  'Modalità': 'Mode', 'Aspira': 'Vacuum', 'Aspira e lava': 'Vacuum and mop', 'Lava': 'Mop', 'Smart': 'Smart', 'Potenza aspirazione': 'Suction power', 'Silenziosa': 'Quiet', 'Bilanciata': 'Balanced', 'Turbo': 'Turbo',
  'Intensità lavaggio': 'Mop intensity', 'Massima': 'Maximum', 'Ultima pulizia': 'Last clean', 'In corso': 'In progress', 'Durata': 'Duration', 'Area': 'Area', 'Manutenzione': 'Maintenance', 'Sensori': 'Sensors', 'Filtro': 'Filter',
  'Spazzola principale': 'Main brush', 'Spazzola laterale': 'Side brush', 'Spazzola del dock': 'Dock brush', 'Filtro del dock': 'Dock filter', 'Dopo aver pulito o sostituito una parte, tieni premuto il pulsante per azzerare il contatore.': 'After cleaning or replacing a part, hold the button to reset the counter.',
  
  'Musica': 'Music', 'In ascolto': 'Now playing', 'Libreria': 'Library', 'Cerca': 'Search', 'Raggruppa': 'Group', 'Prossimi in coda': 'Up next', 'Svuota': 'Clear',
  
  'Elettrodomestici': 'Appliances', 'Lavastoviglie': 'Dishwasher', 'In lavaggio': 'Washing', 'Programma': 'Program', 'Fine': 'End', 'Spegni': 'Turn off', 'Tieni premuto Stop per interrompere il programma.': 'Hold Stop to interrupt the program.',
  'Centrifuga': 'Spinning', 'Cicli': 'Cycles', 'Questo mese': 'This month', 'Asciugatrice': 'Dryer', 'Pronta': 'Ready', 'Auto elettrica': 'Electric car', 'Storico': 'History', 'Grafici dei sensori': 'Sensor charts',
  'Wi-Fi ospiti': 'Guest Wi-Fi', 'Non configurato': 'Not configured',
  
  'Soggiorno · in riproduzione': 'Living room · now playing',
};
const WEEKDAYS = { lunedì: 'Monday', martedì: 'Tuesday', mercoledì: 'Wednesday', giovedì: 'Thursday', venerdì: 'Friday', sabato: 'Saturday', domenica: 'Sunday' };
const MONTHS = { gennaio: 'January', febbraio: 'February', marzo: 'March', aprile: 'April', maggio: 'May', giugno: 'June', luglio: 'July', agosto: 'August', settembre: 'September', ottobre: 'October', novembre: 'November', dicembre: 'December' };
const RULES = [
  [/^(.+? kWh) finora · (\d+) previsti$/, (m, a, b) => `${a} so far · ${b} forecast`],
  [/^(\p{L}+) (\d+) (\p{L}+)$/u, (m, w, d, mo) => (WEEKDAYS[w] && MONTHS[mo] ? `${cap(WEEKDAYS[w])}, ${MONTHS[mo]} ${d}` : null)],
  [/^Ultimo (\d+:\d+)$/, (m, t) => `Last ${t}`], [/^Oggi (\d+:\d+)$/, (m, t) => `Today ${t}`], [/^Ieri (\d+:\d+)$/, (m, t) => `Yesterday ${t}`],
  [/^Ultima: oggi (\d+:\d+)$/, (m, t) => `Last: today ${t}`], [/^Porte (\d+\/\d+) bloccate$/, (m, n) => `Doors ${n} locked`],
  [/^(.+?) · umidità (.+)$/, (m, a, b) => `${a} · humidity ${b}`], [/^Ora (.+)$/, (m, a) => `Now ${a}`], [/^Accesa · (\d+%)$/, (m, p) => `On · ${p}`],
  [/^Obiettivo (.+)$/, (m, a) => `Target ${a}`], [/^Ancora (\d+ h)$/, (m, a) => `${a} left`], [/^(ieri|domani) (\d+:\d+)$/, (m, d, t) => `${d === 'ieri' ? 'yesterday' : 'tomorrow'} ${t}`],
  [/^raffica (.+?) · max (.+)$/, (m, a, b) => `gust ${a} · max ${b}`], [/^in salita \((.+)\)$/, (m, a) => `rising (${a})`], [/^in calo \((.+)\)$/, (m, a) => `falling (${a})`],
  [/^Radiazione (.+)$/, (m, a) => `Radiation ${a}`], [/^Punto di rugiada (.+)$/, (m, a) => `Dew point ${a}`], [/^Deficit vapore (.+)$/, (m, a) => `Vapour deficit ${a}`],
  [/^Automatica · cambio tra (.+)$/, (m, a) => `Automatic · change in ${a}`], [/^(\d+) stanze$/, (m, n) => `${n} rooms`], [/^· tra (.+)$/, (m, a) => `· in ${a}`], [/^tra (.+)$/, (m, a) => `in ${a}`],
  [/^(\d+) giorni$/, (m, n) => `${n} days`], [/^UV (\d+)$/, (m, n) => `UV ${n}`], [/^(\d+(?:,\d+)?) mm oggi$/, (m, n) => `${n} mm today`],
];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const num = (s) => s.replace(/(\d)\.(\d{3})(?!\d)/g, '$1,$2').replace(/(\d),(\d)/g, '$1.$2');

export function translate(text) {
  const t = text.trim();
  if (!t) return text;
  let out = D[t] ?? null;
  if (out === null) for (const [re, fn] of RULES) { const m = t.match(re); if (m) { out = fn(...m); if (out) break; } }
  if (out === null && t.includes(' · ')) out = t.split(' · ').map((p) => D[p] ?? translate(p).trim()).join(' · ');
  return text.replace(t, num(out ?? t));
}

const seen = new WeakMap();
const observed = new WeakSet();

function translateText(node) {
  if (node.parentElement?.closest('style,script')) return;
  const rec = seen.get(node);
  if (rec && node.nodeValue === rec.out) return;
  const out = translate(node.nodeValue);
  seen.set(node, { out });
  if (out !== node.nodeValue) node.nodeValue = out;
}

function walk(root) {
  observe(root);
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) translateText(n);
  for (const el of root.querySelectorAll('*')) if (el.shadowRoot) walk(el.shadowRoot);
}

function observe(root) {
  if (observed.has(root)) return;
  observed.add(root);
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') translateText(m.target);
      for (const n of m.addedNodes) {
        if (n.nodeType === 3) translateText(n);
        else if (n.nodeType === 1) {
          const tw = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
          for (let t = tw.nextNode(); t; t = tw.nextNode()) translateText(t);
          if (n.shadowRoot) walk(n.shadowRoot);
          for (const el of n.querySelectorAll('*')) if (el.shadowRoot) walk(el.shadowRoot);
        }
      }
    }
  }).observe(root, { childList: true, subtree: true, characterData: true });
}

const attachShadow = Element.prototype.attachShadow;
Element.prototype.attachShadow = function (init) {
  const root = attachShadow.call(this, init);
  observe(root);
  return root;
};

window.__translate = () => walk(document);
document.addEventListener('DOMContentLoaded', window.__translate);
setInterval(window.__translate, 1000);
