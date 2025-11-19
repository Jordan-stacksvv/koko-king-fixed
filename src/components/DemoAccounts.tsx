import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, ChefHat, TruckIcon } from "lucide-react";

export const DemoAccounts = () => {
  const accounts = [
    {
      role: "Super Admin",
      icon: Shield,
      username: "admin@kokoking.com",
      password: "admin123",
      access: "All branches, analytics, settings, driver management",
      color: "text-red-600"
    },
    {
      role: "Manager",
      icon: User,
      username: "manager@branch1.com",
      password: "manager123",
      access: "Single branch management, orders, menu",
      color: "text-blue-600"
    },
    {
      role: "Kitchen Staff",
      icon: ChefHat,
      username: "kitchen",
      password: "kitchen123",
      access: "Order management, display system",
      color: "text-orange-600"
    },
    {
      role: "Driver",
      icon: TruckIcon,
      username: "driver@koko.com",
      password: "driver123",
      access: "Delivery dashboard, queue, earnings",
      color: "text-green-600"
    }
  ];

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Demo Accounts - For Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account) => {
          const Icon = account.icon;
          return (
            <div key={account.role} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${account.color}`} />
                  <h3 className="font-bold">{account.role}</h3>
                </div>
                <Badge variant="outline">{account.role}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Username:</span>
                  <p className="font-mono font-semibold">{account.username}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Password:</span>
                  <p className="font-mono font-semibold">{account.password}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{account.access}</p>
            </div>
          );
        })}
        
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> These are temporary demo accounts for development and testing. 
            In production, implement proper authentication with secure password hashing and role-based access control via Convex.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
