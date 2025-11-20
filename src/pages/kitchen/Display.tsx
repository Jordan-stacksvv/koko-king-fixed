import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Bike, ChefHat } from "lucide-react";

const Display = () => {
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadOrders = () => {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      // Show confirmed and preparing orders, prioritize walk-in
      const activeOrders = orders
        .filter((order: any) => 
          order.status === "confirmed" || order.status === "preparing"
        )
        .sort((a: any, b: any) => {
          // Walk-in orders first
          if (a.priority && !b.priority) return -1;
          if (!a.priority && b.priority) return 1;
          if (a.orderType === "walk-in" && b.orderType === "online") return -1;
          if (a.orderType === "online" && b.orderType === "walk-in") return 1;
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
      setActiveOrders(activeOrders);
    };

    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "confirmed": return "bg-blue-500 text-white";
      case "preparing": return "bg-orange-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      {/* Header */}
      <div className="max-w-[1920px] mx-auto mb-8">
        <div className="flex items-center justify-between bg-primary/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-xl">
              <ChefHat className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-primary">Kitchen Display</h1>
              <p className="text-muted-foreground text-lg mt-1">Live Order Status</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active Orders</p>
            <p className="text-6xl font-bold text-primary">{activeOrders.length}</p>
          </div>
        </div>
      </div>
      
      {/* Orders Grid */}
      <div className="max-w-[1920px] mx-auto">
        {activeOrders.length === 0 ? (
          <div className="text-center text-3xl text-muted-foreground py-32">
            <Package className="h-24 w-24 mx-auto mb-6 opacity-30" />
            <p className="text-4xl font-bold mb-2">No Active Orders</p>
            <p className="text-xl">Waiting for new orders...</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeOrders.map((order) => (
              <Card 
                key={order.id} 
                className={`border-4 shadow-2xl transform transition-all hover:scale-105 ${
                  order.status === "preparing" ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" : "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                }`}
              >
                <CardHeader className="pb-3 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-black tracking-tight">
                        #{order.id.slice(-6).toUpperCase()}
                      </CardTitle>
                      <p className="text-base font-semibold text-foreground mt-1">
                        {order.customer?.name || order.customerName || "Walk-in Customer"}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getStatusColor(order.status)} text-sm px-3 py-1 font-bold uppercase`}>
                        {order.status}
                      </Badge>
                      {order.priority && (
                        <Badge variant="destructive" className="text-xs font-bold">
                          PRIORITY
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {order.deliveryMethod === "delivery" ? (
                      <Badge variant="secondary" className="gap-1 text-sm">
                        <Bike className="h-4 w-4" />
                        Delivery
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 text-sm">
                        <Package className="h-4 w-4" />
                        Pickup
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-sm">
                      {order.orderType === "walk-in" ? "Walk-in" : "Online"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border-2 border-border">
                    <p className="font-bold text-sm mb-3 text-primary uppercase tracking-wide">Order Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-start text-base">
                            <span className="font-bold flex-1">
                              <span className="inline-block bg-primary text-primary-foreground rounded-full w-6 h-6 text-center text-sm leading-6 mr-2">
                                {item.quantity}
                              </span>
                              {item.name}
                            </span>
                            <span className="font-bold text-primary ml-2">
                              ₵{((item.price || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          {item.extras && item.extras.length > 0 && (
                            <div className="ml-10 space-y-1">
                              {item.extras.map((extra: any, eIdx: number) => (
                                <div key={eIdx} className="text-sm text-muted-foreground font-medium">
                                  + {extra.name}
                                </div>
                              ))}
                            </div>
                          )}
                          {item.notes && (
                            <div className="ml-10 text-xs italic text-muted-foreground bg-muted/50 p-2 rounded">
                              Note: {item.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-primary/10 backdrop-blur-sm rounded-lg p-3 border-2 border-primary/30">
                    <span className="font-bold text-base uppercase tracking-wide">Total:</span>
                    <span className="text-2xl font-black text-primary">
                      ₵{order.total.toFixed(2)}
                    </span>
                  </div>
                  {order.notes && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-3">
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-400 uppercase mb-1">Special Instructions:</p>
                      <p className="text-sm text-amber-900 dark:text-amber-300 font-medium">{order.notes}</p>
                    </div>
                  )}
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
