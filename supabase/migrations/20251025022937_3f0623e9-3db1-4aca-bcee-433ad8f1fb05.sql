-- Enable insert for system_events to track rover logs
CREATE POLICY "Public can insert system events" ON public.system_events
  FOR INSERT
  WITH CHECK (true);

-- Add index for faster queries on rover logs
CREATE INDEX IF NOT EXISTS idx_system_events_mode_type ON public.system_events(mode, event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_metadata_mission ON public.system_events USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_system_events_timestamp ON public.system_events(timestamp DESC);