import { Restaurant } from "@/data/menuItems";
import { MapPin, Edit2, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAccurateLocation, findNearestRestaurant } from "@/lib/geolocation";
import { toast } from "sonner";
import { MapLocationPicker } from "./MapLocationPicker";
import { useBranchData } from "@/hooks/useBranchData";

interface LocationSelectorProps {
  selectedRestaurant: Restaurant;
  restaurants: Restaurant[];
  onRestaurantChange: (restaurant: Restaurant) => void;
}

export const LocationSelectorWithMap = ({
  selectedRestaurant,
  restaurants,
  onRestaurantChange,
}: LocationSelectorProps) => {
  const { loadBranches } = useBranchData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("Your current location");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Sync with latest branch data
  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const handleUseCurrentLocation = async () => {
    setIsDetectingLocation(true);
    toast.loading("Detecting your location...");
    
    try {
      const position = await getAccurateLocation();
      const nearest = findNearestRestaurant(
        position.coords.latitude,
        position.coords.longitude,
        restaurants
      );
      
      if (nearest) {
        onRestaurantChange(nearest);
        localStorage.setItem("selectedRestaurant", JSON.stringify(nearest));
        setDeliveryAddress("Your current location");
        toast.success(`Nearest branch: ${nearest.name}`);
      }
    } catch (error) {
      toast.error("Could not detect location. Please select manually.");
    } finally {
      setIsDetectingLocation(false);
      toast.dismiss();
    }
  };

  const handleLocationSelect = (location: {
    address: string;
    lat: number;
    lng: number;
    nearestRestaurant: Restaurant;
  }) => {
    setDeliveryAddress(location.address);
    setDeliveryCoords({ lat: location.lat, lng: location.lng });
    onRestaurantChange(location.nearestRestaurant);
    localStorage.setItem("selectedRestaurant", JSON.stringify(location.nearestRestaurant));
    localStorage.setItem("deliveryAddress", location.address);
    localStorage.setItem("selectedLocation", location.address); // Sync to checkout
    localStorage.setItem("deliveryCoords", JSON.stringify({ lat: location.lat, lng: location.lng }));
    setIsDialogOpen(false);
    toast.success("Delivery address updated!");
  };

  const getDirections = (restaurant: Restaurant) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates.lat},${restaurant.coordinates.lng}`,
      '_blank'
    );
  };

  return (
    <>
      <section className="py-3 sm:py-4 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 max-w-4xl">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm sm:text-base">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span>DELIVERY</span>
            </div>
            <div className="flex-1 w-full flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setIsDialogOpen(true)}
                className="flex-1 min-w-0 text-left hover:bg-muted/50 rounded-lg p-2 transition-colors"
              >
                <div className="text-xs sm:text-sm text-muted-foreground">From:</div>
                <div className="font-semibold text-foreground text-xs sm:text-base truncate">{selectedRestaurant.name.toUpperCase()}</div>
              </button>
              <button 
                onClick={() => setIsDialogOpen(true)}
                className="flex-1 min-w-0 text-left hover:bg-muted/50 rounded-lg p-2 transition-colors"
              >
                <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  To:
                </div>
                <div className="font-semibold text-foreground text-xs sm:text-base truncate">{deliveryAddress}</div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDialogOpen(true)}
                className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
              >
                <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Restaurant & Delivery Location</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <MapLocationPicker 
              restaurants={restaurants}
              onLocationSelect={handleLocationSelect}
            />

            <Button
              onClick={handleUseCurrentLocation}
              disabled={isDetectingLocation}
              variant="outline"
              className="w-full"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Use My Current Location
            </Button>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Available Restaurants</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.name}
                    onClick={() => {
                      onRestaurantChange(restaurant);
                      localStorage.setItem("selectedRestaurant", JSON.stringify(restaurant));
                      setIsDialogOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-md ${
                      restaurant.name === selectedRestaurant.name
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-sm">{restaurant.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{restaurant.address}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{restaurant.coordinates.lat.toFixed(4)}, {restaurant.coordinates.lng.toFixed(4)}</span>
                    </div>
                    {restaurant.name === selectedRestaurant.name && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          getDirections(restaurant);
                        }}
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                      >
                        <Navigation className="mr-2 h-3 w-3" />
                        Get Directions
                      </Button>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
