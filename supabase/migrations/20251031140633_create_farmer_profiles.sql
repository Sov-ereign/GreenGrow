-- Create Farmer Profiles and Core Tables
--
-- 1. New Tables
--    - farmer_profiles: Store farmer profile information
--    - crops: Track crops being grown
--    - weather_alerts: Store weather notifications
--    - market_prices: Current market price data
--    - recommendations: AI-generated farming recommendations
--
-- 2. Security
--    - Enable RLS on all tables
--    - Policies for authenticated users to manage their own data

CREATE TABLE IF NOT EXISTS farmer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone_number text,
  location text,
  farm_size numeric,
  language text DEFAULT 'English',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  area numeric NOT NULL,
  stage text,
  health_status text DEFAULT 'Good',
  days_to_harvest integer,
  expected_yield numeric,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weather_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  location text NOT NULL,
  alert_type text NOT NULL,
  severity text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  current_price numeric NOT NULL,
  previous_price numeric,
  market_location text NOT NULL,
  unit text DEFAULT 'per quintal',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium',
  category text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON farmer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON farmer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON farmer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own crops"
  ON crops FOR SELECT
  TO authenticated
  USING (farmer_id = auth.uid());

CREATE POLICY "Users can insert own crops"
  ON crops FOR INSERT
  TO authenticated
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Users can update own crops"
  ON crops FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Users can delete own crops"
  ON crops FOR DELETE
  TO authenticated
  USING (farmer_id = auth.uid());

CREATE POLICY "Users can view own weather alerts"
  ON weather_alerts FOR SELECT
  TO authenticated
  USING (farmer_id = auth.uid());

CREATE POLICY "Users can update own weather alerts"
  ON weather_alerts FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Anyone can view market prices"
  ON market_prices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (farmer_id = auth.uid());

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());
