import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import PhoneTrackingForm from './components/PhoneTrackingForm';
import PhoneList from './components/PhoneList';
import PhoneMap from './components/PhoneMap';
import { supabase } from './lib/supabase';
import type { TrackedPhone } from './lib/database.types';

function App() {
  const [phones, setPhones] = useState<TrackedPhone[]>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPhones = async () => {
    try {
      const { data, error } = await supabase
        .from('tracked_phones')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setPhones(data || []);
    } catch (error) {
      console.error('Error fetching phones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhones();

    const channel = supabase
      .channel('tracked_phones_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tracked_phones',
        },
        () => {
          fetchPhones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePhoneSelect = (phone: TrackedPhone) => {
    setSelectedPhoneId(phone.id === selectedPhoneId ? null : phone.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Smartphone size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Phone Tracker</h1>
              <p className="text-sm text-gray-600">Track phone locations on an interactive map</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <PhoneTrackingForm onPhoneAdded={fetchPhones} />
              <PhoneList
                phones={phones}
                onPhoneDeleted={fetchPhones}
                onPhoneSelect={handlePhoneSelect}
                selectedPhoneId={selectedPhoneId}
              />
            </div>

            <div className="lg:col-span-2">
              <PhoneMap phones={phones} selectedPhoneId={selectedPhoneId} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
