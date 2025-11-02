import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Display = () => {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadOrders = () => {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      const active = orders.filter((order: any) => 
        order.status === "preparing" || order.status === "confirmed"
      );
      setActiveOrders(active);
    };

    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Kitchen Display - Orders Being Prepared</h1>
        
        {activeOrders.length === 0 ? (
          <div className="text-center text-2xl text-muted-foreground py-20">
            No active orders
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeOrders.map((order) => (
              <Card key={order.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                    </div>
                    <Badge className={
                      order.status === "pending" ? "bg-orange-500" : "bg-blue-500"
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-semibold">₵{item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₵{order.total.toFixed(2)}</span>
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
