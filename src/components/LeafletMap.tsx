import { useEffect, useRef, useState } from "react";

type Props = { query: string; title?: string };

export default function LeafletMap({ query, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let resizeObs: ResizeObserver | null = null;

    (async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
          { headers: { Accept: "application/json" } },
        );
        const data = (await res.json()) as Array<{ lat: string; lon: string }>;
        if (cancelled || !containerRef.current) return;

        const lat = data[0] ? parseFloat(data[0].lat) : -27.5949;
        const lon = data[0] ? parseFloat(data[0].lon) : -48.5482;

        const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
          [lat, lon],
          data[0] ? 16 : 13,
        );
        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const icon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });
        L.marker([lat, lon], { icon }).addTo(map).bindPopup(title ?? query);

        resizeObs = new ResizeObserver(() => map.invalidateSize());
        resizeObs.observe(containerRef.current);
        setTimeout(() => map.invalidateSize(), 200);

        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      resizeObs?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [query, title]);

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] bg-secondary">
      <div ref={containerRef} className="absolute inset-0" />
      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
          Carregando mapa…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
          Não foi possível carregar o mapa.
        </div>
      )}
      <div className="absolute bottom-1 right-1 z-[400] text-[10px] bg-white/85 px-1.5 py-0.5 rounded">
        Leaflet | ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          OpenStreetMap
        </a>
      </div>
    </div>
  );
}
