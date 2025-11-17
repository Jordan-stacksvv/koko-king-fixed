import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const AdminDeliveries = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    if (localStorage.getItem("adminAuth") !== "true") {
      navigate("/admin/login");
      return;
    }

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const deliveryOrders = orders.filter((order: any) => 
      order.deliveryMethod === "delivery" && 
      (order.status === "out-for-delivery" || order.status === "completed")
    );
    setDeliveries(deliveryOrders);
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "out-for-delivery": return "bg-purple-500";
      case "completed": return "bg-green-500";
      default: return "bg-muted";
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <h1 className="text-base sm:text-lg font-semibold">Delivery Management</h1>
          </header>

          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Delivery Management</h2>
              <p className="text-sm text-muted-foreground">Track all delivery orders across branches</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{deliveries.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {deliveries.filter(d => d.status === "out-for-delivery").length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {deliveries.filter(d => d.status === "completed").length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">25 min</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Integrate with external delivery services for seamless order fulfillment
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => toast.info("Bolt Food integration coming soon!")}
                  >
                    <Truck className="h-6 w-6" />
                    <span>Bolt Food</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => toast.info("Custom delivery system available")}
                  >
                    <Truck className="h-6 w-6" />
                    <span>In-House Delivery</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                {deliveries.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No active deliveries</p>
                ) : (
                  <div className="space-y-4">
                    {deliveries.map((delivery) => (
                      <div key={delivery.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">Order #{delivery.id.slice(0, 8)}</p>
                            <Badge className={getStatusColor(delivery.status)}>
                              {delivery.status.replace("-", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{delivery.deliveryAddress || "No address"}</span>
                          </div>
                          <p className="text-sm font-medium">₵{delivery.total.toFixed(2)}</p>
                        </div>
                        {delivery.driverName && (
                          <div className="text-right text-sm">
                            <p className="font-medium">{delivery.driverName}</p>
                            <p className="text-muted-foreground">{delivery.driverPhone}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDeliveries;
