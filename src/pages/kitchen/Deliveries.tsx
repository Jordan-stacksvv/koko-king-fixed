import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { Bike, Clock, CheckCircle2, AlertCircle, User, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export default function KitchenDeliveries() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const deliveryOrders = storedOrders.filter(
      (order: any) => order.deliveryStatus && order.deliveryStatus !== "completed"
    );
    setOrders(deliveryOrders);
  };

  const getOngoingDeliveries = () => {
    return orders.filter(
      (order) =>
        order.deliveryStatus === "accepted" || order.deliveryStatus === "on-route"
    );
  };

  const getDelayedDeliveries = () => {
    const now = new Date().getTime();
    return orders.filter((order) => {
      if (!order.assignedAt) return false;
      const assignedTime = new Date(order.assignedAt).getTime();
      const minutesElapsed = (now - assignedTime) / (1000 * 60);
      return minutesElapsed > 30 && order.deliveryStatus !== "delivered";
    });
  };

  const getCompletedDeliveries = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    return storedOrders.filter((order: any) => order.deliveryStatus === "delivered");
  };

  const getDeliveryStatusBadge = (status: string) => {
    const statusConfig = {
      assigned: { label: "Assigned", variant: "secondary" as const, icon: Clock },
      accepted: { label: "Rider Accepted", variant: "default" as const, icon: CheckCircle2 },
      "on-route": { label: "On Route", variant: "default" as const, icon: Bike },
      delivered: { label: "Delivered", variant: "default" as const, icon: CheckCircle2 },
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

  const formatTimeElapsed = (timestamp: string) => {
    const now = new Date().getTime();
    const orderTime = new Date(timestamp).getTime();
    const minutes = Math.floor((now - orderTime) / (1000 * 60));
    return `${minutes} min ago`;
  };

  const renderOrderCard = (order: any) => (
    <Card key={order.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTimeElapsed(order.timestamp)}
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
      </CardContent>
    </Card>
  );

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Monitor ongoing, delayed, and completed deliveries
          </p>
        </div>

        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ongoing">
              Ongoing ({getOngoingDeliveries().length})
            </TabsTrigger>
            <TabsTrigger value="delayed">
              Delayed ({getDelayedDeliveries().length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({getCompletedDeliveries().length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="space-y-4 mt-4">
            {getOngoingDeliveries().length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bike className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No ongoing deliveries</p>
                </CardContent>
              </Card>
            ) : (
              getOngoingDeliveries().map(renderOrderCard)
            )}
          </TabsContent>

          <TabsContent value="delayed" className="space-y-4 mt-4">
            {getDelayedDeliveries().length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No delayed deliveries</p>
                </CardContent>
              </Card>
            ) : (
              getDelayedDeliveries().map((order) => (
                <div key={order.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Delayed
                    </Badge>
                  </div>
                  {renderOrderCard(order)}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {getCompletedDeliveries().length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No completed deliveries yet</p>
                </CardContent>
              </Card>
            ) : (
              getCompletedDeliveries().map(renderOrderCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </KitchenLayout>
  );
}
