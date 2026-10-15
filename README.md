# Basecamp UI

Una dashboard di casa per [Home Assistant](https://www.home-assistant.io/) **senza Lovelace**: un `panel_custom` in HTML, CSS e JavaScript vanilla (web component, nessun build step), pensato prima di tutto per il tablet a muro, poi per telefono e PC.

> Questo repository contiene il sito di presentazione e la documentazione. Il codice dell'interfaccia vive in un repository separato e privato.

## Idee di fondo

- **Un solo pannello, niente framework.** Un web component registrato in Home Assistant riceve l'oggetto `hass` già autenticato: nessun token nel codice distribuito, funziona anche nell'app companion.
- **Nessuna entità cablata a mano.** La UI si costruisce dai registri di HA (aree, dispositivi, entità, etichette). Un piccolo `config.json` dice solo ordine, nomi brevi e il ruolo di alcune entità.
- **Sola lettura di default.** I comandi ammessi sono un elenco chiuso; le azioni delicate (serrature, cancelli, allarme) richiedono pressione prolungata, conferma o codice.
- **Tablet prima di tutto.** Layout pensato per 1280×800, target touch di almeno 44 px, tema scuro, numeri grandi e leggibili da lontano.

## Cosa c'è dentro

| Area | Cosa mostra e controlla |
|---|---|
| Home | Meteo esterno, energia, comandi rapidi, zone della casa, sicurezza e accessi |
| Zone | Luci, tapparelle, clima e qualità dell'aria per area |
| Energia | Flussi solare/rete/casa, storico, inverter, bolletta stimata |
| Meteo | Stazione domestica, grafico 24 h, previsioni |
| Sicurezza | Allarme, telecamere, porte e finestre, citofono |
| Funzioni | Robot, auto elettrica, clima, laboratorio, musica, elettrodomestici, storico, rack, impostazioni |
| Avvisi | Un'unica lista di ciò che richiede attenzione |

Il dettaglio è in [docs/features.md](docs/features.md).

## Documentazione

- [Panoramica](docs/overview.md)
- [Funzionalità](docs/features.md)
- [Architettura](docs/architecture.md)
- [Installazione e deploy](docs/installation.md)
- [Personalizzazione](docs/customization.md)

## Stato

Progetto personale in sviluppo attivo, scritto per una casa specifica: va letto come riferimento e ispirazione più che come prodotto pronto all'uso.
