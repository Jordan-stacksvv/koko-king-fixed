import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const KitchenOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [notifiedOrders, setNotifiedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("kitchenAuth");
    if (!isAuthenticated) {
      navigate("/kitchen/login");
    }
  }, [navigate]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const activeOrders = storedOrders.filter(
      (order: any) => order.status !== "completed" && order.status !== "cancelled"
    );
    
    const pendingOrders = activeOrders.filter((order: any) => order.status === "pending");
    pendingOrders.forEach((order: any) => {
      if (!notifiedOrders.has(order.id)) {
        playNotificationSound();
        showNewOrderNotification();
        setNotifiedOrders(prev => new Set([...prev, order.id]));
      }
    });
    
    setOrders(activeOrders);
  };

  const playNotificationSound = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVKni7KxfGAg9lunzvmwhBTGH0fPTgjMGHm7A7+OZSA0PVKni7KxfGAg=");
    audio.play().catch(() => {});
  };

  const showNewOrderNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("New Order!", {
        body: "A new order has arrived!",
        icon: kokoKingLogo,
      });
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updated = allOrders.map((order: any) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem("orders", JSON.stringify(updated));
    loadOrders();
    toast.success(`Order ${orderId} updated to ${newStatus}`);
  };

  const handlePrintOrder = (order: any) => {
    const printContent = `
KOKO KING EXPRESS
==================
Order ID: ${order.id}
Type: ${order.orderType === "walk-in" ? "WALK-IN" : "ONLINE"}
Date: ${new Date(order.timestamp).toLocaleString()}
Customer: ${order.customer.name}
Phone: ${order.customer.phone}

ITEMS:
${order.items.map((item: any) => `${item.quantity}x ${item.name} - ₵${(item.price * item.quantity).toFixed(2)}`).join('\n')}

TOTAL: ₵${order.total.toFixed(2)}
==================
    `;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<pre>' + printContent + '</pre>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const renderOrderCard = (order: any) => (
    <Card key={order.id} className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">{order.id}</h3>
          <Badge variant={order.orderType === "walk-in" ? "default" : "secondary"}>
            {order.orderType === "walk-in" ? "Walk-in" : "Online"}
          </Badge>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">₵{order.total.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <p className="text-sm"><strong>Customer:</strong> {order.customer?.name || "N/A"}</p>
        <p className="text-sm"><strong>Phone:</strong> {order.customer?.phone || "N/A"}</p>
        <div className="border-t pt-2 mt-2">
          <p className="text-sm font-semibold mb-1">Items:</p>
          {order.items?.map((item: any, idx: number) => (
            <p key={idx} className="text-sm ml-2">
              {item.quantity}x {item.name}
              {item.extras && item.extras.length > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  + {item.extras.map((e: any) => e.name).join(", ")}
                </span>
              )}
            </p>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {order.status === "pending" && (
          <>
            <Button size="sm" onClick={() => handlePrintOrder(order)} variant="outline">
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button size="sm" onClick={() => handleStatusUpdate(order.id, "confirmed")}>
              Confirm
            </Button>
          </>
        )}
        {order.status === "confirmed" && (
          <Button size="sm" onClick={() => handleStatusUpdate(order.id, "preparing")}>
            Start Preparing
          </Button>
        )}
        {order.status === "preparing" && (
          <Button size="sm" onClick={() => handleStatusUpdate(order.id, "completed")}>
            Mark as Done
          </Button>
        )}
      </div>
    </Card>
  );

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const preparingOrders = orders.filter((o) => o.status === "preparing");

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kitchen Workflow</h1>
          <p className="text-muted-foreground">Manage incoming and active orders</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              New Orders ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({confirmedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Preparing ({preparingOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingOrders.length > 0 ? (
              pendingOrders.map(renderOrderCard)
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                No pending orders
              </Card>
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="mt-6">
            {confirmedOrders.length > 0 ? (
              confirmedOrders.map(renderOrderCard)
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                No confirmed orders
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preparing" className="mt-6">
            {preparingOrders.length > 0 ? (
              preparingOrders.map(renderOrderCard)
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                No orders being prepared
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </KitchenLayout>
  );
};

export default KitchenOrders;
