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

async function fetchRealWeather(latitude: number, longitude: number) {
  const apiKey = Deno.env.get('WEATHER_API_KEY');
  if (!apiKey) {
    throw new Error('WEATHER_API_KEY environment variable is not set');
  }
  
  const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=yes`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`WeatherAPI error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('WeatherAPI response:', JSON.stringify(data, null, 2));
    
    return {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      pressure: data.current.pressure_mb,
      windSpeed: data.current.wind_kph,
      airQualityIndex: data.current.air_quality?.['us-epa-index'] || 50, // EPA AQI scale 1-6
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data from WeatherAPI.com');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { mode = 'mars', latitude = 40.7128, longitude = -74.0060 } = await req.json();
    
    if (mode !== 'mars' && mode !== 'earth') {
      throw new Error('Invalid mode. Must be "mars" or "earth"');
    }

    let reading;

    if (mode === 'mars') {
      // Generate simulated Mars habitat data
      const state = marsState;
      reading = generateReading(mode, state);
    } else {
      // Fetch real weather data for Earth mode
      const weather = await fetchRealWeather(latitude, longitude);
      
      // Convert EPA AQI (1-6 scale) to percentage (higher is better)
      // 1=Good(100%), 2=Moderate(83%), 3=Unhealthy for sensitive(67%), 4=Unhealthy(50%), 5=Very Unhealthy(33%), 6=Hazardous(17%)
      const airQualityMap: { [key: number]: number } = { 1: 100, 2: 83, 3: 67, 4: 50, 5: 33, 6: 17 };
      const airQuality = airQualityMap[weather.airQualityIndex] || 70;
      
      // Calculate stability score based on weather conditions
      let stabilityScore = 100;
      
      // Temperature penalties (comfort range 15-25°C)
      if (weather.temperature < 15 || weather.temperature > 25) {
        stabilityScore -= Math.abs(weather.temperature - 20) * 2;
      }
      
      // Humidity penalties (comfort range 30-60%)
      if (weather.humidity < 30 || weather.humidity > 60) {
        stabilityScore -= Math.abs(weather.humidity - 45) * 1.5;
      }
      
      // Wind penalties (calm to moderate is ideal)
      if (weather.windSpeed > 30) {
        stabilityScore -= (weather.windSpeed - 30) * 2;
      }
      
      // Pressure penalties (normal range 980-1020 hPa)
      if (weather.pressure < 980 || weather.pressure > 1020) {
        stabilityScore -= Math.abs(weather.pressure - 1000) * 0.5;
      }
      
      stabilityScore = Math.max(0, Math.min(100, stabilityScore));
      
      reading = {
        mode: 'earth',
        temperature: Number(weather.temperature.toFixed(2)),
        oxygen: Number(airQuality.toFixed(2)),
        power: null,
        humidity: Number(weather.humidity.toFixed(2)),
        pressure: Number(weather.pressure.toFixed(2)),
        co2_level: 415, // Current global average CO2 level
        radiation: null,
        stability_score: Number(stabilityScore.toFixed(2)),
        is_crisis: false,
        crisis_type: null,
      };
    }

    // Insert reading
    const { data: insertedReading, error: readingError } = await supabase
      .from('environmental_readings')
      .insert(reading)
      .select()
      .single();

    if (readingError) throw readingError;

    // Generate events based on reading
    const events = [];

    if (mode === 'mars') {
      // Mars habitat-specific alerts
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

      if (reading.oxygen < 19.5) {
        events.push({
          mode,
          event_type: 'alert',
          severity: 'critical',
          title: 'Oxygen Critical',
          message: 'Oxygen levels below safe threshold',
          reading_id: insertedReading.id,
        });
      }

      if (reading.power !== null && reading.power < 30) {
        events.push({
          mode,
          event_type: 'alert',
          severity: 'critical',
          title: 'Power Critical',
          message: 'Power reserves critically low',
          reading_id: insertedReading.id,
        });
      } else if (reading.power !== null && reading.power < 50) {
        events.push({
          mode,
          event_type: 'alert',
          severity: 'warning',
          title: 'Power Warning',
          message: 'Power reserves declining',
          reading_id: insertedReading.id,
        });
      }
    } else {
      // Earth weather-specific alerts
      if (reading.temperature < 0) {
        events.push({
          mode,
          event_type: 'alert',
          severity: 'warning',
          title: 'Freezing Temperature',
          message: `Temperature dropped to ${reading.temperature}°C`,
          reading_id: insertedReading.id,
        });
      } else if (reading.temperature > 35) {
        events.push({
          mode,
          event_type: 'alert',
          severity: 'warning',
          title: 'Extreme Heat',
          message: `Temperature reached ${reading.temperature}°C`,
          reading_id: insertedReading.id,
        });
      }

      if (reading.humidity > 85) {
        events.push({
          mode,
          event_type: 'alert',
          severity: 'info',
          title: 'High Humidity',
          message: `Humidity at ${reading.humidity}% - rain likely`,
          reading_id: insertedReading.id,
        });
      }

      if (reading.pressure < 980) {
        events.push({
          mode,
          event_type: 'alert',
          severity: 'warning',
          title: 'Low Pressure System',
          message: 'Storm conditions possible',
          reading_id: insertedReading.id,
        });
      }
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
