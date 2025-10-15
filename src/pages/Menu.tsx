import { Navbar } from "@/components/Navbar";
import { MenuItem } from "@/components/MenuItem";
import { FloatingCart } from "@/components/FloatingCart";
import { LocationSelector } from "@/components/LocationSelector";
import { menuItems, categories, restaurants } from "@/data/menuItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRestaurant = item.restaurantId === selectedRestaurant.id;
    return matchesCategory && matchesSearch && matchesRestaurant;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <LocationSelector
        selectedRestaurant={selectedRestaurant}
        restaurants={restaurants}
        onRestaurantChange={setSelectedRestaurant}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Menu</h1>
          <div className="max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your favorite food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full bg-white shadow-sm"
            />
          </div>
        </div>

        <div>
          <div className="mb-6 sticky top-16 z-40 bg-background pb-4 -mt-4 pt-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className="flex-shrink-0 whitespace-nowrap"
              >
                All Items
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <MenuItem key={item.id} {...item} />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-muted-foreground text-lg">No items found</p>
            </div>
          )}
        </div>
      </div>

      <FloatingCart />
    </div>
  );
};

export default Menu;
