import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnvironmentalData, HabitatMode, Alert, Advisory } from '@/lib/dataSimulator';
import { useToast } from '@/hooks/use-toast';

export const useEnvironmentData = (
  mode: HabitatMode, 
  isRunning: boolean, 
  location?: { latitude: number; longitude: number }
) => {
  const [data, setData] = useState<EnvironmentalData[]>([]);
  const [currentReading, setCurrentReading] = useState<EnvironmentalData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const { toast } = useToast();

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    const { data: readings, error } = await supabase
      .from('environmental_readings')
      .select('*')
      .eq('mode', mode)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching readings:', error);
      return;
    }

    if (readings) {
      const formattedData = readings
        .reverse()
        .map((r: any) => ({
          id: r.id,
          timestamp: new Date(r.timestamp),
          mode: r.mode,
          temperature: r.temperature,
          oxygen: r.oxygen,
          power: r.power,
          humidity: r.humidity,
          pressure: r.pressure,
          co2_level: r.co2_level,
          radiation: r.radiation,
          stabilityScore: r.stability_score,
          is_crisis: r.is_crisis,
          crisis_type: r.crisis_type,
        }));
      setData(formattedData);
      if (formattedData.length > 0) {
        setCurrentReading(formattedData[formattedData.length - 1]);
      }
    }
  }, [mode]);

  // Fetch recent alerts
  const fetchAlerts = useCallback(async () => {
    const { data: events, error } = await supabase
      .from('system_events')
      .select('*')
      .eq('mode', mode)
      .eq('event_type', 'alert')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching alerts:', error);
      return;
    }

    if (events) {
      const formattedAlerts: Alert[] = events.map((e: any) => ({
        id: e.id,
        severity: e.severity as 'critical' | 'warning' | 'info',
        message: e.message,
        timestamp: new Date(e.timestamp),
      }));
      setAlerts(formattedAlerts);
    }
  }, [mode]);

  // Generate AI advisory
  const generateAdvisory = useCallback(async (reading: EnvironmentalData, recentAlerts: Alert[]) => {
    try {
      const { data: advisoryData, error } = await supabase.functions.invoke('generate-advisory', {
        body: {
          mode,
          currentReading: reading,
          recentAlerts: recentAlerts.slice(0, 5), // Last 5 alerts for context
        },
      });

      if (error) throw error;
      
      if (advisoryData?.advisory) {
        setAdvisory(advisoryData.advisory);
      }
    } catch (error) {
      console.error('Error generating advisory:', error);
      // Don't show error toast for advisory generation to avoid spam
    }
  }, [mode]);

  // Trigger simulation
  const triggerSimulation = useCallback(async (location?: { latitude: number; longitude: number }) => {
    try {
      const body: any = { mode };
      if (location && mode === 'earth') {
        body.latitude = location.latitude;
        body.longitude = location.longitude;
      }
      
      const { error } = await supabase.functions.invoke('simulate-environment', {
        body,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error triggering simulation:', error);
      toast({
        title: 'Simulation Error',
        description: 'Failed to generate environmental data',
        variant: 'destructive',
      });
    }
  }, [mode, toast]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchInitialData();
    fetchAlerts();

    const readingsChannel = supabase
      .channel('environmental_readings_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'environmental_readings',
          filter: `mode=eq.${mode}`,
        },
        (payload) => {
          const newReading: EnvironmentalData = {
            id: payload.new.id,
            timestamp: new Date(payload.new.timestamp),
            mode: payload.new.mode,
            temperature: payload.new.temperature,
            oxygen: payload.new.oxygen,
            power: payload.new.power,
            humidity: payload.new.humidity,
            pressure: payload.new.pressure,
            co2_level: payload.new.co2_level,
            radiation: payload.new.radiation,
            stabilityScore: payload.new.stability_score,
            is_crisis: payload.new.is_crisis,
            crisis_type: payload.new.crisis_type,
          };

          setData((prev) => {
            const updated = [...prev, newReading];
            return updated.slice(-50); // Keep last 50 readings
          });
          setCurrentReading(newReading);
          
          // Generate new advisory when readings update
          if (alerts.length > 0 || newReading.stabilityScore < 80 || newReading.is_crisis) {
            generateAdvisory(newReading, alerts);
          }
        }
      )
      .subscribe();

    const eventsChannel = supabase
      .channel('system_events_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_events',
          filter: `mode=eq.${mode}`,
        },
        (payload) => {
          if (payload.new.event_type === 'alert') {
            const newAlert: Alert = {
              id: payload.new.id,
              severity: payload.new.severity as 'critical' | 'warning' | 'info',
              message: payload.new.message,
              timestamp: new Date(payload.new.timestamp),
            };

            setAlerts((prev) => {
              const updated = [newAlert, ...prev];
              return updated.slice(0, 10); // Keep last 10 alerts
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(readingsChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [mode, fetchInitialData, fetchAlerts, generateAdvisory]);

  // Generate advisory when readings or alerts change significantly
  useEffect(() => {
    if (currentReading && (alerts.length > 0 || currentReading.stabilityScore < 80 || currentReading.is_crisis)) {
      // Debounce advisory generation to avoid too many calls
      const timer = setTimeout(() => {
        generateAdvisory(currentReading, alerts);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentReading, alerts, generateAdvisory]);

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      triggerSimulation(location);
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [isRunning, triggerSimulation, location]);

  return {
    data,
    currentReading,
    alerts,
    advisory,
    triggerSimulation,
  };
};
