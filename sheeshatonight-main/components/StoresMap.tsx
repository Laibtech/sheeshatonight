'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VendorItem } from '@/lib/api';

// Fix default marker icon issue with Leaflet + Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface StoresMapProps {
  stores: VendorItem[];
}

// UAE city coordinates
const cityCoordinates: { [key: string]: [number, number] } = {
  'Dubai': [25.2048, 55.2708],
  'Abu Dhabi': [24.4539, 54.3773],
  'Sharjah': [25.3463, 55.4209],
  'Ajman': [25.4052, 55.5136],
  'Ras Al Khaimah': [25.7892, 55.9432],
  'Fujairah': [25.1288, 56.3265],
  'Umm Al Quwain': [25.5647, 55.5533],
  'Al Ain': [24.2075, 55.7447],
};

// Generate random offset for stores in same city
const getStoreCoordinates = (location: string, index: number): [number, number] => {
  const baseCoords = cityCoordinates[location] || cityCoordinates['Dubai'];
  if (!baseCoords) return [25.2048, 55.2708]; // Fallback to Dubai
  // Add small random offset (0.01 to 0.05 degrees) to prevent markers overlapping
  const latOffset = (Math.random() - 0.5) * 0.08;
  const lngOffset = (Math.random() - 0.5) * 0.08;
  return [baseCoords[0] + latOffset, baseCoords[1] + lngOffset];
};

export default function StoresMap({ stores }: StoresMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Initialize map centered on Dubai
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([25.2048, 55.2708], 11);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current!.removeLayer(layer);
      }
    });

    // Add markers for each store
    stores.forEach((store, index) => {
      const coords = getStoreCoordinates(store.location, index);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-pin">
            <div class="marker-inner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(mapRef.current!);

      // Create popup content
      const popupContent = `
        <div class="store-popup">
          <div class="popup-header">
            <h3>${store.name}</h3>
            ${store.verified ? '<span class="verified-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline;margin-right:3px;vertical-align:-1px"><polyline points="20 6 9 17 4 12"></polyline></svg>Verified</span>' : ''}
          </div>
          <div class="popup-rating">
            <span class="rating-star"><svg width="12" height="12" viewBox="0 0 24 24" fill="#e4ad36" stroke="#e4ad36" stroke-width="1" style="display:inline;vertical-align:-1px;margin-right:2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span>
            <strong>${store.rating}</strong>
            <span>(${store.reviews} reviews)</span>
          </div>
          <div class="popup-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${store.location}
          </div>
          <div class="popup-tags">
            ${store.tags.slice(0, 3).map(tag => `<span class="popup-tag">${tag}</span>`).join('')}
          </div>
          <a href="/stores/${store.id}" class="popup-button">Visit Store</a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'custom-popup',
      });
    });

    // Adjust map to show all markers if there are any
    if (stores.length > 0) {
      const group = L.featureGroup(
        stores.map((store, index) => {
          const coords = getStoreCoordinates(store.location, index);
          return L.marker(coords);
        })
      );
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [stores]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />;
}
