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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { menuItems } from "@/data/menuItems";
import kokoKingLogo from "@/assets/koko-king-logo.png";

const AdminMenu = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<any[]>([]);
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
    branchId: "all"
  });

  useEffect(() => {
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
      description: newItem.description || "",
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
    setNewItem({ name: "", price: "", category: "", description: "", image: "", branchId: "all" });
    setIsAddOpen(false);
  };

  const handleEditItem = (item: any) => {
    setEditingItem({ ...item });
    setIsEditOpen(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    const updated = customItems.map(item => 
      item.id === editingItem.id ? editingItem : item
    );
    localStorage.setItem("customMenuItems", JSON.stringify(updated));
    setCustomItems(updated);
    toast.success("Menu item updated!");
    setIsEditOpen(false);
    setEditingItem(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isEdit && editingItem) {
          setEditingItem({ ...editingItem, image: base64 });
        } else {
          setNewItem({ ...newItem, image: base64 });
        }
        toast.success("Image uploaded!");
      };
      reader.readAsDataURL(file);
    }
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
                    <SidebarMenuButton onClick={() => navigate("/admin/settings")}>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
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
                <Card 
                  key={item.id}
                  className={item.id.startsWith("custom-") ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}
                  onClick={() => item.id.startsWith("custom-") && handleEditItem(item)}
                >
                  <CardHeader>
                    <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-md mb-2" />
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Category: {item.category}</p>
                      <p className="text-lg font-bold">₵{item.price.toFixed(2)}</p>
                      {item.id.startsWith("custom-") && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditItem(item)}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <SelectItem value="specials">Specials</SelectItem>
                  <SelectItem value="wraps">Wraps</SelectItem>
                  <SelectItem value="sandwiches">Sandwiches</SelectItem>
                  <SelectItem value="sides">Sides</SelectItem>
                  <SelectItem value="drinks">Drinks</SelectItem>
                  <SelectItem value="salads">Salads</SelectItem>
                  <SelectItem value="bakery">Bakery</SelectItem>
                  <SelectItem value="porridge">Porridge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Item description"
                rows={3}
              />
            </div>
            <div>
              <Label>Image</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                  className="cursor-pointer"
                />
                <Input
                  value={newItem.image}
                  onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                  placeholder="Or paste image URL"
                />
                {newItem.image && (
                  <img src={newItem.image} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                )}
              </div>
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

      {/* Edit Item Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>Item Name *</Label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Price (₵) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={editingItem.category} onValueChange={(v) => setEditingItem({...editingItem, category: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="specials">Specials</SelectItem>
                    <SelectItem value="wraps">Wraps</SelectItem>
                    <SelectItem value="sandwiches">Sandwiches</SelectItem>
                    <SelectItem value="sides">Sides</SelectItem>
                    <SelectItem value="drinks">Drinks</SelectItem>
                    <SelectItem value="salads">Salads</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="porridge">Porridge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label>Image</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="cursor-pointer"
                  />
                  <Input
                    value={editingItem.image}
                    onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
                    placeholder="Or paste image URL"
                  />
                  {editingItem.image && (
                    <img src={editingItem.image} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                  )}
                </div>
              </div>
              <div>
                <Label>Branch</Label>
                <Select value={editingItem.branchId} onValueChange={(v) => setEditingItem({...editingItem, branchId: v})}>
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
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateItem}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminMenu;
