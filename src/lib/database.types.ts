export interface Database {
  public: {
    Tables: {
      tracked_phones: {
        Row: {
          id: string;
          phone_number: string;
          label: string;
          latitude: number;
          longitude: number;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone_number: string;
          label?: string;
          latitude: number;
          longitude: number;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone_number?: string;
          label?: string;
          latitude?: number;
          longitude?: number;
          last_updated?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type TrackedPhone = Database['public']['Tables']['tracked_phones']['Row'];
