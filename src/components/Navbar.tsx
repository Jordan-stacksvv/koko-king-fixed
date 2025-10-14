import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import kokoKingLogo from "@/assets/koko-king-logo.png";

export const Navbar = () => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));

    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(updatedCart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center transition-transform hover:scale-105">
            <img src={kokoKingLogo} alt="Koko King" className="h-10 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                isActive("/") ? "text-primary" : "text-foreground/70 hover:text-primary"
              }`}
            >
              Home
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="relative">
              <div>
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent">
                    {cartCount}
                  </Badge>
                )}
              </div>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
