import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bike, MapPin, Phone, Package } from "lucide-react";
import { toast } from "sonner";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";

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
    
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = allOrders.map((o: any) =>
      o.id === selectedOrder.id
        ? { ...o, assignedDriver: firstDriver.name, driverId: firstDriver.id, deliveryStatus: "assigned" }
        : o
    );
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

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

    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = allOrders.map((o: any) =>
      o.id === selectedOrder.id
        ? { ...o, assignedDriver: driverName, driverId, deliveryStatus: "assigned" }
        : o
    );
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

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

  const getDeliveryStatusBadge = (status: string) => {
    const badges: any = {
      assigned: <Badge variant="outline">Assigned</Badge>,
      accepted: <Badge className="bg-blue-500">Rider Accepted</Badge>,
      "on-route": <Badge className="bg-purple-500">On Route</Badge>,
      delivered: <Badge className="bg-green-500">Delivered</Badge>,
      completed: <Badge className="bg-gray-500">Completed</Badge>,
    };
    return badges[status] || null;
  };

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Completed Orders & Delivery Status</h1>
          <p className="text-muted-foreground">Manage rider assignments and track deliveries</p>
        </div>

        {doneOrders.length > 0 ? (
          <div className="grid gap-4">
            {doneOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{order.id}</h3>
                      <Badge variant={order.orderType === "walk-in" ? "default" : "secondary"}>
                        {order.orderType}
                      </Badge>
                      {order.deliveryStatus && getDeliveryStatusBadge(order.deliveryStatus)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer?.phone || "N/A"}</span>
                      </div>
                      {order.customer?.address && (
                        <div className="flex items-center gap-2 md:col-span-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{order.customer.address}</span>
                        </div>
                      )}
                      {order.assignedDriver && (
                        <div className="flex items-center gap-2 md:col-span-2">
                          <Bike className="h-4 w-4 text-muted-foreground" />
                          <span>Driver: <strong>{order.assignedDriver}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-1">Items:</p>
                      {order.items?.map((item: any, idx: number) => (
                        <p key={idx} className="text-sm text-muted-foreground ml-2">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="font-bold text-xl">₵{order.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!order.assignedDriver && (
                      <Button size="sm" onClick={() => handleAssignDriver(order)}>
                        <Bike className="h-4 w-4 mr-2" />
                        Assign to Rider
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center text-muted-foreground">
            <p className="text-lg">No completed orders yet</p>
          </Card>
        )}

        {/* Assign Driver Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Rider to Order {selectedOrder?.id}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {onlineDrivers.length > 0 ? (
                <>
                  <Button onClick={assignToFirstDriver} className="w-full">
                    Auto-Assign to First Available Rider ({onlineDrivers[0]?.name})
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
                    {onlineDrivers.map((driver) => (
                      <Card key={driver.id} className="p-3 hover:bg-muted/50 cursor-pointer" onClick={() => handleManualAssign(driver.id, driver.name)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bike className="h-5 w-5" />
                            <div>
                              <p className="font-medium">{driver.name}</p>
                              <p className="text-xs text-muted-foreground">{driver.phone}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Online
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">No riders currently online</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </KitchenLayout>
  );
};

export default KitchenDone;
