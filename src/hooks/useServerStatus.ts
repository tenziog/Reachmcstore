import { useEffect, useState } from 'react';

export interface ServerStatus {
  online: boolean;
  players: { current: number; max: number } | null;
  loading: boolean;
  error: boolean;
}

const REFRESH_MS = 60_000;

// Reads the api.mcsrvstat.us/3 schema (configurable via VITE_MCSTATUS_API_URL).
export function useServerStatus(apiUrl: string): ServerStatus {
  const [state, setState] = useState<ServerStatus>({
    online: false,
    players: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      setState((s) => ({ ...s, loading: true, error: false }));
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        const online = Boolean(data?.online);
        const players =
          online && data?.players
            ? {
                current: Number(data.players.online) || 0,
                max: Number(data.players.max) || 0,
              }
            : null;
        setState({ online, players, loading: false, error: false });
      } catch {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: true }));
      }
    }

    fetchStatus();
    const timer = setInterval(fetchStatus, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [apiUrl]);

  return state;
}
