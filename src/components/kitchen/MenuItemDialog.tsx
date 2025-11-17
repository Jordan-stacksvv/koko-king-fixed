import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus } from "lucide-react";

interface ExtraOption {
  id: string;
  name: string;
  price: number;
  compulsory?: boolean;
}

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
  };
  onAddToOrder: (item: any) => void;
}

const getExtraOptions = (): ExtraOption[] => {
  const savedExtras = localStorage.getItem("menuExtras");
  if (savedExtras) {
    return JSON.parse(savedExtras);
  }
  return [
    { id: "extra-pepper", name: "Extra Pepper", price: 5, compulsory: false },
    { id: "extra-tomatoes", name: "Extra Tomatoes", price: 15, compulsory: false },
    { id: "extra-cheese", name: "Extra Cheese", price: 20, compulsory: false },
    { id: "extra-sauce", name: "Extra Sauce", price: 10, compulsory: false },
    { id: "no-onions", name: "No Onions", price: 0, compulsory: false },
  ];
};

export const MenuItemDialog = ({ isOpen, onClose, item, onAddToOrder }: MenuItemDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const extraOptions = getExtraOptions();

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
    return (item.price + extrasTotal) * quantity;
  };

  const handleAdd = () => {
    const totalPrice = calculateTotalPrice() / quantity;
    const extras = selectedExtras
      .map(extraId => extraOptions.find(e => e.id === extraId))
      .filter(Boolean);

    onAddToOrder({
      ...item,
      quantity,
      extras,
      totalPrice,
    });

    setQuantity(1);
    setSelectedExtras([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg" />

          <div>
            <p className="text-muted-foreground text-sm">{item.description}</p>
            <p className="text-2xl font-bold text-primary mt-2">₵{item.price.toFixed(2)}</p>
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
                    <label htmlFor={extra.id} className="text-sm cursor-pointer flex items-center gap-2">
                      {extra.name}
                      {extra.compulsory && (
                        <span className="text-xs px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded">
                          Required
                        </span>
                      )}
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
            <Button onClick={handleAdd} className="flex-1">
              Add ₵{calculateTotalPrice().toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
