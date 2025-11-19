import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
import { format } from "date-fns";

export default function KitchenReports() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dailyStats, setDailyStats] = useState<any>({
    sales: 0,
    orders: 0,
    items: []
  });
  const [weeklyStats, setWeeklyStats] = useState<any>({
    sales: 0,
    orders: 0,
    topItems: []
  });

  useEffect(() => {
    // Calculate daily stats
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const selectedDate = date?.toDateString() || new Date().toDateString();
    
    const dayOrders = orders.filter((order: any) => 
      new Date(order.timestamp).toDateString() === selectedDate
    );

    const dailySales = dayOrders.reduce((sum: number, order: any) => sum + order.total, 0);
    
    setDailyStats({
      sales: dailySales,
      orders: dayOrders.length,
      items: dayOrders
    });

    // Calculate weekly stats (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekOrders = orders.filter((order: any) => 
      new Date(order.timestamp) >= weekAgo
    );

    const weeklySales = weekOrders.reduce((sum: number, order: any) => sum + order.total, 0);

    setWeeklyStats({
      sales: weeklySales,
      orders: weekOrders.length,
      topItems: weekOrders
    });
  }, [date]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
          <p className="text-muted-foreground mt-1">
            View sales performance and order history
          </p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Report</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₵{dailyStats.sales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {format(date || new Date(), "MMMM dd, yyyy")}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dailyStats.orders}</div>
                <p className="text-xs text-muted-foreground">Total orders today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₵{dailyStats.orders > 0 ? (dailyStats.sales / dailyStats.orders).toFixed(2) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Per order</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>All orders from {format(date || new Date(), "MMMM dd, yyyy")}</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyStats.items.length > 0 ? (
                <div className="space-y-2">
                  {dailyStats.items.map((order: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{order.orderType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No orders for this date</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₵{weeklyStats.sales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weeklyStats.orders}</div>
                <p className="text-xs text-muted-foreground">Total orders this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Avg</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₵{(weeklyStats.sales / 7).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Per day</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Order History</CardTitle>
              <CardDescription>All orders in chronological order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {JSON.parse(localStorage.getItem("orders") || "[]")
                  .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((order: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.timestamp), "MMM dd, yyyy 'at' HH:mm")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
