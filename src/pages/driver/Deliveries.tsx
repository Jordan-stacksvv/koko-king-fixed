import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, MapPin, Phone, User, Navigation, PhoneCall, MessageSquare } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { toast } from "sonner";
import { calculateDistance } from "@/lib/geolocation";

const DriverDeliveries = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const auth = localStorage.getItem("driverAuth");
    if (!auth) {
      navigate("/driver/login");
      return;
    }
    setDriver(JSON.parse(auth));
    loadDeliveries();

    // Check driver location vs delivery destination
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition((position) => {
        checkArrival(position.coords.latitude, position.coords.longitude);
      });
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [navigate]);

  const loadDeliveries = () => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const driverAuth = JSON.parse(localStorage.getItem("driverAuth") || "{}");
    
    const todayDeliveries = orders.filter((order: any) => 
      order.deliveryMethod === "delivery" && 
      order.assignedDriver === driverAuth.id &&
      order.status !== "cancelled" &&
      new Date(order.timestamp).toDateString() === new Date().toDateString()
    );
    setDeliveries(todayDeliveries);
  };

  const checkArrival = (driverLat: number, driverLng: number) => {
    const activeDelivery = deliveries.find(d => 
      d.deliveryStatus === "on-route" && d.customerLocation
    );

    if (activeDelivery && activeDelivery.customerLocation) {
      const distance = calculateDistance(
        driverLat,
        driverLng,
        activeDelivery.customerLocation.lat,
        activeDelivery.customerLocation.lng
      );

      // If within 50 meters, notify customer
      if (distance < 0.05) {
        sendArrivalAlert(activeDelivery);
      }
    }
  };

  const sendArrivalAlert = (delivery: any) => {
    // Update delivery status
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updated = orders.map((order: any) =>
      order.id === delivery.id 
        ? { ...order, arrivalNotified: true, arrivedAt: new Date().toISOString() } 
        : order
    );
    localStorage.setItem("orders", JSON.stringify(updated));
    
    toast.success("Customer notified of your arrival!", {
      description: `Order ${delivery.id} - You're at the destination`,
    });
    
    loadDeliveries();
  };

  const handleMarkAsDone = (orderId: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updated = orders.map((order: any) =>
      order.id === orderId 
        ? { 
            ...order, 
            status: "completed",
            deliveryStatus: "delivered",
            completedAt: new Date().toISOString() 
          } 
        : order
    );
    localStorage.setItem("orders", JSON.stringify(updated));
    loadDeliveries();
    toast.success("Delivery marked as completed!");
  };

  const handleCallCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsAppCustomer = (phone: string, orderId: string) => {
    const message = encodeURIComponent(
      `Hello! I'm your Koko King driver for order ${orderId}. I'm on my way with your delivery.`
    );
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem("driverAuth");
    navigate("/");
  };

  const openMap = (address: string, lat?: number, lng?: number) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const activeDeliveries = deliveries.filter(d => 
    d.status !== "completed" && d.deliveryStatus !== "delivered"
  );
  const completedDeliveries = deliveries.filter(d => 
    d.status === "completed" || d.deliveryStatus === "delivered"
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={kokoKingLogo} alt="Koko King" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-bold">Driver Dashboard</h1>
              {driver && <p className="text-sm text-muted-foreground">{driver.phone}</p>}
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{activeDeliveries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{completedDeliveries.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {activeDeliveries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active deliveries</p>
              ) : (
                <div className="space-y-4">
                  {activeDeliveries.map((delivery) => (
                    <div key={delivery.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">{delivery.id}</p>
                            <Badge className="bg-orange-500">Active</Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{delivery.customer.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{delivery.customerPhone}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                              <span className="text-sm">{delivery.deliveryAddress || delivery.customer.address}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-lg">₵{delivery.total.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(delivery.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => openMap(
                            delivery.deliveryAddress || delivery.customer.address,
                            delivery.customerLocation?.lat,
                            delivery.customerLocation?.lng
                          )}
                          className="flex-1 min-w-[120px]"
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Navigate
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCallCustomer(delivery.customerPhone)}
                          className="flex-1 min-w-[120px]"
                        >
                          <PhoneCall className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWhatsAppCustomer(delivery.customerPhone, delivery.id)}
                          className="flex-1 min-w-[120px]"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-500 hover:bg-green-600 flex-1 min-w-[120px]"
                          onClick={() => handleMarkAsDone(delivery.id)}
                        >
                          Mark as Delivered
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        <strong>Order Items:</strong>{" "}
                        {delivery.items.map((item: any) => item.name).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {completedDeliveries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No completed deliveries yet</p>
              ) : (
                <div className="space-y-4">
                  {completedDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{delivery.id}</p>
                          <Badge className="bg-green-500">Completed</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{delivery.customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {delivery.deliveryAddress || delivery.customer.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{delivery.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(delivery.completedAt || delivery.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {completedDeliveries.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Completed Deliveries</h2>
            <div className="space-y-2">
              {completedDeliveries.map((delivery) => (
                <Card key={delivery.id} className="opacity-60">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{delivery.id}</p>
                        <p className="text-sm text-muted-foreground">{delivery.customer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{delivery.total.toFixed(2)}</p>
                        <Badge className="bg-green-500">Completed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {deliveries.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No deliveries assigned for today</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverDeliveries;
