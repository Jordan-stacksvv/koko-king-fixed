import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChefHat } from "lucide-react";
import { toast } from "sonner";
import kokoKingLogo from "@/assets/koko-king-logo.png";

const KitchenLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo credentials: kitchen@kokoking.com / demo123
    if (email === "kitchen@kokoking.com" && password === "demo123") {
      localStorage.setItem("kitchenAuth", "true");
      toast.success("Kitchen access granted!");
      navigate("/kitchen/orders");
    } else {
      toast.error("Invalid credentials. Try: kitchen@kokoking.com / demo123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={kokoKingLogo} alt="Koko King" className="h-16 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <ChefHat className="h-6 w-6" />
              Kitchen Access
            </CardTitle>
            <CardDescription>Login to view and manage orders</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="kitchen@kokoking.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login to Kitchen
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo: kitchen@kokoking.com / demo123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default KitchenLogin;
