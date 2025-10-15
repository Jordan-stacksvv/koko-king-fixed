import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Settings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage restaurant configuration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Restaurant Name</Label>
                <Input defaultValue="Koko King" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input defaultValue="+233 257 962 987" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea defaultValue="Multiple locations across Accra, Ghana" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="hello@kokoking.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">24/7 Operations</p>
                <p className="text-sm text-muted-foreground">Accept orders at any time</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delivery Fee</Label>
                <Input type="number" defaultValue="5.00" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Estimated Delivery Time (mins)</Label>
                <Input type="number" defaultValue="30" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Order Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified for new orders</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delivery Updates</p>
                <p className="text-sm text-muted-foreground">Track delivery status changes</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </KitchenLayout>
  );
};

export default Settings;
