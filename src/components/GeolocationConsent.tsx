import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { requestUserLocation, findNearestRestaurant } from "@/lib/geolocation";
import { restaurants } from "@/data/menuItems";
import { toast } from "sonner";

export const GeolocationConsent = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already granted/denied location permission
    const hasSeenPrompt = localStorage.getItem("geolocationPromptSeen");
    const savedLocation = localStorage.getItem("selectedRestaurant");

    // Show prompt only if user hasn't seen it and hasn't selected a location
    if (!hasSeenPrompt && !savedLocation) {
      // Delay slightly to allow page to load
      setTimeout(() => {
        setIsOpen(true);
      }, 1000);
    }
  }, []);

  const handleAllow = async () => {
    try {
      toast.loading("Detecting your location...");
      const position = await requestUserLocation();
      
      const nearest = findNearestRestaurant(
        position.coords.latitude,
        position.coords.longitude,
        restaurants
      );

      if (nearest) {
        localStorage.setItem("selectedRestaurant", JSON.stringify(nearest));
        localStorage.setItem("deliveryCoords", JSON.stringify({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
        localStorage.setItem("selectedLocation", "Your current location");
        toast.dismiss();
        toast.success(`Nearest branch: ${nearest.name}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Location access denied. You can manually select your location.");
    } finally {
      localStorage.setItem("geolocationPromptSeen", "true");
      setIsOpen(false);
    }
  };

  const handleDeny = () => {
    localStorage.setItem("geolocationPromptSeen", "true");
    setIsOpen(false);
    toast.info("You can select your location manually from the menu.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Navigation className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Enable Location Services
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            We need your location to find the nearest Koko King restaurant and calculate accurate delivery fees based on your distance.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleAllow}
            className="w-full"
            size="lg"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Allow Location Access
          </Button>
          <Button 
            onClick={handleDeny}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Select Location Manually
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center pt-2">
          Your location is only used to enhance your ordering experience.
        </p>
      </DialogContent>
    </Dialog>
  );
};
