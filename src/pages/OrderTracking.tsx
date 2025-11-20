import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  User,
  Navigation,
  Home
} from "lucide-react";
import { toast } from "sonner";
import kokoKingLogo from "@/assets/koko-king-logo.png";

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  
  const [order, setOrder] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>("Calculating...");

  useEffect(() => {
    if (!orderId) {
      toast.error("No order ID provided");
      return;
    }

    loadOrderData();
    
    // Refresh every 3 seconds for real-time updates
    const interval = setInterval(loadOrderData, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrderData = () => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const foundOrder = orders.find((o: any) => o.id === orderId);
    
    if (!foundOrder) {
      toast.error("Order not found");
      return;
    }
    
    setOrder(foundOrder);

    // Load driver info if assigned
    if (foundOrder.assignedDriver) {
      const drivers = JSON.parse(localStorage.getItem("drivers") || "[]");
      const foundDriver = drivers.find((d: any) => d.id === foundOrder.assignedDriver);
      setDriver(foundDriver);
      
      // Calculate estimated arrival time
      if (foundOrder.deliveryStatus === "on-route") {
        // Simulate 10-20 minutes delivery time
        const minutes = Math.floor(Math.random() * 10) + 10;
        setEstimatedTime(`${minutes} minutes`);
      } else if (foundOrder.deliveryStatus === "accepted") {
        setEstimatedTime("Driver is preparing to pick up");
      } else if (foundOrder.deliveryStatus === "delivered") {
        setEstimatedTime("Delivered!");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" }> = {
      "pending": { label: "Order Placed", variant: "default" },
      "confirmed": { label: "Confirmed", variant: "default" },
      "preparing": { label: "Preparing", variant: "warning" },
      "ready": { label: "Ready", variant: "warning" },
      "done": { label: "Ready for Delivery", variant: "warning" },
      "pending-approval": { label: "Finding Driver", variant: "default" },
      "accepted": { label: "Driver Assigned", variant: "secondary" },
      "on-route": { label: "Out for Delivery", variant: "warning" },
      "delivered": { label: "Delivered", variant: "success" },
      "completed": { label: "Completed", variant: "success" }
    };

    const config = statusConfig[status] || { label: status, variant: "default" };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const openMap = () => {
    if (order?.deliveryAddress) {
      const address = encodeURIComponent(order.deliveryAddress);
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDelivered = order.deliveryStatus === "delivered" || order.status === "completed";
  const hasDriver = order.assignedDriver && driver;
  const isInTransit = order.deliveryStatus === "on-route";

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <img 
              src={kokoKingLogo} 
              alt="Koko King" 
              className="h-12 mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate("/")}
            />
            <CardTitle>Track Your Order</CardTitle>
            <p className="text-sm text-muted-foreground">Order #{order.id}</p>
          </CardHeader>
        </Card>

        {/* Order Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  ["confirmed", "preparing", "ready", "done", "pending-approval", "accepted", "on-route", "delivered", "completed"].includes(order.status) ||
                  order.deliveryStatus
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Order Confirmed</p>
                  <p className="text-xs text-muted-foreground">Your order has been received</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  ["preparing", "ready", "done", "pending-approval", "accepted", "on-route", "delivered", "completed"].includes(order.status) ||
                  order.deliveryStatus
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Preparing</p>
                  <p className="text-xs text-muted-foreground">Kitchen is preparing your order</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  hasDriver
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Driver Assigned</p>
                  <p className="text-xs text-muted-foreground">
                    {hasDriver ? `${driver.fullName} is delivering your order` : "Finding a driver..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  isInTransit
                    ? "bg-primary text-primary-foreground animate-pulse"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Out for Delivery</p>
                  <p className="text-xs text-muted-foreground">
                    {isInTransit ? "Your order is on the way!" : "Waiting for driver to start"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  isDelivered
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Delivered</p>
                  <p className="text-xs text-muted-foreground">
                    {isDelivered ? "Your order has been delivered!" : "Pending delivery"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Current Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Status:</span>
              {getStatusBadge(order.deliveryStatus || order.status)}
            </div>

            {isInTransit && (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Estimated Arrival:</span>
                </div>
                <span className="text-sm font-bold text-primary">{estimatedTime}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Information */}
        {hasDriver && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Driver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{driver.fullName}</p>
                    <p className="text-sm text-muted-foreground">{driver.vehicleType}</p>
                  </div>
                </div>
                {order.driverPhone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`tel:${order.driverPhone}`, "_self")}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress || "N/A"}</p>
                  </div>
                </div>
                {isInTransit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={openMap}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">₵{item.price.toFixed(2)}</p>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>₵{order.total?.toFixed(2) || "0.00"}</span>
            </div>

            {order.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-1">Special Instructions:</p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          {!isDelivered && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={loadOrderData}
            >
              Refresh Status
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
