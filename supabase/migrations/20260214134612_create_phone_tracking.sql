/*
  # Phone Number Tracking System

  1. New Tables
    - `tracked_phones`
      - `id` (uuid, primary key) - Unique identifier for each tracked phone
      - `phone_number` (text) - Phone number being tracked
      - `label` (text) - Optional label/name for the phone
      - `latitude` (decimal) - Current latitude coordinate
      - `longitude` (decimal) - Current longitude coordinate
      - `last_updated` (timestamptz) - When the coordinates were last updated
      - `created_at` (timestamptz) - When the record was created
      - `user_id` (uuid) - Reference to the user who added this phone (optional for now)
  
  2. Security
    - Enable RLS on `tracked_phones` table
    - Add policy for public access (for demo purposes - in production, restrict to authenticated users)
    
  3. Indexes
    - Index on phone_number for quick lookups
    - Index on last_updated for sorting by recency
*/

CREATE TABLE IF NOT EXISTS tracked_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  label text DEFAULT '',
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tracked_phones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tracked phones"
  ON tracked_phones
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tracked phones"
  ON tracked_phones
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tracked phones"
  ON tracked_phones
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tracked phones"
  ON tracked_phones
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tracked_phones_phone_number ON tracked_phones(phone_number);
CREATE INDEX IF NOT EXISTS idx_tracked_phones_last_updated ON tracked_phones(last_updated DESC);