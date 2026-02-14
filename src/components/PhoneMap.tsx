import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import type { TrackedPhone } from '../lib/database.types';
import 'leaflet/dist/leaflet.css';

const phoneIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(37, 99, 235)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapUpdaterProps {
  phones: TrackedPhone[];
  selectedPhoneId: string | null;
}

function MapUpdater({ phones, selectedPhoneId }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedPhoneId) {
      const selectedPhone = phones.find(p => p.id === selectedPhoneId);
      if (selectedPhone) {
        map.setView([Number(selectedPhone.latitude), Number(selectedPhone.longitude)], 13, {
          animate: true,
        });
      }
    } else if (phones.length > 0) {
      const bounds = phones.map(phone => [
        Number(phone.latitude),
        Number(phone.longitude),
      ] as LatLngExpression);

      if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      } else {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [phones, selectedPhoneId, map]);

  return null;
}

interface PhoneMapProps {
  phones: TrackedPhone[];
  selectedPhoneId: string | null;
}

export default function PhoneMap({ phones, selectedPhoneId }: PhoneMapProps) {
  const defaultCenter: LatLngExpression = [40.7128, -74.0060];
  const defaultZoom = 3;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {phones.map((phone) => (
          <Marker
            key={phone.id}
            position={[Number(phone.latitude), Number(phone.longitude)]}
            icon={phoneIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900">{phone.label}</h3>
                <p className="text-sm text-gray-600">{phone.phone_number}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Number(phone.latitude).toFixed(4)}, {Number(phone.longitude).toFixed(4)}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(phone.last_updated).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapUpdater phones={phones} selectedPhoneId={selectedPhoneId} />
      </MapContainer>
    </div>
  );
}
