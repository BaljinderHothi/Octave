import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import type { Feature, Polygon } from 'geojson';
import { saveToLocalStorage, getFromLocalStorage } from '@/utils/storage';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Location {
  lng: number;
  lat: number;
}

interface MapboxNYCProps {
  onSelectLocation: (location: Location, radius: number, zipCode: string) => void;
}

export default function MapboxNYC({ onSelectLocation }: MapboxNYCProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const radiusCircle = useRef<mapboxgl.GeoJSONSource | null>(null);
  const [radius, setRadius] = useState<number>(5); // default mile radius
  const [currentZipCode, setCurrentZipCode] = useState<string>('');

  // convert miles to meters for mapbox
  const milesToMeters = (miles: number) => miles * 1609.34;

  //zip code from coordinates
  const getZipCodeFromCoordinates = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=postcode`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Extract zip code from the first feature
        const zipCode = data.features[0].text;
        setCurrentZipCode(zipCode);
        return zipCode;
      }
      return '';
    } catch (error) {
      console.error('Error fetching zip code:', error);
      return '';
    }
  };

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      const savedLocation = getFromLocalStorage<Location>('mapLocation');
      const savedRadius = getFromLocalStorage<number>('mapRadius');
      
      if (savedRadius) {
        setRadius(savedRadius);
      }

      const initialLocation = savedLocation || { lng: -73.935242, lat: 40.73061 }; // Default to NYC

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [initialLocation.lng, initialLocation.lat],
        zoom: 11
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      marker.current = new mapboxgl.Marker({
        draggable: true,
        color: '#ff6b6b'
      })
        .setLngLat([initialLocation.lng, initialLocation.lat])
        .addTo(map.current);

      map.current.on('load', () => {
        if (!map.current) return;

        map.current.addSource('radius-circle', {
          type: 'geojson',
          data: createGeoJSONCircle([initialLocation.lng, initialLocation.lat], milesToMeters(radius))
        });

        map.current.addLayer({
          id: 'radius-circle',
          type: 'fill',
          source: 'radius-circle',
          paint: {
            'fill-color': '#6366f1',
            'fill-opacity': 0.2,
            'fill-outline-color': '#4f46e5'
          }
        });

        radiusCircle.current = map.current.getSource('radius-circle') as mapboxgl.GeoJSONSource;
        
        //If  saved location, get and set the zip code
        if (savedLocation) {
          getZipCodeFromCoordinates(savedLocation.lng, savedLocation.lat).then(zipCode => {
            if (zipCode) {
              onSelectLocation(savedLocation, radius, zipCode);
            }
          });
        }
      });

      marker.current.on('dragend', updateLocation);

      map.current.on('click', (e) => {
        if (marker.current) {
          marker.current.setLngLat(e.lngLat);
          updateLocation();
        }
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (marker.current && radiusCircle.current) {
      const lngLat = marker.current.getLngLat();
      radiusCircle.current.setData(createGeoJSONCircle([lngLat.lng, lngLat.lat], milesToMeters(radius)));

      saveToLocalStorage('mapRadius', radius);

      if (currentZipCode) {
        onSelectLocation({ lng: lngLat.lng, lat: lngLat.lat }, radius, currentZipCode);
      }
    }
  }, [radius, currentZipCode]);

  const createGeoJSONCircle = (center: [number, number], radiusInMeters: number): Feature<Polygon> => {
    const points = 64;
    const coordinates: [number, number][] = [];

    const degreePerPoint = 360 / points;
    const kmPerLngDegree = 111.32 * Math.cos(center[1] * Math.PI / 180);
    const kmPerLatDegree = 110.574;

    for (let i = 0; i < points; i++) {
      const degree = i * degreePerPoint;
      const radian = degree * (Math.PI / 180);
      const latOffset = Math.sin(radian) * (radiusInMeters / 1000) / kmPerLatDegree;
      const lngOffset = Math.cos(radian) * (radiusInMeters / 1000) / kmPerLngDegree;

      const lat = center[1] + latOffset;
      const lng = center[0] + lngOffset;

      coordinates.push([lng, lat]);
    }

    coordinates.push(coordinates[0]);

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      },
      properties: {}
    };
  };

  const updateLocation = async () => {
    if (marker.current && radiusCircle.current) {
      const lngLat = marker.current.getLngLat();

      radiusCircle.current.setData(createGeoJSONCircle([lngLat.lng, lngLat.lat], milesToMeters(radius)));
      saveToLocalStorage('mapLocation', { lng: lngLat.lng, lat: lngLat.lat });

      const zipCode = await getZipCodeFromCoordinates(lngLat.lng, lngLat.lat);
      
      // Update the component with new location info
      onSelectLocation({ lng: lngLat.lng, lat: lngLat.lat }, radius, zipCode);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center">
          <MapPin size={20} className="text-blue-600 mr-2" />
          <span className="font-semibold">Drag pin or click map to set location</span>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="radius" className="text-sm font-medium">
            Radius (miles):
          </label>
          <input
            id="radius"
            type="range"
            min="1"
            max="15"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm font-bold">{radius}</span>
          {currentZipCode && (
            <span className="text-sm ml-4 bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Zip: {currentZipCode}
            </span>
          )}
        </div>
      </div>
      <div
        ref={mapContainer}
        className="rounded-xl h-[400px] border border-gray-300 shadow"
      />
    </div>
  );
}