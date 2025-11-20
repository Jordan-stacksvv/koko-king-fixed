import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Send, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState({ to: "", subject: "", content: "" });
  const [branchAccessEnabled, setBranchAccessEnabled] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ id: "", name: "" });
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [logoImage, setLogoImage] = useState("");

  useEffect(() => {
    if (localStorage.getItem("adminAuth") !== "true") {
      navigate("/admin/login");
    }

    // Load saved images
    const savedBanners = localStorage.getItem("customBannerImages");
    const savedLogo = localStorage.getItem("customLogo");
    if (savedBanners) setBannerImages(JSON.parse(savedBanners));
    if (savedLogo) setLogoImage(savedLogo);
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

  const handleAddCategory = () => {
    if (!newCategory.id || !newCategory.name) {
      toast.error("Please fill in all category fields");
      return;
    }
    const categories = JSON.parse(localStorage.getItem("categories") || "[]");
    categories.push({ id: newCategory.id, name: newCategory.name, image: "" });
    localStorage.setItem("categories", JSON.stringify(categories));
    toast.success(`Category "${newCategory.name}" added successfully!`);
    setNewCategory({ id: "", name: "" });
    setIsCategoryDialogOpen(false);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setBannerImages((prev) => {
          const updated = [...prev, base64];
          localStorage.setItem("customBannerImages", JSON.stringify(updated));
          return updated;
        });
        toast.success("Banner image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file is too large. Maximum size is 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoImage(base64);
      localStorage.setItem("customLogo", base64);
      toast.success("Logo uploaded successfully! Refresh to see changes.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBanner = (index: number) => {
    setBannerImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem("customBannerImages", JSON.stringify(updated));
      return updated;
    });
    toast.success("Banner image removed");
  };

  const handleRemoveLogo = () => {
    setLogoImage("");
    localStorage.removeItem("customLogo");
    toast.success("Logo removed. Refresh to see changes.");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />

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
                <CardTitle>Category Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setIsCategoryDialogOpen(true)}>
                  Add New Category
                </Button>
              </CardContent>
            </Card>

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

            {/* Branding & Images */}
            <Card>
              <CardHeader>
                <CardTitle>Branding & Images</CardTitle>
                <p className="text-sm text-muted-foreground">Upload custom logo and banner images for your storefront</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Restaurant Logo</Label>
                    {logoImage && (
                      <Button variant="ghost" size="sm" onClick={handleRemoveLogo}>
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    {logoImage && (
                      <div className="relative p-4 border rounded-lg bg-muted/50">
                        <img src={logoImage} alt="Logo" className="h-16 w-auto object-contain" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("logo-upload")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {logoImage ? "Change Logo" : "Upload Logo"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: PNG or SVG with transparent background. Max size: 2MB
                    </p>
                  </div>
                </div>

                {/* Banner Images Upload */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Header Banner Images</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload multiple images for the homepage carousel
                  </p>
                  
                  {bannerImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {bannerImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Banner ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveBanner(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("banner-upload")?.click()}
                      className="w-full"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Add Banner Images
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1920x400px images. Max 5MB per image. Multiple uploads supported.
                  </p>
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

        {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Category ID</Label>
                <Input
                  value={newCategory.id}
                  onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                  placeholder="e.g., pizza"
                />
              </div>
              <div>
                <Label>Category Name</Label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Pizza"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory}>
                  Add Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default AdminSettings;
