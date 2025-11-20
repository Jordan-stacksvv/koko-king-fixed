import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, User, Phone, Mail, Car, TruckIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const ManagerDrivers = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [approvedDrivers, setApprovedDrivers] = useState<any[]>([]);
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    
    // Check for new applications every 5 seconds
    const interval = setInterval(() => {
      const apps = JSON.parse(localStorage.getItem("driverApplications") || "[]");
      const pendingApps = apps.filter((a: any) => a.status === "pending");
      
      if (pendingApps.length > applications.length) {
        toast.info(`New driver application received! ${pendingApps.length} pending applications.`, {
          duration: 5000,
        });
      }
      
      setApplications(pendingApps);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const apps = JSON.parse(localStorage.getItem("driverApplications") || "[]");
    const drivers = JSON.parse(localStorage.getItem("drivers") || "[]");
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");

    setApplications(apps.filter((a: any) => a.status === "pending"));
    setApprovedDrivers(drivers.filter((d: any) => d.approved));
    setOnlineDrivers(queue.filter((d: any) => d.status === "online"));
  };

  const handleApprove = (applicationId: string) => {
    const apps = JSON.parse(localStorage.getItem("driverApplications") || "[]");
    const appIndex = apps.findIndex((a: any) => a.id === applicationId);
    
    if (appIndex !== -1) {
      const application = apps[appIndex];
      
      // Create approved driver
      const drivers = JSON.parse(localStorage.getItem("drivers") || "[]");
      const newDriver = {
        id: `DRV-${Date.now().toString().slice(-6)}`,
        ...application,
        approved: true,
        status: "approved",
        approvedAt: new Date().toISOString(),
        deliveries: [],
        earnings: 0
      };
      
      drivers.push(newDriver);
      localStorage.setItem("drivers", JSON.stringify(drivers));
      
      // Update application status
      apps[appIndex].status = "approved";
      localStorage.setItem("driverApplications", JSON.stringify(apps));
      
      loadData();
      toast.success(`Driver ${application.fullName} approved! They can now login and update their passkey.`);
    }
  };

  const handleReject = (applicationId: string) => {
    const apps = JSON.parse(localStorage.getItem("driverApplications") || "[]");
    const appIndex = apps.findIndex((a: any) => a.id === applicationId);
    
    if (appIndex !== -1) {
      apps[appIndex].status = "rejected";
      localStorage.setItem("driverApplications", JSON.stringify(apps));
      loadData();
      toast.success("Application rejected");
    }
  };

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Driver Management</h1>
            <p className="text-muted-foreground">Manage driver applications and active drivers</p>
          </div>
          {applications.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {applications.length} New Application{applications.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedDrivers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onlineDrivers.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">
              Applications
              {applications.length > 0 && (
                <Badge variant="secondary" className="ml-2">{applications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">Active Drivers</TabsTrigger>
            <TabsTrigger value="online">Online Drivers</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending applications
                </CardContent>
              </Card>
            ) : (
              applications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{app.fullName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">Pending Review</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{app.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{app.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{app.vehicleType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{app.vehicleReg}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApprove(app.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Driver
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleReject(app.id)}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {approvedDrivers.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No active drivers
                </CardContent>
              </Card>
            ) : (
              approvedDrivers.map((driver) => (
                <Card key={driver.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TruckIcon className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{driver.fullName}</h3>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <span>{driver.phone}</span>
                          <span>{driver.vehicleType} - {driver.vehicleReg}</span>
                          <span>Deliveries: {driver.deliveries?.length || 0}</span>
                          <span>Earnings: ₵{driver.earnings?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                      <Badge variant={driver.status === "online" ? "default" : "secondary"}>
                        {driver.status || "Offline"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="online" className="space-y-4">
            {onlineDrivers.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No drivers currently online
                </CardContent>
              </Card>
            ) : (
              onlineDrivers.map((driver) => {
                const driverInfo = approvedDrivers.find(d => d.id === driver.driverId);
                return (
                  <Card key={driver.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <div>
                            <p className="font-semibold">{driverInfo?.fullName || 'Unknown Driver'}</p>
                            <p className="text-sm text-muted-foreground">
                              {driver.currentDelivery ? 'On delivery' : 'Available'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="default">Online</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </KitchenLayout>
  );
};

export default ManagerDrivers;
