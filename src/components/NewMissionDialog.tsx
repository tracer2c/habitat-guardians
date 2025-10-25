import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mission } from "@/hooks/useMissions";
import { toast } from "sonner";

interface NewMissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateMission: (mission: Omit<Mission, 'id' | 'created_at' | 'completed_at'>) => Promise<boolean>;
}

export const NewMissionDialog = ({ open, onOpenChange, onCreateMission }: NewMissionDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Mission['category']>("rover");
  const [priority, setPriority] = useState<Mission['priority']>("medium");
  const [duration, setDuration] = useState<string>("60");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Mission title is required");
      return;
    }

    setIsSubmitting(true);
    
    const newMission: Omit<Mission, 'id' | 'created_at' | 'completed_at'> = {
      title: title.trim(),
      description: description.trim() || null,
      category,
      priority,
      status: 'pending',
      estimated_duration: parseInt(duration) || 60,
      assigned_to: null,
      deadline: null
    };

    const success = await onCreateMission(newMission);
    
    if (success) {
      toast.success("Mission created successfully");
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("rover");
      setPriority("medium");
      setDuration("60");
      onOpenChange(false);
    } else {
      toast.error("Failed to create mission");
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] font-mono">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-wider">
            [NEW MISSION PROTOCOL]
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground">
              Mission Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter mission designation"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">
              Mission Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter mission objectives and details"
              className="font-mono min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs uppercase tracking-wider text-muted-foreground">
                Category
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value as Mission['category'])}>
                <SelectTrigger id="category" className="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rover">🤖 Rover Operation</SelectItem>
                  <SelectItem value="habitat">🏠 Habitat</SelectItem>
                  <SelectItem value="science">🔬 Science</SelectItem>
                  <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                  <SelectItem value="human">👨‍🚀 Human Mission</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-xs uppercase tracking-wider text-muted-foreground">
                Priority Level
              </Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Mission['priority'])}>
                <SelectTrigger id="priority" className="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-xs uppercase tracking-wider text-muted-foreground">
              Estimated Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Mission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};