import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface PricingTier {
  id: string;
  minDistance: number;
  maxDistance: number;
  price: number;
}

export const DeliveryPricingSettings = () => {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    { id: "1", minDistance: 0, maxDistance: 3, price: 5.0 },
    { id: "2", minDistance: 3, maxDistance: 7, price: 10.0 },
    { id: "3", minDistance: 7, maxDistance: 15, price: 15.0 },
  ]);

  const addTier = () => {
    const lastTier = pricingTiers[pricingTiers.length - 1];
    const newTier: PricingTier = {
      id: Date.now().toString(),
      minDistance: lastTier ? lastTier.maxDistance : 0,
      maxDistance: lastTier ? lastTier.maxDistance + 5 : 5,
      price: lastTier ? lastTier.price + 5 : 5.0,
    };
    setPricingTiers([...pricingTiers, newTier]);
  };

  const removeTier = (id: string) => {
    setPricingTiers(pricingTiers.filter((tier) => tier.id !== id));
    toast.success("Pricing tier removed");
  };

  const updateTier = (id: string, field: keyof PricingTier, value: number) => {
    setPricingTiers(
      pricingTiers.map((tier) =>
        tier.id === id ? { ...tier, [field]: value } : tier
      )
    );
  };

  const savePricing = () => {
    // Store in localStorage (will be migrated to Convex)
    localStorage.setItem("deliveryPricing", JSON.stringify(pricingTiers));
    toast.success("Delivery pricing updated successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distance-Based Delivery Pricing</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure delivery fees based on distance from restaurant (in km)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <Label className="text-xs">Min Distance (km)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={tier.minDistance}
                  onChange={(e) =>
                    updateTier(tier.id, "minDistance", parseFloat(e.target.value))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Max Distance (km)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={tier.maxDistance}
                  onChange={(e) =>
                    updateTier(tier.id, "maxDistance", parseFloat(e.target.value))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Delivery Fee (₵)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={tier.price}
                  onChange={(e) =>
                    updateTier(tier.id, "price", parseFloat(e.target.value))
                  }
                  className="h-9"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeTier(tier.id)}
                  className="h-9 w-full"
                  disabled={pricingTiers.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={addTier} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Tier
          </Button>
          <Button onClick={savePricing} className="flex-1">
            Save Pricing
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
          <p className="font-semibold mb-2">Example:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• 0-3 km: ₵5.00</li>
            <li>• 3-7 km: ₵10.00</li>
            <li>• 7-15 km: ₵15.00</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
