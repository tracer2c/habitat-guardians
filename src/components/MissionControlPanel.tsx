import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MissionCard } from "@/components/MissionCard";
import { RoverStatusCard } from "@/components/RoverStatusCard";
import { RoverMissionDialog } from "@/components/RoverMissionDialog";
import { NewMissionDialog } from "@/components/NewMissionDialog";
import { useMissions, Mission, Rover } from "@/hooks/useMissions";
import { Plus, Rocket, Activity } from "lucide-react";
import { toast } from "sonner";

export const MissionControlPanel = () => {
  const { missions, rovers, isLoading, updateMission, createMission } = useMissions();
  const [filter, setFilter] = useState<string>('all');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedRover, setSelectedRover] = useState<Rover | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMissionDialogOpen, setNewMissionDialogOpen] = useState(false);

  const handleStart = async (id: string) => {
    const mission = missions.find(m => m.id === id);
    if (!mission) return;

    // Find an available rover (idle or charging, not active on another mission)
    const availableRover = rovers.find(r => 
      (r.status === 'idle' || r.status === 'charging') && 
      !r.current_task_id
    );
    
    if (!availableRover) {
      toast.error("No rovers available - all rovers are busy or on missions");
      return;
    }

    // Update mission status first
    const success = await updateMission(id, { 
      status: 'in_progress',
      assigned_to: availableRover.rover_id 
    });
    
    if (success) {
      // Update the mission object with the new status
      const updatedMission = { ...mission, status: 'in_progress' as const, assigned_to: availableRover.rover_id };
      setSelectedMission(updatedMission);
      setSelectedRover(availableRover);
      setDialogOpen(true);
      toast.success("Mission started");
    }
  };

  const handleComplete = async (id: string) => {
    const success = await updateMission(id, { 
      status: 'completed',
      completed_at: new Date().toISOString()
    });
    if (success) {
      toast.success("Mission completed!");
    }
  };

  const handleCancel = async (id: string) => {
    const success = await updateMission(id, { status: 'failed' });
    if (success) {
      toast.error("Mission cancelled");
    }
  };

  const filteredMissions = missions.filter(m => 
    filter === 'all' || m.status === filter
  );

  const activeMissionsCount = missions.filter(m => m.status === 'in_progress').length;
  const pendingMissionsCount = missions.filter(m => m.status === 'pending').length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mission Control</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader className="bg-secondary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2 font-mono text-base tracking-wider">
                <Rocket className="h-5 w-5 text-primary" />
                [MISSION CONTROL]
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="default" className="font-mono">
                  <Activity className="h-3 w-3 mr-1" />
                  {activeMissionsCount} ACTIVE
                </Badge>
                <Badge variant="secondary" className="font-mono">
                  {pendingMissionsCount} PENDING
                </Badge>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setNewMissionDialogOpen(true)} className="font-mono">
              <Plus className="h-4 w-4 mr-2" />
              New Mission
            </Button>
          </div>
        </CardHeader>
      <CardContent>
        <Tabs defaultValue="missions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="rovers">Rovers</TabsTrigger>
          </TabsList>

          <TabsContent value="missions" className="space-y-4">
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={filter === 'pending' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending
              </Button>
              <Button 
                variant={filter === 'in_progress' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('in_progress')}
              >
                In Progress
              </Button>
              <Button 
                variant={filter === 'completed' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMissions.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-2 text-center py-8">
                  No missions found
                </p>
              ) : (
                filteredMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onStart={handleStart}
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="rovers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rovers.map((rover) => (
                <RoverStatusCard key={rover.id} rover={rover} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

        {selectedMission && selectedRover && (
          <RoverMissionDialog
            mission={selectedMission}
            rover={selectedRover}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        )}
      </Card>

      <NewMissionDialog
        open={newMissionDialogOpen}
        onOpenChange={setNewMissionDialogOpen}
        onCreateMission={createMission}
      />
    </>
  );
};
