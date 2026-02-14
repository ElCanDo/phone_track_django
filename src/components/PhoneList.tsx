import { Phone, Trash2, Navigation } from 'lucide-react';
import type { TrackedPhone } from '../lib/database.types';
import { supabase } from '../lib/supabase';

interface PhoneListProps {
  phones: TrackedPhone[];
  onPhoneDeleted: () => void;
  onPhoneSelect: (phone: TrackedPhone) => void;
  selectedPhoneId: string | null;
}

export default function PhoneList({ phones, onPhoneDeleted, onPhoneSelect, selectedPhoneId }: PhoneListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to stop tracking this phone?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tracked_phones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onPhoneDeleted();
    } catch (err) {
      alert('Failed to delete phone');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (phones.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 text-center">No phones being tracked yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Tracked Phones ({phones.length})</h3>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {phones.map((phone) => (
          <div
            key={phone.id}
            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
              selectedPhoneId === phone.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => onPhoneSelect(phone)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{phone.label}</h4>
                    {selectedPhoneId === phone.id && (
                      <Navigation size={16} className="text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{phone.phone_number}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Lat: {phone.latitude}, Lng: {phone.longitude}</p>
                    <p>Updated: {formatDate(phone.last_updated)}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(phone.id);
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
