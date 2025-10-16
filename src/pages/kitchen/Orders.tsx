import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Bell } from "lucide-react";
import { OrderCard } from "@/components/kitchen/OrderCard";
import kokoKingLogo from "@/assets/koko-king-logo.png";

const KitchenOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [lastOrderCount, setLastOrderCount] = useState(0);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("kitchenAuth");
    if (!isAuthenticated) {
      navigate("/kitchen/login");
    }
  }, [navigate]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000); // Check for new orders every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const activeOrders = storedOrders.filter(
      (order: any) => order.status !== "completed" && order.status !== "cancelled"
    );
    
    // New order notification
    if (activeOrders.length > lastOrderCount) {
      playNotificationSound();
      showNewOrderNotification();
    }
    
    setLastOrderCount(activeOrders.length);
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
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    
    // Update in localStorage
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updated = allOrders.map((order: any) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem("orders", JSON.stringify(updated));
  };

  const handleRemoveOrder = (orderId: string) => {
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updated = allOrders.map((order: any) =>
      order.id === orderId ? { ...order, status: "completed" } : order
    );
    localStorage.setItem("orders", JSON.stringify(updated));
    loadOrders();
  };

  const toggleExpand = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      // Limit to 3 expanded orders
      if (newExpanded.size >= 3) {
        const firstExpanded = Array.from(newExpanded)[0];
        newExpanded.delete(firstExpanded);
      }
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleLogout = () => {
    localStorage.removeItem("kitchenAuth");
    navigate("/");
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const preparingOrders = orders.filter(o => o.status === "preparing");
  const readyOrders = orders.filter(o => o.status === "ready" || o.status === "out-for-delivery");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={kokoKingLogo} alt="Koko King" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold">Kitchen Display System</h1>
              <p className="text-sm text-muted-foreground">Active Orders: {orders.length}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Active Orders</h2>
            <p className="text-muted-foreground">Waiting for new orders to arrive...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-500 animate-bounce" />
                  New Orders ({pendingOrders.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                      onRemove={handleRemoveOrder}
                      isExpanded={expandedOrders.has(order.id)}
                      onToggleExpand={() => toggleExpand(order.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Preparing Orders */}
            {preparingOrders.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">In Progress ({preparingOrders.length})</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {preparingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                      onRemove={handleRemoveOrder}
                      isExpanded={expandedOrders.has(order.id)}
                      onToggleExpand={() => toggleExpand(order.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Ready Orders */}
            {readyOrders.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">Ready for Pickup/Delivery ({readyOrders.length})</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {readyOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                      onRemove={handleRemoveOrder}
                      isExpanded={expandedOrders.has(order.id)}
                      onToggleExpand={() => toggleExpand(order.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenOrders;
