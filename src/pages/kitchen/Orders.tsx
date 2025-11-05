import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, Search, Plus, Printer, Monitor } from "lucide-react";
import { AddOrderForm } from "@/components/kitchen/AddOrderForm";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { toast } from "sonner";

const KitchenOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [notifiedOrders, setNotifiedOrders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<any>(null);

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
    setAllOrders(storedOrders);
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

  const handleLogout = () => {
    localStorage.removeItem("kitchenAuth");
    navigate("/");
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const confirmOrders = orders.filter(o => o.status === "confirmed");
  const preparingOrders = orders.filter(o => o.status === "preparing");
  const completedOrders = allOrders.filter(o => o.status === "completed");

  const openDisplayPage = () => {
    window.open('/kitchen/display', '_blank', 'width=1920,height=1080');
  };

  const searchResults = searchQuery.trim() ? allOrders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.phone.includes(searchQuery)
  ) : [];

  return (
    <div className="min-h-screen bg-background">
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

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search all orders by ID, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((order) => (
                <div 
                  key={order.id} 
                  className="border rounded-lg p-4 bg-card cursor-pointer hover:bg-accent"
                  onClick={() => setSelectedOrderForReceipt(order)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold">{order.id}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                  <p className="text-sm font-semibold mt-2">₵{(order.total || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <TabsList>
              <TabsTrigger value="pending">New Orders ({pendingOrders.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirm ({confirmOrders.length})</TabsTrigger>
              <TabsTrigger value="preparing">Preparing ({preparingOrders.length})</TabsTrigger>
              <TabsTrigger value="done">Done ({completedOrders.length})</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button variant="outline" onClick={openDisplayPage}>
                <Monitor className="h-4 w-4 mr-2" />
                Display Page
              </Button>
              
              <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
                <Button onClick={() => setIsAddOrderOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Order
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Walk-in Order</DialogTitle>
                  </DialogHeader>
                  <AddOrderForm onClose={() => setIsAddOrderOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Pending Orders Tab */}
          <TabsContent value="pending" className="mt-0">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No new orders</div>
            ) : (
              <div className="space-y-3">
                {[...pendingOrders].sort((a, b) => {
                  if (a.orderType === "walk-in" && b.orderType !== "walk-in") return -1;
                  if (a.orderType !== "walk-in" && b.orderType === "walk-in") return 1;
                  return 0;
                }).map((order) => (
                  <div key={order.id} className="border-2 border-orange-500 rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg">{order.id}</p>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            order.orderType === "walk-in" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                          }`}>
                            {order.orderType === "walk-in" ? "WALK-IN" : "ONLINE"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customer.name} • {new Date(order.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Button onClick={() => handleStatusUpdate(order.id, "confirmed")}>
                        Accept Order
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Confirm Orders Tab - Split View */}
          <TabsContent value="confirmed" className="mt-0">
            {confirmOrders.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No orders to confirm</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Walk-in Orders */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="bg-red-500 text-white px-3 py-1 rounded text-sm">WALK-IN</span>
                    Orders ({confirmOrders.filter((o: any) => o.orderType === "walk-in").length})
                  </h3>
                  <div className="space-y-3">
                    {confirmOrders.filter((o: any) => o.orderType === "walk-in").map((order) => (
                      <div key={order.id} className="border-2 border-yellow-500 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/20">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-bold text-lg">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePrintOrder(order)}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="text-sm font-medium">
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => handleStatusUpdate(order.id, "preparing")}
                        >
                          Start Preparing
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Online Orders */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm">ONLINE</span>
                    Orders ({confirmOrders.filter((o: any) => o.orderType !== "walk-in").length})
                  </h3>
                  <div className="space-y-3">
                    {confirmOrders.filter((o: any) => o.orderType !== "walk-in").map((order) => (
                      <div key={order.id} className="border-2 border-yellow-500 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/20">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-bold text-lg">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePrintOrder(order)}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="text-sm font-medium">
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          onClick={() => handleStatusUpdate(order.id, "preparing")}
                        >
                          Start Preparing
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Preparing Orders Tab - List Style */}
          <TabsContent value="preparing" className="mt-0">
            {preparingOrders.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No orders being prepared</div>
            ) : (
              <div className="space-y-2">
                {preparingOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-2 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-4 flex-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg">{order.id}</p>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            order.orderType === "walk-in" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                          }`}>
                            {order.orderType === "walk-in" ? "WALK-IN" : "ONLINE"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {order.items.map((item: any, idx: number) => (
                          <span key={idx} className="text-sm font-medium bg-background px-2 py-1 rounded">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleStatusUpdate(order.id, "completed")}
                    >
                      Mark as Done
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Done Orders Tab */}
          <TabsContent value="done" className="mt-0">
            {completedOrders.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No completed orders</div>
            ) : (
              <div className="space-y-2">
                {completedOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between border rounded-lg p-4 bg-card cursor-pointer hover:bg-accent"
                    onClick={() => setSelectedOrderForReceipt(order)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{order.id}</p>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            order.orderType === "walk-in" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                          }`}>
                            {order.orderType === "walk-in" ? "WALK-IN" : "ONLINE"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₵{(order.total || 0).toFixed(2)}</p>
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Receipt Dialog */}
      <Dialog open={!!selectedOrderForReceipt} onOpenChange={() => setSelectedOrderForReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Receipt</DialogTitle>
          </DialogHeader>
          {selectedOrderForReceipt && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold">KOKO KING EXPRESS</h2>
                <p className="text-sm text-muted-foreground">Order Receipt</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-semibold">{selectedOrderForReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(selectedOrderForReceipt.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span>{selectedOrderForReceipt.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{selectedOrderForReceipt.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize font-semibold">{selectedOrderForReceipt.status}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Items:</h3>
                <div className="space-y-2">
                  {selectedOrderForReceipt.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₵{((item.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₵{(selectedOrderForReceipt.total || 0).toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => handlePrintOrder(selectedOrderForReceipt)}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KitchenOrders;
