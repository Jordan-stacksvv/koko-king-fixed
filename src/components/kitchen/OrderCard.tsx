import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, ChefHat, X, Download } from "lucide-react";
import { toast } from "sonner";

interface OrderCardProps {
  order: any;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onRemove: (orderId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const OrderCard = ({ order, onStatusUpdate, onRemove, isExpanded, onToggleExpand }: OrderCardProps) => {
  const [preparingBy, setPreparingBy] = useState<string>("");

  const handleStartPreparing = () => {
    const chefName = prompt("Enter your name:");
    if (chefName) {
      setPreparingBy(chefName);
      onStatusUpdate(order.id, "preparing");
      toast.success(`${chefName} started preparing order ${order.id}`);
    }
  };

  const handleMarkDone = () => {
    onStatusUpdate(order.id, "ready");
    toast.success(`Order ${order.id} is ready!`);
  };

  const handleComplete = () => {
    const receipt = generateReceipt(order);
    downloadReceipt(receipt, order.id);
    onRemove(order.id);
    toast.success("Order completed and receipt downloaded!");
  };

  const generateReceipt = (order: any) => {
    return `
KOKO KING EXPRESS
==================
Order ID: ${order.id}
Date: ${new Date(order.timestamp).toLocaleString()}
Customer: ${order.customer.name}
Phone: ${order.customer.phone}
${order.deliveryMethod === 'delivery' ? `Address: ${order.customer.address}` : 'Method: Pickup'}

ITEMS:
${order.items.map((item: any) => `${item.quantity}x ${item.name} - ₵${(item.price * item.quantity).toFixed(2)}`).join('\n')}

TOTAL: ₵${order.total.toFixed(2)}
==================
Thank you for choosing Koko King Express!
`;
  };

  const downloadReceipt = (content: string, orderId: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-500";
      case "preparing": return "bg-blue-500";
      case "ready": return "bg-green-500";
      default: return "bg-muted";
    }
  };

  return (
    <Card 
      className={`
        ${order.status === 'pending' ? 'border-orange-500 border-2 animate-pulse' : ''}
        ${order.status === 'preparing' ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
        ${isExpanded ? 'col-span-full' : ''}
        transition-all duration-300
      `}
    >
      <CardHeader className="cursor-pointer" onClick={onToggleExpand}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl flex items-center gap-2">
              {order.id}
              {order.status === 'pending' && <Bell className="h-5 w-5 text-orange-500 animate-bounce" />}
            </CardTitle>
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
            {preparingBy && (
              <Badge variant="outline" className="text-xs">
                <ChefHat className="h-3 w-3 mr-1" />
                {preparingBy}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}>
            {isExpanded ? <X className="h-4 w-4" /> : "Expand"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date(order.timestamp).toLocaleTimeString()} • {order.customer.name}
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <h4 className="font-semibold mb-2">Customer Details</h4>
              <p className="text-sm">{order.customer.name}</p>
              <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
              {order.deliveryMethod === "delivery" && (
                <p className="text-sm text-muted-foreground">{order.customer.address}</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Order Info</h4>
              <p className="text-sm">Method: {order.deliveryMethod}</p>
              <p className="text-sm">Items: {order.items.length}</p>
              <p className="text-sm font-bold">Total: ₵{order.total.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-lg">Items to Prepare</h4>
            <div className="space-y-3">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start p-4 rounded-lg border-2 border-primary/20 bg-card">
                  <div className="flex-1">
                    <p className="font-bold text-lg">{item.quantity}x {item.name}</p>
                    {item.extras && item.extras.length > 0 && (
                      <div className="mt-2 p-2 bg-muted rounded">
                        <p className="text-sm font-semibold">Accompaniments:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {item.extras.map((extra: string, i: number) => (
                            <li key={i}>{extra}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-lg">₵{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {order.status === "pending" && (
              <Button onClick={handleStartPreparing} className="flex-1" size="lg">
                <ChefHat className="h-4 w-4 mr-2" />
                Start Preparing
              </Button>
            )}
            {order.status === "preparing" && (
              <Button onClick={handleMarkDone} className="flex-1" size="lg">
                Mark as Ready
              </Button>
            )}
            {order.status === "ready" && (
              <Button onClick={handleComplete} className="flex-1" size="lg" variant="default">
                <Download className="h-4 w-4 mr-2" />
                Complete & Download Receipt
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
