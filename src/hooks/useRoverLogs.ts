import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RoverLog {
  id: string;
  timestamp: string;
  message: string;
  event_type: string;
  severity: string | null;
  metadata: any;
  mission_id?: string;
  rover_id?: string;
}

export const useRoverLogs = (missionId?: string) => {
  const [logs, setLogs] = useState<RoverLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    const query = supabase
      .from('system_events')
      .select('*')
      .eq('mode', 'mars')
      .in('event_type', ['rover_activity', 'mission_update', 'system'])
      .order('timestamp', { ascending: false })
      .limit(100);

    const { data, error } = await query;

    if (!error && data) {
      // Filter by mission_id on client side if provided
      const filteredData = missionId 
        ? (data as RoverLog[]).filter(log => log.metadata?.mission_id === missionId)
        : data as RoverLog[];
      setLogs(filteredData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('rover-logs-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'system_events',
        filter: 'mode=eq.mars'
      }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [missionId]);

  const createLog = async (log: {
    message: string;
    event_type: string;
    severity?: string;
    metadata?: any;
  }) => {
    const { error } = await supabase
      .from('system_events')
      .insert([{
        mode: 'mars',
        title: log.event_type,
        message: log.message,
        event_type: log.event_type,
        severity: log.severity || 'info',
        metadata: log.metadata || {}
      }]);

    if (error) {
      console.error('Error creating log:', error);
      return false;
    }

    return true;
  };

  return {
    logs,
    isLoading,
    createLog,
    refetch: fetchLogs
  };
};
