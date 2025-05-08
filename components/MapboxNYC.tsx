import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface MapboxNYCProps {
  onSelectLocation: (location: { lng: number; lat: number }, radius: number) => void;
}

export default function MapboxNYC({ onSelectLocation }: MapboxNYCProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [radius, setRadius] = useState(2); // default 2 miles

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-73.935242, 40.73061],
      zoom: 10,
    });

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      if (!marker.current) {
        marker.current = new mapboxgl.Marker({ color: '#111' })
          .setLngLat([lng, lat])
          .addTo(map.current!);
      } else {
        marker.current.setLngLat([lng, lat]);
      }
      onSelectLocation({ lng, lat }, radius);
    });
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-md shadow" />
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
        <label className="block text-xs font-medium mb-1">Radius (miles)</label>
        <input
          type="range"
          min={1}
          max={10}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        />
        <p className="text-xs">{radius} mi</p>
      </div>
    </div>
  );
}