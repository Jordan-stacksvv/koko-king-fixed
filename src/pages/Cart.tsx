import { Navbar } from "@/components/Navbar";
import { FloatingCart } from "@/components/FloatingCart";
import { LocationSelector } from "@/components/LocationSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { restaurants } from "@/data/menuItems";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  extras?: Array<{ name: string; price: number }>;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);

  useEffect(() => {
    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.price || 0;
    const extrasPrice = item.extras?.reduce((extraSum, extra) => extraSum + (extra.price || 0), 0) || 0;
    return sum + (itemPrice + extrasPrice) * item.quantity;
  }, 0);
  const deliveryFee = subtotal > 0 ? 5.00 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <LocationSelector
        selectedRestaurant={selectedRestaurant}
        restaurants={restaurants}
        onRestaurantChange={setSelectedRestaurant}
      />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some delicious items to get started</p>
            <Button asChild>
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                      <div>
                          <h3 className="font-semibold text-base sm:text-lg mb-1">{item.name}</h3>
                          <p className="text-primary font-bold">₵{(item.price || 0).toFixed(2)}</p>
                          {item.extras && item.extras.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-muted-foreground font-semibold">Extras:</p>
                              {item.extras.map((extra, index) => (
                                <div key={index} className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">+ {extra.name}</span>
                                  <span className="text-muted-foreground">₵{(extra.price || 0).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right font-bold sm:hidden">
                          ₵{(((item.price || 0) + (item.extras?.reduce((sum, e) => sum + (e.price || 0), 0) || 0)) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-2 bg-muted rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right font-bold hidden sm:block">
                      ₵{(((item.price || 0) + (item.extras?.reduce((sum, e) => sum + (e.price || 0), 0) || 0)) * item.quantity).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-24">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <h2 className="text-2xl font-bold">Order Summary</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">₵{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span className="font-semibold">₵{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">₵{total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button className="w-full" size="lg" asChild>
                    <Link to="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/menu">Continue Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <FloatingCart />
    </div>
  );
};

export default Cart;
