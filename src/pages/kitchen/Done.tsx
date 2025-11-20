import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Bike, Clock, CheckCircle2, Radio, User, MapPin, Phone, Package } from "lucide-react";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { toast } from "sonner";

export default function KitchenDone() {
  const [orders, setOrders] = useState<any[]>([]);
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [assignmentInProgress, setAssignmentInProgress] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const doneOrders = storedOrders.filter((order: any) => 
      order.status === "done" || order.deliveryStatus
    );
    setOrders(doneOrders);

    const driverQueue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const available = driverQueue.filter((d: any) => d.status === "online" && !d.currentDelivery);
    setOnlineDrivers(available);
  };

  const handleAssignDriver = (order: any) => {
    setSelectedOrder(order);
    setShowAssignDialog(true);
  };

  const assignToFirstDriver = async () => {
    if (onlineDrivers.length === 0) {
      toast.error("No drivers available");
      return;
    }

    setAssignmentInProgress(true);
    
    // Try first driver with 15-second timeout
    const firstDriver = onlineDrivers[0];
    toast.info(`Assignment request sent to ${firstDriver.name}...`);
    
    const timeout = await simulateDriverResponse(15000);
    
    if (timeout) {
      // First driver missed it, try second
      if (onlineDrivers.length > 1) {
        const secondDriver = onlineDrivers[1];
        toast.info(`First driver missed. Trying ${secondDriver.name}...`);
        
        const secondTimeout = await simulateDriverResponse(15000);
        
        if (secondTimeout) {
          // Both missed, broadcast to all
          toast.info("Broadcasting to all available drivers...");
          await simulateDriverResponse(30000);
          broadcastToAllDrivers();
        } else {
          assignOrderToDriver(secondDriver);
        }
      } else {
        // Only one driver, broadcast
        toast.info("Driver missed. Broadcasting to all available drivers...");
        await simulateDriverResponse(30000);
        broadcastToAllDrivers();
      }
    } else {
      assignOrderToDriver(firstDriver);
    }
    
    setAssignmentInProgress(false);
  };

  const simulateDriverResponse = (timeoutMs: number): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulate 30% chance of acceptance
      const accepted = Math.random() > 0.7;
      const responseTime = Math.random() * timeoutMs;
      
      setTimeout(() => {
        resolve(!accepted); // Return true if timed out (not accepted)
      }, Math.min(responseTime, timeoutMs));
    });
  };

  const broadcastToAllDrivers = () => {
    toast.success(`Order broadcasted to ${onlineDrivers.length} drivers`);
    // In real implementation, this would send notifications to all drivers
  };

  const assignOrderToDriver = (driver: any) => {
    const updatedOrders = orders.map((order) =>
      order.id === selectedOrder.id
        ? {
            ...order,
            assignedDriver: driver.driverId,
            driverName: driver.name,
            driverPhone: driver.phone,
            deliveryStatus: "pending-approval",
            assignedAt: new Date().toISOString(),
          }
        : order
    );

    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const finalOrders = allOrders.map((order: any) =>
      order.id === selectedOrder.id ? updatedOrders.find((o) => o.id === selectedOrder.id) : order
    );

    localStorage.setItem("orders", JSON.stringify(finalOrders));
    setOrders(updatedOrders);

    // Update driver status
    const driverQueue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const updatedQueue = driverQueue.map((d: any) =>
      d.driverId === driver.driverId ? { ...d, currentDelivery: selectedOrder.id, status: "on-delivery" } : d
    );
    localStorage.setItem("driverQueue", JSON.stringify(updatedQueue));

    toast.success(`Order ${selectedOrder.orderId} assigned to ${driver.name}`);
    setShowAssignDialog(false);
  };

  const handleManualAssign = (driver: any) => {
    assignOrderToDriver(driver);
  };

  const handleCompleteOrder = (orderId: string) => {
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updated = allOrders.map((o: any) =>
      o.id === orderId
        ? { ...o, status: "completed", completedAt: new Date().toISOString() }
        : o
    );
    localStorage.setItem("orders", JSON.stringify(updated));
    loadData();
    toast.success("Order marked as completed for pickup");
  };

  const getDeliveryStatusBadge = (status: string) => {
    const statusConfig = {
      "pending-approval": { label: "Pending Approval", variant: "secondary" as const, icon: Clock },
      assigned: { label: "Assigned", variant: "secondary" as const, icon: Clock },
      accepted: { label: "Rider Accepted", variant: "default" as const, icon: CheckCircle2 },
      "on-route": { label: "On Route", variant: "default" as const, icon: Bike },
      delivered: { label: "Delivered", variant: "default" as const, icon: CheckCircle2 },
      completed: { label: "Completed", variant: "outline" as const, icon: CheckCircle2 },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.assigned;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ready for Delivery</h1>
          <p className="text-muted-foreground mt-1">
            Assign completed orders to riders for delivery
          </p>
        </div>

        <div className="grid gap-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No completed orders waiting for delivery</p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(order.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {order.deliveryStatus && getDeliveryStatusBadge(order.deliveryStatus)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {order.customer?.name || order.customerName || "Walk-in Customer"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer?.phone || order.customerPhone || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {order.deliveryAddress || order.customer?.address || "No address"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Order Items:</p>
                      <div className="space-y-1">
                        {order.items?.map((item: any, idx: number) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                      </div>
                      <p className="text-lg font-bold">Total: ₵{order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {order.driverName && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Assigned Driver:</p>
                      <div className="flex items-center gap-2">
                        <Bike className="h-4 w-4" />
                        <span className="text-sm">{order.driverName}</span>
                        <span className="text-sm text-muted-foreground">• {order.driverPhone}</span>
                      </div>
                    </div>
                  )}

                  {order.deliveryMethod === "delivery" && !order.assignedDriver && (
                    <Button
                      onClick={() => handleAssignDriver(order)}
                      className="w-full"
                      size="lg"
                    >
                      <Bike className="mr-2 h-5 w-5" />
                      Assign to Rider
                    </Button>
                  )}
                  
                  {(order.deliveryMethod === "pickup" || order.orderType === "walk-in") && !order.deliveryStatus && (
                    <Button
                      onClick={() => handleCompleteOrder(order.id)}
                      className="w-full"
                      size="lg"
                      variant="default"
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Mark as Completed
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Assign Driver Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Rider</DialogTitle>
              <DialogDescription>
                Choose a rider for Order #{selectedOrder?.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Button
                onClick={assignToFirstDriver}
                className="w-full"
                size="lg"
                disabled={assignmentInProgress || onlineDrivers.length === 0}
              >
                <Radio className="mr-2 h-5 w-5" />
                {assignmentInProgress
                  ? "Assignment in progress..."
                  : "Auto-Assign (First in Queue)"}
              </Button>

              <Button
                onClick={() => {
                  broadcastToAllDrivers();
                  setShowAssignDialog(false);
                }}
                className="w-full"
                size="lg"
                variant="outline"
                disabled={assignmentInProgress || onlineDrivers.length === 0}
              >
                <Radio className="mr-2 h-5 w-5" />
                Broadcast to All Riders
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or select manually</span>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {onlineDrivers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No riders available
                  </p>
                ) : (
                  onlineDrivers.map((driver, index) => (
                    <Button
                      key={driver.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleManualAssign(driver)}
                      disabled={assignmentInProgress}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{driver.name}</p>
                          <p className="text-xs text-muted-foreground">{driver.phone}</p>
                        </div>
                        <Bike className="h-4 w-4" />
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </KitchenLayout>
  );
}
