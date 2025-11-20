import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, MapPin, Package, DollarSign, LogOut, CheckCircle, Navigation, Phone, TruckIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { 
  startGPSTracking, 
  stopGPSTracking, 
  getRestaurantLocation, 
  updateDriverLocation,
  generateCustomerLocation
} from "@/lib/gpsSimulator";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [ongoingDeliveries, setOngoingDeliveries] = useState<any[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);
  const gpsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const driverAuth = localStorage.getItem("driverAuth");
    if (!driverAuth) {
      navigate("/driver/login");
      return;
    }

    const driverData = JSON.parse(driverAuth);
    setDriver(driverData);
    
    // Initialize driver location at restaurant
    updateDriverLocation(driverData.id, getRestaurantLocation());
    
    // Check if driver is in queue
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const driverInQueue = queue.find((d: any) => d.driverId === driverData.id);
    setIsOnline(driverInQueue?.status === "online");
    
    loadOrders(driverData);

    // Refresh orders every 3 seconds
    const interval = setInterval(() => loadOrders(driverData), 3000);
    
    return () => {
      clearInterval(interval);
      if (gpsIntervalRef.current) {
        stopGPSTracking(gpsIntervalRef.current);
      }
    };
  }, [navigate]);

  const loadOrders = (driverData: any) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const today = new Date().toDateString();
    
    // Pending orders assigned to this driver waiting for acceptance
    const pending = orders.filter((order: any) => 
      order.assignedDriver === driverData.id &&
      order.deliveryStatus === "pending-approval" &&
      new Date(order.timestamp).toDateString() === today
    );
    
    // Ongoing deliveries (accepted or on-route)
    const ongoing = orders.filter((order: any) => 
      order.assignedDriver === driverData.id &&
      (order.deliveryStatus === "accepted" || order.deliveryStatus === "on-route") &&
      new Date(order.timestamp).toDateString() === today
    );
    
    // Completed today
    const completed = orders.filter((order: any) => 
      order.assignedDriver === driverData.id &&
      order.deliveryStatus === "delivered" &&
      new Date(order.timestamp).toDateString() === today
    );
    
    setPendingOrders(pending);
    setOngoingDeliveries(ongoing);
    setCompletedDeliveries(completed);
  };

  const handleToggleOnline = () => {
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const existingIndex = queue.findIndex((d: any) => d.driverId === driver.id);
    
    if (isOnline) {
      // Go offline
      if (existingIndex !== -1) {
        queue[existingIndex].status = "offline";
        localStorage.setItem("driverQueue", JSON.stringify(queue));
      }
      setIsOnline(false);
      toast.success("You are now offline");
    } else {
      // Go online
      if (existingIndex !== -1) {
        queue[existingIndex].status = "online";
        queue[existingIndex].joinedAt = new Date().toISOString();
      } else {
        queue.push({
          id: `QUEUE-${Date.now()}`,
          driverId: driver.id,
          driverName: driver.fullName,
          status: "online",
          joinedAt: new Date().toISOString(),
          currentDelivery: null
        });
      }
      localStorage.setItem("driverQueue", JSON.stringify(queue));
      setIsOnline(true);
      toast.success("You are now online and in the delivery queue!");
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex !== -1) {
      // Generate customer location if not exists
      if (!orders[orderIndex].customerLocation) {
        orders[orderIndex].customerLocation = generateCustomerLocation();
      }
      
      orders[orderIndex].deliveryStatus = "accepted";
      orders[orderIndex].acceptedAt = new Date().toISOString();
      
      // Update driver queue
      const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
      const driverIndex = queue.findIndex((d: any) => d.driverId === driver.id);
      if (driverIndex !== -1) {
        queue[driverIndex].currentDelivery = orderId;
        queue[driverIndex].status = "on-delivery";
        localStorage.setItem("driverQueue", JSON.stringify(queue));
      }
      
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders(driver);
      toast.success("Order accepted! Navigate to customer location.");
    }
  };

  const handleMarkPickedUp = (orderId: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].deliveryStatus = "on-route";
      orders[orderIndex].pickedUpAt = new Date().toISOString();
      
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders(driver);
      
      // Start GPS tracking simulation
      const customerLocation = orders[orderIndex].customerLocation;
      if (customerLocation && driver) {
        // Stop any existing tracking
        if (gpsIntervalRef.current) {
          stopGPSTracking(gpsIntervalRef.current);
        }
        
        // Start new tracking
        gpsIntervalRef.current = startGPSTracking(
          driver.id,
          customerLocation,
          (location) => {
            console.log("GPS Update:", location);
          }
        );
        
        toast.success("Order picked up! GPS tracking started. On route to customer.");
      } else {
        toast.success("Order picked up! On route to customer.");
      }
    }
  };

  const handleMarkDelivered = (orderId: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = "delivered";
      orders[orderIndex].deliveryStatus = "delivered";
      orders[orderIndex].deliveredAt = new Date().toISOString();
      
      // Stop GPS tracking
      if (gpsIntervalRef.current) {
        stopGPSTracking(gpsIntervalRef.current);
        gpsIntervalRef.current = null;
      }
      
      // Reset driver location to restaurant
      updateDriverLocation(driver.id, getRestaurantLocation());
      
      // Update driver queue - set back to online
      const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
      const driverIndex = queue.findIndex((d: any) => d.driverId === driver.id);
      if (driverIndex !== -1) {
        queue[driverIndex].currentDelivery = null;
        queue[driverIndex].status = "online";
        localStorage.setItem("driverQueue", JSON.stringify(queue));
      }

      // Update driver earnings (20% commission)
      const drivers = JSON.parse(localStorage.getItem("drivers") || "[]");
      const driverDataIndex = drivers.findIndex((d: any) => d.id === driver.id);
      if (driverDataIndex !== -1) {
        const commission = orders[orderIndex].total * 0.2;
        drivers[driverDataIndex].earnings = (drivers[driverDataIndex].earnings || 0) + commission;
        drivers[driverDataIndex].deliveries = drivers[driverDataIndex].deliveries || [];
        drivers[driverDataIndex].deliveries.push(orderId);
        localStorage.setItem("drivers", JSON.stringify(drivers));
      }
      
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders(driver);
      toast.success("Delivery completed! GPS tracking stopped. You're back in the queue.");
    }
  };

  const handleLogout = () => {
    // Set driver offline before logout
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const existingIndex = queue.findIndex((d: any) => d.driverId === driver?.id);
    if (existingIndex !== -1) {
      queue[existingIndex].status = "offline";
      localStorage.setItem("driverQueue", JSON.stringify(queue));
    }
    
    localStorage.removeItem("driverAuth");
    toast.success("Logged out successfully");
    navigate("/driver/login");
  };

  const openMap = (address: string) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, "_blank");
  };

  if (!driver) {
    return null;
  }

  const totalEarnings = completedDeliveries.reduce((sum, order) => sum + (order.total * 0.2), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img 
              src={kokoKingLogo} 
              alt="Koko King" 
              className="h-10 cursor-pointer" 
              onClick={() => navigate("/")}
            />
            <div>
              <p className="text-sm font-semibold">{driver.fullName}</p>
              <p className="text-xs text-muted-foreground">{driver.phone}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container px-4 py-6 space-y-6">
        {/* Online Status Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="online-toggle" className="text-base font-semibold">
                    {isOnline ? "You're Online" : "You're Offline"}
                  </Label>
                  {isOnline && (
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isOnline ? "Available for delivery assignments" : "Toggle to start receiving orders"}
                </p>
              </div>
              <Switch
                id="online-toggle"
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ongoing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ongoingDeliveries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedDeliveries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders - Need Acceptance */}
        {pendingOrders.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold">New Delivery Requests</h2>
              <Badge variant="destructive">{pendingOrders.length}</Badge>
            </div>
            {pendingOrders.map((order) => (
              <Card key={order.id} className="border-orange-500/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                      Awaiting Response
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{order.customerInfo?.phone || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{order.items?.length || 0} items</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">₵{order.total.toFixed(2)}</p>
                      <span className="text-xs text-muted-foreground">(Your commission: ₵{(order.total * 0.2).toFixed(2)})</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAcceptOrder(order.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Delivery
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => openMap(order.deliveryAddress)}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Ongoing Deliveries */}
        {ongoingDeliveries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Ongoing Deliveries</h2>
            {ongoingDeliveries.map((order) => (
              <Card key={order.id} className="border-blue-500/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.deliveryStatus === "accepted" ? "Pick up order" : "Delivering to customer"}
                      </p>
                    </div>
                    <Badge className="bg-blue-500">
                      {order.deliveryStatus === "accepted" ? "Ready for Pickup" : "On Route"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{order.customerInfo?.phone || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">₵{order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => openMap(order.deliveryAddress)}
                      className="flex-1"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Open in Maps
                    </Button>
                    {order.deliveryStatus === "accepted" ? (
                      <Button 
                        onClick={() => handleMarkPickedUp(order.id)}
                        className="flex-1"
                      >
                        <TruckIcon className="h-4 w-4 mr-2" />
                        Picked Up
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleMarkDelivered(order.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Completed Deliveries */}
        {completedDeliveries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Completed Deliveries Today</h2>
            {completedDeliveries.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Delivered at {new Date(order.deliveredAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+₵{(order.total * 0.2).toFixed(2)}</p>
                      <Badge variant="outline" className="mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isOnline && pendingOrders.length === 0 && ongoingDeliveries.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <TruckIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Ready to Start Delivering?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Toggle the switch above to go online and start receiving delivery requests
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
