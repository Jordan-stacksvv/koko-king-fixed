import categorySpecials from "@/assets/category-specials.jpg";
import categoryWraps from "@/assets/category-wraps.jpg";
import categorySandwiches from "@/assets/category-sandwiches.jpg";
import categorySalads from "@/assets/category-salads.jpg";
import categorySides from "@/assets/category-sides.jpg";
import categoryBakery from "@/assets/category-bakery.jpg";
import categoryPorridge from "@/assets/category-porridge.jpg";
import categoryDrinks from "@/assets/category-drinks.jpg";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

export const restaurants: Restaurant[] = [
  {
    id: "east-legon",
    name: "Koko King Express - East Legon",
    address: "East Legon, Accra, Ghana",
    coordinates: { lat: 5.6454, lng: -0.1520 },
  },
  {
    id: "osu",
    name: "Koko King Express - Osu",
    address: "Oxford Street, Osu, Accra, Ghana",
    coordinates: { lat: 5.5571, lng: -0.1823 },
  },
  {
    id: "spintex",
    name: "Koko King Express - Spintex",
    address: "Spintex Road, Accra, Ghana",
    coordinates: { lat: 5.6384, lng: -0.1078 },
  },
];

export const menuItems: MenuItem[] = [
  // King Specials
  { id: "ks1", name: "Kings Favourite", description: "Our signature special", price: 75.00, category: "specials", image: categorySpecials, restaurantId: "east-legon" },
  { id: "ks2", name: "Kings Combo", description: "Sandwich + Beverage/Porridge", price: 65.00, category: "specials", image: categorySpecials, restaurantId: "east-legon" },
  { id: "ks3", name: "Special Occasion Package", description: "Perfect for celebrations", price: 150.00, category: "specials", image: categorySpecials, restaurantId: "east-legon" },
  { id: "ks4", name: "Fries + Drumsticks + Ketchup", description: "Crispy combo", price: 105.00, category: "specials", image: categorySpecials, restaurantId: "east-legon" },
  { id: "ks5", name: "Salad + Smoothie Combo", description: "Healthy and refreshing", price: 97.00, category: "specials", image: categorySpecials, restaurantId: "east-legon" },

  // Wraps & Quesadillas
  { id: "wq1", name: "Chicken Shawarma", description: "Tender chicken wrap", price: 75.00, category: "wraps", image: categoryWraps, restaurantId: "east-legon" },
  { id: "wq2", name: "Beef Shawarma", description: "Savory beef wrap", price: 90.00, category: "wraps", image: categoryWraps, restaurantId: "east-legon" },
  { id: "wq3", name: "Chicken Wrap", description: "Fresh chicken wrap", price: 75.00, category: "wraps", image: categoryWraps, restaurantId: "osu" },
  { id: "wq4", name: "Tuna Wrap", description: "Light tuna wrap", price: 82.00, category: "wraps", image: categoryWraps, restaurantId: "osu" },
  { id: "wq5", name: "Cheesy Chicken Quesadilla", description: "Melted cheese and chicken", price: 105.00, category: "wraps", image: categoryWraps, restaurantId: "osu" },
  { id: "wq6", name: "Cheesy Beef Quesadilla", description: "Beef and cheese delight", price: 115.00, category: "wraps", image: categoryWraps, restaurantId: "spintex" },
  { id: "wq7", name: "Egg & Cheese Quesadilla", description: "Simple and tasty", price: 68.00, category: "wraps", image: categoryWraps, restaurantId: "spintex" },
  { id: "wq8", name: "Smoked Ham, Egg & Cheese Quesadilla", description: "Premium ingredients", price: 129.00, category: "wraps", image: categoryWraps, restaurantId: "spintex" },

  // Sandwiches
  { id: "sw1", name: "Smoked Bacon & Cheese", description: "Premium bacon sandwich", price: 120.00, category: "sandwiches", image: categorySandwiches, restaurantId: "east-legon" },
  { id: "sw2", name: "Smoked Turkey & Cheese", description: "Turkey delight", price: 120.00, category: "sandwiches", image: categorySandwiches, restaurantId: "east-legon" },
  { id: "sw3", name: "Tuna Melt", description: "Warm tuna sandwich", price: 65.00, category: "sandwiches", image: categorySandwiches, restaurantId: "east-legon" },
  { id: "sw4", name: "Chicken Mayo", description: "Creamy chicken", price: 65.00, category: "sandwiches", image: categorySandwiches, restaurantId: "osu" },
  { id: "sw5", name: "Tuna Mayo", description: "Light and fresh", price: 37.00, category: "sandwiches", image: categorySandwiches, restaurantId: "osu" },
  { id: "sw6", name: "Egg Sausage", description: "Breakfast favorite", price: 44.00, category: "sandwiches", image: categorySandwiches, restaurantId: "osu" },
  { id: "sw7", name: "Egg Bacon", description: "Classic combo", price: 85.00, category: "sandwiches", image: categorySandwiches, restaurantId: "spintex" },
  { id: "sw8", name: "Vege Mayo Sandwich", description: "Vegetarian option", price: 39.00, category: "sandwiches", image: categorySandwiches, restaurantId: "spintex" },

  // Salads
  { id: "sl1", name: "Plain Salad", description: "Fresh greens", price: 56.00, category: "salads", image: categorySalads, restaurantId: "east-legon" },
  { id: "sl2", name: "Egg Salad", description: "With boiled eggs", price: 58.00, category: "salads", image: categorySalads, restaurantId: "east-legon" },
  { id: "sl3", name: "Chicken Salad", description: "Grilled chicken", price: 73.00, category: "salads", image: categorySalads, restaurantId: "osu" },
  { id: "sl4", name: "Tuna Salad", description: "Fresh tuna", price: 80.00, category: "salads", image: categorySalads, restaurantId: "osu" },

  // Sides
  { id: "sd1", name: "Spicy Potato Wedges", description: "Crispy and spicy", price: 45.00, category: "sides", image: categorySides, restaurantId: "east-legon" },
  { id: "sd2", name: "Chicken Nuggets", description: "Golden nuggets", price: 45.00, category: "sides", image: categorySides, restaurantId: "east-legon" },
  { id: "sd3", name: "Hash Browns", description: "Crispy hash browns", price: 45.00, category: "sides", image: categorySides, restaurantId: "east-legon" },
  { id: "sd4", name: "Gizzard", description: "Seasoned gizzard", price: 45.00, category: "sides", image: categorySides, restaurantId: "osu" },
  { id: "sd5", name: "6pc Chicken Wings", description: "Spicy wings", price: 53.00, category: "sides", image: categorySides, restaurantId: "osu" },
  { id: "sd6", name: "Koose (3 pcs)", description: "Traditional koose", price: 10.00, category: "sides", image: categorySides, restaurantId: "osu" },
  { id: "sd7", name: "Boffloat (2 pcs)", description: "Sweet boffloat", price: 15.00, category: "sides", image: categorySides, restaurantId: "spintex" },
  { id: "sd8", name: "Bread Roll", description: "Fresh bread roll", price: 15.00, category: "sides", image: categorySides, restaurantId: "spintex" },
  { id: "sd9", name: "Cheese Slice", description: "Premium cheese", price: 13.00, category: "sides", image: categorySides, restaurantId: "spintex" },
  { id: "sd10", name: "Sausage", description: "Grilled sausage", price: 8.00, category: "sides", image: categorySides, restaurantId: "east-legon" },
  { id: "sd11", name: "Egg", description: "Fresh egg", price: 8.00, category: "sides", image: categorySides, restaurantId: "east-legon" },
  { id: "sd12", name: "Baked Beans", description: "Warm baked beans", price: 8.00, category: "sides", image: categorySides, restaurantId: "east-legon" },

  // Bakery
  { id: "bk1", name: "Coconut Cake", description: "Moist coconut cake", price: 30.00, category: "bakery", image: categoryBakery, restaurantId: "east-legon" },
  { id: "bk2", name: "Marble Cake", description: "Chocolate marble", price: 30.00, category: "bakery", image: categoryBakery, restaurantId: "east-legon" },
  { id: "bk3", name: "Caramel Cake", description: "Sweet caramel", price: 30.00, category: "bakery", image: categoryBakery, restaurantId: "east-legon" },
  { id: "bk4", name: "Red Velvet Cake", description: "Classic red velvet", price: 30.00, category: "bakery", image: categoryBakery, restaurantId: "osu" },
  { id: "bk5", name: "Banana Cake", description: "Fresh banana cake", price: 30.00, category: "bakery", image: categoryBakery, restaurantId: "osu" },
  { id: "bk6", name: "Plain Doughnut", description: "Classic doughnut", price: 15.00, category: "bakery", image: categoryBakery, restaurantId: "osu" },
  { id: "bk7", name: "Sugar Doughnut", description: "Sugar coated", price: 15.00, category: "bakery", image: categoryBakery, restaurantId: "spintex" },
  { id: "bk8", name: "Coconut Doughnut", description: "Coconut topping", price: 15.00, category: "bakery", image: categoryBakery, restaurantId: "spintex" },
  { id: "bk9", name: "Chocolate Doughnut", description: "Chocolate glazed", price: 15.00, category: "bakery", image: categoryBakery, restaurantId: "spintex" },

  // Porridge & Hot Beverages
  { id: "pr1", name: "Hausa Koko", description: "Traditional porridge", price: 20.00, category: "porridge", image: categoryPorridge, restaurantId: "east-legon" },
  { id: "pr2", name: "Oblayo", description: "Corn porridge", price: 20.00, category: "porridge", image: categoryPorridge, restaurantId: "east-legon" },
  { id: "pr3", name: "Ekugbemi", description: "Millet porridge", price: 20.00, category: "porridge", image: categoryPorridge, restaurantId: "east-legon" },
  { id: "pr4", name: "Oats", description: "Healthy oats", price: 30.00, category: "porridge", image: categoryPorridge, restaurantId: "osu" },
  { id: "pr5", name: "Tom Brown", description: "Nutritious porridge", price: 30.00, category: "porridge", image: categoryPorridge, restaurantId: "osu" },
  { id: "pr6", name: "Rice Porridge", description: "Creamy rice", price: 30.00, category: "porridge", image: categoryPorridge, restaurantId: "osu" },
  { id: "pr7", name: "Wheat Porridge", description: "Wheat goodness", price: 30.00, category: "porridge", image: categoryPorridge, restaurantId: "spintex" },
  { id: "pr8", name: "White Porridge", description: "Classic porridge", price: 30.00, category: "porridge", image: categoryPorridge, restaurantId: "spintex" },
  { id: "pr9", name: "Milo", description: "Hot chocolate drink", price: 27.00, category: "porridge", image: categoryPorridge, restaurantId: "spintex" },
  { id: "pr10", name: "Tea", description: "Fresh tea", price: 27.00, category: "porridge", image: categoryPorridge, restaurantId: "east-legon" },
  { id: "pr11", name: "Nescafe", description: "Hot coffee", price: 27.00, category: "porridge", image: categoryPorridge, restaurantId: "east-legon" },

  // Drinks
  { id: "dr1", name: "Sprite", description: "Lemon-lime soda", price: 15.00, category: "drinks", image: categoryDrinks, restaurantId: "east-legon" },
  { id: "dr2", name: "Fanta", description: "Orange soda", price: 15.00, category: "drinks", image: categoryDrinks, restaurantId: "east-legon" },
  { id: "dr3", name: "Coke Zero", description: "Zero sugar cola", price: 15.00, category: "drinks", image: categoryDrinks, restaurantId: "east-legon" },
  { id: "dr4", name: "Coca-Cola", description: "Classic cola", price: 15.00, category: "drinks", image: categoryDrinks, restaurantId: "osu" },
  { id: "dr5", name: "Brewed Iced Coffee", description: "Cold brew coffee", price: 37.00, category: "drinks", image: categoryDrinks, restaurantId: "osu" },
  { id: "dr6", name: "Ice Green Tea", description: "Refreshing tea", price: 30.00, category: "drinks", image: categoryDrinks, restaurantId: "osu" },
  { id: "dr7", name: "Fresh Orange Juice", description: "Squeezed orange", price: 37.00, category: "drinks", image: categoryDrinks, restaurantId: "spintex" },
  { id: "dr8", name: "Fresh Pineapple Juice", description: "Tropical juice", price: 37.00, category: "drinks", image: categoryDrinks, restaurantId: "spintex" },
  { id: "dr9", name: "Fresh Watermelon Juice", description: "Sweet watermelon", price: 37.00, category: "drinks", image: categoryDrinks, restaurantId: "spintex" },
  { id: "dr10", name: "Bottled Water", description: "Pure water", price: 7.00, category: "drinks", image: categoryDrinks, restaurantId: "east-legon" },
];

export const categories = [
  { id: "specials", name: "King Specials", image: categorySpecials },
  { id: "wraps", name: "Wraps & Quesadillas", image: categoryWraps },
  { id: "sandwiches", name: "Sandwiches", image: categorySandwiches },
  { id: "salads", name: "Salads", image: categorySalads },
  { id: "sides", name: "Sides", image: categorySides },
  { id: "bakery", name: "Bakery", image: categoryBakery },
  { id: "porridge", name: "Porridge & Hot Beverages", image: categoryPorridge },
  { id: "drinks", name: "Drinks", image: categoryDrinks }
];
