import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings as SettingsIcon, Truck, Bell, MapPin } from "lucide-react";

export default function KitchenSettings() {
  const [settings, setSettings] = useState({
    autoAssignRider: false,
    riderRadius: 5,
    broadcastTimeout: 20,
    soundNotifications: true,
    autoConfirmOrders: false,
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("kitchenSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem("kitchenSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully");
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kitchen Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure automation and delivery preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Rider Assignment Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <CardTitle>Rider Assignment</CardTitle>
            </div>
            <CardDescription>
              Configure how orders are assigned to delivery riders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-assign">Auto-Assign Rider</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign nearest available rider when order is ready
                </p>
              </div>
              <Switch
                id="auto-assign"
                checked={settings.autoAssignRider}
                onCheckedChange={(checked) => updateSetting("autoAssignRider", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="radius">Default Rider Radius (km)</Label>
              <Input
                id="radius"
                type="number"
                value={settings.riderRadius}
                onChange={(e) => updateSetting("riderRadius", parseFloat(e.target.value))}
                min="1"
                max="50"
              />
              <p className="text-sm text-muted-foreground">
                Maximum distance to search for available riders
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Broadcast Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                value={settings.broadcastTimeout}
                onChange={(e) => updateSetting("broadcastTimeout", parseInt(e.target.value))}
                min="10"
                max="60"
              />
              <p className="text-sm text-muted-foreground">
                Time to wait for rider acceptance before trying next rider
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Manage alerts and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound">Sound Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Play sound when new orders arrive
                </p>
              </div>
              <Switch
                id="sound"
                checked={settings.soundNotifications}
                onCheckedChange={(checked) => updateSetting("soundNotifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Automation Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              <CardTitle>Automation</CardTitle>
            </div>
            <CardDescription>
              Enable automatic order processing features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-confirm">Auto-Confirm Orders</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically confirm online orders when they arrive
                </p>
              </div>
              <Switch
                id="auto-confirm"
                checked={settings.autoConfirmOrders}
                onCheckedChange={(checked) => updateSetting("autoConfirmOrders", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={saveSettings} size="lg">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
