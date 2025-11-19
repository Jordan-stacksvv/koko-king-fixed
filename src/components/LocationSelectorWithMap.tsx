import { Restaurant } from "@/data/menuItems";
import { MapPin, Edit2, Navigation, Locate } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAccurateLocation, findNearestRestaurant } from "@/lib/geolocation";
import { toast } from "sonner";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("Your current location");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 5.6037, lng: -0.1870 }); // Accra default
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

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
                <div className="text-xs sm:text-sm text-muted-foreground">To:</div>
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
          
          <Tabs defaultValue="select" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Select Location</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="select" className="space-y-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleUseCurrentLocation} 
                disabled={isDetectingLocation}
                className="flex-1"
                variant="outline"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isDetectingLocation ? "Detecting..." : "Use My Current Location"}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Restaurant</label>
                  <div className="space-y-2">
                    {restaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        className={`border rounded-lg p-4 transition-all ${
                          selectedRestaurant.id === restaurant.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50 hover:shadow"
                        }`}
                      >
                        <button
                          onClick={() => {
                            onRestaurantChange(restaurant);
                            localStorage.setItem("selectedRestaurant", JSON.stringify(restaurant));
                          }}
                          className="w-full text-left"
                        >
                          <div className="font-semibold flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div>{restaurant.name}</div>
                              <div className="text-sm text-muted-foreground font-normal mt-1">
                                {restaurant.address}
                              </div>
                            </div>
                          </div>
                        </button>
                        <Button
                          onClick={() => getDirections(restaurant)}
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full text-primary hover:text-primary"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Get Directions
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter delivery address"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="bg-muted rounded-lg h-full min-h-[400px] flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedRestaurant.coordinates.lat},${selectedRestaurant.coordinates.lng}&zoom=15`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={() => setIsDialogOpen(false)} className="w-full">
              Confirm Selection
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="map" className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Search location or enter address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            
            <Button 
              onClick={handleUseCurrentLocation} 
              disabled={isDetectingLocation}
              variant="outline"
              className="w-full"
            >
              <Locate className="h-4 w-4 mr-2" />
              {isDetectingLocation ? "Detecting..." : "Use My Current Location"}
            </Button>
            
            {/* Interactive Map Display */}
            <div className="border rounded-lg overflow-hidden bg-muted">
              <div className="aspect-[16/9] relative">
                <iframe
                  src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&output=embed&z=13`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Delivery Location Map"
                  className="w-full h-full"
                />
              </div>
              <div className="p-4 bg-background">
                <h4 className="font-semibold mb-2">Selected Location</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {deliveryAddress || "Click on the map or use current location"}
                </p>
                
                <h4 className="font-semibold mb-2 mt-4">Nearby Restaurants</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {restaurants.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      onClick={() => {
                        onRestaurantChange(restaurant);
                        setMapCenter({ lat: restaurant.coordinates.lat, lng: restaurant.coordinates.lng });
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedRestaurant.id === restaurant.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{restaurant.name}</p>
                          <p className="text-xs text-muted-foreground">{restaurant.address}</p>
                        </div>
                        <Navigation className="h-4 w-4 text-primary" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <Button onClick={() => setIsDialogOpen(false)} className="w-full">
              Confirm Location
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      </DialogContent>
      </Dialog>
    </>
  );
};
