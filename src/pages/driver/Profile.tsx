import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { toast } from "sonner";

const DriverProfile = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    vehicleType: "",
    vehicleReg: "",
    profilePic: null as File | null
  });

  useEffect(() => {
    const driverAuth = localStorage.getItem("driverAuth");
    if (!driverAuth) {
      navigate("/driver/login");
      return;
    }

    const driverData = JSON.parse(driverAuth);
    setDriver(driverData);
    setFormData({
      fullName: driverData.fullName || "",
      phone: driverData.phone || "",
      email: driverData.email || "",
      vehicleType: driverData.vehicleType || "",
      vehicleReg: driverData.vehicleReg || "",
      profilePic: null
    });
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, profilePic: e.target.files[0] });
    }
  };

  const handleSave = () => {
    if (!driver) return;

    const updatedDriver = {
      ...driver,
      ...formData,
      profilePic: formData.profilePic?.name || driver.profilePic
    };

    localStorage.setItem("driverAuth", JSON.stringify(updatedDriver));
    
    // Update in drivers list
    const drivers = JSON.parse(localStorage.getItem("drivers") || "[]");
    const driverIndex = drivers.findIndex((d: any) => d.id === driver.id);
    if (driverIndex !== -1) {
      drivers[driverIndex] = updatedDriver;
      localStorage.setItem("drivers", JSON.stringify(drivers));
    }

    setDriver(updatedDriver);
    toast.success("Profile updated successfully!");
  };

  if (!driver) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <img 
            src={kokoKingLogo} 
            alt="Koko King" 
            className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/driver/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Driver Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
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
              <Label htmlFor="vehicleReg">Vehicle Registration Number</Label>
              <Input
                id="vehicleReg"
                type="text"
                value={formData.vehicleReg}
                onChange={(e) => setFormData({ ...formData, vehicleReg: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePic">Profile Picture</Label>
              <Input
                id="profilePic"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Driver ID:</span>
              <span className="font-medium">{driver.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Joined:</span>
              <span className="font-medium">{new Date(driver.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DriverProfile;
