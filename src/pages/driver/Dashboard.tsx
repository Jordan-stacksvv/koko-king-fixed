import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MapPin, Package, LogOut, CheckCircle, Navigation, Phone, TruckIcon, AlertCircle, Settings } from "lucide-react";
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
  const [notifications, setNotifications] = useState<any[]>([]);
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
    loadNotifications(driverData);

    // Refresh orders and notifications every 3 seconds
    const interval = setInterval(() => {
      loadOrders(driverData);
      loadNotifications(driverData);
    }, 3000);
    
    // Sync driver location to orders every 2 seconds
    const locationSyncInterval = setInterval(() => {
      const driverLocations = JSON.parse(localStorage.getItem("driverLocations") || "{}");
      const currentLocation = driverLocations[driverData.id];
      
      if (currentLocation) {
        const orders = JSON.parse(localStorage.getItem("orders") || "[]");
        let updated = false;
        
        const updatedOrders = orders.map((order: any) => {
          if (order.assignedDriver === driverData.id && 
              (order.deliveryStatus === "accepted" || order.deliveryStatus === "on-route")) {
            updated = true;
            return { ...order, driverLocation: currentLocation };
          }
          return order;
        });
        
        if (updated) {
          localStorage.setItem("orders", JSON.stringify(updatedOrders));
        }
      }
    }, 2000);
    
    return () => {
      clearInterval(interval);
      clearInterval(locationSyncInterval);
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

  const loadNotifications = (driverData: any) => {
    const allNotifications = JSON.parse(localStorage.getItem("driverNotifications") || "[]");
    const driverNotifications = allNotifications.filter(
      (n: any) => n.driverId === driverData.id && !n.read
    );
    setNotifications(driverNotifications);
    
    // Show toast for new notifications
    driverNotifications.forEach((notification: any) => {
      if (notification.type === "assignment") {
        toast.info(notification.message, {
          duration: 5000,
        });
      } else if (notification.type === "broadcast") {
        toast.warning(notification.message, {
          duration: 10000,
        });
      } else if (notification.type === "cancellation") {
        toast.error(notification.message);
      }
    });
  };

  const markNotificationAsRead = (notificationId: string) => {
    const allNotifications = JSON.parse(localStorage.getItem("driverNotifications") || "[]");
    const updated = allNotifications.map((n: any) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem("driverNotifications", JSON.stringify(updated));
    loadNotifications(driver);
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
          name: driver.fullName,
          phone: driver.phone,
          branch: driver.branch || "Main Branch",
          status: "online",
          joinedAt: new Date().toISOString(),
          currentDelivery: null,
        });
      }
      localStorage.setItem("driverQueue", JSON.stringify(queue));
      setIsOnline(true);
      toast.success("You are now online and ready to receive orders!");
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].deliveryStatus = "accepted";
      
      // Get current driver location
      const driverLocations = JSON.parse(localStorage.getItem("driverLocations") || "{}");
      const currentLocation = driverLocations[driver.id] || getRestaurantLocation();
      orders[orderIndex].driverLocation = currentLocation;
      
      // Update driver queue status
      const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
      const driverIndex = queue.findIndex((d: any) => d.driverId === driver.id);
      if (driverIndex !== -1) {
        queue[driverIndex].currentDelivery = orderId;
        queue[driverIndex].status = "on-delivery";
        localStorage.setItem("driverQueue", JSON.stringify(queue));
      }
      
      // Mark related notifications as read
      const allNotifications = JSON.parse(localStorage.getItem("driverNotifications") || "[]");
      const updated = allNotifications.map((n: any) =>
        n.driverId === driver.id && n.orderId === orderId ? { ...n, read: true } : n
      );
      localStorage.setItem("driverNotifications", JSON.stringify(updated));
      
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders(driver);
      loadNotifications(driver);
      toast.success("Order accepted! Navigate to customer location");
    }
  };

  const handleRejectOrder = (orderId: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].assignedDriver = null;
      orders[orderIndex].deliveryStatus = null;
      orders[orderIndex].driverName = null;
      orders[orderIndex].driverPhone = null;
      
      // Release driver from queue
      const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
      const driverIndex = queue.findIndex((d: any) => d.driverId === driver.id);
      if (driverIndex !== -1) {
        queue[driverIndex].currentDelivery = null;
        queue[driverIndex].status = "online";
        localStorage.setItem("driverQueue", JSON.stringify(queue));
      }
      
      // Mark related notifications as read
      const allNotifications = JSON.parse(localStorage.getItem("driverNotifications") || "[]");
      const updated = allNotifications.map((n: any) =>
        n.driverId === driver.id && n.orderId === orderId ? { ...n, read: true } : n
      );
      localStorage.setItem("driverNotifications", JSON.stringify(updated));
      
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders(driver);
      loadNotifications(driver);
      toast.info("Order rejected and returned to queue");
    }
  };

  const handleMarkPickedUp = (orderId: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].deliveryStatus = "on-route";
      
      // Get current driver location
      const driverLocations = JSON.parse(localStorage.getItem("driverLocations") || "{}");
      const currentLocation = driverLocations[driver.id] || getRestaurantLocation();
      orders[orderIndex].driverLocation = currentLocation;
      
      // Generate customer location if not exists
      if (!orders[orderIndex].customerLocation) {
        orders[orderIndex].customerLocation = generateCustomerLocation();
      }
      
      // Start GPS tracking
      if (gpsIntervalRef.current) {
        stopGPSTracking(gpsIntervalRef.current);
      }
      
      gpsIntervalRef.current = startGPSTracking(
        driver.id,
        getRestaurantLocation(),
        orders[orderIndex].customerLocation
      );
      
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders(driver);
      toast.success("Marked as picked up. GPS tracking started!");
    }
  };

  const handleMarkDelivered = (orderId: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex !== -1) {
      const order = orders[orderIndex];
      orders[orderIndex].status = "completed";
      orders[orderIndex].deliveryStatus = "delivered";
      orders[orderIndex].deliveredAt = new Date().toISOString();
      
      // Calculate driver commission (20% of order total)
      const commission = (order.total * 0.2).toFixed(2);
      
      // Stop GPS tracking
      if (gpsIntervalRef.current) {
        stopGPSTracking(gpsIntervalRef.current);
        gpsIntervalRef.current = null;
      }
      
      // Reset driver location to restaurant
      updateDriverLocation(driver.id, getRestaurantLocation());
      
      // Update driver queue - mark as available
      const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
      const driverIndex = queue.findIndex((d: any) => d.driverId === driver.id);
      if (driverIndex !== -1) {
        queue[driverIndex].currentDelivery = null;
        queue[driverIndex].status = "online";
        localStorage.setItem("driverQueue", JSON.stringify(queue));
      }
      
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders(driver);
      toast.success(`Delivery completed! Earned GH₵${commission}`);
    }
  };

  const handleLogout = () => {
    // Set driver to offline before logging out
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const driverIndex = queue.findIndex((d: any) => d.driverId === driver.id);
    if (driverIndex !== -1) {
      queue[driverIndex].status = "offline";
      localStorage.setItem("driverQueue", JSON.stringify(queue));
    }
    
    localStorage.removeItem("driverAuth");
    toast.success("Logged out successfully");
    navigate("/driver/login");
  };

  const openMap = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
  };

  if (!driver) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <img 
            src={kokoKingLogo} 
            alt="Koko King" 
            className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          />
          <div className="flex items-center gap-3">
            <Avatar 
              className="h-10 w-10 cursor-pointer border-2 border-primary hover:opacity-80 transition-opacity"
              onClick={() => navigate("/driver/settings")}
            >
              <AvatarImage src={driver.profilePicUrl} alt={driver.fullName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(driver.fullName)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/driver/settings")}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Driver Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Welcome, {driver.fullName}!</CardTitle>
              <Badge variant={isOnline ? "default" : "secondary"} className="text-lg px-4 py-2 bg-green-600 text-white">
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {isOnline 
                    ? "You're ready to receive delivery orders" 
                    : "Switch online to start receiving orders"}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{pendingOrders.length}</span> Pending
                  </span>
                  <span className="flex items-center gap-1">
                    <TruckIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{ongoingDeliveries.length}</span> Ongoing
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{completedDeliveries.length}</span> Completed Today
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="online-toggle" className="text-base font-medium">
                  {isOnline ? "Go Offline" : "Go Online"}
                </Label>
                <Switch
                  id="online-toggle"
                  checked={isOnline}
                  onCheckedChange={handleToggleOnline}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <Card className="mb-6 border-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-5 w-5" />
                New Orders Awaiting Acceptance ({pendingOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingOrders.map((order) => (
                <Card key={order.id} className="bg-orange-50 dark:bg-orange-950">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">Order #{order.id}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge className="bg-orange-500 text-white">
                        ₵{order.total?.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{order.customer?.address || order.deliveryAddress || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer?.phone || order.customerPhone || "N/A"}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{order.items?.length || 0} items</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAcceptOrder(order.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Order
                      </Button>
                      <Button 
                        onClick={() => handleRejectOrder(order.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Ongoing Deliveries */}
        {ongoingDeliveries.length > 0 && (
          <Card className="mb-6 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <TruckIcon className="h-5 w-5" />
                Ongoing Deliveries ({ongoingDeliveries.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ongoingDeliveries.map((order) => (
                <Card key={order.id} className="bg-blue-50 dark:bg-blue-950">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">Order #{order.id}</h3>
                        <Badge variant="default" className="mt-1">
                          {order.deliveryStatus === "accepted" ? "Picked Up" : "On Route"}
                        </Badge>
                      </div>
                      <Badge className="bg-blue-600 text-white">
                        ₵{order.total?.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{order.customer?.address || order.deliveryAddress || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer?.phone || order.customerPhone || "N/A"}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {order.deliveryStatus === "accepted" ? (
                        <>
                          <Button 
                            onClick={() => handleMarkPickedUp(order.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Start Delivery
                          </Button>
                          <Button 
                            onClick={() => openMap(order.customer?.address || order.deliveryAddress)}
                            variant="outline"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            onClick={() => handleMarkDelivered(order.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Delivered
                          </Button>
                          <Button 
                            onClick={() => openMap(order.customer?.address || order.deliveryAddress)}
                            variant="outline"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Completed Deliveries */}
        {completedDeliveries.length > 0 && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Completed Today ({completedDeliveries.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedDeliveries.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      Delivered at {new Date(order.deliveredAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    ₵{order.total?.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {pendingOrders.length === 0 && ongoingDeliveries.length === 0 && completedDeliveries.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground">
                {isOnline 
                  ? "You're online and ready! Orders will appear here." 
                  : "Switch online to start receiving delivery orders."}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default DriverDashboard;
