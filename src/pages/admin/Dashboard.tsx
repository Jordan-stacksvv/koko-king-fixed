import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { DollarSign, Store, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [branchStats, setBranchStats] = useState<any[]>([]);

  useEffect(() => {
    // Load branch data from localStorage
    const branches = JSON.parse(localStorage.getItem("branches") || "[]");
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    
    const stats = branches.map((branch: any) => {
      const branchOrders = orders.filter((o: any) => o.branchId === branch.id);
      const revenue = branchOrders.reduce((sum: number, o: any) => sum + o.total, 0);
      return {
        ...branch,
        orderCount: branchOrders.length,
        revenue
      };
    });
    
    setBranchStats(stats);
  }, []);

  const totalRevenue = branchStats.reduce((sum, b) => sum + b.revenue, 0);
  const totalOrders = branchStats.reduce((sum, b) => sum + b.orderCount, 0);

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of all branches</p>
          </div>
          <Button onClick={() => navigate("/admin/branches")}>
            <Store className="h-4 w-4 mr-2" />
            Manage Branches
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Branches</CardTitle>
              <Store className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{branchStats.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Branch</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₵{branchStats.length > 0 ? (totalRevenue / branchStats.length).toFixed(2) : "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Branch Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {branchStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No branches yet</p>
              ) : (
                branchStats.map((branch) => (
                  <div key={branch.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-semibold">{branch.name}</p>
                      <p className="text-sm text-muted-foreground">{branch.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₵{branch.revenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{branch.orderCount} orders</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </KitchenLayout>
  );
};

export default AdminDashboard;
