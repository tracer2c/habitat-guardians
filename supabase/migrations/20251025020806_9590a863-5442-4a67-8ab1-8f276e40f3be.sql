-- Create dashboard_layouts table for storing user preferences
CREATE TABLE dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  mode TEXT NOT NULL,
  locations JSONB NOT NULL,
  layout_order INTEGER[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create mars_missions table for mission management
CREATE TABLE mars_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  category TEXT NOT NULL CHECK (category IN ('rover', 'habitat', 'science', 'maintenance')),
  assigned_to TEXT,
  deadline TIMESTAMPTZ,
  estimated_duration INTEGER,
  dependencies JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB
);

-- Create rover_status table for tracking rovers
CREATE TABLE rover_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rover_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'idle', 'charging', 'maintenance', 'offline')),
  battery_level NUMERIC,
  location_x NUMERIC,
  location_y NUMERIC,
  current_task_id UUID REFERENCES mars_missions(id),
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mars_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rover_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (demo mode)
CREATE POLICY "Public can view dashboard layouts" ON dashboard_layouts FOR SELECT USING (true);
CREATE POLICY "Public can insert dashboard layouts" ON dashboard_layouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update dashboard layouts" ON dashboard_layouts FOR UPDATE USING (true);

CREATE POLICY "Public can view missions" ON mars_missions FOR SELECT USING (true);
CREATE POLICY "Public can insert missions" ON mars_missions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update missions" ON mars_missions FOR UPDATE USING (true);
CREATE POLICY "Public can delete missions" ON mars_missions FOR DELETE USING (true);

CREATE POLICY "Public can view rover status" ON rover_status FOR SELECT USING (true);
CREATE POLICY "Public can insert rover status" ON rover_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update rover status" ON rover_status FOR UPDATE USING (true);

-- Enable realtime for missions and rover status
ALTER TABLE mars_missions REPLICA IDENTITY FULL;
ALTER TABLE rover_status REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE mars_missions;
ALTER PUBLICATION supabase_realtime ADD TABLE rover_status;

-- Insert initial rovers
INSERT INTO rover_status (rover_id, name, status, battery_level, location_x, location_y) VALUES
('rover_1', 'Perseverance', 'idle', 95, 0, 0),
('rover_2', 'Curiosity', 'idle', 87, 50, 30);

-- Insert sample missions
INSERT INTO mars_missions (title, description, priority, status, category, assigned_to, estimated_duration) VALUES
('Solar Panel Inspection', 'Check solar panel efficiency and clean dust', 'high', 'pending', 'maintenance', 'rover_1', 45),
('Soil Sample Collection', 'Collect samples from crater rim', 'medium', 'pending', 'science', 'rover_2', 120),
('Habitat Pressure Check', 'Verify airlock seals and pressure systems', 'critical', 'in_progress', 'habitat', 'automated', 30);