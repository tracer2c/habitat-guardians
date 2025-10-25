import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

export const LOCATIONS: Location[] = [
  { name: "New York, USA", latitude: 40.7128, longitude: -74.0060 },
  { name: "London, UK", latitude: 51.5074, longitude: -0.1278 },
  { name: "Tokyo, Japan", latitude: 35.6762, longitude: 139.6503 },
  { name: "Sydney, Australia", latitude: -33.8688, longitude: 151.2093 },
  { name: "Mumbai, India", latitude: 19.0760, longitude: 72.8777 },
  { name: "São Paulo, Brazil", latitude: -23.5505, longitude: -46.6333 },
  { name: "Dubai, UAE", latitude: 25.2048, longitude: 55.2708 },
  { name: "Paris, France", latitude: 48.8566, longitude: 2.3522 },
  { name: "Singapore", latitude: 1.3521, longitude: 103.8198 },
  { name: "Los Angeles, USA", latitude: 34.0522, longitude: -118.2437 },
];

interface LocationSelectorProps {
  selectedLocation: Location;
  onLocationChange: (location: Location) => void;
}

export const LocationSelector = ({ selectedLocation, onLocationChange }: LocationSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedLocation.name}
        onValueChange={(value) => {
          const location = LOCATIONS.find((loc) => loc.name === value);
          if (location) onLocationChange(location);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          {LOCATIONS.map((location) => (
            <SelectItem key={location.name} value={location.name}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
