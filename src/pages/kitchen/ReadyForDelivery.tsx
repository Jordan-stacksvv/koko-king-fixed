import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Bike, Clock, Package, User, MapPin, Phone, Navigation, XCircle } from "lucide-react";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { toast } from "sonner";

export default function ReadyForDelivery() {
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const ready = storedOrders.filter((order: any) => 
      order.status === "ready" && !order.assignedDriver && order.deliveryMethod === "delivery"
    );
    setReadyOrders(ready);

    const driverQueue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const available = driverQueue.filter((d: any) => d.status === "online" && !d.currentDelivery);
    setOnlineDrivers(available);
  };

  const handleAssignDriver = (order: any) => {
    setSelectedOrder(order);
    setShowAssignDialog(true);
  };

  const assignToDriver = (driver: any) => {
    // Update order with driver assignment
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const finalOrders = allOrders.map((order: any) =>
      order.id === selectedOrder.id
        ? {
            ...order,
            status: "done",
            assignedDriver: driver.driverId,
            driverName: driver.name,
            driverPhone: driver.phone,
            deliveryStatus: "pending-approval",
          }
        : order
    );
    
    localStorage.setItem("orders", JSON.stringify(finalOrders));
    
    // Update driver queue
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const updatedQueue = queue.map((d: any) =>
      d.driverId === driver.driverId
        ? { ...d, currentDelivery: selectedOrder.id }
        : d
    );
    localStorage.setItem("driverQueue", JSON.stringify(updatedQueue));
    
    // Create notification for driver
    const notifications = JSON.parse(localStorage.getItem("driverNotifications") || "[]");
    notifications.push({
      id: Date.now().toString(),
      driverId: driver.driverId,
      orderId: selectedOrder.id,
      orderNumber: selectedOrder.orderId,
      type: "assignment",
      message: `New delivery assignment: Order ${selectedOrder.orderId}`,
      timestamp: new Date().toISOString(),
      read: false
    });
    localStorage.setItem("driverNotifications", JSON.stringify(notifications));
    
    loadData();
    setShowAssignDialog(false);
    toast.success(`Order assigned to ${driver.name} - Notification sent!`);
  };

  const broadcastToAllDrivers = () => {
    if (onlineDrivers.length === 0) {
      toast.error("No drivers available to broadcast");
      return;
    }

    // Send broadcast notification to all online drivers
    const notifications = JSON.parse(localStorage.getItem("driverNotifications") || "[]");
    onlineDrivers.forEach(driver => {
      notifications.push({
        id: `${Date.now()}-${driver.driverId}`,
        driverId: driver.driverId,
        orderId: selectedOrder.id,
        orderNumber: selectedOrder.orderId,
        type: "broadcast",
        message: `Urgent: Order ${selectedOrder.orderId} needs delivery - First to accept gets it!`,
        timestamp: new Date().toISOString(),
        read: false
      });
    });
    localStorage.setItem("driverNotifications", JSON.stringify(notifications));
    
    setShowAssignDialog(false);
    toast.success(`Order broadcasted to ${onlineDrivers.length} drivers`);
  };

  const handleCancelOrder = (orderId: string) => {
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = allOrders.map((order: any) =>
      order.id === orderId
        ? { ...order, status: "cancelled" }
        : order
    );
    
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    loadData();
    toast.success("Order cancelled");
  };

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ready for Delivery</h1>
            <p className="text-muted-foreground mt-1">
              Orders ready to be assigned to riders
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              <Bike className="h-4 w-4 mr-2" />
              {onlineDrivers.length} Drivers Available
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Package className="h-4 w-4 mr-2" />
              {readyOrders.length} Ready Orders
            </Badge>
          </div>
        </div>

        {readyOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders ready for delivery</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {readyOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{order.orderId}</span>
                    <Badge variant="default">Ready</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{order.deliveryAddress || order.customer.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(order.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Items:</p>
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="text-xs">
                        {item.quantity}x {item.name}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm font-semibold">Total: ₵{order.total.toFixed(2)}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAssignDriver(order)}
                      className="flex-1"
                      disabled={onlineDrivers.length === 0}
                    >
                      <Bike className="h-4 w-4 mr-2" />
                      Assign Rider
                    </Button>
                    <Button 
                      variant="destructive"
                      size="icon"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Assign Driver Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Rider to Order {selectedOrder?.orderId}</DialogTitle>
              <DialogDescription>
                Select a driver or broadcast to all available drivers
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-96 overflow-auto">
              {onlineDrivers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No drivers available
                </div>
              ) : (
                onlineDrivers.map((driver) => (
                  <Card key={driver.driverId} className="cursor-pointer hover:bg-accent/50" onClick={() => assignToDriver(driver)}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bike className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{driver.name}</p>
                          <p className="text-sm text-muted-foreground">{driver.phone}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Available</Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={broadcastToAllDrivers} disabled={onlineDrivers.length === 0}>
                <Navigation className="h-4 w-4 mr-2" />
                Broadcast to All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </KitchenLayout>
  );
}
