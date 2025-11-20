import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Clock, MapPin, Eye, Home, TruckIcon, CheckCircle2 } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    const customerPhone = localStorage.getItem("customerPhone");
    const customerEmail = localStorage.getItem("customerEmail");
    
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const customerOrders = allOrders.filter((order: any) => 
      order.customerPhone === customerPhone || order.customerEmail === customerEmail
    );
    
    // Sort by most recent first
    const sortedOrders = customerOrders.sort((a: any, b: any) => 
      new Date(b.createdAt || b.timestamp || 0).getTime() - new Date(a.createdAt || a.timestamp || 0).getTime()
    );

    // Split into active and completed
    const active = sortedOrders.filter((order: any) => 
      order.deliveryStatus !== "delivered" && order.status !== "completed"
    );
    const completed = sortedOrders.filter((order: any) => 
      order.deliveryStatus === "delivered" || order.status === "completed"
    );

    setActiveOrders(active);
    setCompletedOrders(completed);
  };

  const getStatusBadge = (order: any) => {
    const status = order.deliveryStatus || order.status;
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" }> = {
      "pending": { label: "Order Placed", variant: "default" },
      "confirmed": { label: "Confirmed", variant: "default" },
      "preparing": { label: "Preparing", variant: "warning" },
      "ready": { label: "Ready", variant: "warning" },
      "done": { label: "Ready for Delivery", variant: "warning" },
      "pending-approval": { label: "Finding Driver", variant: "default" },
      "accepted": { label: "Driver Assigned", variant: "secondary" },
      "on-route": { label: "Out for Delivery", variant: "warning" },
      "delivered": { label: "Delivered", variant: "success" },
      "completed": { label: "Completed", variant: "success" }
    };

    const config = statusConfig[status] || { label: status, variant: "default" };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <img 
            src={kokoKingLogo} 
            alt="Koko King" 
            className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Track Order</h1>
          <p className="text-muted-foreground">Monitor your active orders and view order history</p>
        </div>

        {activeOrders.length === 0 && completedOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start ordering delicious meals from Koko King!
              </p>
              <Button onClick={() => navigate("/menu")}>
                Browse Menu
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="relative">
                Active Orders
                {activeOrders.length > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500">
                    {activeOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedOrders.length > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center" variant="secondary">
                    {completedOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-6">
              {activeOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <TruckIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
                    <p className="text-muted-foreground">
                      All your orders have been completed!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                activeOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatDate(order.createdAt || order.timestamp)}
                          </p>
                        </div>
                        {getStatusBadge(order)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Order Items */}
                      <div className="space-y-2">
                        {order.items?.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-medium">₵{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{order.items.length - 3} more items
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* Order Details */}
                      <div className="space-y-2">
                        {order.deliveryAddress && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-muted-foreground">{order.deliveryAddress}</span>
                          </div>
                        )}
                        
                        {order.assignedDriver && order.driverName && (
                          <div className="flex items-center gap-2 text-sm">
                            <TruckIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Driver:</span>
                            <span className="font-medium">{order.driverName}</span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Total and Actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-muted-foreground">Total: </span>
                          <span className="text-lg font-bold">₵{order.total?.toFixed(2) || "0.00"}</span>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate(`/track-order?orderId=${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Track Live
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {completedOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Completed Orders</h3>
                    <p className="text-muted-foreground">
                      Your completed orders will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                completedOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatDate(order.createdAt || order.timestamp)}
                          </p>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Order Items */}
                      <div className="space-y-2">
                        {order.items?.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-medium">₵{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{order.items.length - 3} more items
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* Total and Actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-muted-foreground">Total: </span>
                          <span className="text-lg font-bold">₵{order.total?.toFixed(2) || "0.00"}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/track-order?orderId=${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default CustomerOrders;
