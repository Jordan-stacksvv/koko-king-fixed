import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MapPin, Navigation, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Restaurant } from "@/data/menuItems";
import { findNearestRestaurant, getAccurateLocation } from "@/lib/geolocation";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 5.6037,
  lng: -0.1870,
};

interface MapLocationPickerProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
    nearestRestaurant: Restaurant;
  }) => void;
  restaurants: Restaurant[];
  initialCenter?: { lat: number; lng: number };
}

export const MapLocationPicker = ({
  onLocationSelect,
  restaurants,
  initialCenter,
}: MapLocationPickerProps) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8",
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(initialCenter || defaultCenter);
  const [address, setAddress] = useState("Drag map or search location");
  const [searchInput, setSearchInput] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    });
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (isLoaded && searchInputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          componentRestrictions: { country: "gh" }, // Ghana
          fields: ["formatted_address", "geometry", "name"],
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          const newCenter = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setCenter(newCenter);
          map?.panTo(newCenter);
          setAddress(place.formatted_address || "");
          setSearchInput("");
        }
      });
    }
  }, [isLoaded, map]);

  // Handle map drag end - reverse geocode new center
  const handleMapIdle = useCallback(() => {
    if (map) {
      const newCenter = map.getCenter();
      if (newCenter) {
        const lat = newCenter.lat();
        const lng = newCenter.lng();
        setCenter({ lat, lng });
        reverseGeocode(lat, lng);
      }
    }
  }, [map, reverseGeocode]);

  // Use current location
  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    toast.loading("Getting your location...");

    try {
      const position = await getAccurateLocation();
      const newCenter = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCenter(newCenter);
      map?.panTo(newCenter);
      reverseGeocode(newCenter.lat, newCenter.lng);
      toast.success("Location detected!");
    } catch (error) {
      toast.error("Could not detect location. Please search or drag map.");
    } finally {
      setIsGettingLocation(false);
      toast.dismiss();
    }
  };

  // Confirm location selection
  const handleConfirmLocation = () => {
    const nearest = findNearestRestaurant(center.lat, center.lng, restaurants);
    if (nearest) {
      onLocationSelect({
        address,
        lat: center.lat,
        lng: center.lng,
        nearestRestaurant: nearest,
      });
      toast.success(`Nearest branch: ${nearest.name}`);
    } else {
      toast.error("No nearby restaurant found");
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] gap-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search or drop pin on map"
          className="pl-10 pr-4"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Use Current Location Button */}
      <Button
        onClick={handleUseCurrentLocation}
        disabled={isGettingLocation}
        variant="outline"
        className="w-full"
      >
        <Navigation className="h-4 w-4 mr-2" />
        {isGettingLocation ? "Detecting..." : "Use My Current Location"}
      </Button>

      {/* Map Container */}
      <div className="flex-1 relative rounded-lg overflow-hidden border">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onIdle={handleMapIdle}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {/* Center Pin Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
            <MapPin className="h-10 w-10 text-primary drop-shadow-lg" fill="currentColor" />
          </div>
        </GoogleMap>
      </div>

      {/* Address Display */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Selected Location</p>
            <p className="text-xs text-muted-foreground mt-1">{address}</p>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <Button onClick={handleConfirmLocation} className="w-full" size="lg">
        Confirm Location
      </Button>
    </div>
  );
};
