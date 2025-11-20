import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  Truck, 
  TrendingUp,
  BarChart3,
  DollarSign,
  ChefHat,
  Bike
} from "lucide-react";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";

export default function KitchenDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaySales: 0,
    totalOrders: 0,
    ordersInQueue: 0,
    ordersPreparing: 0,
    ongoingDeliveries: 0,
    completedOrders: 0
  });

  // Calculate live stats from localStorage (will be replaced by Convex)
  useEffect(() => {
    const calculateStats = () => {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      const today = new Date().toDateString();
      
      const todayOrders = orders.filter((order: any) => 
        new Date(order.timestamp).toDateString() === today
      );

      const todaySales = todayOrders.reduce((sum: number, order: any) => sum + order.total, 0);
      const totalOrders = todayOrders.length;
      const ordersInQueue = orders.filter((o: any) => o.status === "pending").length;
      const ordersPreparing = orders.filter((o: any) => o.status === "preparing").length;
      const ongoingDeliveries = orders.filter((o: any) => 
        o.deliveryStatus === "assigned" || 
        o.deliveryStatus === "accepted" || 
        o.deliveryStatus === "on-route"
      ).length;
      const completedOrders = orders.filter((o: any) => o.status === "completed").length;

      setStats({
        todaySales,
        totalOrders,
        ordersInQueue,
        ordersPreparing,
        ongoingDeliveries,
        completedOrders
      });
    };

    calculateStats();
    const interval = setInterval(calculateStats, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: "Today's Sales",
      value: `₵${stats.todaySales.toFixed(2)}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      clickAction: () => navigate("/kitchen/reports")
    },
    {
      title: "Total Orders Today",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      clickAction: () => navigate("/kitchen/orders")
    },
    {
      title: "Orders in Queue",
      value: stats.ordersInQueue,
      icon: ShoppingCart,
      color: "text-accent",
      bgColor: "bg-accent/10",
      clickAction: () => navigate("/kitchen/orders")
    },
    {
      title: "Orders Preparing",
      value: stats.ordersPreparing,
      icon: Clock,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      clickAction: () => navigate("/kitchen/orders")
    },
    {
      title: "Ongoing Deliveries",
      value: stats.ongoingDeliveries,
      icon: Truck,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      clickAction: () => navigate("/kitchen/done")
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders,
      icon: CheckCircle2,
      color: "text-primary",
      bgColor: "bg-primary/10",
      clickAction: () => navigate("/kitchen/orders")
    }
  ];

  const actionButtons = [
    {
      title: "Sales",
      description: "Manage walk-in and online orders",
      icon: ShoppingCart,
      color: "bg-primary hover:bg-primary/90",
      onClick: () => navigate("/kitchen/orders")
    },
    {
      title: "Rider Assignment",
      description: "View rider queue and manage assignments",
      icon: Truck,
      color: "bg-secondary hover:bg-secondary/90",
      onClick: () => navigate("/kitchen/settings")
    },
    {
      title: "Delivery Tracking",
      description: "Monitor ongoing, delayed, and completed deliveries",
      icon: Bike,
      color: "bg-accent hover:bg-accent/90",
      onClick: () => navigate("/kitchen/deliveries")
    },
    {
      title: "Sales Reports",
      description: "View daily, weekly sales and order history",
      icon: BarChart3,
      color: "bg-accent hover:bg-accent/90",
      onClick: () => navigate("/kitchen/reports")
    }
  ];

  return (
    <KitchenLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kitchen Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor operations and manage orders in real-time
          </p>
        </div>

      {/* Live Stats Grid - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
            onClick={stat.clickAction}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">Click for details</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionButtons.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-all cursor-pointer group" onClick={action.onClick}>
              <CardHeader>
                <div className={`${action.color} text-white p-3 rounded-lg inline-flex w-fit mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      </div>
    </KitchenLayout>
  );
}
