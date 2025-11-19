import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddOrderForm } from "@/components/kitchen/AddOrderForm";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Printer, Store, Globe } from "lucide-react";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { toast } from "sonner";

export default function KitchenOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    loadOrders();
    checkAndResetDaily();
    const interval = setInterval(() => {
      loadOrders();
      checkAndResetDaily();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkAndResetDaily = () => {
    const lastReset = localStorage.getItem("lastOrderReset");
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    
    if (!lastReset || new Date(lastReset) < midnight) {
      // Archive old orders (move to history for admin/manager)
      const currentOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
      orderHistory.push(...currentOrders);
      localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
      localStorage.setItem("orders", "[]");
      localStorage.setItem("lastOrderReset", now.toISOString());
      setOrders([]);
      toast.info("New day started - orders archived");
    }
  };

  const loadOrders = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(storedOrders);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    );
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    toast.success(`Order ${orderId.slice(0, 8)} moved to ${newStatus}`);
  };

  const handleCompleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // If pickup, mark as completed immediately
    if (order.deliveryMethod === "pickup") {
      handleStatusChange(orderId, "completed");
      toast.success("Order completed - Ready for pickup!");
    } else {
      // If delivery, move to done (ready for rider assignment)
      handleStatusChange(orderId, "done");
      toast.success("Order ready for delivery assignment!");
    }
  };

  const printReceipt = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Order ${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: 'Courier New', monospace; width: 300px; margin: 20px auto; }
            h2 { text-align: center; margin-bottom: 20px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .order-info { margin-bottom: 15px; }
            .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 1.2em; text-align: right; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>KOKO KING</h2>
            <p>Order #${order.id.slice(0, 8)}</p>
            <p>${new Date(order.timestamp).toLocaleString()}</p>
          </div>
          <div class="order-info">
            <p><strong>Customer:</strong> ${order.customer?.name || order.customerName || "Walk-in"}</p>
            <p><strong>Phone:</strong> ${order.customer?.phone || order.customerPhone || "N/A"}</p>
            <p><strong>Type:</strong> ${order.orderType || "Walk-in"}</p>
          </div>
          <div class="items">
            ${order.items.map((item: any) => `
              <div class="item">
                <span>${item.quantity}x ${item.name}</span>
                <span>₵${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              ${item.extras?.length > 0 ? item.extras.map((extra: any) => `
                <div class="item" style="padding-left: 20px; font-size: 0.9em;">
                  <span>+ ${extra.name}</span>
                  <span>₵${extra.price.toFixed(2)}</span>
                </div>
              `).join('') : ''}
            `).join('')}
          </div>
          <div class="total">
            TOTAL: ₵${order.total.toFixed(2)}
          </div>
          <div class="footer">
            <p>Thank you for your order!</p>
            <p>Visit us again soon</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.name || order.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.phone || order.customerPhone || "").includes(searchQuery);

    const matchesTab = 
      selectedTab === "all" ||
      (selectedTab === "walkin" && order.orderType === "walk-in") ||
      (selectedTab === "online" && order.orderType === "online");

    return matchesSearch && matchesTab;
  });

  const getOrdersByStatus = (status: string) => {
    return filteredOrders.filter((order) => order.status === status);
  };

  const walkInCount = orders.filter((o) => o.orderType === "walk-in").length;
  const onlineCount = orders.filter((o) => o.orderType === "online").length;

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
            <p className="text-muted-foreground mt-1">Manage walk-in and online orders</p>
          </div>
          <Button onClick={() => setShowAddOrder(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add Walk-in Order
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">
                All Orders
              </TabsTrigger>
              <TabsTrigger value="walkin" className="gap-2">
                <Store className="h-4 w-4" />
                Walk-in ({walkInCount})
              </TabsTrigger>
              <TabsTrigger value="online" className="gap-2">
                <Globe className="h-4 w-4" />
                Online ({onlineCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Order Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Pending Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>New Orders</span>
                <Badge variant="secondary">{getOrdersByStatus("pending").length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getOrdersByStatus("pending").length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No new orders</p>
              ) : (
                getOrdersByStatus("pending").map((order) => (
                  <Card key={order.id} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{order.customer?.name}</p>
                      </div>
                      <Badge>{order.orderType}</Badge>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items?.map((item: any, i: number) => (
                        <p key={i} className="text-sm">{item.quantity}x {item.name}</p>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleStatusChange(order.id, "confirmed")} className="flex-1">Confirm</Button>
                      <Button size="sm" variant="outline" onClick={() => printReceipt(order)}><Printer className="h-4 w-4" /></Button>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Confirmed Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Confirmed</span>
                <Badge variant="secondary">{getOrdersByStatus("confirmed").length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getOrdersByStatus("confirmed").length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No confirmed orders</p>
              ) : (
                getOrdersByStatus("confirmed").map((order) => (
                  <Card key={order.id} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{order.customer?.name}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleStatusChange(order.id, "preparing")} className="w-full">Start Preparing</Button>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Preparing Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Preparing</span>
                <Badge variant="secondary">{getOrdersByStatus("preparing").length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getOrdersByStatus("preparing").length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No orders preparing</p>
              ) : (
                getOrdersByStatus("preparing").map((order) => (
                  <Card key={order.id} className="p-3 bg-accent/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{order.customer?.name}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleCompleteOrder(order.id)} className="w-full">Mark Ready</Button>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Ready Orders - Split by Delivery/Pickup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ready</span>
                <Badge variant="secondary">{getOrdersByStatus("done").length + getOrdersByStatus("completed").length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(getOrdersByStatus("done").length + getOrdersByStatus("completed").length) === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No ready orders</p>
              ) : (
                <>
                  {getOrdersByStatus("done").map((order) => (
                    <Card key={order.id} className="p-3 space-y-2 border-green-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{order.customer?.name}</p>
                          <p className="text-sm font-bold mt-1">₵{order.total.toFixed(2)}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10">Delivery</Badge>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => printReceipt(order)} className="w-full">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Receipt
                      </Button>
                      <Button size="sm" variant="default" className="w-full" onClick={() => window.location.href = "/kitchen/done"}>
                        Assign to Driver
                      </Button>
                    </Card>
                  ))}
                  {getOrdersByStatus("completed").map((order) => (
                    <Card key={order.id} className="p-3 space-y-2 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{order.customer?.name}</p>
                          <p className="text-sm font-bold mt-1">₵{order.total.toFixed(2)}</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-500/10">Pickup</Badge>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => printReceipt(order)} className="w-full">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Receipt
                      </Button>
                    </Card>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Order Dialog */}
        <Dialog open={showAddOrder} onOpenChange={setShowAddOrder}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Walk-in Order</DialogTitle>
            </DialogHeader>
            <AddOrderForm onClose={() => setShowAddOrder(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </KitchenLayout>
  );
}
