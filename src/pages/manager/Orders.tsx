import { useState, useEffect } from "react";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(storedOrders);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || new Date(order.timestamp).toISOString().split('T')[0] === selectedDate;
    const matchesCategory = selectedCategory === "all" || order.items?.some((item: any) => item.category === selectedCategory);
    return matchesStatus && matchesSearch && matchesDate && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-500/10 text-orange-500";
      case "confirmed": return "bg-yellow-500/10 text-yellow-500";
      case "preparing": return "bg-blue-500/10 text-blue-500";
      case "completed": return "bg-green-500/10 text-green-500";
      default: return "bg-muted";
    }
  };

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">View all orders (Read-only)</p>
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
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full md:w-48"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="specials">King Specials</SelectItem>
              <SelectItem value="wraps">Wraps & Quesadillas</SelectItem>
              <SelectItem value="sandwiches">Sandwiches</SelectItem>
              <SelectItem value="salads">Salads</SelectItem>
              <SelectItem value="sides">Sides</SelectItem>
              <SelectItem value="bakery">Bakery</SelectItem>
              <SelectItem value="porridge">Porridge & Hot Beverages</SelectItem>
              <SelectItem value="drinks">Drinks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow 
                      key={order.id} 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>{order.customer.phone}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell className="font-semibold">₵{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.timestamp).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Order Details - {selectedOrder.id}</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Customer Details</h4>
                      <p className="text-sm"><span className="font-medium">Name:</span> {selectedOrder.customer.name}</p>
                      <p className="text-sm"><span className="font-medium">Phone:</span> {selectedOrder.customer.phone}</p>
                      {selectedOrder.deliveryMethod === "delivery" && selectedOrder.customer.address && (
                        <p className="text-sm"><span className="font-medium">Address:</span> {selectedOrder.customer.address}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Order Information</h4>
                      <p className="text-sm"><span className="font-medium">Method:</span> {selectedOrder.deliveryMethod}</p>
                      <p className="text-sm"><span className="font-medium">Payment:</span> {selectedOrder.paymentMethod || 'N/A'}</p>
                      <p className="text-sm"><span className="font-medium">Date:</span> {new Date(selectedOrder.timestamp).toLocaleString()}</p>
                      <p className="text-sm"><span className="font-medium">Total:</span> <span className="font-bold text-lg">₵{selectedOrder.total.toFixed(2)}</span></p>
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
                                + {item.extras.map((e: any) => e.name).join(", ")}
                              </p>
                            )}
                          </div>
                          <span className="font-semibold">₵{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.customer.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Special Instructions</h4>
                      <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                        {selectedOrder.customer.notes}
                      </p>
                    </div>
                  )}
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
