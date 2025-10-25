import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { LOCATIONS, Location } from "@/components/LocationSelector";
import { LocationCard } from "@/components/LocationCard";
import { useMultiLocationData } from "@/hooks/useMultiLocationData";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const MultiLocationDashboard = () => {
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([
    LOCATIONS[0],
    LOCATIONS[1]
  ]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const locationStates = useMultiLocationData(selectedLocations, autoRefresh);

  const addLocation = (location: Location) => {
    if (selectedLocations.length >= 4) {
      toast.error("Maximum 4 locations allowed");
      return;
    }
    if (selectedLocations.some(loc => loc.name === location.name)) {
      toast.error("Location already added");
      return;
    }
    setSelectedLocations([...selectedLocations, location]);
    toast.success(`Added ${location.name.split(',')[0]}`);
  };

  const removeLocation = (locationName: string) => {
    if (selectedLocations.length <= 1) {
      toast.error("At least one location required");
      return;
    }
    setSelectedLocations(selectedLocations.filter(loc => loc.name !== locationName));
    toast.success("Location removed");
  };

  const availableLocations = LOCATIONS.filter(
    loc => !selectedLocations.some(selected => selected.name === loc.name)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Multi-Location Comparison
              <span className="text-sm font-normal text-muted-foreground">
                ({selectedLocations.length}/4 locations)
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
              </Button>
              {selectedLocations.length < 4 && availableLocations.length > 0 && (
                <Select
                  value={availableLocations[0].name}
                  onValueChange={(value) => {
                    const location = availableLocations.find(loc => loc.name === value);
                    if (location) addLocation(location);
                  }}
                >
                  <Button asChild size="sm" variant="outline">
                    <SelectTrigger className="w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </SelectTrigger>
                  </Button>
                  <SelectContent>
                    {availableLocations.map((location) => (
                      <SelectItem key={location.name} value={location.name}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedLocations.map((location) => {
              const state = locationStates.get(location.name);
              const current = state?.currentReading;

              return (
                <LocationCard
                  key={location.name}
                  locationName={location.name}
                  temperature={current?.temperature || 0}
                  humidity={current?.humidity || 0}
                  airQuality={current?.oxygen || 0}
                  weatherScore={current?.stabilityScore || 0}
                  data={state?.data || []}
                  onRemove={() => removeLocation(location.name)}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
