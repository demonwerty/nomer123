const KEY = 'garage_spin_save_v1';
const VERSION = 1;

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('[storage] save failed', e);
    return false;
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version !== VERSION) return migrate(data);
    return data;
  } catch (e) {
    console.error('[storage] load failed', e);
    return null;
  }
}

export function clear() {
  localStorage.removeItem(KEY);
}

function migrate(data) {
  // место для будущих миграций
  data.version = VERSION;
  return data;
}