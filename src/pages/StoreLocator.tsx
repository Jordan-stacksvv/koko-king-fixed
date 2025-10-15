import { Navbar } from "@/components/Navbar";
import { FloatingCart } from "@/components/FloatingCart";
import { MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { restaurants } from "@/data/menuItems";
import { Link } from "react-router-dom";

const StoreLocator = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = restaurants.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDirections = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Find Your Nearest</h1>
          <h2 className="text-3xl font-bold mb-8">Koko King Branch</h2>

          <div className="mb-8">
            <Input
              type="text"
              placeholder="Type your address or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md h-12"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {filteredStores.map((store) => (
                <div key={store.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-primary text-white rounded-full p-2">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">{store.name}</h3>
                      <p className="text-muted-foreground mb-3">{store.address}</p>

                      <div className="flex flex-wrap gap-4 mb-4">
                        <button
                          onClick={() => getDirections(store.address)}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <MapPin className="h-4 w-4" />
                          Directions
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-sm">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Open 24/7</span>
                      </div>

                      <Button className="w-full" asChild>
                        <Link to="/menu">START MY ORDER</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block">
              <div className="bg-gray-200 rounded-lg h-[600px] flex items-center justify-center sticky top-24">
                <div className="text-center p-8">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">Map View</p>
                  <p className="text-muted-foreground">
                    Interactive map with store locations would appear here
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">All Branches</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {restaurants.map((store) => (
                <div key={store.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-primary text-white rounded-full p-2">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold">{store.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{store.address}</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => getDirections(store.address)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FloatingCart />
    </div>
  );
};

export default StoreLocator;
