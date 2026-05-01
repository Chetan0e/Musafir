import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function RouteMap({ destination }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on India
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add marker for destination (using approximate coordinates)
    const coordinates = {
      'goa': [15.2993, 74.1240],
      'mumbai': [19.0760, 72.8777],
      'delhi': [28.7041, 77.1025],
      'bangalore': [12.9716, 77.5946],
      'jaipur': [26.9124, 75.7873],
      'kerala': [10.8505, 76.2711],
      'himachal': [31.1048, 77.1734],
      'rajasthan': [27.0238, 74.2179],
      'manali': [32.2396, 77.1887],
      'rishikesh': [30.0869, 78.2676]
    };

    const destLower = destination?.toLowerCase();
    const coords = coordinates[destLower] || [20.5937, 78.9629];

    L.marker(coords)
      .addTo(map)
      .bindPopup(`<b>${destination}</b><br>Your destination`)
      .openPopup();

    map.setView(coords, 10);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destination]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-2xl shadow-lg"
      style={{ zIndex: 1 }}
    />
  );
}
