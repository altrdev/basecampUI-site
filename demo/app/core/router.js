// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


export function parseRoute(hash) {
  const [name, id, entity] = hash.replace(/^#/, '').split('/');
  if (name === 'zona' && id) return { name, id };
  if (name === 'avvisi') return id === 'citofono' ? { name, id } : { name };
  if (name === 'vmc' || name === 'sicurezza' || name === 'citofono' || name === 'meteo' || name === 'energia' || name === 'tapparelle') return { name };
  if (name === 'funzioni' && id === 'storico') return entity ? { name, id, entity } : { name, id };
  if (name === 'funzioni') return ['piante', 'clima', 'auto', 'robot', 'lab', 'wifi', 'impostazioni', 'elettrodomestici', 'musica', 'rack'].includes(id) ? { name, id } : { name };
  return null;
}

export class Router {
  #openedHere = false;

  constructor(onChange) {
    this.onChange = onChange;
    this.handle = () => {
      const route = parseRoute(location.hash);
      if (!route) this.#openedHere = false;
      onChange(route);
    };
    window.addEventListener('hashchange', this.handle);
  }

  get current() {
    return parseRoute(location.hash);
  }

   
  open(hash, replace = false) {
    if (replace && this.current) {
      location.replace(hash);
      return;
    }
    this.#openedHere = true;
    location.hash = hash;
  }

  close() {
    if (this.#openedHere) {
      
      this.#openedHere = false;
      history.back();
    } else {
      
      history.replaceState(history.state, '', location.pathname + location.search);
      this.handle();
    }
  }

  destroy() {
    window.removeEventListener('hashchange', this.handle);
  }
}
