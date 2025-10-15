import { useState, useEffect } from "react";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { toast } from "sonner";

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(storedOrders);
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    toast.success(`Order ${orderId} updated to ${newStatus}`);
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

        <div className="grid gap-4">
          {filteredOrders.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No orders found</p>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.id}</CardTitle>
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
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold mb-2">Customer Details</h4>
                      <p className="text-sm">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                      {order.deliveryMethod === "delivery" && (
                        <p className="text-sm text-muted-foreground">{order.customer.address}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Order Details</h4>
                      <p className="text-sm">Items: {order.items.length}</p>
                      <p className="text-sm">Method: {order.deliveryMethod}</p>
                      <p className="text-sm font-bold">Total: ₵{order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Items</h4>
                    <div className="space-y-1">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span>₵{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <Button onClick={() => updateOrderStatus(order.id, "preparing")} size="sm">
                        Start Preparing
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button onClick={() => updateOrderStatus(order.id, "ready")} size="sm">
                        Mark as Ready
                      </Button>
                    )}
                    {order.status === "ready" && order.deliveryMethod === "delivery" && (
                      <Button onClick={() => updateOrderStatus(order.id, "out-for-delivery")} size="sm">
                        Out for Delivery
                      </Button>
                    )}
                    {(order.status === "ready" && order.deliveryMethod === "pickup") || order.status === "out-for-delivery" ? (
                      <Button onClick={() => updateOrderStatus(order.id, "completed")} size="sm" variant="default">
                        Mark as Completed
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </KitchenLayout>
  );
};

export default Orders;
