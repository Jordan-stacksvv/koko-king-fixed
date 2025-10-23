import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const FloatingCart = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    };

    updateCart();
    window.addEventListener("cartUpdated", updateCart);
    return () => window.removeEventListener("cartUpdated", updateCart);
  }, []);

  if (cartCount === 0) return null;

  return (
    <Button
      size="icon"
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-foreground hover:bg-foreground/90 z-50"
      asChild
    >
      <Link to="/cart">
        <ShoppingCart className="h-6 w-6 text-background" />
        <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-primary text-white border-2 border-background">
          {cartCount}
        </Badge>
      </Link>
    </Button>
  );
};
