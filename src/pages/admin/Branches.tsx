import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, MapPin, Phone, Trash2, TrendingUp, Store, ShoppingCart, Package, BarChart, ArrowLeft, Settings, Edit } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { initializeBranches } from "@/data/defaultBranches";

const Branches = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedBranchId = searchParams.get("selected");
  
  const [branches, setBranches] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [newBranch, setNewBranch] = useState({
    name: "",
    location: "",
    phone: "",
    manager: "",
    image: ""
  });

  useEffect(() => {
    if (localStorage.getItem("adminAuth") !== "true") {
      navigate("/admin/login");
      return;
    }

    initializeBranches();

    const saved = JSON.parse(localStorage.getItem("branches") || "[]");
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setBranches(saved);
    setOrders(allOrders);
  }, [navigate]);

  const saveBranches = (updatedBranches: any[]) => {
    localStorage.setItem("branches", JSON.stringify(updatedBranches));
    setBranches(updatedBranches);
  };

  const handleAddBranch = () => {
    if (!newBranch.name || !newBranch.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    const branch = {
      id: `branch-${Date.now()}`,
      ...newBranch,
      createdAt: new Date().toISOString()
    };

    saveBranches([...branches, branch]);
    toast.success(`${newBranch.name} added successfully!`);
    setNewBranch({ name: "", location: "", phone: "", manager: "", image: "" });
    setIsAddOpen(false);
  };

  const handleEditBranch = (branch: any) => {
    setEditingBranch({ ...branch });
    setIsEditOpen(true);
  };

  const handleUpdateBranch = () => {
    if (!editingBranch) return;

    const updated = branches.map(b => 
      b.id === editingBranch.id ? editingBranch : b
    );
    saveBranches(updated);
    toast.success("Branch updated!");
    setIsEditOpen(false);
    setEditingBranch(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isEdit && editingBranch) {
          setEditingBranch({ ...editingBranch, image: base64 });
        } else {
          setNewBranch({ ...newBranch, image: base64 });
        }
        toast.success("Image uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (id: string, name: string) => {
    if (confirm(`Remove ${name}?`)) {
      saveBranches(branches.filter(b => b.id !== id));
      toast.success(`${name} removed`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

  const selectedBranch = selectedBranchId ? branches.find(b => b.id === selectedBranchId) : null;
  const branchOrders = selectedBranch ? orders.filter(o => o.branchId === selectedBranch.id) : [];
  const branchRevenue = branchOrders.reduce((sum, o) => sum + o.total, 0);
  
  const itemCounts: any = {};
  branchOrders.forEach((order: any) => {
    order.items?.forEach((item: any) => {
      if (itemCounts[item.name]) {
        itemCounts[item.name] += item.quantity;
      } else {
        itemCounts[item.name] = item.quantity;
      }
    });
  });
  const topBranchItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  if (selectedBranch) {
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
                      <SidebarMenuButton onClick={() => navigate("/admin/branches")} className="bg-primary/10">
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
                      <SidebarMenuButton onClick={() => navigate("/admin/menu")}>
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/branches")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Branches
              </Button>
              <h1 className="text-lg font-semibold">{selectedBranch.name}</h1>
            </header>

            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">₵{branchRevenue.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{branchOrders.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Average Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ₵{branchOrders.length > 0 ? (branchRevenue / branchOrders.length).toFixed(2) : "0.00"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                  <TabsTrigger value="items">Top Items</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Branch Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedBranch.image && (
                        <img src={selectedBranch.image} alt={selectedBranch.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{selectedBranch.location}</span>
                      </div>
                      {selectedBranch.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedBranch.phone}</span>
                        </div>
                      )}
                      {selectedBranch.manager && (
                        <p className="text-sm text-muted-foreground">Manager: {selectedBranch.manager}</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Orders ({branchOrders.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {branchOrders.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No orders yet</p>
                      ) : (
                        <div className="space-y-2">
                          {branchOrders.slice(0, 10).map((order: any) => (
                            <div key={order.id} className="flex justify-between p-3 bg-muted rounded-lg">
                              <div>
                                <p className="font-mono text-sm">{order.id}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">₵{order.total.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{order.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="items">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Selling Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {topBranchItems.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No data available</p>
                      ) : (
                        <div className="space-y-3">
                          {topBranchItems.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                  {idx + 1}
                                </div>
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <span className="font-semibold">{item.count} sold</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

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
                    <SidebarMenuButton onClick={() => navigate("/admin/branches")} className="bg-primary/10">
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
                    <SidebarMenuButton onClick={() => navigate("/admin/menu")}>
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
            <h1 className="text-lg font-semibold">Branch Management</h1>
          </header>

          <div className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Manage all Koko King locations</p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Branch
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {branches.map((branch) => (
            <Card 
              key={branch.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleEditBranch(branch)}
            >
              <CardHeader>
                {branch.image && (
                  <img src={branch.image} alt={branch.name} className="w-full h-32 object-cover rounded-md mb-2" />
                )}
                <CardTitle className="flex justify-between items-start">
                  <span>{branch.name}</span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBranch(branch)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(branch.id, branch.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{branch.location}</span>
                </div>
                {branch.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{branch.phone}</span>
                  </div>
                )}
                {branch.manager && (
                  <p className="text-sm text-muted-foreground">Manager: {branch.manager}</p>
                )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Branch Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Branch Name *</Label>
              <Input
                value={newBranch.name}
                onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                placeholder="e.g., Accra Central"
              />
            </div>
            <div>
              <Label>Location *</Label>
              <Input
                value={newBranch.location}
                onChange={(e) => setNewBranch({...newBranch, location: e.target.value})}
                placeholder="Full address"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newBranch.phone}
                onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
                placeholder="+233 XX XXX XXXX"
              />
            </div>
            <div>
              <Label>Manager Name</Label>
              <Input
                value={newBranch.manager}
                onChange={(e) => setNewBranch({...newBranch, manager: e.target.value})}
                placeholder="Manager name"
              />
            </div>
            <div>
              <Label>Branch Image</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                  className="cursor-pointer"
                />
                <Input
                  value={newBranch.image}
                  onChange={(e) => setNewBranch({...newBranch, image: e.target.value})}
                  placeholder="Or paste image URL"
                />
                {newBranch.image && (
                  <img src={newBranch.image} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddBranch}>Add Branch</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          {editingBranch && (
            <div className="space-y-4">
              <div>
                <Label>Branch Name *</Label>
                <Input
                  value={editingBranch.name}
                  onChange={(e) => setEditingBranch({...editingBranch, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Location *</Label>
                <Input
                  value={editingBranch.location}
                  onChange={(e) => setEditingBranch({...editingBranch, location: e.target.value})}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editingBranch.phone || ""}
                  onChange={(e) => setEditingBranch({...editingBranch, phone: e.target.value})}
                />
              </div>
              <div>
                <Label>Manager Name</Label>
                <Input
                  value={editingBranch.manager || ""}
                  onChange={(e) => setEditingBranch({...editingBranch, manager: e.target.value})}
                />
              </div>
              <div>
                <Label>Branch Image</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="cursor-pointer"
                  />
                  <Input
                    value={editingBranch.image || ""}
                    onChange={(e) => setEditingBranch({...editingBranch, image: e.target.value})}
                    placeholder="Or paste image URL"
                  />
                  {editingBranch.image && (
                    <img src={editingBranch.image} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateBranch}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Branches;
