import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { MenuItem } from "@/components/MenuItem";
import { FloatingCart } from "@/components/FloatingCart";
import { LocationSelector } from "@/components/LocationSelector";
import { categories, menuItems, restaurants } from "@/data/menuItems";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { requestUserLocation, findNearestRestaurant } from "@/lib/geolocation";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);
  const { toast } = useToast();

  // Request user location on mount and find nearest restaurant
  useEffect(() => {
    // Show location request notification
    toast({
      title: "Location Access",
      description: "We need your location to show nearby branches and deliver to you.",
      duration: 5000,
    });

    requestUserLocation()
      .then((position) => {
        const { latitude, longitude } = position.coords;
        const nearest = findNearestRestaurant(latitude, longitude, restaurants);
        setSelectedRestaurant(nearest);
        toast({
          title: "✓ Location detected",
          description: `Showing menu from ${nearest.name}`,
          duration: 3000,
        });
      })
      .catch((error) => {
        console.log("Location access denied or unavailable:", error);
        toast({
          title: "Location Required",
          description: "Please allow location access for accurate delivery and to find your nearest branch.",
          variant: "destructive",
          duration: 7000,
        });
      });
  }, [toast]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRestaurant = item.restaurantId === selectedRestaurant.id;
    return matchesCategory && matchesSearch && matchesRestaurant;
  });

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Scroll to menu section smoothly
    const menuSection = document.getElementById("menu-section");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Category Carousel */}
      <section className="py-8 bg-white">
        <CategoryCarousel categories={categories} onCategoryClick={handleCategoryClick} />
      </section>

      {/* Location Selector */}
      <LocationSelector
        selectedRestaurant={selectedRestaurant}
        restaurants={restaurants}
        onRestaurantChange={setSelectedRestaurant}
      />

      {/* Search Bar */}
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your favorite food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-12 rounded-full bg-white shadow-sm text-sm sm:text-base"
            />
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu-section" className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Left Sidebar - Categories - Desktop Only */}
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <h2 className="text-xl font-bold mb-4">Categories</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === "all"
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-muted"
                    }`}
                  >
                    All Items
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {selectedCategory === "all" 
                    ? "All Items" 
                    : categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
                </p>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No items found matching your search.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <MenuItem key={item.id} {...item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <FloatingCart />
    </div>
  );
};

export default Index;
