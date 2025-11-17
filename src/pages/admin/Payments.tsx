import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CreditCard, Wallet } from "lucide-react";

const AdminPayments = () => {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState("today");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, cash: 0, momo: 0, card: 0 });

  useEffect(() => {
    if (localStorage.getItem("adminAuth") !== "true") {
      navigate("/admin/login");
      return;
    }

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    setTransactions(orders);

    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    const cashPayments = orders.filter((o: any) => o.paymentMethod === "cash").reduce((sum: number, o: any) => sum + o.total, 0);
    const momoPayments = orders.filter((o: any) => o.paymentMethod === "momo").reduce((sum: number, o: any) => sum + o.total, 0);
    const cardPayments = orders.filter((o: any) => o.paymentMethod === "card").reduce((sum: number, o: any) => sum + o.total, 0);

    setStats({ total: totalRevenue, cash: cashPayments, momo: momoPayments, card: cardPayments });
  }, [navigate]);

  const filteredTransactions = transactions.filter(t => {
    if (paymentTypeFilter === "all") return true;
    return t.paymentMethod === paymentTypeFilter;
  });

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "card": return <CreditCard className="h-4 w-4" />;
      case "momo": return <Wallet className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <h1 className="text-base sm:text-lg font-semibold">Payments & Transactions</h1>
          </header>

          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Payments & Transactions</h2>
              <p className="text-sm text-muted-foreground">Track all payment activities across branches</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₵{stats.total.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Cash Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₵{stats.cash.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Mobile Money</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₵{stats.momo.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Card Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₵{stats.card.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Types</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="momo">Mobile Money</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No transactions found</p>
                ) : (
                  <div className="space-y-4">
                    {filteredTransactions.slice(0, 20).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            {getPaymentIcon(transaction.paymentMethod)}
                          </div>
                          <div>
                            <p className="font-semibold">Order #{transaction.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₵{transaction.total.toFixed(2)}</p>
                          <Badge variant="outline" className="capitalize">
                            {transaction.paymentMethod}
                          </Badge>
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

export default AdminPayments;
