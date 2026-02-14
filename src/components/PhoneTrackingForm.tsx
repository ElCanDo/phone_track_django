import { useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PhoneTrackingFormProps {
  onPhoneAdded: () => void;
}

interface GeolocationErrorPayload {
  error?: string;
  details?: string;
  suggestion?: string;
}

function buildGeolocationError(payload: GeolocationErrorPayload): string {
  const lines = [payload.error, payload.details, payload.suggestion].filter(Boolean);
  return lines.length > 0
    ? lines.join(' ')
    : 'Auto-location is unavailable. Use manual coordinates or the target device current location with consent.';
}


export default function PhoneTrackingForm({ onPhoneAdded }: PhoneTrackingFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [label, setLabel] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geolocating, setGeolocating] = useState(false);

   const fetchPhoneLocation = async (number: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/geolocate_phone`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber: number }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(buildGeolocationError(payload));
    }

    return payload;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let lat = latitude;
    let lng = longitude;

    if (!lat || !lng) {
      if (!phoneNumber) {
        setError('Please enter a phone number');
        setLoading(false);
        return;
      }

      try {
        setGeolocating(true);
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(
          `${supabaseUrl}/functions/v1/geolocate_phone`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to auto-detect location');
        }

        const data = await response.json();
        lat = data.latitude.toString();
        lng = data.longitude.toString();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to auto-detect location. Please enter coordinates manually.');
        setLoading(false);
        setGeolocating(false);
        return;
      } finally {
        setGeolocating(false);
      }
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('tracked_phones')
        .insert({
          phone_number: phoneNumber,
          label: label || phoneNumber,
          latitude: latNum,
          longitude: lngNum,
        });

      if (insertError) throw insertError;

      setPhoneNumber('');
      setLabel('');
      setLatitude('');
      setLongitude('');
      onPhoneAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add phone');
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
        },
        (geoerror) => {
          setError(`Failed to get location: ${geoerror.message}`);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const geolocatePhoneNumber = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number first');
      return;
    }

    setGeolocating(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/geolocate_phone`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to geolocate phone number');
      }

      const data = await response.json();
      setLatitude(data.latitude.toFixed(6));
      setLongitude(data.longitude.toFixed(6));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to geolocate phone number');
    } finally {
      setGeolocating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Track New Phone</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1234567890"
              required
            />
            <button
              type="button"
              onClick={geolocatePhoneNumber}
              disabled={geolocating || !phoneNumber}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center gap-2 whitespace-nowrap"
              title="Auto-detect location from phone number"
            >
              {geolocating ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <MapPin size={18} />
                  Auto-Locate
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John's Phone"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude {!latitude && '*'}
            </label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="40.7128"
              required={!latitude}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude {!longitude && '*'}
            </label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="-74.0060"
              required={!longitude}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={useCurrentLocation}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <MapPin size={18} />
          Use My Current Location
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Adding...' : 'Track Phone'}
        </button>
      </div>
    </form>
  );
}
