// Caché stale-while-revalidate liviana para el front. Pensada para conexiones
// lentas/inestables (Cuba): guarda en memoria + localStorage, deduplica los
// requests en vuelo y reintenta con backoff. Convención: las funciones de la API
// devuelven `null` cuando algo falla, así que tratamos `null` como fallo.

type Entry<T> = { t: number; v: T };

const STORAGE_PREFIX = "castillo:cache:";

// Copia en memoria (rápida) y conjunto de requests en vuelo (para deduplicar).
const mem = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

// Claves estables de recursos compartidos entre páginas (para invalidar tras
// una mutación). Los recursos por rango/mes se cachean con su propia clave.
export const CACHE_KEYS = {
  capital: "capital",
  inventario: "inventario",
  patrimonio: "patrimonio",
  patrimonioHistorial: "patrimonio:historial",
} as const;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Lee del caché (memoria primero, luego localStorage). No expira: la frescura la
// decide quien consume comparando contra `t`.
export function readCache<T>(key: string): Entry<T> | null {
  const inMem = mem.get(key) as Entry<T> | undefined;
  if (inMem) return inMem;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Entry<T>;
    mem.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T): void {
  const entry: Entry<T> = { t: Date.now(), v: value };
  mem.set(key, entry);
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage lleno o no disponible: la copia en memoria alcanza.
  }
}

// Borra una clave del caché. Útil tras una mutación para forzar recarga fresca
// la próxima vez que se consuma (en esta página o al navegar a otra).
export function invalidateCache(key: string): void {
  mem.delete(key);
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // noop
  }
}

// Ejecuta el fetcher con reintentos + backoff exponencial. null/excepción = fallo.
async function fetchWithRetry<T>(
  fetcher: () => Promise<T | null>,
  retries = 2,
  baseDelay = 600
): Promise<T | null> {
  for (let attempt = 0; ; attempt++) {
    let res: T | null = null;
    try {
      res = await fetcher();
    } catch {
      res = null;
    }
    if (res !== null && res !== undefined) return res;
    if (attempt >= retries) return null;
    await sleep(baseDelay * 2 ** attempt);
  }
}

// Revalida una clave deduplicando requests concurrentes: si ya hay uno en vuelo
// para la misma clave, todos esperan el mismo. Guarda en caché si tuvo éxito.
export function revalidate<T>(
  key: string,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  const existing = inflight.get(key) as Promise<T | null> | undefined;
  if (existing) return existing;

  const p = fetchWithRetry(fetcher)
    .then((res) => {
      if (res !== null && res !== undefined) writeCache(key, res);
      return res;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, p);
  return p;
}
