import { useCallback, useEffect, useRef, useState } from "react";
import { readCache, revalidate } from "../lib/resourceCache";

interface Options {
  // Si la copia cacheada es más nueva que esto (ms), no se revalida al montar.
  ttl?: number;
  // Permite desactivar el fetch (p. ej. mientras faltan parámetros).
  enabled?: boolean;
}

// Hook de datos con stale-while-revalidate:
// - Muestra al instante lo último cacheado (memoria/localStorage).
// - Revalida en segundo plano si está vencido o si se fuerza (refetch).
// - Deduplica requests concurrentes con la misma clave.
// - Si la revalidación falla, conserva los datos viejos y marca `error`.
export function useCachedResource<T>(
  key: string,
  fetcher: () => Promise<T | null>,
  { ttl = 60_000, enabled = true }: Options = {}
) {
  const [data, setData] = useState<T | null>(() => readCache<T>(key)?.v ?? null);
  const [loading, setLoading] = useState<boolean>(
    () => !readCache<T>(key) && enabled
  );
  const [error, setError] = useState<boolean>(false);

  // El fetcher suele recrearse en cada render; lo guardamos en ref para no
  // re-disparar el effect por su identidad (la clave es la que manda).
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (force: boolean) => {
      const entry = readCache<T>(key);
      if (entry) {
        setData(entry.v);
        setLoading(false);
        if (!force && Date.now() - entry.t < ttl) return; // fresco: no revalida
      } else {
        setData(null);
        setLoading(true);
      }

      const res = await revalidate<T>(key, () => fetcherRef.current());
      if (!mounted.current) return;
      if (res !== null && res !== undefined) {
        setData(res);
        setError(false);
      } else {
        setError(true); // se conserva la data stale si la había
      }
      setLoading(false);
    },
    [key, ttl]
  );

  useEffect(() => {
    if (!enabled) return;
    run(false);
  }, [enabled, run]);

  const refetch = useCallback(() => run(true), [run]);

  return { data, loading, error, refetch };
}
