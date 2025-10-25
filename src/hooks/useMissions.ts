import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Mission {
  id: string;
  title: string;
  description: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  category: 'rover' | 'habitat' | 'science' | 'maintenance' | 'human';
  assigned_to: string | null;
  deadline: string | null;
  estimated_duration: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface Rover {
  id: string;
  rover_id: string;
  name: string;
  status: 'active' | 'idle' | 'charging' | 'maintenance' | 'offline';
  battery_level: number | null;
  location_x: number | null;
  location_y: number | null;
  current_task_id: string | null;
  last_updated: string;
}

export const useMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [rovers, setRovers] = useState<Rover[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMissions = async () => {
    const { data, error } = await supabase
      .from('mars_missions')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMissions(data as Mission[]);
    }
  };

  const fetchRovers = async () => {
    const { data, error } = await supabase
      .from('rover_status')
      .select('*');

    if (!error && data) {
      setRovers(data as Rover[]);
      
      // Auto-clear task IDs for idle/charging rovers (cleanup stuck assignments)
      const stuckRovers = (data as Rover[]).filter(r => 
        (r.status === 'idle' || r.status === 'charging') && r.current_task_id !== null
      );
      
      if (stuckRovers.length > 0) {
        for (const rover of stuckRovers) {
          await supabase
            .from('rover_status')
            .update({ current_task_id: null })
            .eq('rover_id', rover.rover_id);
        }
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await Promise.all([fetchMissions(), fetchRovers()]);
      setIsLoading(false);
    };

    initialize();

    // Subscribe to real-time updates
    const missionsChannel = supabase
      .channel('missions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mars_missions'
      }, () => {
        fetchMissions();
      })
      .subscribe();

    const roversChannel = supabase
      .channel('rovers-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rover_status'
      }, () => {
        fetchRovers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(missionsChannel);
      supabase.removeChannel(roversChannel);
    };
  }, []);

  const createMission = async (mission: Omit<Mission, 'id' | 'created_at' | 'completed_at'>) => {
    const { error } = await supabase
      .from('mars_missions')
      .insert([mission])
      .select()
      .single();

    if (error) {
      console.error('Error creating mission:', error);
      return false;
    }

    await fetchMissions();
    return true;
  };

  const updateMission = async (id: string, updates: Partial<Mission>) => {
    const { error } = await supabase
      .from('mars_missions')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating mission:', error);
      return false;
    }

    return true;
  };

  const deleteMission = async (id: string) => {
    const { error } = await supabase
      .from('mars_missions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting mission:', error);
      return false;
    }

    return true;
  };

  const updateRoverStatus = async (roverId: string, updates: Partial<Rover>) => {
    const { error } = await supabase
      .from('rover_status')
      .update(updates)
      .eq('rover_id', roverId);

    if (error) {
      console.error('Error updating rover:', error);
      return false;
    }

    return true;
  };

  return {
    missions,
    rovers,
    isLoading,
    createMission,
    updateMission,
    deleteMission,
    updateRoverStatus,
    refetch: () => Promise.all([fetchMissions(), fetchRovers()])
  };
};
