import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { KitchenLayout } from "@/components/kitchen/KitchenLayout";
import { Plus, MapPin, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Branches = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: "",
    location: "",
    phone: "",
    manager: ""
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("branches") || "[]");
    setBranches(saved);
  }, []);

  const saveBranches = (updatedBranches: any[]) => {
    localStorage.setItem("branches", JSON.stringify(updatedBranches));
    setBranches(updatedBranches);
  };

  const handleAddBranch = () => {
    if (!newBranch.name || !newBranch.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    const branch = {
      id: `branch-${Date.now()}`,
      ...newBranch,
      createdAt: new Date().toISOString()
    };

    saveBranches([...branches, branch]);
    toast.success(`${newBranch.name} added successfully!`);
    setNewBranch({ name: "", location: "", phone: "", manager: "" });
    setIsAddOpen(false);
  };

  const handleRemove = (id: string, name: string) => {
    if (confirm(`Remove ${name}?`)) {
      saveBranches(branches.filter(b => b.id !== id));
      toast.success(`${name} removed`);
    }
  };

  return (
    <KitchenLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Branch Management</h1>
            <p className="text-muted-foreground">Manage all Koko King locations</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Branch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Branch Name *</Label>
                  <Input
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                    placeholder="e.g., Accra Central"
                  />
                </div>
                <div>
                  <Label>Location *</Label>
                  <Input
                    value={newBranch.location}
                    onChange={(e) => setNewBranch({...newBranch, location: e.target.value})}
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>
                <div>
                  <Label>Manager Name</Label>
                  <Input
                    value={newBranch.manager}
                    onChange={(e) => setNewBranch({...newBranch, manager: e.target.value})}
                    placeholder="Manager name"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddBranch}>Add Branch</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {branches.map((branch) => (
            <Card key={branch.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{branch.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(branch.id, branch.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{branch.location}</span>
                </div>
                {branch.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{branch.phone}</span>
                  </div>
                )}
                {branch.manager && (
                  <p className="text-sm text-muted-foreground">Manager: {branch.manager}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </KitchenLayout>
  );
};

export default Branches;
