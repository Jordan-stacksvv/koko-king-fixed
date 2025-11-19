import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, User, Phone, Mail, Car } from "lucide-react";
import { toast } from "sonner";

const AdminDrivers = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [approvedDrivers, setApprovedDrivers] = useState<any[]>([]);
  const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);

  useEffect(() => {
    if (localStorage.getItem("adminAuth") !== "true") {
      navigate("/admin/login");
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = () => {
    const apps = JSON.parse(localStorage.getItem("driverApplications") || "[]");
    const drivers = JSON.parse(localStorage.getItem("drivers") || "[]");
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");

    setApplications(apps.filter((a: any) => a.status === "pending"));
    setApprovedDrivers(drivers);
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
        status: "approved",
        approvedAt: new Date().toISOString(),
        deliveries: []
      };
      
      drivers.push(newDriver);
      localStorage.setItem("drivers", JSON.stringify(drivers));
      
      // Update application status
      apps[appIndex].status = "approved";
      localStorage.setItem("driverApplications", JSON.stringify(apps));
      
      loadData();
      toast.success("Driver approved successfully!");
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <h1 className="text-base sm:text-lg font-semibold">Driver Management</h1>
          </header>

          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Driver Management</h2>
              <p className="text-sm text-muted-foreground">Manage driver applications and active drivers</p>
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
                  <div className="text-2xl font-bold text-green-600">{onlineDrivers.length}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="applications" className="w-full">
              <TabsList>
                <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
                <TabsTrigger value="drivers">Active Drivers ({approvedDrivers.length})</TabsTrigger>
                <TabsTrigger value="online">Online ({onlineDrivers.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="applications" className="space-y-4 mt-4">
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
                            <CardTitle className="text-lg">{app.fullName}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Applied {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{app.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{app.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span>{app.vehicleType} - {app.vehicleReg}</span>
                          </div>
                          {app.ghanaCard && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{app.ghanaCard}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-3 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Bank/MoMo: {app.bankAccount}</p>
                          <p className="text-sm text-muted-foreground">Emergency: {app.emergencyContact}</p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            className="flex-1"
                            onClick={() => handleApprove(app.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleReject(app.id)}
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

              <TabsContent value="drivers" className="space-y-4 mt-4">
                {approvedDrivers.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No active drivers
                    </CardContent>
                  </Card>
                ) : (
                  approvedDrivers.map((driver) => (
                    <Card key={driver.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{driver.fullName}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">ID: {driver.id}</p>
                          </div>
                          <Badge className="bg-green-500">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{driver.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>{driver.vehicleType} - {driver.vehicleReg}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Joined:</span>
                          <span>{new Date(driver.approvedAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="online" className="space-y-4 mt-4">
                {onlineDrivers.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No drivers online
                    </CardContent>
                  </Card>
                ) : (
                  onlineDrivers.map((driver) => (
                    <Card key={driver.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{driver.name}</p>
                            <p className="text-sm text-muted-foreground">{driver.phone}</p>
                          </div>
                          <Badge className="bg-green-500">🟢 Online</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDrivers;
