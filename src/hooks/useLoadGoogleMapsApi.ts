import { useEffect, useState } from "react";

let loadedKey: string | null = null;
let loadingPromise: Promise<void> | null = null;

export function useLoadGoogleMapsApi(apiKey?: string) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setReady(false);
      return;
    }

    // Already loaded
    if ((window as any).google && loadedKey === apiKey) {
      setReady(true);
      return;
    }

    // Avoid reloading same key
    if (loadingPromise && loadedKey === apiKey) {
      loadingPromise.then(() => setReady(true)).catch((e) => setError(String(e)));
      return;
    }

    loadedKey = apiKey;
    loadingPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[data-google-maps]`);
      if (existing) existing.remove();

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMaps = "true";
      script.onload = () => {
        setReady(true);
        resolve();
      };
      script.onerror = () => {
        const msg = "Failed to load Google Maps API";
        setError(msg);
        reject(new Error(msg));
      };
      document.head.appendChild(script);
    });

    return () => {
      // do not unload on unmount to preserve cache
    };
  }, [apiKey]);

  return { ready, error };
}
