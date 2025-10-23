import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, Bell, Search, Plus, Printer } from "lucide-react";
import { OrderCard } from "@/components/kitchen/OrderCard";
import { AddOrderForm } from "@/components/kitchen/AddOrderForm";
import kokoKingLogo from "@/assets/koko-king-logo.png";

const KitchenOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [lastOrderCount, setLastOrderCount] = useState(0);
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

  const handleConfirmOrder = (orderId: string) => {
    handleStatusUpdate(orderId, "confirmed");
  };

  const handlePrintOrder = (order: any) => {
    const printContent = `
KOKO KING EXPRESS
==================
Order ID: ${order.id}
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
  const confirmedOrders = orders.filter(o => o.status === "confirmed" || o.status === "preparing");
  const doneOrders = orders.filter(o => o.status === "ready" || o.status === "completed");

  const filteredDoneOrders = doneOrders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchResults = searchQuery.trim() ? allOrders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.phone.includes(searchQuery)
  ) : [];

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
        {/* Global Search Bar */}
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
                      order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
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

        <div className="flex items-center justify-between mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed ({confirmedOrders.length})</TabsTrigger>
                <TabsTrigger value="done">Done ({doneOrders.length})</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                
                <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Walk-in Order</DialogTitle>
                    </DialogHeader>
                    <AddOrderForm onClose={() => setIsAddOrderOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <TabsContent value="pending" className="mt-0">
              {pendingOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No Pending Orders</h2>
                  <p className="text-muted-foreground">Waiting for new orders to arrive...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Active Incoming Orders</h3>
                  <div className="grid gap-4">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="border-2 border-orange-500 rounded-lg p-4 bg-card animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="font-bold text-lg">{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.customer.name} • {new Date(order.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Button onClick={() => handleConfirmOrder(order.id)}>
                            Confirm Order
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
                </div>
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="mt-0">
              {confirmedOrders.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No confirmed orders</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {confirmedOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold">{order.id}</p>
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
                          <div key={idx} className="text-sm">
                            {item.quantity}x {item.name}
                            {item.extras?.length > 0 && (
                              <p className="text-xs text-muted-foreground ml-4">+ {item.extras.join(', ')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => handleStatusUpdate(order.id, "ready")}
                      >
                        Mark as Done
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="done" className="mt-0">
              {filteredDoneOrders.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  {searchQuery ? "No orders found" : "No completed orders"}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDoneOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm font-bold mt-3">Total: ₵{order.total.toFixed(2)}</p>
                      <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={() => handleRemoveOrder(order.id)}
                      >
                        Complete & Archive
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
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
