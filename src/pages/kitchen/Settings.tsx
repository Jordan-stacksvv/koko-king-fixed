import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bike, MapPin, Clock, Radio, User, Phone } from "lucide-react";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { toast } from "sonner";

export default function KitchenSettings() {
  const [settings, setSettings] = useState({
    autoAssignRider: true,
    defaultRadius: 5,
    broadcastTimeout: 20,
  });

  const [driverQueue, setDriverQueue] = useState<any[]>([]);

  useEffect(() => {
    const storedSettings = localStorage.getItem("kitchenSettings");
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }

    loadDriverQueue();
    const interval = setInterval(loadDriverQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadDriverQueue = () => {
    const queue = JSON.parse(localStorage.getItem("driverQueue") || "[]");
    setDriverQueue(queue);
  };

  const handleSave = () => {
    localStorage.setItem("kitchenSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully");
  };

  const handleToggleDriverStatus = (driverId: string) => {
    const updatedQueue = driverQueue.map((driver) =>
      driver.id === driverId
        ? { ...driver, status: driver.status === "online" ? "offline" : "online" }
        : driver
    );
    localStorage.setItem("driverQueue", JSON.stringify(updatedQueue));
    setDriverQueue(updatedQueue);
    toast.success("Driver status updated");
  };

  const broadcastToAllDrivers = () => {
    const onlineDrivers = driverQueue.filter((d) => d.status === "online");
    if (onlineDrivers.length === 0) {
      toast.error("No online drivers available");
      return;
    }
    toast.success(`Broadcasting to ${onlineDrivers.length} drivers`);
  };

  const onlineDrivers = driverQueue.filter((d) => d.status === "online");
  const offlineDrivers = driverQueue.filter((d) => d.status === "offline");

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rider Assignment</h1>
          <p className="text-muted-foreground mt-1">
            Manage rider queue and delivery settings
          </p>
        </div>

        {/* Rider Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Rider Queue</span>
              <Badge variant="secondary">{onlineDrivers.length} Online</Badge>
            </CardTitle>
            <CardDescription>
              View and manage riders available for delivery assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Online Riders ({onlineDrivers.length})</Label>
                <Button variant="outline" size="sm" onClick={broadcastToAllDrivers}>
                  <Radio className="h-4 w-4 mr-2" />
                  Broadcast to All
                </Button>
              </div>
              
              {onlineDrivers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No riders currently online
                </p>
              ) : (
                <div className="space-y-2">
                  {onlineDrivers.map((driver, index) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="default">#{index + 1}</Badge>
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{driver.name}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">{driver.phone}</p>
                          </div>
                          {driver.currentDelivery && (
                            <Badge variant="secondary" className="mt-1">
                              On Delivery
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleDriverStatus(driver.id)}
                      >
                        Set Offline
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Offline Riders ({offlineDrivers.length})</Label>
              {offlineDrivers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All riders are online
                </p>
              ) : (
                <div className="space-y-2">
                  {offlineDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-muted-foreground">{driver.name}</p>
                          <p className="text-sm text-muted-foreground">{driver.phone}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleDriverStatus(driver.id)}
                      >
                        Set Online
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Settings</CardTitle>
            <CardDescription>
              Configure automatic rider assignment and delivery preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-assign">Auto-Assign Rider</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign orders to the first available rider in queue
                </p>
              </div>
              <Switch
                id="auto-assign"
                checked={settings.autoAssignRider}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoAssignRider: checked })
                }
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="radius">Default Rider Radius (km)</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="radius"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.defaultRadius}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultRadius: parseInt(e.target.value) || 5 })
                  }
                  className="max-w-32"
                />
                <span className="text-sm text-muted-foreground">km</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Maximum distance riders can be from the restaurant for assignments
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Broadcast Timeout (seconds)</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="timeout"
                  type="number"
                  min="10"
                  max="60"
                  value={settings.broadcastTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      broadcastTimeout: parseInt(e.target.value) || 20,
                    })
                  }
                  className="max-w-32"
                />
                <span className="text-sm text-muted-foreground">seconds</span>
              </div>
              <p className="text-sm text-muted-foreground">
                How long to wait for a rider response before moving to the next rider
              </p>
            </div>

            <Button onClick={handleSave} className="w-full" size="lg">
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </KitchenLayout>
  );
}
