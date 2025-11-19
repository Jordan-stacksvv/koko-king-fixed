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
    
    // Demo credentials: kitchen / kitchen123
    if (email === "kitchen" && password === "kitchen123") {
      localStorage.setItem("kitchenAuth", "true");
      toast.success("Kitchen access granted!");
      navigate("/kitchen/dashboard");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img 
              src={kokoKingLogo} 
              alt="Koko King" 
              className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate("/")}
            />
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
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="kitchen"
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

            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <p className="font-semibold mb-1 text-muted-foreground">Demo Credentials:</p>
              <p className="font-mono">kitchen</p>
              <p className="font-mono">kitchen123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default KitchenLogin;
