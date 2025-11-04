import { Navbar } from "@/components/Navbar";
import { HeroBanner } from "@/components/HeroBanner";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { LocationSelector } from "@/components/LocationSelector";
import { MenuItem } from "@/components/MenuItem";
import { FloatingCart } from "@/components/FloatingCart";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { categories, menuItems, restaurants } from "@/data/menuItems";
import { useState, useEffect } from "react";
import { requestUserLocation } from "@/lib/geolocation";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Auto-detect user location on first visit
    const hasDetectedLocation = localStorage.getItem("locationDetected");
    
    if (!hasDetectedLocation) {
      requestUserLocation().then((coords) => {
        if (coords) {
          // Find closest restaurant based on coordinates
          // For demo purposes, we'll just set to first restaurant
          // In production, calculate distance to each restaurant
          localStorage.setItem("locationDetected", "true");
          setSelectedRestaurant(restaurants[0]);
        }
      });
    }
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const menuSection = document.getElementById("menu-section");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />
      
      <LocationSelector 
        selectedRestaurant={selectedRestaurant}
        restaurants={restaurants}
        onRestaurantChange={setSelectedRestaurant}
      />

      <section className="py-8 bg-white">
        <CategoryCarousel categories={categories} onCategoryClick={handleCategoryClick} />
      </section>

      <section className="py-4 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for dishes, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>
      </section>

      <section id="menu-section" className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
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
                    No items found.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3">
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
      <Footer />
    </div>
  );
};

export default Index;
