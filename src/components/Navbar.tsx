import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
export const Navbar = () => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
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
            <img src={kokoKingLogo} alt="Koko King" className="h-8 sm:h-10 w-auto cursor-pointer" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`font-medium transition-colors ${isActive("/") ? "text-primary" : "text-foreground/70 hover:text-primary"}`}>
              Home
            </Link>
            <Link to="/menu" className={`font-medium transition-colors ${isActive("/menu") ? "text-primary" : "text-foreground/70 hover:text-primary"}`}>
              Menu
            </Link>
            <Link to="/store-locator" className={`font-medium transition-colors ${isActive("/store-locator") ? "text-primary" : "text-foreground/70 hover:text-primary"}`}>
              Locations
            </Link>
            <Link to="/contact" className={`font-medium transition-colors ${isActive("/contact") ? "text-primary" : "text-foreground/70 hover:text-primary"}`}>
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" asChild className="hidden md:flex">
              <Link to="/auth">Login</Link>
            </Button>
            
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
            
            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    to="/auth" 
                    className="text-lg font-medium py-2 px-4 rounded-lg bg-primary text-primary-foreground text-center mb-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/" 
                    className={`text-lg font-medium py-2 px-4 rounded-lg transition-colors ${isActive("/") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/menu" 
                    className={`text-lg font-medium py-2 px-4 rounded-lg transition-colors ${isActive("/menu") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Menu
                  </Link>
                  <Link 
                    to="/store-locator" 
                    className={`text-lg font-medium py-2 px-4 rounded-lg transition-colors ${isActive("/store-locator") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Locations
                  </Link>
                  <Link 
                    to="/contact" 
                    className={`text-lg font-medium py-2 px-4 rounded-lg transition-colors ${isActive("/contact") ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};