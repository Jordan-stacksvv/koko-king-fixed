import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useState } from "react";

export const Hero = () => {
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const menuSection = document.getElementById("menu-section");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
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

            <div className="max-w-xl mx-auto bg-white rounded-full shadow-lg p-2 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-4">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter a location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12"
              >
                SEARCH
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
