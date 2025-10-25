-- Seed sample data for Mars mode (last 10 minutes)
INSERT INTO environmental_readings (timestamp, mode, temperature, oxygen, power, humidity, pressure, co2_level, radiation, stability_score, is_crisis, crisis_type)
VALUES
  (NOW() - INTERVAL '10 minutes', 'mars', 21.5, 21.2, 85.3, 45.0, 610.0, NULL, 0.35, 87.5, false, NULL),
  (NOW() - INTERVAL '9.5 minutes', 'mars', 21.8, 21.0, 83.7, 44.5, 608.0, NULL, 0.38, 86.2, false, NULL),
  (NOW() - INTERVAL '9 minutes', 'mars', 22.1, 20.5, 82.1, 44.0, 607.0, NULL, 0.42, 84.8, false, NULL),
  (NOW() - INTERVAL '8.5 minutes', 'mars', 22.5, 19.8, 80.5, 43.5, 605.0, NULL, 0.45, 82.1, false, NULL),
  (NOW() - INTERVAL '8 minutes', 'mars', 23.0, 18.5, 78.2, 43.0, 603.0, NULL, 0.48, 78.3, true, 'oxygen_depletion'),
  (NOW() - INTERVAL '7.5 minutes', 'mars', 23.5, 17.2, 75.8, 42.5, 601.0, NULL, 0.51, 73.5, true, 'oxygen_depletion'),
  (NOW() - INTERVAL '7 minutes', 'mars', 22.8, 18.8, 77.5, 43.2, 604.0, NULL, 0.47, 79.8, false, NULL),
  (NOW() - INTERVAL '6.5 minutes', 'mars', 22.2, 20.1, 80.3, 44.1, 606.0, NULL, 0.43, 84.5, false, NULL),
  (NOW() - INTERVAL '6 minutes', 'mars', 21.6, 21.5, 83.8, 44.8, 609.0, NULL, 0.39, 88.2, false, NULL),
  (NOW() - INTERVAL '5.5 minutes', 'mars', 21.0, 22.1, 86.5, 45.5, 611.0, NULL, 0.36, 90.5, false, NULL),
  (NOW() - INTERVAL '5 minutes', 'mars', 20.5, 22.5, 88.2, 46.0, 612.0, NULL, 0.33, 92.1, false, NULL),
  (NOW() - INTERVAL '4.5 minutes', 'mars', 20.2, 22.8, 89.5, 46.5, 613.0, NULL, 0.31, 93.5, false, NULL),
  (NOW() - INTERVAL '4 minutes', 'mars', 19.8, 23.0, 90.1, 47.0, 614.0, NULL, 0.29, 94.2, false, NULL),
  (NOW() - INTERVAL '3.5 minutes', 'mars', 19.5, 22.7, 88.8, 46.8, 613.5, NULL, 0.30, 93.8, false, NULL),
  (NOW() - INTERVAL '3 minutes', 'mars', 24.8, 22.5, 87.5, 46.5, 613.0, NULL, 0.32, 55.2, true, 'thermal_spike'),
  (NOW() - INTERVAL '2.5 minutes', 'mars', 26.5, 22.2, 85.8, 46.0, 612.0, NULL, 0.34, 48.3, true, 'thermal_spike'),
  (NOW() - INTERVAL '2 minutes', 'mars', 23.2, 22.0, 84.2, 45.5, 611.0, NULL, 0.36, 82.5, false, NULL),
  (NOW() - INTERVAL '1.5 minutes', 'mars', 21.8, 21.8, 85.5, 45.2, 610.5, NULL, 0.37, 87.8, false, NULL),
  (NOW() - INTERVAL '1 minute', 'mars', 21.2, 21.5, 86.8, 45.0, 610.0, NULL, 0.38, 89.5, false, NULL),
  (NOW() - INTERVAL '30 seconds', 'mars', 20.8, 21.3, 87.5, 44.8, 609.5, NULL, 0.39, 90.8, false, NULL);

