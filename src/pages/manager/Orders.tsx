import { useState, useEffect } from "react";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Bell, ChefHat } from "lucide-react";
import { toast } from "sonner";

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [assignedTo, setAssignedTo] = useState<Record<string, string>>({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(storedOrders);
  };

  const updateOrderStatus = (orderId: string, newStatus: string, chef?: string) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    
    if (chef && newStatus === "preparing") {
      setAssignedTo(prev => ({ ...prev, [orderId]: chef }));
      toast.success(`Order ${orderId} assigned to ${chef}`);
    } else {
      toast.success(`Order ${orderId} updated to ${newStatus}`);
    }
    
    if (newStatus === "completed") {
      playNotificationSound();
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVKni7KxfGAg9lunj"); 
    audio.play().catch(() => {});
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-500";
      case "preparing": return "bg-blue-500";
      case "ready": return "bg-purple-500";
      case "out-for-delivery": return "bg-indigo-500";
      case "completed": return "bg-green-500";
      default: return "bg-muted";
    }
  };

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">View and manage all incoming orders</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.length === 0 ? (
            <Card className="p-12 text-center col-span-full">
              <p className="text-muted-foreground">No orders found</p>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card 
                key={order.id} 
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  order.status === 'pending' ? 'border-orange-500 border-2 animate-pulse' : ''
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {order.id}
                        {order.status === 'pending' && <Bell className="h-4 w-4 text-orange-500 animate-bounce" />}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{order.customer.name}</p>
                      {assignedTo[order.id] && (
                        <Badge variant="outline" className="text-xs">
                          <ChefHat className="h-3 w-3 mr-1" />
                          {assignedTo[order.id]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Items: {order.items.length}</p>
                    <p className="text-sm font-bold">Total: ₵{order.total.toFixed(2)}</p>
                    
                    <div className="flex gap-2 mt-4">
                      {order.status === "pending" && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const chef = prompt("Enter chef name:");
                            if (chef) updateOrderStatus(order.id, "preparing", chef);
                          }} 
                          size="sm"
                          className="flex-1"
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === "preparing" && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, "ready");
                          }} 
                          size="sm"
                          className="flex-1"
                        >
                          Mark Ready
                        </Button>
                      )}
                      {order.status === "ready" && order.deliveryMethod === "delivery" && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, "out-for-delivery");
                          }} 
                          size="sm"
                          className="flex-1"
                        >
                          Send Out
                        </Button>
                      )}
                      {((order.status === "ready" && order.deliveryMethod === "pickup") || order.status === "out-for-delivery") && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, "completed");
                          }} 
                          size="sm" 
                          variant="default"
                          className="flex-1"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Order {selectedOrder.id}</span>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Customer Details</h4>
                      <p className="text-sm">{selectedOrder.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.customer.phone}</p>
                      {selectedOrder.deliveryMethod === "delivery" && (
                        <p className="text-sm text-muted-foreground">{selectedOrder.customer.address}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Order Details</h4>
                      <p className="text-sm">Method: {selectedOrder.deliveryMethod}</p>
                      <p className="text-sm">Time: {new Date(selectedOrder.timestamp).toLocaleString()}</p>
                      <p className="text-sm font-bold">Total: ₵{selectedOrder.total.toFixed(2)}</p>
                      {assignedTo[selectedOrder.id] && (
                        <p className="text-sm flex items-center gap-1">
                          <ChefHat className="h-4 w-4" />
                          Assigned to: {assignedTo[selectedOrder.id]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                          <div className="flex-1">
                            <p className="font-medium">{item.quantity}x {item.name}</p>
                            {item.extras && item.extras.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                + {item.extras.join(", ")}
                              </p>
                            )}
                          </div>
                          <span className="font-semibold">₵{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    {selectedOrder.status === "pending" && (
                      <Button 
                        onClick={() => {
                          const chef = prompt("Enter chef name:");
                          if (chef) {
                            updateOrderStatus(selectedOrder.id, "preparing", chef);
                            setSelectedOrder(null);
                          }
                        }} 
                        className="flex-1"
                      >
                        <ChefHat className="h-4 w-4 mr-2" />
                        Start Preparing
                      </Button>
                    )}
                    {selectedOrder.status === "preparing" && (
                      <Button 
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, "ready");
                          setSelectedOrder(null);
                        }} 
                        className="flex-1"
                      >
                        Mark as Ready
                      </Button>
                    )}
                    {selectedOrder.status === "ready" && selectedOrder.deliveryMethod === "delivery" && (
                      <Button 
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, "out-for-delivery");
                          setSelectedOrder(null);
                        }} 
                        className="flex-1"
                      >
                        Out for Delivery
                      </Button>
                    )}
                    {((selectedOrder.status === "ready" && selectedOrder.deliveryMethod === "pickup") || selectedOrder.status === "out-for-delivery") && (
                      <Button 
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, "completed");
                          setSelectedOrder(null);
                        }} 
                        variant="default"
                        className="flex-1"
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </KitchenLayout>
  );
};

export default Orders;
