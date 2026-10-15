# Basecamp UI — website

Website for **Basecamp**, a custom [Home Assistant](https://www.home-assistant.io/) interface (a `panel_custom` in vanilla JavaScript, designed for the wall tablet).

Static site, English and Italian, no build step: open `index.html`, or serve the folder with GitHub Pages.

- `index.html`, `assets/style.css`, `assets/app.js`: the page, its styles and the EN/IT switcher
- `assets/screens/{en,it}/`: screenshots of the real interface, rendered with a fictional demo home (no personal data)
- `demo/`: a live, in-browser demo of the interface with fictional data. A fake Home Assistant runs inside the page; some controls (lights, shutters, thermostats, switches, music) respond, the rest are disabled on purpose.

## Updating

After changing `assets/style.css` or `assets/app.js`, run `./bump-assets.sh` so browsers fetch the new files instead of a cached copy, then commit.

## License

The interface source code in `demo/` is published under the [PolyForm Noncommercial License 1.0.0](LICENSE): you may read, study and use it for any non-commercial purpose; commercial use requires a separate agreement with the author.
