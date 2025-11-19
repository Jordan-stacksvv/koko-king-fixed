import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, TruckIcon, CheckCircle } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { toast } from "sonner";

const KitchenDone = () => {
  const navigate = useNavigate();
  const [doneOrders, setDoneOrders] = useState<any[]>([]);
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState<string | null>(null);
  const [assignmentTimeout, setAssignmentTimeout] = useState<number>(0);

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
    const done = orders.filter((o: any) => o.status === "done");
    setDoneOrders(done);

    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const online = queue.filter((d: any) => d.status === "online" && !d.currentOrder);
    setOnlineDrivers(online);
  };

  // CONVEX TODO: Replace with real-time subscription
  // const doneOrders = useQuery(api.orders.getDoneOrders, { branchId });
  // const onlineDrivers = useQuery(api.drivers.getOnlineDrivers, { branchId });

  const handleAssignDriver = (order: any) => {
    if (onlineDrivers.length === 0) {
      toast.error("No drivers available online");
      return;
    }
    setSelectedOrder(order);
    setIsAssignDialogOpen(true);
  };

  const assignToFirstDriver = async () => {
    if (onlineDrivers.length === 0) {
      toast.error("No drivers online");
      broadcastToAllDrivers();
      return;
    }

    const firstDriver = onlineDrivers[0];
    setAssigningDriver(firstDriver.id);
    setAssignmentTimeout(15);

    // Start countdown
    const countdown = setInterval(() => {
      setAssignmentTimeout(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          trySecondDriver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Send notification to first driver
    // CONVEX TODO: Use Resend API via edge function
    // await mutation(api.notifications.sendDriverAssignment, {
    //   driverId: firstDriver.id,
    //   orderId: selectedOrder.id,
    //   timeout: 15000
    // });

    toast.info(`Assigning to ${firstDriver.name}... (15s timeout)`);
  };

  const trySecondDriver = () => {
    if (onlineDrivers.length < 2) {
      broadcastToAllDrivers();
      return;
    }

    const secondDriver = onlineDrivers[1];
    setAssigningDriver(secondDriver.id);
    setAssignmentTimeout(15);

    const countdown = setInterval(() => {
      setAssignmentTimeout(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          broadcastToAllDrivers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // CONVEX TODO: Send to second driver
    toast.info(`Trying ${secondDriver.name}... (15s timeout)`);
  };

  const broadcastToAllDrivers = () => {
    setAssigningDriver("broadcast");
    toast.info("Broadcasting to all online drivers...");
    
    // CONVEX TODO: Broadcast via Resend API
    // await mutation(api.notifications.broadcastOrderToDrivers, {
    //   orderId: selectedOrder.id,
    //   branchId: selectedOrder.branchId
    // });
  };

  const handleDriverAccept = (driverId: string, driverName: string) => {
    // Update order with assigned driver
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updated = orders.map((o: any) => 
      o.id === selectedOrder.id 
        ? { ...o, assignedDriver: { id: driverId, name: driverName }, status: "out-for-delivery" }
        : o
    );
    localStorage.setItem("orders", JSON.stringify(updated));

    // Update driver queue
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const updatedQueue = queue.map((d: any) =>
      d.id === driverId ? { ...d, currentOrder: selectedOrder.id } : d
    );
    localStorage.setItem("driverQueue", JSON.stringify(updatedQueue));

    // CONVEX TODO: Send customer notification via Resend
    // await mutation(api.notifications.sendCustomerOrderOnWay, {
    //   orderId: selectedOrder.id,
    //   driverName,
    //   customerPhone: selectedOrder.customer.phone
    // });

    toast.success(`${driverName} has accepted the order!`);
    setIsAssignDialogOpen(false);
    setSelectedOrder(null);
    setAssigningDriver(null);
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem("kitchenAuth");
    navigate("/kitchen/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src={kokoKingLogo} alt="Koko King" className="h-10" />
            <div>
              <h1 className="text-lg font-bold">Done Orders</h1>
              <p className="text-xs text-muted-foreground">Ready for delivery</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{doneOrders.length} Completed Orders</h2>
            <p className="text-sm text-muted-foreground">{onlineDrivers.length} drivers online</p>
          </div>
        </div>

        {doneOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No completed orders yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {doneOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{order.id}</h3>
                      <p className="text-sm text-muted-foreground">{order.customer.name} • {order.customer.phone}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                      Done
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-3">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-semibold">₵{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-bold">Total: ₵{order.total.toFixed(2)}</span>
                    <div className="flex gap-2 items-center">
                      {order.status === "out-for-delivery" ? (
                        <Badge className="bg-blue-500 text-white">
                          <TruckIcon className="h-3 w-3 mr-1" />
                          Out for Delivery - {order.assignedDriver?.name}
                        </Badge>
                      ) : order.status === "delivered" ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Delivered
                        </Badge>
                      ) : order.assignedDriver ? (
                        <Badge className="bg-orange-500 text-white">
                          Assigned to {order.assignedDriver.name}
                        </Badge>
                      ) : (
                        <Button onClick={() => handleAssignDriver(order)} size="sm">
                          <TruckIcon className="h-4 w-4 mr-2" />
                          Assign to Rider
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Driver Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver to Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {assigningDriver ? (
              <div className="text-center py-6">
                <div className="animate-pulse mb-4">
                  <TruckIcon className="h-12 w-12 mx-auto text-primary" />
                </div>
                <p className="font-semibold mb-2">
                  {assigningDriver === "broadcast" 
                    ? "Broadcasting to all drivers..." 
                    : `Waiting for driver response...`}
                </p>
                {assignmentTimeout > 0 && (
                  <p className="text-sm text-muted-foreground">Timeout in {assignmentTimeout}s</p>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {onlineDrivers.length} drivers available online
                </p>
                
                <Button onClick={assignToFirstDriver} className="w-full" size="lg">
                  Auto-Assign (15s timeout per driver)
                </Button>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Or select driver manually:</h4>
                  <div className="space-y-2">
                    {onlineDrivers.map((driver) => (
                      <Button
                        key={driver.id}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => handleDriverAccept(driver.id, driver.name)}
                      >
                        <span>{driver.name}</span>
                        <Badge variant="secondary">{driver.phone}</Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KitchenDone;
