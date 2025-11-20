import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { LocationSelectorWithMap } from "@/components/LocationSelectorWithMap";
import { Button } from "@/components/ui/button";
import { restaurants } from "@/data/menuItems";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapLocationPicker } from "@/components/MapLocationPicker";
import { calculateDistance } from "@/lib/geolocation";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  // Sync selected location address to delivery address
  useEffect(() => {
    const selectedLocation = localStorage.getItem("selectedLocation");
    const savedCoords = localStorage.getItem("deliveryCoords");
    if (selectedLocation && deliveryMethod === "delivery") {
      setFormData(prev => ({ ...prev, address: selectedLocation }));
    }
    if (savedCoords) {
      setDeliveryCoords(JSON.parse(savedCoords));
    }
  }, [selectedRestaurant, deliveryMethod]);

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const subtotal = cart.reduce((sum: number, item: any) => {
    const itemPrice = item.price;
    const extrasPrice = item.extras?.reduce((extraSum: number, extra: any) => extraSum + extra.price, 0) || 0;
    return sum + (itemPrice + extrasPrice) * item.quantity;
  }, 0);

  // Calculate distance-based delivery fee
  const calculateDeliveryFee = () => {
    if (deliveryMethod !== "delivery" || !deliveryCoords) return 0;

    const distance = calculateDistance(
      selectedRestaurant.coordinates.lat,
      selectedRestaurant.coordinates.lng,
      deliveryCoords.lat,
      deliveryCoords.lng
    );

    // Load pricing tiers from localStorage
    const pricingTiers = JSON.parse(
      localStorage.getItem("deliveryPricing") || 
      '[{"minDistance":0,"maxDistance":3,"price":5},{"minDistance":3,"maxDistance":7,"price":10},{"minDistance":7,"maxDistance":15,"price":15}]'
    );

    const matchingTier = pricingTiers.find(
      (tier: any) => distance >= tier.minDistance && distance <= tier.maxDistance
    );

    return matchingTier?.price || 5.0;
  };

  const deliveryFee = calculateDeliveryFee();
  const deliveryDistance = deliveryCoords
    ? calculateDistance(
        selectedRestaurant.coordinates.lat,
        selectedRestaurant.coordinates.lng,
        deliveryCoords.lat,
        deliveryCoords.lng
      )
    : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate delivery location for delivery orders
    if (deliveryMethod === "delivery" && !deliveryCoords) {
      toast.error("Please select your delivery location on the map");
      setIsLocationDialogOpen(true);
      return;
    }

    const order = {
      id: `KK-${Math.floor(1000 + Math.random() * 9000)}`,
      items: cart,
      customer: formData,
      customerPhone: formData.phone,
      customerEmail: formData.email || "",
      deliveryAddress: formData.address,
      deliveryMethod,
      paymentMethod,
      total,
      deliveryFee,
      deliveryDistance: deliveryDistance.toFixed(2),
      customerLocation: deliveryCoords,
      status: "pending",
      orderType: "online",
      branch: selectedRestaurant.name,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Store order in localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Save customer info for order tracking
    if (formData.phone) localStorage.setItem("customerPhone", formData.phone);
    if (formData.email) localStorage.setItem("customerEmail", formData.email);

    // Clear cart
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));

    toast.success("Order placed successfully! Redirecting to track your order...");
    
    // Redirect to order tracking page
    setTimeout(() => {
      navigate(`/track-order?orderId=${order.id}`);
    }, 1500);
  };

  const handleLocationSelect = (location: {
    address: string;
    lat: number;
    lng: number;
    nearestRestaurant: any;
  }) => {
    setFormData({ ...formData, address: location.address });
    setDeliveryCoords({ lat: location.lat, lng: location.lng });
    localStorage.setItem("selectedLocation", location.address);
    localStorage.setItem("deliveryCoords", JSON.stringify({ lat: location.lat, lng: location.lng }));
    setIsLocationDialogOpen(false);
    toast.success("Delivery location updated!");
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <LocationSelectorWithMap
        selectedRestaurant={selectedRestaurant}
        restaurants={restaurants}
        onRestaurantChange={setSelectedRestaurant}
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={deliveryMethod} onValueChange={(value: any) => setDeliveryMethod(value)}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Delivery</div>
                      <div className="text-sm text-muted-foreground">
                        {deliveryCoords && deliveryDistance > 0
                          ? `Get it delivered to your doorstep (${deliveryDistance.toFixed(1)} km)`
                          : "Get it delivered to your doorstep - Select location for pricing"}
                      </div>
                    </Label>
                    <span className="font-semibold">
                      {deliveryCoords && deliveryDistance > 0 
                        ? `₵${deliveryFee.toFixed(2)}` 
                        : "Select location"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Pickup</div>
                      <div className="text-sm text-muted-foreground">Collect from nearest branch</div>
                    </Label>
                    <span className="font-semibold">Free</span>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                {deliveryMethod === "delivery" && (
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    {!deliveryCoords && (
                      <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Please select your delivery location using the map to calculate accurate delivery fees
                        </p>
                      </div>
                    )}
                    <div className="relative">
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                        rows={3}
                        className="pr-12"
                        placeholder="Click the map icon to select your location"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsLocationDialogOpen(true)}
                        className="absolute top-2 right-2"
                      >
                        <MapPin className="h-5 w-5 text-primary" />
                      </Button>
                    </div>
                    {deliveryDistance > 0 && deliveryCoords && (
                      <p className="text-xs text-muted-foreground">
                        Distance: {deliveryDistance.toFixed(1)} km from {selectedRestaurant.name} • Fee: ₵{deliveryFee.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">Cash on Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="momo" id="momo" />
                    <Label htmlFor="momo" className="flex-1 cursor-pointer">Mobile Money</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">Debit/Credit Card</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item: any, index: number) => (
                    <div key={index} className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                        <span className="font-semibold">₵{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      {item.extras && item.extras.length > 0 && (
                        <div className="pl-4 space-y-0.5">
                          {item.extras.map((extra: any, i: number) => (
                            <div key={i} className="flex justify-between text-muted-foreground text-xs">
                              <span>+ {extra.name}</span>
                              <span>₵{(extra.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-semibold">₵{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₵{total.toFixed(2)}</span>
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Place Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>

      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Delivery Location</DialogTitle>
          </DialogHeader>
          <MapLocationPicker
            onLocationSelect={handleLocationSelect}
            restaurants={restaurants}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
