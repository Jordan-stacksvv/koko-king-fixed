import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Minus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { menuItems } from "@/data/menuItems";

export const AddOrderForm = ({ onClose }: { onClose: () => void }) => {
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullMenu, setShowFullMenu] = useState(false);

  const handleAddItem = (item: any) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.id === item.id ? {...i, quantity: i.quantity + 1} : i
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1, extras: [] }]);
    }
    toast.success(`${item.name} added`);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return {...item, quantity: newQty};
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId));
  };

  const filteredMenu = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    if (!customer.name || !customer.phone) {
      toast.error("Please fill customer details");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const newOrder = {
      id: `KK-${Math.floor(1000 + Math.random() * 9000)}`,
      customer,
      items: selectedItems,
      total: selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "pending",
      orderType: "walk-in",
      timestamp: new Date().toISOString(),
      deliveryMethod: "pickup",
    };

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    toast.success("Walk-in order added!");
    onClose();
  };

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Customer Name *</Label>
          <Input
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            placeholder="Enter name"
          />
        </div>
        <div>
          <Label>Phone *</Label>
          <Input
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            placeholder="Enter phone"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Menu Items</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullMenu(!showFullMenu)}
          >
            {showFullMenu ? "Quick Add" : "Full Menu"}
          </Button>
        </div>

        {showFullMenu ? (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-[300px] border rounded-lg p-2">
              <div className="grid gap-2">
                {filteredMenu.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    onClick={() => handleAddItem(item)}
                    className="h-auto py-3 justify-between"
                  >
                    <div className="text-left">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.category}</div>
                    </div>
                    <span className="font-bold">₵{item.price.toFixed(2)}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {menuItems.slice(0, 6).map((item) => (
              <Button
                key={item.id}
                variant="outline"
                onClick={() => handleAddItem(item)}
                className="h-auto py-3 flex flex-col items-start"
              >
                <span className="font-semibold text-sm">{item.name}</span>
                <span className="text-xs text-muted-foreground">₵{item.price.toFixed(2)}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div>
          <Label>Selected Items ({selectedItems.length})</Label>
          <div className="space-y-2 mt-2 p-3 bg-muted/50 rounded-lg max-h-[200px] overflow-y-auto">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm gap-2">
                <span className="flex-1 truncate">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, -1)}
                    className="h-6 w-6 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span className="font-semibold w-16 text-right">₵{(item.price * item.quantity).toFixed(2)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(item.id)}
                    className="h-6 w-6 p-0 text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₵{selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full" size="lg">
        Add Walk-in Order
      </Button>
    </div>
  );
};
