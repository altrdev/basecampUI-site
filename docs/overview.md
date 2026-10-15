# Panoramica

Basecamp nasce da una scelta: abbandonare Lovelace per le cose di tutti i giorni e costruire un'interfaccia su misura, veloce e coerente. Lovelace resta per l'amministrazione e per ciò che si usa raramente.

## Layout del tablet

- **Header**: nome della casa, data, ora, pillole delle attività in corso (lavatrice, ricarica auto, modalità vacanza…) e il pulsante *Funzioni*.
- **Colonna sinistra**: meteo esterno, energia, comandi rapidi.
- **Centro**: griglia delle zone della casa. Ogni card è di sola lettura con badge; il tocco apre un pannello laterale.
- **Colonna destra**: sicurezza e accessi.

Ogni pannello è legato all'URL (`#zona/...`, `#energia`, `#funzioni/...`), quindi il tasto indietro lo chiude e si può aprire direttamente da una notifica.

## Stile

Fondo scuro, card con raggio 20 px, ambra per solare e attenzione, azzurro per consumo e freddo, verde per "ok", rosso-arancio per allarmi. Font Sora per titoli e numeri, IBM Plex Sans per il testo. Niente emoji nell'interfaccia.

## Screenshot

Gli screenshot si aggiungono in `assets/screenshots/`.
