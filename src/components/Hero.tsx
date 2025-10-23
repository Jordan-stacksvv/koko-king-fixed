import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { requestUserLocation } from "@/lib/geolocation";
import { toast } from "sonner";

export const Hero = () => {
  const [location, setLocation] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    // Try to detect location on component mount
    setIsDetectingLocation(true);
    requestUserLocation()
      .then((position) => {
        setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        setIsDetectingLocation(false);
      })
      .catch(() => {
        setIsDetectingLocation(false);
      });
  }, []);

  const handleSearch = () => {
    if (!location) {
      toast.error("Please enter your location or allow location access");
      return;
    }
    const menuSection = document.getElementById("menu-section");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleUseMyLocation = () => {
    setIsDetectingLocation(true);
    requestUserLocation()
      .then((position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        toast.success("Location detected successfully!");
        setIsDetectingLocation(false);
      })
      .catch((error) => {
        toast.error("Unable to detect location. Please enter manually.");
        setIsDetectingLocation(false);
      });
  };

  return (
    <section className="relative bg-[#FFF5EB] py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Center: Search Form */}
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Craving a bite?
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                We've got you!
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-3">
              <div className="bg-white rounded-full shadow-lg p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-0">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder={isDetectingLocation ? "Detecting..." : "Enter location"}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isDetectingLocation}
                    className="flex-1 bg-transparent outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isDetectingLocation}
                  className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8 h-10 sm:h-12 text-sm sm:text-base"
                >
                  SEARCH
                </Button>
              </div>
              <button
                onClick={handleUseMyLocation}
                disabled={isDetectingLocation}
                className="text-sm text-primary hover:underline mx-auto block disabled:opacity-50"
              >
                {isDetectingLocation ? "Detecting..." : "📍 Use my current location"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
