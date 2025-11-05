import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrendingUp, Store, BarChart, ShoppingCart, Package, Settings as SettingsIcon, Send } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";
import { toast } from "sonner";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState({ to: "", subject: "", content: "" });
  const [branchAccessEnabled, setBranchAccessEnabled] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("adminAuth") !== "true") {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

  const handleSendMessage = () => {
    if (!message.to || !message.content) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Message sent to ${message.to}!`);
    setMessage({ to: "", subject: "", content: "" });
    setIsMessageDialogOpen(false);
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <div className="px-4 py-3">
                <img 
                  src={kokoKingLogo} 
                  alt="Koko King" 
                  className="h-12 w-auto cursor-pointer"
                  onClick={() => window.location.reload()}
                />
              </div>
              <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/admin/dashboard")}>
                      <TrendingUp className="h-4 w-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/admin/branches")}>
                      <Store className="h-4 w-4" />
                      <span>Branches</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/admin/analytics")}>
                      <BarChart className="h-4 w-4" />
                      <span>Sales Analytics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/admin/orders")}>
                      <ShoppingCart className="h-4 w-4" />
                      <span>All Orders</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate("/admin/menu")}>
                      <Package className="h-4 w-4" />
                      <span>Menu Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="bg-primary/10">
                      <SettingsIcon className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} className="text-destructive">
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">System Settings</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Branch Management */}
            <Card>
              <CardHeader>
                <CardTitle>Branch Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Individual Branch Management</p>
                    <p className="text-sm text-muted-foreground">
                      Allow admin to access and manage specific branches as if they were the branch manager
                    </p>
                  </div>
                  <Switch
                    checked={branchAccessEnabled}
                    onCheckedChange={setBranchAccessEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Messaging System */}
            <Card>
              <CardHeader>
                <CardTitle>Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                  <Button onClick={() => setIsMessageDialogOpen(true)} className="w-full md:w-auto">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message to Manager
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Message</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>To (Manager/Branch)</Label>
                        <Input
                          value={message.to}
                          onChange={(e) => setMessage({ ...message, to: e.target.value })}
                          placeholder="Enter manager name or branch"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          value={message.subject}
                          onChange={(e) => setMessage({ ...message, subject: e.target.value })}
                          placeholder="Message subject"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                          value={message.content}
                          onChange={(e) => setMessage({ ...message, content: e.target.value })}
                          placeholder="Type your message here..."
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSendMessage}>
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Feature Toggles */}
            <Card>
              <CardHeader>
                <CardTitle>System Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Walk-in Orders</p>
                    <p className="text-sm text-muted-foreground">Enable walk-in order functionality</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Online Orders</p>
                    <p className="text-sm text-muted-foreground">Enable online ordering system</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delivery Service</p>
                    <p className="text-sm text-muted-foreground">Enable delivery functionality</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Driver App</p>
                    <p className="text-sm text-muted-foreground">Enable driver portal access</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Notifications</p>
                    <p className="text-sm text-muted-foreground">Automatically send order notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Global Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Global Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input type="number" defaultValue="15" step="0.1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Service Charge (%)</Label>
                    <Input type="number" defaultValue="10" step="0.1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Currency Symbol</Label>
                  <Input defaultValue="₵" maxLength={3} />
                </div>
              </CardContent>
            </Card>

            <div className="sticky bottom-0 bg-background py-4 border-t">
              <Button onClick={handleSaveSettings} size="lg" className="w-full md:w-auto">
                Save All Settings
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminSettings;
