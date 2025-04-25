import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function MapboxNYC({ onSelectLocation }: { onSelectLocation: (lngLat: { lng: number, lat: number }) => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-73.935242, 40.73061], // NYC
      zoom: 10
    });

    map.on('click', (e) => {
      onSelectLocation(e.lngLat);
    });

    return () => map.remove();
  }, [onSelectLocation]);

  return (
    <div
      ref={mapContainer}
      className="rounded-2xl w-[50vw] h-[80vh] border border-gray-300 shadow"
    />
  );
}