-- Seed sample data for Earth mode (last 10 minutes)
INSERT INTO environmental_readings (timestamp, mode, temperature, oxygen, power, humidity, pressure, co2_level, radiation, stability_score, is_crisis, crisis_type)
VALUES
  (NOW() - INTERVAL '10 minutes', 'earth', 22.5, 78.5, 82.3, 55.0, 1013.0, 450.0, NULL, 85.2, false, NULL),
  (NOW() - INTERVAL '9.5 minutes', 'earth', 23.0, 77.8, 81.5, 54.5, 1012.5, 465.0, NULL, 83.8, false, NULL),
  (NOW() - INTERVAL '9 minutes', 'earth', 23.5, 76.5, 80.2, 54.0, 1012.0, 480.0, NULL, 81.5, false, NULL),
  (NOW() - INTERVAL '8.5 minutes', 'earth', 24.0, 75.0, 78.8, 53.5, 1011.5, 495.0, NULL, 78.9, false, NULL),
  (NOW() - INTERVAL '8 minutes', 'earth', 24.5, 73.2, 76.5, 53.0, 1011.0, 510.0, NULL, 75.3, false, NULL),
  (NOW() - INTERVAL '7.5 minutes', 'earth', 25.0, 71.5, 74.2, 52.5, 1010.5, 525.0, NULL, 71.8, false, NULL),
  (NOW() - INTERVAL '7 minutes', 'earth', 25.5, 68.8, 71.5, 52.0, 1010.0, 545.0, NULL, 67.2, true, 'air_quality_drop'),
  (NOW() - INTERVAL '6.5 minutes', 'earth', 25.2, 70.5, 73.8, 52.5, 1010.5, 535.0, NULL, 72.5, false, NULL),
  (NOW() - INTERVAL '6 minutes', 'earth', 24.8, 72.8, 76.5, 53.0, 1011.0, 520.0, NULL, 77.8, false, NULL),
  (NOW() - INTERVAL '5.5 minutes', 'earth', 24.2, 75.2, 79.2, 53.5, 1011.5, 505.0, NULL, 82.5, false, NULL),
  (NOW() - INTERVAL '5 minutes', 'earth', 23.8, 77.5, 81.8, 54.0, 1012.0, 490.0, NULL, 86.2, false, NULL),
  (NOW() - INTERVAL '4.5 minutes', 'earth', 23.2, 79.8, 84.5, 54.5, 1012.5, 475.0, NULL, 89.5, false, NULL),
  (NOW() - INTERVAL '4 minutes', 'earth', 22.8, 81.5, 86.8, 55.0, 1013.0, 460.0, NULL, 91.8, false, NULL),
  (NOW() - INTERVAL '3.5 minutes', 'earth', 22.5, 82.8, 88.5, 55.5, 1013.5, 445.0, NULL, 93.5, false, NULL),
  (NOW() - INTERVAL '3 minutes', 'earth', 22.2, 83.5, 89.8, 56.0, 1014.0, 435.0, NULL, 94.8, false, NULL),
  (NOW() - INTERVAL '2.5 minutes', 'earth', 22.0, 84.2, 62.5, 56.5, 1014.5, 430.0, NULL, 68.5, true, 'power_failure'),
  (NOW() - INTERVAL '2 minutes', 'earth', 22.5, 83.8, 75.8, 56.2, 1014.2, 435.0, NULL, 82.8, false, NULL),
  (NOW() - INTERVAL '1.5 minutes', 'earth', 22.8, 83.2, 82.5, 55.8, 1013.8, 440.0, NULL, 87.5, false, NULL),
  (NOW() - INTERVAL '1 minute', 'earth', 23.0, 82.5, 85.2, 55.5, 1013.5, 445.0, NULL, 89.8, false, NULL),
  (NOW() - INTERVAL '30 seconds', 'earth', 23.2, 81.8, 86.8, 55.2, 1013.2, 450.0, NULL, 90.5, false, NULL);

-- Insert corresponding system events for crisis readings
INSERT INTO system_events (timestamp, mode, event_type, title, severity, message, reading_id)
SELECT 
  r.timestamp,
  r.mode,
  'alert',
  CASE 
    WHEN r.crisis_type = 'oxygen_depletion' THEN 'Oxygen Level Critical'
    WHEN r.crisis_type = 'thermal_spike' THEN 'Temperature Spike Detected'
    WHEN r.crisis_type = 'air_quality_drop' THEN 'Air Quality Degraded'
    WHEN r.crisis_type = 'power_failure' THEN 'Power System Alert'
  END,
  'critical',
  CASE 
    WHEN r.crisis_type = 'oxygen_depletion' THEN 'Oxygen levels have dropped to ' || ROUND(r.oxygen::numeric, 1) || '%. Immediate action required.'
    WHEN r.crisis_type = 'thermal_spike' THEN 'Temperature has risen to ' || ROUND(r.temperature::numeric, 1) || '°C. Cooling systems activated.'
    WHEN r.crisis_type = 'air_quality_drop' THEN 'Air quality index dropped to ' || ROUND(r.oxygen::numeric, 1) || '. Ventilation systems engaged.'
    WHEN r.crisis_type = 'power_failure' THEN 'Power output decreased to ' || ROUND(r.power::numeric, 1) || '%. Backup systems online.'
  END,
  r.id
FROM environmental_readings r
WHERE r.is_crisis = true;