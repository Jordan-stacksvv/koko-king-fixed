import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Bike } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";

const KitchenDone = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("kitchenAuth")) {
      navigate("/kitchen/login");
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("kitchenAuth");
    navigate("/kitchen/login");
  };

  const handleViewDeliveryStatus = () => {
    // TODO: Navigate to delivery status page when implemented
    // navigate("/kitchen/delivery-status");
    alert("Delivery Status page - To be implemented with Convex");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={kokoKingLogo}
                alt="Koko King" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold">Done Orders</h1>
                <p className="text-sm text-muted-foreground">
                  Orders completed and ready for delivery
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          <div className="bg-card p-12 rounded-lg border text-center max-w-md">
            <Bike className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Delivery Management</h2>
            <p className="text-muted-foreground mb-6">
              View and manage all delivery statuses, assign riders, and track orders in real-time
            </p>
            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={handleViewDeliveryStatus}
            >
              <Bike className="h-5 w-5" />
              See Delivery Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDone;
