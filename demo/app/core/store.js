// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { subscribeEntities } from '../vendor/home-assistant-js-websocket/index.js';

export class EntityStore {
  #states = {};
  #listeners = new Set();
  #waiters = new Set();
  #version = 0;

  

  constructor(connection, initial = null) {
    const seeded = initial && Object.keys(initial).length > 0;
    if (seeded) this.#states = initial;
    this.ready = new Promise((resolve) => {
      if (seeded) resolve();
      this.unsubscribe = subscribeEntities(connection, (states) => {
        const prev = this.#states;
        this.#states = states;
        this.#version++;
        resolve();
        for (const waiter of [...this.#waiters]) waiter();
        
        for (const listener of this.#listeners) listener(prev, states);
      });
    });
  }

   
  get version() {
    return this.#version;
  }

   
  changed(version, timeoutMs) {
    if (this.#version > version) return Promise.resolve(true);
    return new Promise((resolve) => {
      const done = (value) => {
        clearTimeout(timer);
        this.#waiters.delete(onUpdate);
        resolve(value);
      };
      const onUpdate = () => done(true);
      const timer = setTimeout(() => done(false), timeoutMs);
      this.#waiters.add(onUpdate);
    });
  }

  get(entityId) {
    return this.#states[entityId];
  }

   
  watch(ids, callback) {
    if (!ids.length) return () => {};
    const listener = (prev, next) => {
      if (ids.some((id) => prev[id] !== next[id])) callback();
    };
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
}
