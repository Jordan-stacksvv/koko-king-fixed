import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload, User } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { toast } from "sonner";

const DriverSettings = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    vehicleType: "",
    vehicleReg: "",
    passkey: "",
    confirmPasskey: "",
    profilePicUrl: ""
  });
  const [profilePreview, setProfilePreview] = useState<string>("");

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
      passkey: "",
      confirmPasskey: "",
      profilePicUrl: driverData.profilePicUrl || ""
    });
    setProfilePreview(driverData.profilePicUrl || "");
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePreview(base64String);
        setFormData({ ...formData, profilePicUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!driver) return;

    const updatedDriver = {
      ...driver,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      vehicleType: formData.vehicleType,
      vehicleReg: formData.vehicleReg,
      profilePicUrl: formData.profilePicUrl
    };

    localStorage.setItem("driverAuth", JSON.stringify(updatedDriver));
    
    // Update in drivers list
    const drivers = JSON.parse(localStorage.getItem("drivers") || "[]");
    const driverIndex = drivers.findIndex((d: any) => d.id === driver.id);
    if (driverIndex !== -1) {
      drivers[driverIndex] = updatedDriver;
      localStorage.setItem("drivers", JSON.stringify(drivers));
    }

    // Update in driver queue
    const driverQueue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    const queueIndex = driverQueue.findIndex((d: any) => d.driverId === driver.id);
    if (queueIndex !== -1) {
      driverQueue[queueIndex] = {
        ...driverQueue[queueIndex],
        name: formData.fullName,
        phone: formData.phone
      };
      localStorage.setItem("driverQueue", JSON.stringify(driverQueue));
    }

    setDriver(updatedDriver);
    toast.success("Profile updated successfully!");
  };

  const handleChangePasskey = () => {
    if (!driver) return;

    if (formData.passkey !== formData.confirmPasskey) {
      toast.error("Passkeys do not match!");
      return;
    }

    if (formData.passkey.length < 6) {
      toast.error("Passkey must be at least 6 characters!");
      return;
    }

    const updatedDriver = {
      ...driver,
      passkey: formData.passkey
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
    setFormData({ ...formData, passkey: "", confirmPasskey: "" });
    toast.success("Passkey changed successfully!");
  };

  if (!driver) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* Profile Picture */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profilePreview} alt={driver.fullName} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(driver.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="profilePic" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Upload Photo</span>
                  </div>
                  <Input
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG or GIF (max. 2MB)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-6">
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
              <Input
                id="vehicleType"
                type="text"
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleReg">Vehicle Registration</Label>
              <Input
                id="vehicleReg"
                type="text"
                value={formData.vehicleReg}
                onChange={(e) => setFormData({ ...formData, vehicleReg: e.target.value })}
              />
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Change Passkey */}
        <Card>
          <CardHeader>
            <CardTitle>Change Passkey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passkey">New Passkey</Label>
              <Input
                id="passkey"
                type="password"
                value={formData.passkey}
                onChange={(e) => setFormData({ ...formData, passkey: e.target.value })}
                placeholder="Enter new passkey"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPasskey">Confirm Passkey</Label>
              <Input
                id="confirmPasskey"
                type="password"
                value={formData.confirmPasskey}
                onChange={(e) => setFormData({ ...formData, confirmPasskey: e.target.value })}
                placeholder="Confirm new passkey"
              />
            </div>

            <Button onClick={handleChangePasskey} className="w-full">
              Change Passkey
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DriverSettings;
