import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, MapPin, Phone, User, Navigation, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { toast } from "sonner";

const DriverDeliveries = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [editingDelivery, setEditingDelivery] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("driverAuth");
    if (!auth) {
      navigate("/driver/login");
      return;
    }
    setDriver(JSON.parse(auth));
    loadDeliveries();
  }, [navigate]);

  const loadDeliveries = () => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const todayDeliveries = orders.filter((order: any) => 
      order.deliveryMethod === "delivery" && 
      order.status !== "cancelled" &&
      new Date(order.timestamp).toDateString() === new Date().toDateString()
    );
    setDeliveries(todayDeliveries);
  };

  const handleMarkAsDone = (orderId: string) => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updated = orders.map((order: any) =>
      order.id === orderId ? { ...order, status: "completed", completedAt: new Date().toISOString() } : order
    );
    localStorage.setItem("orders", JSON.stringify(updated));
    loadDeliveries();
    toast.success("Delivery marked as completed!");
  };

  const handleEditLocation = (delivery: any) => {
    setEditingDelivery({ ...delivery });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingDelivery) return;
    
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updated = orders.map((order: any) =>
      order.id === editingDelivery.id ? editingDelivery : order
    );
    localStorage.setItem("orders", JSON.stringify(updated));
    loadDeliveries();
    setIsEditDialogOpen(false);
    toast.success("Delivery location updated!");
  };

  const handleLogout = () => {
    localStorage.removeItem("driverAuth");
    navigate("/");
  };

  const openMap = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const activeDeliveries = deliveries.filter(d => d.status !== "completed");
  const completedDeliveries = deliveries.filter(d => d.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={kokoKingLogo} alt="Koko King" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold">Driver Dashboard</h1>
              {driver && <p className="text-sm text-muted-foreground">{driver.phone}</p>}
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDeliveries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedDeliveries.length}</div>
            </CardContent>
          </Card>
        </div>

        {activeDeliveries.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Active Deliveries</h2>
            <div className="space-y-3">
              {activeDeliveries.map((delivery) => (
                <Card key={delivery.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{delivery.id}</p>
                          <Badge>{delivery.status}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{delivery.customer.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{delivery.customer.phone}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary" onClick={() => openMap(delivery.customer.address)}>
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1">{delivery.customer.address}</span>
                          <Navigation className="h-3 w-3" />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditLocation(delivery)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Location
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <p className="font-semibold text-lg">₵{delivery.total.toFixed(2)}</p>
                        <Button onClick={() => handleMarkAsDone(delivery.id)} size="sm">
                          Mark as Done
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {completedDeliveries.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Completed Deliveries</h2>
            <div className="space-y-2">
              {completedDeliveries.map((delivery) => (
                <Card key={delivery.id} className="opacity-60">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{delivery.id}</p>
                        <p className="text-sm text-muted-foreground">{delivery.customer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{delivery.total.toFixed(2)}</p>
                        <Badge className="bg-green-500">Completed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {deliveries.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No deliveries assigned for today</p>
          </div>
        )}
      </main>

      {/* Edit Location Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Delivery Location</DialogTitle>
          </DialogHeader>
          {editingDelivery && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input
                  value={editingDelivery.customer.name}
                  onChange={(e) => setEditingDelivery({
                    ...editingDelivery,
                    customer: { ...editingDelivery.customer, name: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={editingDelivery.customer.phone}
                  onChange={(e) => setEditingDelivery({
                    ...editingDelivery,
                    customer: { ...editingDelivery.customer, phone: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Delivery Address</Label>
                <Input
                  value={editingDelivery.customer.address}
                  onChange={(e) => setEditingDelivery({
                    ...editingDelivery,
                    customer: { ...editingDelivery.customer, address: e.target.value }
                  })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverDeliveries;
