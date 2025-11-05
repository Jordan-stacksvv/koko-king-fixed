import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrendingUp, Store, ShoppingCart, Package, BarChart, Plus, Edit, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { menuItems } from "@/data/menuItems";
import kokoKingLogo from "@/assets/koko-king-logo.png";

const AdminMenu = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<any[]>([]);
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    branchId: "all"
  });

  useEffect(() => {
    // Check admin auth
    if (localStorage.getItem("adminAuth") !== "true") {
      navigate("/admin/login");
      return;
    }

    const allBranches = JSON.parse(localStorage.getItem("branches") || "[]");
    const savedItems = JSON.parse(localStorage.getItem("customMenuItems") || "[]");
    setBranches(allBranches);
    setCustomItems(savedItems);
  }, [navigate]);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const item = {
      id: `custom-${Date.now()}`,
      name: newItem.name,
      price: parseFloat(newItem.price),
      category: newItem.category,
      image: newItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      branchId: newItem.branchId,
      createdAt: new Date().toISOString()
    };

    const updated = [...customItems, item];
    localStorage.setItem("customMenuItems", JSON.stringify(updated));
    setCustomItems(updated);
    toast.success("Menu item added successfully!");
    setNewItem({ name: "", price: "", category: "", image: "", branchId: "all" });
    setIsAddOpen(false);
  };

  const handleRemoveItem = (id: string, name: string) => {
    if (confirm(`Remove ${name}?`)) {
      const updated = customItems.filter(item => item.id !== id);
      localStorage.setItem("customMenuItems", JSON.stringify(updated));
      setCustomItems(updated);
      toast.success("Item removed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

  const allMenuItems = [...menuItems, ...customItems];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <div className="px-4 py-3">
                <img 
                  src={kokoKingLogo} 
                  alt="Koko King" 
                  className="h-12 w-auto cursor-pointer"
                  onClick={() => window.location.reload()}
                />
              </div>
              <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/admin/dashboard")}>
                      <TrendingUp className="h-4 w-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/admin/branches")}>
                      <Store className="h-4 w-4" />
                      <span>Branches</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/admin/analytics")}>
                      <BarChart className="h-4 w-4" />
                      <span>Sales Analytics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/admin/orders")}>
                      <ShoppingCart className="h-4 w-4" />
                      <span>All Orders</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/admin/menu")} className="bg-primary/10">
                      <Package className="h-4 w-4" />
                      <span>Menu Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} className="text-destructive">
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Menu Management</h1>
          </header>

          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Manage menu items across all branches ({allMenuItems.length} items)
              </p>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allMenuItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-md mb-2" />
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Category: {item.category}</p>
                      <p className="text-lg font-bold">₵{item.price.toFixed(2)}</p>
                      {item.id.startsWith("custom-") && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive"
                            onClick={() => handleRemoveItem(item.id, item.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item Name *</Label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="e.g., Grilled Chicken"
              />
            </div>
            <div>
              <Label>Price (₵) *</Label>
              <Input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={newItem.category} onValueChange={(v) => setNewItem({...newItem, category: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pizza">Pizza</SelectItem>
                  <SelectItem value="Wraps">Wraps</SelectItem>
                  <SelectItem value="Sandwiches">Sandwiches</SelectItem>
                  <SelectItem value="Sides">Sides</SelectItem>
                  <SelectItem value="Drinks">Drinks</SelectItem>
                  <SelectItem value="Salads">Salads</SelectItem>
                  <SelectItem value="Combo">Combo</SelectItem>
                  <SelectItem value="Specials">Specials</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={newItem.image}
                onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Branch</Label>
              <Select value={newItem.branchId} onValueChange={(v) => setNewItem({...newItem, branchId: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddItem}>Add Item</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminMenu;
