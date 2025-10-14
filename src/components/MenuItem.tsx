import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

const extraOptions: ExtraOption[] = [
  { id: "extra-pepper", name: "Extra Pepper", price: 5 },
  { id: "extra-tomatoes", name: "Extra Tomatoes", price: 15 },
  { id: "extra-cheese", name: "Extra Cheese", price: 20 },
  { id: "extra-sauce", name: "Extra Sauce", price: 10 },
  { id: "no-onions", name: "No Onions", price: 0 },
];

export interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export const MenuItem = ({ id, name, description, price, image, category }: MenuItemProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev =>
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const calculateTotalPrice = () => {
    const extrasTotal = selectedExtras.reduce((sum, extraId) => {
      const extra = extraOptions.find(e => e.id === extraId);
      return sum + (extra?.price || 0);
    }, 0);
    return (price + extrasTotal) * quantity;
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalPrice = calculateTotalPrice() / quantity;
    const extras = selectedExtras.map(extraId =>
      extraOptions.find(e => e.id === extraId)?.name
    ).filter(Boolean);

    const cartItem = {
      id: `${id}-${selectedExtras.join('-')}`,
      name,
      price: totalPrice,
      image,
      category,
      quantity,
      extras,
      baseId: id
    };

    const existingItem = cart.find((item: any) => item.id === cartItem.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(`${name} added to cart!`);
    setQuantity(1);
    setSelectedExtras([]);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="group overflow-hidden transition-all hover:shadow-[var(--shadow-hover)] cursor-pointer">
          <CardHeader className="p-0">
            <div className="relative h-40 overflow-hidden">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <CardTitle className="text-base mb-1 line-clamp-1">{name}</CardTitle>
            <CardDescription className="line-clamp-1 text-xs">{description}</CardDescription>
            <p className="text-lg font-bold text-primary mt-2">₵{price.toFixed(2)}</p>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <img src={image} alt={name} className="w-full h-48 object-cover rounded-lg" />

          <div>
            <p className="text-muted-foreground text-sm">{description}</p>
            <p className="text-2xl font-bold text-primary mt-2">₵{price.toFixed(2)}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Customize Your Order</h4>
            <div className="space-y-2">
              {extraOptions.map((extra) => (
                <div key={extra.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={extra.id}
                      checked={selectedExtras.includes(extra.id)}
                      onCheckedChange={() => toggleExtra(extra.id)}
                    />
                    <label htmlFor={extra.id} className="text-sm cursor-pointer">
                      {extra.name}
                    </label>
                  </div>
                  {extra.price > 0 && (
                    <span className="text-sm font-medium">+₵{extra.price.toFixed(2)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <div className="flex items-center gap-2 bg-muted rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={addToCart} className="flex-1">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add ₵{calculateTotalPrice().toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
