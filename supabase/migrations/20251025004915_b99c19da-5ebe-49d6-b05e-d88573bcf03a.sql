-- Create environmental_readings table for time-series data
CREATE TABLE public.environmental_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  mode TEXT NOT NULL CHECK (mode IN ('mars', 'earth')),
  
  -- Core metrics
  temperature NUMERIC(5,2) NOT NULL,
  oxygen NUMERIC(5,2) NOT NULL,
  power NUMERIC(5,2) NOT NULL,
  
  -- Enhanced metrics
  humidity NUMERIC(5,2) NOT NULL,
  pressure NUMERIC(6,2) NOT NULL,
  co2_level NUMERIC(6,2),
  radiation NUMERIC(6,3),
  
  -- Computed score
  stability_score NUMERIC(5,2) NOT NULL,
  
  -- Metadata
  is_crisis BOOLEAN DEFAULT false,
  crisis_type TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_events table for alerts and logs
CREATE TABLE public.system_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  mode TEXT NOT NULL CHECK (mode IN ('mars', 'earth')),
  
  event_type TEXT NOT NULL CHECK (event_type IN ('alert', 'advisory', 'log', 'crisis')),
  severity TEXT CHECK (severity IN ('critical', 'warning', 'info')),
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Link to reading if applicable
  reading_id UUID REFERENCES public.environmental_readings(id) ON DELETE CASCADE,
  
  -- Additional data
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.environmental_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required for demo)
CREATE POLICY "Public can view all readings"
  ON public.environmental_readings
  FOR SELECT
  USING (true);

CREATE POLICY "Public can view all events"
  ON public.system_events
  FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_readings_timestamp ON public.environmental_readings(timestamp DESC);
CREATE INDEX idx_readings_mode ON public.environmental_readings(mode);
CREATE INDEX idx_events_timestamp ON public.system_events(timestamp DESC);
CREATE INDEX idx_events_type ON public.system_events(event_type);
CREATE INDEX idx_events_severity ON public.system_events(severity);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.environmental_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_events;