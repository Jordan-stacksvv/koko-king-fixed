import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, ShoppingCart, Award, Store, Package } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { initializeBranches } from "@/data/defaultBranches";

const COLORS = ['#E94E1B', '#FFA500', '#FFD700', '#32CD32', '#4169E1'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [branchStats, setBranchStats] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);

  useEffect(() => {
    // Check admin auth
    if (localStorage.getItem("adminAuth") !== "true") {
      navigate("/admin/login");
      return;
    }

    // Initialize branches
    initializeBranches();

    // Load data
    const branches = JSON.parse(localStorage.getItem("branches") || "[]");
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    
    const stats = branches.map((branch: any) => {
      const branchOrders = allOrders.filter((o: any) => o.branchId === branch.id);
      const revenue = branchOrders.reduce((sum: number, o: any) => sum + o.total, 0);
      return {
        ...branch,
        orderCount: branchOrders.length,
        revenue
      };
    });
    
    setBranchStats(stats);
    setOrders(allOrders);

    // Calculate top items
    const itemCounts: any = {};
    allOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (itemCounts[item.name]) {
          itemCounts[item.name] += item.quantity;
        } else {
          itemCounts[item.name] = item.quantity;
        }
      });
    });

    const topItemsArray = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);
    
    setTopItems(topItemsArray);
  }, [navigate]);

  const totalRevenue = branchStats.reduce((sum, b) => sum + b.revenue, 0);
  const totalOrders = branchStats.reduce((sum, b) => sum + b.orderCount, 0);
  const highestBranch = branchStats.length > 0 ? branchStats.reduce((max, b) => b.revenue > max.revenue ? b : max, branchStats[0]) : null;
  const topItem = topItems.length > 0 ? topItems[0] : null;

  const handleBranchClick = (branchId: string) => {
    navigate(`/admin/branches?selected=${branchId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

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
                    <SidebarMenuButton onClick={() => navigate("/admin/dashboard")} className="bg-primary/10">
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
                    <SidebarMenuButton onClick={() => navigate("/admin/menu")}>
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
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₵{totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">All branches combined</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all locations</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Item</CardTitle>
                  <Award className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold truncate">{topItem?.name || "N/A"}</div>
                  <p className="text-xs text-muted-foreground mt-1">{topItem?.count || 0} orders</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Branch</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold truncate">{highestBranch?.name || "N/A"}</div>
                  <p className="text-xs text-muted-foreground mt-1">₵{highestBranch?.revenue.toFixed(2) || "0.00"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Branch Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Branch</CardTitle>
                </CardHeader>
                <CardContent>
                  {branchStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={branchStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#E94E1B" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Items Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {topItems.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={topItems}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => entry.name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {topItems.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Branch Performance Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Branch Performance</CardTitle>
                <Button onClick={() => navigate("/admin/branches")}>
                  <Store className="h-4 w-4 mr-2" />
                  Manage Branches
                </Button>
              </CardHeader>
              <CardContent>
                {branchStats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No branches yet</p>
                ) : (
                  <div className="space-y-3">
                    {branchStats.map((branch) => (
                      <div
                        key={branch.id}
                        onClick={() => handleBranchClick(branch.id)}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold">{branch.name}</p>
                          <p className="text-sm text-muted-foreground">{branch.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">₵{branch.revenue.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{branch.orderCount} orders</p>
                        </div>
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

export default AdminDashboard;
