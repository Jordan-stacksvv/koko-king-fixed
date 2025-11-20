import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Minus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { menuItems } from "@/data/menuItems";
import { MenuItemDialog } from "./MenuItemDialog";

export const AddOrderForm = ({ onClose, onOrderCreated }: { onClose: () => void; onOrderCreated?: () => void }) => {
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [dialogItem, setDialogItem] = useState<any>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");

  const handleAddItem = (item: any) => {
    setDialogItem(item);
  };

  const handleAddToOrder = (itemWithExtras: any) => {
    const itemId = `${itemWithExtras.id}-${itemWithExtras.extras?.map((e: any) => e.id).join('-') || 'base'}`;
    const existing = selectedItems.find(i => i.uniqueId === itemId);
    
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.uniqueId === itemId ? {...i, quantity: i.quantity + itemWithExtras.quantity} : i
      ));
    } else {
      setSelectedItems([...selectedItems, { 
        ...itemWithExtras, 
        uniqueId: itemId,
        basePrice: itemWithExtras.price,
      }]);
    }
    toast.success(`${itemWithExtras.name} added`);
  };

  const updateQuantity = (uniqueId: string, delta: number) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.uniqueId === uniqueId) {
        const newQty = Math.max(1, item.quantity + delta);
        return {...item, quantity: newQty};
      }
      return item;
    }));
  };

  const removeItem = (uniqueId: string) => {
    setSelectedItems(selectedItems.filter(i => i.uniqueId !== uniqueId));
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
    if (deliveryMethod === "delivery" && !customer.address) {
      toast.error("Please enter delivery address");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const total = selectedItems.reduce((sum, item) => {
      const basePrice = item.price;
      const extrasPrice = item.extras?.reduce((eSum: number, e: any) => eSum + e.price, 0) || 0;
      return sum + (basePrice + extrasPrice) * item.quantity;
    }, 0);

    const newOrder = {
      id: `KK-${Math.floor(1000 + Math.random() * 9000)}`,
      customer,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: selectedItems,
      total,
      status: "confirmed", // Auto-confirm walk-in orders
      orderType: "walk-in",
      timestamp: new Date().toISOString(),
      deliveryMethod,
      deliveryAddress: deliveryMethod === "delivery" ? customer.address : null,
      priority: true, // Walk-in orders get priority
    };

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    toast.success("Walk-in order added!");
    onOrderCreated?.(); // Call the callback to reload orders
    onClose();
  };

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto">
      <div>
        <Label>Order Type *</Label>
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant={deliveryMethod === "pickup" ? "default" : "outline"}
            onClick={() => setDeliveryMethod("pickup")}
            className="flex-1"
          >
            Pickup
          </Button>
          <Button
            type="button"
            variant={deliveryMethod === "delivery" ? "default" : "outline"}
            onClick={() => setDeliveryMethod("delivery")}
            className="flex-1"
          >
            Delivery
          </Button>
        </div>
      </div>

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

      {deliveryMethod === "delivery" && (
        <div>
          <Label>Delivery Address *</Label>
          <Input
            value={customer.address}
            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            placeholder="Enter delivery address"
          />
        </div>
      )}

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
              <div key={item.uniqueId} className="space-y-1">
                <div className="flex justify-between items-center text-sm gap-2">
                  <span className="flex-1 truncate">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.uniqueId, -1)} className="h-6 w-6 p-0">
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.uniqueId, 1)} className="h-6 w-6 p-0">
                      <Plus className="h-3 w-3" />
                    </Button>
                    <span className="font-semibold w-16 text-right">
                      ₵{((item.price + (item.extras?.reduce((s: number, e: any) => s + e.price, 0) || 0)) * item.quantity).toFixed(2)}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => removeItem(item.uniqueId)} className="h-6 w-6 p-0 text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {item.extras && item.extras.length > 0 && (
                  <div className="pl-4 text-xs text-muted-foreground">+ {item.extras.map((e: any) => e.name).join(", ")}</div>
                )}
              </div>
            ))}
            <div className="pt-2 border-t mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₵{selectedItems.reduce((sum, item) => {
                  const basePrice = item.price;
                  const extrasPrice = item.extras?.reduce((eSum: number, e: any) => eSum + e.price, 0) || 0;
                  return sum + (basePrice + extrasPrice) * item.quantity;
                }, 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full" size="lg">Add Walk-in Order</Button>

      {dialogItem && (
        <MenuItemDialog isOpen={!!dialogItem} onClose={() => setDialogItem(null)} item={dialogItem} onAddToOrder={handleAddToOrder} />
      )}
    </div>
  );
};
