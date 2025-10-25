import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

export const LOCATIONS: Location[] = [
  { name: "Kennedy Space Center, FL", latitude: 28.5729, longitude: -80.6490 },
  { name: "Johnson Space Center, TX", latitude: 29.5603, longitude: -95.0894 },
  { name: "Marshall Space Flight Center, AL", latitude: 34.6419, longitude: -86.6856 },
  { name: "Goddard Space Flight Center, MD", latitude: 38.9916, longitude: -76.8479 },
  { name: "Ames Research Center, CA", latitude: 37.4095, longitude: -122.0626 },
  { name: "Glenn Research Center, OH", latitude: 41.4132, longitude: -81.8622 },
  { name: "Langley Research Center, VA", latitude: 37.0956, longitude: -76.3866 },
  { name: "Stennis Space Center, MS", latitude: 30.3657, longitude: -89.6042 },
  { name: "Armstrong Flight Research Center, CA", latitude: 34.9584, longitude: -117.8847 },
  { name: "Jet Propulsion Laboratory, CA", latitude: 34.2011, longitude: -118.1718 },
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
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select NASA Center" />
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
