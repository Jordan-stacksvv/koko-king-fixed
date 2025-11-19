import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Bike } from "lucide-react";

const Display = () => {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadOrders = () => {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      // Show only confirmed and preparing orders
      const activeOrders = orders.filter((order: any) => 
        order.status === "confirmed" || order.status === "preparing"
      );
      setActiveOrders(activeOrders);
    };

    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "confirmed": return "bg-blue-500";
      case "preparing": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">Kitchen Display System</h1>
        
        {activeOrders.length === 0 ? (
          <div className="text-center text-2xl text-muted-foreground py-20">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No active orders</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeOrders.map((order) => (
              <Card key={order.id} className="border-4 border-primary/20 shadow-lg">
                <CardHeader className="pb-3 bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-3xl font-bold">{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.customer?.name || order.customerName || "Walk-in"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      {order.deliveryMethod === "delivery" ? (
                        <Badge variant="outline" className="gap-1">
                          <Bike className="h-3 w-3" />
                          Delivery
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Package className="h-3 w-3" />
                          Pickup
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <p className="font-semibold text-sm border-b pb-2">Order Items:</p>
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-base">
                          <span className="font-medium">{item.quantity}x {item.name}</span>
                          <span className="font-semibold">
                            ₵{((item.price || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        {item.extras && item.extras.length > 0 && (
                          <div className="ml-4 text-xs text-muted-foreground">
                            {item.extras.map((extra: any, eIdx: number) => (
                              <div key={eIdx}>+ {extra.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-primary/20">
                    <div className="flex justify-between font-bold text-xl">
                      <span>TOTAL</span>
                      <span className="text-primary">₵{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Display;
