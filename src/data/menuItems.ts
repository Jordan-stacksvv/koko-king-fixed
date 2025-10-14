import categoryPizza from "@/assets/category-pizza.jpg";
import categoryBakery from "@/assets/category-bakery.jpg";
import categoryCombo from "@/assets/category-combo.jpg";
import categorySalads from "@/assets/category-salads.jpg";

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
  {
    id: "special-1",
    name: "Father's Day Treat",
    description: "Porridge or Hot Beverage, Egg Sausage quesadilla, Springrolls, Choice of cake, Choice of Juice",
    price: 260.00,
    image: categoryCombo,
    category: "specials",
    restaurantId: "east-legon"
  },
  {
    id: "special-2",
    name: "Special Occasion Value Package",
    description: "Any Porridge/Hot Bev, Kings Favourite pack (3pc Sandwich, 2 sausages, 2eggs, baked beans), choice of Cake, choice of Juice",
    price: 150.00,
    image: categoryCombo,
    category: "specials",
    restaurantId: "east-legon"
  },

  // Snackies
  {
    id: "snack-1",
    name: "Samosa Meal (4pcs)",
    description: "4 pcs Samosa with a choice of drink",
    price: 45.00,
    image: categoryBakery,
    category: "snacks",
    restaurantId: "east-legon"
  },
  {
    id: "snack-2",
    name: "Spring Rolls (4pcs)",
    description: "Crispy spring rolls served with dipping sauce",
    price: 40.00,
    image: categoryBakery,
    category: "snacks",
    restaurantId: "osu"
  },
  {
    id: "snack-3",
    name: "Chicken Wings (6pcs)",
    description: "Seasoned and fried chicken wings",
    price: 55.00,
    image: categoryCombo,
    category: "snacks",
    restaurantId: "spintex"
  },

  // Bakery
  {
    id: "bakery-1",
    name: "Croissant",
    description: "Buttery, flaky French croissant baked fresh daily",
    price: 15.00,
    image: categoryBakery,
    category: "bakery",
    restaurantId: "east-legon"
  },
  {
    id: "bakery-2",
    name: "Chocolate Muffin",
    description: "Rich chocolate muffin with chocolate chips",
    price: 18.00,
    image: categoryBakery,
    category: "bakery",
    restaurantId: "osu"
  },
  {
    id: "bakery-3",
    name: "Blueberry Danish",
    description: "Sweet pastry filled with fresh blueberries",
    price: 20.00,
    image: categoryBakery,
    category: "bakery",
    restaurantId: "spintex"
  },
  {
    id: "bakery-4",
    name: "Meat Pie",
    description: "Savory meat pie with seasoned beef filling",
    price: 25.00,
    image: categoryBakery,
    category: "bakery",
    restaurantId: "east-legon"
  },

  // Wraps & Quesadillas
  {
    id: "wrap-1",
    name: "Chicken Shawarma",
    description: "Grilled chicken with vegetables wrapped in warm pita",
    price: 35.00,
    image: categoryCombo,
    category: "wraps",
    restaurantId: "osu"
  },
  {
    id: "wrap-2",
    name: "Beef Quesadilla",
    description: "Grilled tortilla filled with seasoned beef and cheese",
    price: 40.00,
    image: categoryCombo,
    category: "wraps",
    restaurantId: "spintex"
  },
  {
    id: "wrap-3",
    name: "Vegetarian Wrap",
    description: "Fresh vegetables and hummus in a soft tortilla",
    price: 30.00,
    image: categorySalads,
    category: "wraps",
    restaurantId: "east-legon"
  },

  // Combo Meals
  {
    id: "combo-1",
    name: "Classic Burger Combo",
    description: "Juicy burger with fries and a drink",
    price: 65.00,
    image: categoryCombo,
    category: "combo",
    restaurantId: "east-legon"
  },
  {
    id: "combo-2",
    name: "Chicken Wings Combo",
    description: "8 pieces of crispy chicken wings with fries and drink",
    price: 75.00,
    image: categoryCombo,
    category: "combo",
    restaurantId: "osu"
  },
  {
    id: "combo-3",
    name: "Sandwich Meal",
    description: "Choice of sandwich with fries and drink",
    price: 55.00,
    image: categoryCombo,
    category: "combo",
    restaurantId: "spintex"
  },

  // Salads
  {
    id: "salad-1",
    name: "Caesar Salad",
    description: "Crisp romaine, parmesan, croutons with Caesar dressing",
    price: 40.00,
    image: categorySalads,
    category: "salads",
    restaurantId: "east-legon"
  },
  {
    id: "salad-2",
    name: "Greek Salad",
    description: "Fresh vegetables, feta cheese, olives with Greek dressing",
    price: 45.00,
    image: categorySalads,
    category: "salads",
    restaurantId: "osu"
  },
  {
    id: "salad-3",
    name: "Grilled Chicken Salad",
    description: "Mixed greens with grilled chicken and balsamic vinaigrette",
    price: 50.00,
    image: categorySalads,
    category: "salads",
    restaurantId: "spintex"
  },

  // Sides
  {
    id: "side-1",
    name: "French Fries",
    description: "Crispy golden fries",
    price: 20.00,
    image: categoryCombo,
    category: "sides",
    restaurantId: "east-legon"
  },
  {
    id: "side-2",
    name: "Coleslaw",
    description: "Fresh creamy coleslaw",
    price: 15.00,
    image: categorySalads,
    category: "sides",
    restaurantId: "osu"
  },
  {
    id: "side-3",
    name: "Baked Beans",
    description: "Savory baked beans in tomato sauce",
    price: 18.00,
    image: categoryCombo,
    category: "sides",
    restaurantId: "spintex"
  },

  // Drinks
  {
    id: "drink-1",
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 25.00,
    image: categorySalads,
    category: "drinks",
    restaurantId: "east-legon"
  },
  {
    id: "drink-2",
    name: "Smoothie",
    description: "Choice of fruit smoothie",
    price: 30.00,
    image: categorySalads,
    category: "drinks",
    restaurantId: "osu"
  },
  {
    id: "drink-3",
    name: "Soft Drink",
    description: "Choice of Coca-Cola, Sprite, or Fanta",
    price: 12.00,
    image: categoryCombo,
    category: "drinks",
    restaurantId: "spintex"
  }
];

export const categories = [
  { id: "specials", name: "King Specials", image: categoryCombo },
  { id: "snacks", name: "Snackies", image: categoryBakery },
  { id: "bakery", name: "Bakery", image: categoryBakery },
  { id: "wraps", name: "Wraps & Quesadillas", image: categoryCombo },
  { id: "combo", name: "Combo Meals", image: categoryCombo },
  { id: "salads", name: "Salads", image: categorySalads },
  { id: "sides", name: "Sides", image: categoryCombo },
  { id: "drinks", name: "Drinks", image: categorySalads }
];
