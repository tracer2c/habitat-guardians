import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Location } from "@/components/LocationSelector";

export interface LocationData {
  temperature: number;
  humidity: number;
  oxygen: number;
  stabilityScore: number;
  pressure: number;
  co2_level?: number;
  timestamp: string;
}

export interface MultiLocationState {
  data: LocationData[];
  currentReading: LocationData | null;
  isLoading: boolean;
}

export const useMultiLocationData = (locations: Location[], isActive: boolean) => {
  const [locationStates, setLocationStates] = useState<Map<string, MultiLocationState>>(
    new Map()
  );

  const fetchLocationData = async (location: Location) => {
    try {
      const { data, error } = await supabase.functions.invoke('simulate-environment', {
        body: { 
          mode: 'earth',
          location: { latitude: location.latitude, longitude: location.longitude }
        }
      });

      if (error) throw error;

      const { data: latest } = await supabase
        .from('environmental_readings')
        .select('*')
        .eq('mode', 'earth')
        .order('timestamp', { ascending: false })
        .limit(20);

      const mapData = (readings: any[]): LocationData[] => {
        return readings.map(r => ({
          temperature: r.temperature,
          humidity: r.humidity,
          oxygen: r.oxygen,
          stabilityScore: r.stability_score,
          pressure: r.pressure,
          co2_level: r.co2_level,
          timestamp: r.timestamp
        }));
      };

      return {
        data: latest ? mapData(latest) : [],
        currentReading: latest?.[0] ? mapData([latest[0]])[0] : null,
        isLoading: false
      };
    } catch (error) {
      console.error('Error fetching location data:', error);
      return {
        data: [],
        currentReading: null,
        isLoading: false
      };
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const fetchAll = async () => {
      const newStates = new Map<string, MultiLocationState>();
      
      await Promise.all(
        locations.map(async (location) => {
          const state = await fetchLocationData(location);
          newStates.set(location.name, state);
        })
      );

      setLocationStates(newStates);
    };

    fetchAll();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [locations, isActive]);

  return locationStates;
};
