# Architettura

## Struttura

- `panel_custom` di Home Assistant con un web component (`basecamp-panel`).
- **Vanilla JS**, nessun framework e nessun build step obbligatorio. Le dipendenze, quando servono, sono vendorizzate.
- Un unico **store** `entity_id → stato` alimentato da `subscribeEntities`: i componenti leggono dallo store, nessuno apre sottoscrizioni proprie.
- Logica pura in `src/core/` (bollette, fasce, programmazioni, avvisi, VMC…), testata con `node --test` senza dipendenze e senza browser. La UI sta in `src/ui/`.

## Dai registri alla UI

Aree → zone, dispositivi ed entità arrivano dai registri di HA. Tre etichette governano i casi speciali: una nasconde un'entità, una la porta nei comandi rapidi, una la mostra come pillola attiva nell'header. `config.json` aggiunge ordine, nomi brevi e il ruolo di sensori che i registri non possono indovinare (ad esempio quale sia "la" temperatura esterna).

## Sicurezza

- Nessun token nel codice distribuito: il pannello usa la sessione già autenticata di HA.
- I servizi che la UI può chiamare sono un elenco chiuso (`services.js`); le entità sensibili partono solo con pressione prolungata, rifiutata altrove.
- Il server di sviluppo si collega all'HA reale ma blocca ogni chiamata di servizio.

## Deploy versionato

Un *loader* fisso, registrato in `panel_custom`, legge `version.json` senza cache e importa la versione corrente da una cartella con l'hash. Si tengono le ultime versioni e la configurazione di HA non cambia mai tra un deploy e l'altro.
