import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { DollarSign, ShoppingBag, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedToday: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const today = new Date().toDateString();
    
    const todayOrders = orders.filter((order: any) => 
      new Date(order.timestamp).toDateString() === today
    );

    setStats({
      totalOrders: todayOrders.length,
      pendingOrders: todayOrders.filter((o: any) => o.status === "pending").length,
      completedToday: todayOrders.filter((o: any) => o.status === "completed").length,
      todayRevenue: todayOrders.reduce((sum: number, order: any) => sum + order.total, 0),
    });
  }, []);

  const statsData = [
    { title: "Total Orders Today", value: stats.totalOrders, icon: ShoppingBag, color: "text-blue-500" },
    { title: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "text-orange-500" },
    { title: "Completed Today", value: stats.completedToday, icon: CheckCircle, color: "text-green-500" },
    { title: "Today's Revenue", value: `₵${stats.todayRevenue.toFixed(2)}`, icon: DollarSign, color: "text-primary" },
  ];

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const recentOrders = orders.slice(-5).reverse();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-500/10 text-orange-500";
      case "preparing": return "bg-blue-500/10 text-blue-500";
      case "out-for-delivery": return "bg-purple-500/10 text-purple-500";
      case "completed": return "bg-green-500/10 text-green-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No orders yet</p>
                ) : (
                  recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{order.total.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button onClick={() => navigate("/manager/orders")} variant="outline" className="w-full mt-4">
                View All Orders
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => navigate("/manager/orders")} className="w-full justify-start">
                <ShoppingBag className="h-4 w-4 mr-3" />
                Manage Orders
              </Button>
              <Button onClick={() => navigate("/manager/menu")} variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-3" />
                Update Menu
              </Button>
              <Button onClick={() => navigate("/manager/deliveries")} variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-3" />
                Track Deliveries
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </KitchenLayout>
  );
};

export default Dashboard;
