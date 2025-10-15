import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CreditCard, Wallet } from "lucide-react";
import { useState, useEffect } from "react";

const Payments = () => {
  const [dateFilter, setDateFilter] = useState("today");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, cash: 0, momo: 0, card: 0 });

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    setTransactions(orders);

    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    const cashPayments = orders.filter((o: any) => o.paymentMethod === "cash").reduce((sum: number, o: any) => sum + o.total, 0);
    const momoPayments = orders.filter((o: any) => o.paymentMethod === "momo").reduce((sum: number, o: any) => sum + o.total, 0);
    const cardPayments = orders.filter((o: any) => o.paymentMethod === "card").reduce((sum: number, o: any) => sum + o.total, 0);

    setStats({ total: totalRevenue, cash: cashPayments, momo: momoPayments, card: cardPayments });
  }, []);

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
    <KitchenLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payments & Transactions</h1>
          <p className="text-muted-foreground">Track all payment activities</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
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

        <div className="flex gap-4">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
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
            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No transactions found</p>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getPaymentIcon(transaction.paymentMethod)}
                      </div>
                      <div>
                        <p className="font-semibold">{transaction.id}</p>
                        <p className="text-sm text-muted-foreground">{transaction.customer.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₵{transaction.total.toFixed(2)}</p>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.paymentMethod}
                      </Badge>
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

export default Payments;
