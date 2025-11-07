import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { LocationSelector } from "@/components/LocationSelector";
import { Button } from "@/components/ui/button";
import { restaurants } from "@/data/menuItems";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const subtotal = cart.reduce((sum: number, item: any) => {
    const itemPrice = item.price;
    const extrasPrice = item.extras?.reduce((extraSum: number, extra: any) => extraSum + extra.price, 0) || 0;
    return sum + (itemPrice + extrasPrice) * item.quantity;
  }, 0);
  const deliveryFee = deliveryMethod === "delivery" ? 5.00 : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const order = {
      id: `KK-${Math.floor(1000 + Math.random() * 9000)}`,
      items: cart,
      customer: formData,
      deliveryMethod,
      paymentMethod,
      total,
      status: "pending",
      orderType: "online",
      branch: selectedRestaurant.name,
      timestamp: new Date().toISOString(),
    };

    // Store order in localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));

    toast.success("Order placed successfully!");
    navigate("/");
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <LocationSelector
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
                      <div className="text-sm text-muted-foreground">Get it delivered to your doorstep</div>
                    </Label>
                    <span className="font-semibold">₵5.00</span>
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
                {deliveryMethod === "delivery" && (
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      rows={3}
                    />
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
    </div>
  );
};

export default Checkout;
