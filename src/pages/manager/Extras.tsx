import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Extra {
  id: string;
  name: string;
  price: number;
  compulsory: boolean;
}

const ManagerExtras = () => {
  const navigate = useNavigate();
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    compulsory: false,
  });

  useEffect(() => {
    const managerAuth = localStorage.getItem("managerAuth");
    if (!managerAuth) {
      navigate("/manager/login");
      return;
    }

    loadExtras();
  }, [navigate]);

  const loadExtras = () => {
    const savedExtras = localStorage.getItem("menuExtras");
    if (savedExtras) {
      setExtras(JSON.parse(savedExtras));
    } else {
      // Initialize with default extras
      const defaultExtras: Extra[] = [
        { id: "extra-pepper", name: "Extra Pepper", price: 5, compulsory: false },
        { id: "extra-tomatoes", name: "Extra Tomatoes", price: 15, compulsory: false },
        { id: "extra-cheese", name: "Extra Cheese", price: 20, compulsory: false },
        { id: "extra-sauce", name: "Extra Sauce", price: 10, compulsory: false },
        { id: "no-onions", name: "No Onions", price: 0, compulsory: false },
      ];
      setExtras(defaultExtras);
      localStorage.setItem("menuExtras", JSON.stringify(defaultExtras));
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter extra name");
      return;
    }

    if (editingExtra) {
      // Update existing extra
      const updatedExtras = extras.map(e =>
        e.id === editingExtra.id
          ? { ...e, name: formData.name, price: formData.price, compulsory: formData.compulsory }
          : e
      );
      setExtras(updatedExtras);
      localStorage.setItem("menuExtras", JSON.stringify(updatedExtras));
      toast.success("Extra updated successfully");
    } else {
      // Add new extra
      const newExtra: Extra = {
        id: `extra-${Date.now()}`,
        name: formData.name,
        price: formData.price,
        compulsory: formData.compulsory,
      };
      const updatedExtras = [...extras, newExtra];
      setExtras(updatedExtras);
      localStorage.setItem("menuExtras", JSON.stringify(updatedExtras));
      toast.success("Extra added successfully");
    }

    resetForm();
  };

  const handleEdit = (extra: Extra) => {
    setEditingExtra(extra);
    setFormData({
      name: extra.name,
      price: extra.price,
      compulsory: extra.compulsory,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedExtras = extras.filter(e => e.id !== id);
    setExtras(updatedExtras);
    localStorage.setItem("menuExtras", JSON.stringify(updatedExtras));
    toast.success("Extra deleted successfully");
  };

  const resetForm = () => {
    setFormData({ name: "", price: 0, compulsory: false });
    setEditingExtra(null);
    setIsDialogOpen(false);
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Menu Extras & Sides</h1>
            <p className="text-muted-foreground">Manage additional options for menu items</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Extra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingExtra ? "Edit Extra" : "Add New Extra"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Extra Cheese"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₵)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="compulsory">Compulsory Selection</Label>
                  <Switch
                    id="compulsory"
                    checked={formData.compulsory}
                    onCheckedChange={(checked) => setFormData({ ...formData, compulsory: checked })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  If marked as compulsory, customers must select or decline this option when ordering.
                </p>
                <Button onClick={handleSave} className="w-full">
                  {editingExtra ? "Update Extra" : "Add Extra"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {extras.map((extra) => (
            <Card key={extra.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{extra.name}</CardTitle>
                    {extra.compulsory && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-orange-500/10 text-orange-500 rounded">
                        Compulsory
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(extra)} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(extra.id)} className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {extra.price > 0 ? `+₵${extra.price.toFixed(2)}` : "Free"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {extras.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No extras added yet. Click "Add Extra" to create your first menu extra.
            </CardContent>
          </Card>
        )}
      </div>
    </ManagerLayout>
  );
};

export default ManagerExtras;
