# Installazione e deploy

Basecamp è scritto per una casa precisa; per usarlo altrove servono un `config.json` e le etichette giuste in HA.

## Requisiti

- Home Assistant con accesso a `/config/www` (servita come `/local/`).
- Node.js per gli strumenti di sviluppo.
- Etichette in HA per i casi speciali (nascosta, comandi rapidi, attività).

## Registrazione in Home Assistant

```yaml
panel_custom:
  - name: basecamp-panel
    url_path: basecamp
    sidebar_title: Basecamp
    sidebar_icon: mdi:view-dashboard
    module_url: /local/basecamp/basecamp-panel.js
```

`module_url` punta al loader fisso: le versioni nuove si deployano senza toccare la configurazione.

## Comandi

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Pannello in locale collegato all'HA reale, con le chiamate di servizio bloccate |
| `npm run shot` | Screenshot e controlli (errori JS, card che sforano) con Chrome headless |
| `npm run deploy` | Pubblica una nuova versione per il loader |
| `npm test` | Test della logica di `src/core/` e coerenza della configurazione |
| `npm run snapshot` | Salva registri e stati di HA per lavorare offline |

Le credenziali (URL e token di HA) stanno in un file `.env` mai committato.
