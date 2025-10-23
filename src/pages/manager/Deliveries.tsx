import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const deliveryOrders = orders.filter((order: any) => 
      order.deliveryMethod === "delivery" && 
      (order.status === "out-for-delivery" || order.status === "completed")
    );
    setDeliveries(deliveryOrders);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "out-for-delivery": return "bg-purple-500";
      case "completed": return "bg-green-500";
      default: return "bg-muted";
    }
  };

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Delivery Management</h1>
          <p className="text-muted-foreground">Track all delivery orders</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deliveries.filter(d => d.status === "out-for-delivery").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deliveries.filter(d => d.status === "completed").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25 min</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Integrate with external delivery services for seamless order fulfillment
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => toast.info("Bolt Food integration coming soon!")}
              >
                <Truck className="h-6 w-6" />
                <span>Bolt Food</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => toast.info("Custom delivery system available")}
              >
                <Truck className="h-6 w-6" />
                <span>In-House Delivery</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliveries.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No active deliveries</p>
              ) : (
                deliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{delivery.id}</p>
                        <Badge className={getStatusColor(delivery.status)}>
                          {delivery.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{delivery.customer.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{delivery.customer.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₵{delivery.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(delivery.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </KitchenLayout>
  );
};

export default Deliveries;
