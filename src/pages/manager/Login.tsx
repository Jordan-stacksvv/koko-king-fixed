import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { useBranchData } from "@/hooks/useBranchData";

const Login = () => {
  const navigate = useNavigate();
  const { branches, loadBranches } = useBranchData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBranch) {
      toast.error("Please select a branch");
      return;
    }

    // Demo credentials: manager@kokoking.com / manager123
    if (email === "manager@kokoking.com" && password === "manager123") {
      localStorage.setItem("managerAuth", JSON.stringify({
        authenticated: true,
        branchId: selectedBranch,
        email: email
      }));
      toast.success("Manager access granted!");
      navigate("/manager/dashboard");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
              <Settings className="h-6 w-6" />
              Manager Access
            </CardTitle>
            <CardDescription>Login to access management dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Select Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="manager@kokoking.com"
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
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign In to Dashboard
            </Button>

            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <p className="font-semibold mb-1 text-muted-foreground">Demo Credentials:</p>
              <p className="font-mono">manager@kokoking.com</p>
              <p className="font-mono">manager123</p>
              <p className="text-xs text-muted-foreground mt-1">Select any branch to login</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
