import { useState, useCallback, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Restaurant } from "@/data/menuItems";
import { findNearestRestaurant, getAccurateLocation } from "@/lib/geolocation";

// Public Mapbox token (user can replace with their own)
const MAPBOX_TOKEN = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

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
}

export const MapLocationPicker = ({
  onLocationSelect,
  restaurants,
}: MapLocationPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [center, setCenter] = useState(defaultCenter);
  const [address, setAddress] = useState("Drag map to select location");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.lng, center.lat],
      zoom: 13,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
      }),
      "top-right"
    );

    // Add center marker
    marker.current = new mapboxgl.Marker({
      color: "#e94e1b",
      draggable: true,
    })
      .setLngLat([center.lng, center.lat])
      .addTo(map.current);

    // Update location when marker is dragged
    marker.current.on("dragend", () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        handleLocationChange(lngLat.lat, lngLat.lng);
      }
    });

    // Update location when map is clicked
    map.current.on("click", (e) => {
      handleLocationChange(e.lngLat.lat, e.lngLat.lng);
    });

    // Add restaurant markers
    restaurants.forEach((restaurant) => {
      const el = document.createElement("div");
      el.className = "w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg";
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
      
      new mapboxgl.Marker({ element: el })
        .setLngLat([restaurant.coordinates.lng, restaurant.coordinates.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<strong>${restaurant.name}</strong><br/>${restaurant.address}`)
        )
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      if (data.features && data.features[0]) {
        setAddress(data.features[0].place_name);
      } else {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (error) {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setCenter({ lat, lng });
    marker.current?.setLngLat([lng, lat]);
    map.current?.flyTo({ center: [lng, lat], zoom: 15 });
    reverseGeocode(lat, lng);
  };

  // Search location
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location to search");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?country=gh&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        handleLocationChange(lat, lng);
        setAddress(data.features[0].place_name);
        toast.success("Location found!");
      } else {
        toast.error("Location not found. Try a different search.");
      }
    } catch (error) {
      toast.error("Failed to search location");
    } finally {
      setIsSearching(false);
    }
  };

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
      handleLocationChange(newCenter.lat, newCenter.lng);
      toast.success("Location detected!");
    } catch (error) {
      toast.error("Could not get your location. Please search or select manually.");
    } finally {
      setIsGettingLocation(false);
      toast.dismiss();
    }
  };

  // Confirm location selection
  const handleConfirmLocation = () => {
    const nearestRestaurant = findNearestRestaurant(
      center.lat,
      center.lng,
      restaurants
    );

    if (nearestRestaurant) {
      onLocationSelect({
        address,
        lat: center.lat,
        lng: center.lng,
        nearestRestaurant,
      });
      toast.success(`Nearest branch: ${nearestRestaurant.name}`);
    } else {
      toast.error("No restaurant found nearby");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search location in Ghana..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          variant="secondary"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {/* Current Location Button */}
      <Button
        onClick={handleUseCurrentLocation}
        disabled={isGettingLocation}
        variant="outline"
        className="w-full"
      >
        <Navigation className="mr-2 h-4 w-4" />
        {isGettingLocation ? "Getting location..." : "Use My Current Location"}
      </Button>

      {/* Map Container */}
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden border-2 border-border">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Instruction Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border z-10">
          <p className="text-sm font-medium text-center">
            📍 Click or drag marker to select location
          </p>
        </div>
      </div>

      {/* Selected Location Display */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm mb-1">Selected Location:</p>
            <p className="text-sm text-muted-foreground break-words">{address}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <Button onClick={handleConfirmLocation} className="w-full" size="lg">
        Confirm Location & Find Nearest Restaurant
      </Button>

      {/* Restaurant List */}
      <div className="border-t pt-4">
        <p className="text-sm font-semibold mb-3">Available Restaurants:</p>
        <div className="space-y-2">
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => {
                handleLocationChange(
                  restaurant.coordinates.lat,
                  restaurant.coordinates.lng
                );
              }}
              className="w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <p className="font-semibold text-sm">{restaurant.name}</p>
              <p className="text-xs text-muted-foreground">{restaurant.address}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
