import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SimulatorState {
  baseTemp: number;
  baseOxygen: number;
  basePower: number;
  baseHumidity: number;
  basePressure: number;
  trendOffset: number;
  crisisMode: boolean;
  crisisTimer: number;
}

const marsState: SimulatorState = {
  baseTemp: 20,
  baseOxygen: 21,
  basePower: 75,
  baseHumidity: 30,
  basePressure: 610,
  trendOffset: 0,
  crisisMode: false,
  crisisTimer: 0,
};

const earthState: SimulatorState = {
  baseTemp: 22,
  baseOxygen: 85,
  basePower: 70,
  baseHumidity: 55,
  basePressure: 1013,
  trendOffset: 0,
  crisisMode: false,
  crisisTimer: 0,
};

function generateReading(mode: 'mars' | 'earth', state: SimulatorState) {
  // Crisis management
  if (!state.crisisMode && Math.random() < 0.005) {
    state.crisisMode = true;
    state.crisisTimer = 20 + Math.floor(Math.random() * 20);
  }

  if (state.crisisMode) {
    state.crisisTimer--;
    if (state.crisisTimer <= 0) {
      state.crisisMode = false;
    }
  }

  // Trend offset
  state.trendOffset += (Math.random() - 0.5) * 0.5;
  state.trendOffset = Math.max(-5, Math.min(5, state.trendOffset));

  // Generate base values
  let temperature = state.baseTemp + state.trendOffset + (Math.random() - 0.5) * 2;
  let oxygen = state.baseOxygen + state.trendOffset * 0.5 + (Math.random() - 0.5) * 3;
  let power = state.basePower + state.trendOffset * 2 + (Math.random() - 0.5) * 5;
  let humidity = state.baseHumidity + (Math.random() - 0.5) * 5;
  let pressure = state.basePressure + (Math.random() - 0.5) * (mode === 'mars' ? 20 : 10);

  let crisisType = null;

  if (state.crisisMode) {
    const crisis = Math.floor(Math.random() * 3);
    if (crisis === 0) {
      oxygen -= 10 + Math.random() * 5;
      crisisType = 'oxygen_depletion';
    } else if (crisis === 1) {
      power -= 15 + Math.random() * 10;
      crisisType = 'power_failure';
    } else {
      temperature += 8 + Math.random() * 7;
      crisisType = 'thermal_spike';
    }
  }

  // Clamp values
  temperature = Math.max(0, Math.min(50, temperature));
  oxygen = Math.max(0, Math.min(mode === 'mars' ? 25 : 100, oxygen));
  power = Math.max(0, Math.min(100, power));
  humidity = Math.max(0, Math.min(100, humidity));
  pressure = Math.max(0, Math.min(mode === 'mars' ? 700 : 1100, pressure));

  // Calculate stability score
  let stabilityScore = 100;

  if (mode === 'mars') {
    if (temperature < 18 || temperature > 24) stabilityScore -= Math.abs(temperature - 21) * 3;
    if (oxygen < 19.5) stabilityScore -= (19.5 - oxygen) * 8;
    if (oxygen > 23) stabilityScore -= (oxygen - 23) * 5;
  } else {
    if (temperature < 18 || temperature > 26) stabilityScore -= Math.abs(temperature - 22) * 2.5;
    if (oxygen < 70) stabilityScore -= (70 - oxygen) * 1.5;
  }

  if (power < 40) stabilityScore -= (40 - power) * 3;
  if (power < 20) stabilityScore -= 20;

  stabilityScore = Math.max(0, Math.min(100, stabilityScore));

  return {
    mode,
    temperature: Number(temperature.toFixed(2)),
    oxygen: Number(oxygen.toFixed(2)),
    power: Number(power.toFixed(2)),
    humidity: Number(humidity.toFixed(2)),
    pressure: Number(pressure.toFixed(2)),
    co2_level: mode === 'earth' ? Number((400 + Math.random() * 200).toFixed(2)) : null,
    radiation: mode === 'mars' ? Number((0.2 + Math.random() * 0.3).toFixed(3)) : null,
    stability_score: Number(stabilityScore.toFixed(2)),
    is_crisis: state.crisisMode,
    crisis_type: crisisType,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { mode = 'mars' } = await req.json();
    
    if (mode !== 'mars' && mode !== 'earth') {
      throw new Error('Invalid mode. Must be "mars" or "earth"');
    }

    const state = mode === 'mars' ? marsState : earthState;
    const reading = generateReading(mode, state);

    // Insert reading
    const { data: insertedReading, error: readingError } = await supabase
      .from('environmental_readings')
      .insert(reading)
      .select()
      .single();

    if (readingError) throw readingError;

    // Generate events based on reading
    const events = [];

    if (reading.stability_score < 40) {
      events.push({
        mode,
        event_type: 'alert',
        severity: 'critical',
        title: 'Critical Stability',
        message: 'Habitat stability severely compromised',
        reading_id: insertedReading.id,
      });
    } else if (reading.stability_score < 60) {
      events.push({
        mode,
        event_type: 'alert',
        severity: 'warning',
        title: 'Stability Warning',
        message: 'Stability degrading',
        reading_id: insertedReading.id,
      });
    }

    if (mode === 'mars' && reading.oxygen < 19.5) {
      events.push({
        mode,
        event_type: 'alert',
        severity: 'critical',
        title: 'Oxygen Critical',
        message: 'Oxygen levels below safe threshold',
        reading_id: insertedReading.id,
      });
    } else if (mode === 'earth' && reading.oxygen < 60) {
      events.push({
        mode,
        event_type: 'alert',
        severity: 'critical',
        title: 'Air Quality Critical',
        message: 'Air quality dangerously low',
        reading_id: insertedReading.id,
      });
    }

    if (reading.power < 30) {
      events.push({
        mode,
        event_type: 'alert',
        severity: 'critical',
        title: 'Power Critical',
        message: 'Power reserves critically low',
        reading_id: insertedReading.id,
      });
    } else if (reading.power < 50) {
      events.push({
        mode,
        event_type: 'alert',
        severity: 'warning',
        title: 'Power Warning',
        message: 'Power reserves declining',
        reading_id: insertedReading.id,
      });
    }

    if (events.length > 0) {
      const { error: eventsError } = await supabase
        .from('system_events')
        .insert(events);

      if (eventsError) console.error('Error inserting events:', eventsError);
    }

    // Log crisis events
    if (reading.is_crisis && reading.crisis_type) {
      await supabase.from('system_events').insert({
        mode,
        event_type: 'crisis',
        severity: 'critical',
        title: `Crisis: ${reading.crisis_type.replace('_', ' ')}`,
        message: `System experiencing ${reading.crisis_type.replace('_', ' ')}`,
        reading_id: insertedReading.id,
      });
    }

    return new Response(
      JSON.stringify({ success: true, reading: insertedReading }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in simulate-environment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
