-- Add rover-related event types to the system_events table
-- This allows the system to log rover activities, mission updates, and system events

ALTER TABLE system_events DROP CONSTRAINT IF EXISTS system_events_event_type_check;

ALTER TABLE system_events ADD CONSTRAINT system_events_event_type_check 
CHECK (event_type IN ('alert', 'advisory', 'log', 'crisis', 'rover_activity', 'mission_update', 'system'));