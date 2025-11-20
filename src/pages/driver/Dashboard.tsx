import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Package, Clock, CheckCircle, Navigation, LogOut, User } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { toast } from "sonner";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [ongoingOrders, setOngoingOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const driverAuth = localStorage.getItem("driverAuth");
    if (!driverAuth) {
      navigate("/driver/login");
      return;
    }

    const driverData = JSON.parse(driverAuth);
    setDriver(driverData);
    loadOrders(driverData.id);
    loadOnlineStatus(driverData.id);
  }, [navigate]);

  const loadOrders = (driverId: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    
    // Pending: Orders marked "ready-for-driver" and not yet assigned
    const pending = orders.filter((o: any) => 
      o.status === "ready-for-driver" && !o.driverId
    );
    
    // Ongoing: Orders assigned to this driver and not delivered
    const ongoing = orders.filter((o: any) => 
      o.driverId === driverId && o.status !== "delivered"
    );
    
    // Completed: Orders delivered by this driver
    const completed = orders.filter((o: any) => 
      o.driverId === driverId && o.status === "delivered"
    );

    setPendingOrders(pending);
    setOngoingOrders(ongoing);
    setCompletedOrders(completed);

    // Calculate earnings (20% commission)
    const earnings = completed.reduce((sum: number, order: any) => sum + (order.total * 0.20), 0);
    setTotalEarnings(earnings);
  };

  const loadOnlineStatus = (driverId: string) => {
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const isInQueue = queue.some((d: any) => d.id === driverId && d.status === "online");
    setIsOnline(isInQueue);
  };

  const toggleOnlineStatus = () => {
    if (!driver) return;

    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    
    if (isOnline) {
      // Go offline - remove from queue
      const updated = queue.filter((d: any) => d.id !== driver.id);
      localStorage.setItem("driverQueue", JSON.stringify(updated));
      setIsOnline(false);
      toast.success("You are now offline");

      // CONVEX TODO: Update driver status
      // await mutation(api.drivers.goOffline, { driverId: driver.id });
    } else {
      // Go online - add to queue
      const newEntry = {
        id: driver.id,
        name: driver.fullName || driver.phone,
        phone: driver.phone,
        status: "online",
        joinedAt: new Date().toISOString(),
        currentOrder: null
      };
      queue.push(newEntry);
      localStorage.setItem("driverQueue", JSON.stringify(queue));
      setIsOnline(true);
      toast.success("You are now online and in queue! 🚴");

      // CONVEX TODO: Update driver status & notify system
      // await mutation(api.drivers.goOnline, { 
      //   driverId: driver.id,
      //   location: { lat: 0, lng: 0 } // Use real geolocation
      // });
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    if (!driver) return;

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].driverId = driver.id;
      orders[orderIndex].driverName = driver.fullName || driver.phone;
      orders[orderIndex].driverPhone = driver.phone;
      orders[orderIndex].status = "assigned-to-driver";
      orders[orderIndex].acceptedAt = new Date().toISOString();
      
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders(driver.id);
      toast.success("Order accepted!");
    }
  };

  const handleMarkPickedUp = (orderId: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = "out-for-delivery";
      orders[orderIndex].pickedUpAt = new Date().toISOString();
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders(driver.id);
      toast.success("Order marked as picked up!");
    }
  };

  const handleMarkDelivered = (orderId: string) => {
    if (!driver) return;

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = "delivered";
      orders[orderIndex].deliveryStatus = "delivered";
      orders[orderIndex].deliveredAt = new Date().toISOString();
      localStorage.setItem("orders", JSON.stringify(orders));
      
      // Return driver to queue
      const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
      const driverIndex = queue.findIndex((d: any) => d.id === driver.id);
      if (driverIndex !== -1) {
        queue[driverIndex].status = "online";
        queue[driverIndex].currentOrder = null;
      }
      localStorage.setItem("driverQueue", JSON.stringify(queue));
      
      loadOrders(driver.id);
      toast.success("✅ Delivery confirmed! Order completed.");
    }
  };

  const openMap = (address: string) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(mapsUrl, "_blank");
  };

  const handleLogout = () => {
    // Remove from queue on logout
    if (driver) {
      const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
      const updated = queue.filter((d: any) => d.id !== driver.id);
      localStorage.setItem("driverQueue", JSON.stringify(updated));
    }
    
    localStorage.removeItem("driverAuth");
    navigate("/driver/login");
  };

  if (!driver) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <img 
            src={kokoKingLogo} 
            alt="Koko King" 
            className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          />
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/driver/profile")}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
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

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Driver Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {driver.fullName || driver.phone}</p>
        </div>

        <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
          <Switch
            id="online-status"
            checked={isOnline}
            onCheckedChange={toggleOnlineStatus}
          />
          <Label htmlFor="online-status" className="cursor-pointer">
            {isOnline ? (
              <span className="text-green-600 font-semibold">🟢 Online - Accepting Orders</span>
            ) : (
              <span className="text-muted-foreground">🔴 Offline</span>
            )}
          </Label>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ongoing Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ongoingOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₵{totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing ({ongoingOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending orders. Turn online to receive orders!
                </CardContent>
              </Card>
            ) : (
              pendingOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.customerName || "Customer"}
                        </p>
                      </div>
                      <Badge variant="secondary">₵{order.total.toFixed(2)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">{order.deliveryAddress || "No address"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openMap(order.deliveryAddress)}
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.items?.length || 0} items</span>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={!isOnline}
                    >
                      Accept Order
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="ongoing" className="space-y-4 mt-4">
            {ongoingOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No ongoing deliveries
                </CardContent>
              </Card>
            ) : (
              ongoingOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.customerName || "Customer"}
                        </p>
                      </div>
                      <Badge className="bg-purple-500">
                        {order.status === "assigned-to-driver" ? "Assigned" : "Out for Delivery"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openMap(order.deliveryAddress)}
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${order.customerPhone}`} className="text-sm text-primary">
                        {order.customerPhone || "N/A"}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">₵{order.total.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-2">
                      {order.status === "assigned-to-driver" && (
                        <Button 
                          className="flex-1" 
                          onClick={() => handleMarkPickedUp(order.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Picked Up
                        </Button>
                      )}
                      {order.status === "out-for-delivery" && (
                        <Button 
                          className="flex-1" 
                          onClick={() => handleMarkDelivered(order.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Delivered
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No completed deliveries yet
                </CardContent>
              </Card>
            ) : (
              completedOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(order.deliveredAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-green-500">Delivered</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order Total:</span>
                      <span className="font-medium">₵{order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your Earnings (20%):</span>
                      <span className="font-semibold text-green-600">₵{(order.total * 0.20).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DriverDashboard;
