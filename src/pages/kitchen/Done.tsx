import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, Bike } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { toast } from "sonner";

const KitchenDone = () => {
  const navigate = useNavigate();
  const [doneOrders, setDoneOrders] = useState<any[]>([]);
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("kitchenAuth")) {
      navigate("/kitchen/login");
      return;
    }
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadData = () => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const done = orders.filter((o: any) => o.status === "completed");
    setDoneOrders(done);

    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const online = queue.filter((d: any) => d.status === "online" && !d.currentOrder);
    setOnlineDrivers(online);
  };

  const handleLogout = () => {
    localStorage.removeItem("kitchenAuth");
    navigate("/kitchen/login");
  };

  const handleAssignDriver = (order: any) => {
    if (onlineDrivers.length === 0) {
      toast.error("No drivers available online");
      return;
    }
    setSelectedOrder(order);
    setIsAssignDialogOpen(true);
  };

  const assignToFirstDriver = () => {
    if (onlineDrivers.length === 0 || !selectedOrder) {
      toast.error("No drivers online");
      return;
    }

    const firstDriver = onlineDrivers[0];
    
    // Update order with assigned driver
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = allOrders.map((o: any) =>
      o.id === selectedOrder.id
        ? { ...o, assignedDriver: firstDriver.name, driverId: firstDriver.id, deliveryStatus: "assigned" }
        : o
    );
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    // Update driver queue
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const updatedQueue = queue.map((d: any) =>
      d.id === firstDriver.id
        ? { ...d, currentOrder: selectedOrder.id, status: "on_delivery" }
        : d
    );
    localStorage.setItem("driverQueue", JSON.stringify(updatedQueue));

    toast.success(`Order assigned to ${firstDriver.name}`);
    setIsAssignDialogOpen(false);
    loadData();
  };

  const handleManualAssign = (driverId: string, driverName: string) => {
    if (!selectedOrder) return;

    // Update order with assigned driver
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = allOrders.map((o: any) =>
      o.id === selectedOrder.id
        ? { ...o, assignedDriver: driverName, driverId, deliveryStatus: "assigned" }
        : o
    );
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    // Update driver queue
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const updatedQueue = queue.map((d: any) =>
      d.id === driverId
        ? { ...d, currentOrder: selectedOrder.id, status: "on_delivery" }
        : d
    );
    localStorage.setItem("driverQueue", JSON.stringify(updatedQueue));

    toast.success(`Order assigned to ${driverName}`);
    setIsAssignDialogOpen(false);
    loadData();
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
                  Completed orders ready for delivery
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {doneOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No completed orders yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {doneOrders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{order.id}</h3>
                      <Badge variant={order.orderType === 'walk-in' ? 'secondary' : 'default'}>
                        {order.orderType === 'walk-in' ? 'WALK-IN' : 'ONLINE'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customer.name} • {order.customer.phone}
                    </p>
                    {order.customer.address && (
                      <p className="text-sm text-muted-foreground mt-1">
                        📍 {order.customer.address}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₵{order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₵{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.assignedDriver ? (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bike className="h-4 w-4" />
                      <span className="text-sm">
                        Assigned to: <strong>{order.assignedDriver}</strong>
                      </span>
                      <Badge variant="outline" className="ml-auto">
                        {order.deliveryStatus || 'Out for Delivery'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleAssignDriver(order)}
                    className="w-full gap-2"
                  >
                    <Bike className="h-4 w-4" />
                    Assign to Rider
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Driver Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Rider</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold mb-2">Order: {selectedOrder?.id}</p>
              <p className="text-sm text-muted-foreground">
                {selectedOrder?.customer?.name} • ₵{selectedOrder?.total?.toFixed(2)}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={assignToFirstDriver}
                className="w-full gap-2"
                size="lg"
              >
                <Bike className="h-5 w-5" />
                Auto-Assign to First Available Rider
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or select manually
                  </span>
                </div>
              </div>

              {onlineDrivers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No drivers currently online
                </p>
              ) : (
                <div className="space-y-2">
                  {onlineDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleManualAssign(driver.id, driver.name)}
                    >
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-xs text-muted-foreground">{driver.phone}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Assign
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KitchenDone;
