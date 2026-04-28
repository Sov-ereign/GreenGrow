/**
 * syncBus — a tiny singleton event bus.
 * When the user clicks "Sync" in the Header, emit "sync" here.
 * useWeather and useMandiPrices listen to it and bust their cache.
 */

type Listener = () => void;
const listeners = new Set<Listener>();

export const syncBus = {
  on:  (fn: Listener) => { listeners.add(fn); },
  off: (fn: Listener) => { listeners.delete(fn); },
  emit: () => { listeners.forEach(fn => fn()); },
};
