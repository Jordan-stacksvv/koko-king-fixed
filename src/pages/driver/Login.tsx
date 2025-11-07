import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { toast } from "sonner";

const DriverLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [systemPasskey, setSystemPasskey] = useState("");
  const [signupPhone, setSignupPhone] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const drivers = JSON.parse(localStorage.getItem("drivers") || "[]");
    const driver = drivers.find((d: any) => d.phone === phone);
    
    if (!driver) {
      toast.error("Driver not found. Please sign up first.");
      return;
    }
    
    if (systemPasskey !== "driver2025") {
      toast.error("Invalid system passkey");
      return;
    }
    
    localStorage.setItem("driverAuth", JSON.stringify(driver));
    toast.success("Login successful!");
    navigate("/driver/deliveries");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPhone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    const drivers = JSON.parse(localStorage.getItem("drivers") || "[]");
    
    if (drivers.find((d: any) => d.phone === signupPhone)) {
      toast.error("Phone number already registered");
      return;
    }
    
    const newDriver = {
      id: `DRV-${Date.now().toString().slice(-6)}`,
      phone: signupPhone,
      createdAt: new Date().toISOString(),
      deliveries: []
    };
    
    drivers.push(newDriver);
    localStorage.setItem("drivers", JSON.stringify(drivers));
    
    toast.success("Signup successful! Please login with system passkey.");
    setPhone(signupPhone);
    setSignupPhone("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src={kokoKingLogo} 
            alt="Koko King" 
            className="h-16 mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          />
          <CardTitle className="text-2xl">Driver Portal</CardTitle>
          <CardDescription>Login or signup to manage deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Signup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0XX XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passkey">System Passkey</Label>
                  <Input
                    id="passkey"
                    type="password"
                    placeholder="Enter system passkey"
                    value={systemPasskey}
                    onChange={(e) => setSystemPasskey(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Contact admin for system passkey</p>
                </div>
                <Button type="submit" className="w-full">Login</Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="0XX XXX XXXX"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Sign Up</Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <Button 
            variant="ghost" 
            className="w-full mt-4"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverLogin;
