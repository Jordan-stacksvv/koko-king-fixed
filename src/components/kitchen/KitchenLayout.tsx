import { ReactNode, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Truck, 
  ChefHat, 
  DollarSign, 
  Settings, 
  LogOut 
} from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";

interface KitchenLayoutProps {
  children: ReactNode;
}

export const KitchenLayout = ({ children }: KitchenLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("managerAuth");
    if (!isAuthenticated) {
      navigate("/manager/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("managerAuth");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/manager/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/manager/orders", icon: ShoppingBag, label: "Orders" },
    { path: "/manager/deliveries", icon: Truck, label: "Deliveries" },
    { path: "/manager/menu", icon: ChefHat, label: "Menu" },
    { path: "/manager/payments", icon: DollarSign, label: "Payments" },
    { path: "/manager/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:block">
        <div className="p-6 border-b">
          <img src={kokoKingLogo} alt="Koko King" className="h-10 w-auto mb-2" />
          <p className="text-sm text-muted-foreground">Manager Dashboard</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          ))}

          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
