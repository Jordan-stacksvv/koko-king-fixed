import { Restaurant } from "@/data/menuItems";
import { MapPin, Edit2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocationSelectorProps {
  selectedRestaurant: Restaurant;
  restaurants: Restaurant[];
  onRestaurantChange: (restaurant: Restaurant) => void;
}

export const LocationSelector = ({
  selectedRestaurant,
  restaurants,
  onRestaurantChange,
}: LocationSelectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("Your current location");

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Restaurant & Delivery Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Restaurant</label>
              <div className="space-y-2">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => {
                      onRestaurantChange(restaurant);
                      setIsDialogOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedRestaurant.id === restaurant.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold">{restaurant.name}</div>
                    <div className="text-sm text-muted-foreground">{restaurant.address}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Delivery Address</label>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter delivery address"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
