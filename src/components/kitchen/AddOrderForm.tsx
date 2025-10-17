import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { menuItems } from "@/data/menuItems";

export const AddOrderForm = ({ onClose }: { onClose: () => void }) => {
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const handleAddItem = (item: any) => {
    setSelectedItems([...selectedItems, { ...item, quantity: 1, extras: [] }]);
  };

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
      id: `ORD-${Date.now()}`,
      customer,
      items: selectedItems,
      total: selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "pending",
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
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="space-y-3">
        <div>
          <Label>Customer Name</Label>
          <Input
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            placeholder="Enter name"
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            placeholder="Enter phone"
          />
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Quick Add Items</h4>
        <div className="grid grid-cols-2 gap-2">
          {menuItems.slice(0, 6).map((item) => (
            <Button
              key={item.id}
              variant="outline"
              size="sm"
              onClick={() => handleAddItem(item)}
            >
              {item.name} - ₵{item.price}
            </Button>
          ))}
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Selected Items</h4>
          <div className="space-y-2">
            {selectedItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 border rounded">
                <span>{item.name}</span>
                <span>₵{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full">
        Add Walk-in Order
      </Button>
    </div>
  );
};
