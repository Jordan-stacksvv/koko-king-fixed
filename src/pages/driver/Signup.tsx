import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { toast } from "sonner";

const DriverSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    ghanaCard: "",
    vehicleType: "",
    vehicleReg: "",
    passportPic: null as File | null,
    licenseNumber: "",
    bankAccount: "",
    emergencyContact: ""
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, passportPic: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.email || !formData.password || !formData.vehicleType || !formData.vehicleReg || !formData.bankAccount || !formData.emergencyContact) {
      toast.error("Please fill all required fields");
      return;
    }

    // Store application in localStorage with pending status
    const applications = JSON.parse(localStorage.getItem("driverApplications") || "[]");
    const newApplication = {
      id: `DRV-APP-${Date.now()}`,
      ...formData,
      passportPic: formData.passportPic?.name || null,
      status: "pending",
      appliedAt: new Date().toISOString()
    };
    
    applications.push(newApplication);
    localStorage.setItem("driverApplications", JSON.stringify(applications));
    
    toast.success("Application submitted! You'll be notified once approved.");
    navigate("/driver/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <img 
            src={kokoKingLogo} 
            alt="Koko King" 
            className="h-16 mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          />
          <CardTitle className="text-2xl">Driver Application</CardTitle>
          <CardDescription>Submit your application to become a Koko King driver</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0XX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ghanaCard">Ghana Card Number</Label>
              <Input
                id="ghanaCard"
                type="text"
                placeholder="GHA-XXXXXXXXX-X"
                value={formData.ghanaCard}
                onChange={(e) => setFormData({ ...formData, ghanaCard: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <Select value={formData.vehicleType} onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motorbike">Motorbike</SelectItem>
                    <SelectItem value="bicycle">Bicycle</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehicleReg">Vehicle Registration Number *</Label>
                <Input
                  id="vehicleReg"
                  type="text"
                  placeholder="GR-XXXX-XX"
                  value={formData.vehicleReg}
                  onChange={(e) => setFormData({ ...formData, vehicleReg: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passportPic">Passport Picture</Label>
              <Input
                id="passportPic"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">Upload a clear passport-size photo</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Driver License Number</Label>
              <Input
                id="licenseNumber"
                type="text"
                placeholder="DVLA License Number"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account / Mobile Money Number *</Label>
              <Input
                id="bankAccount"
                type="text"
                placeholder="For payouts"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact Phone Number *</Label>
              <Input
                id="emergencyContact"
                type="tel"
                placeholder="0XX XXX XXXX"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full">Submit Application</Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0" onClick={() => navigate("/driver/login")}>
              Login here
            </Button>
          </div>

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

export default DriverSignup;
