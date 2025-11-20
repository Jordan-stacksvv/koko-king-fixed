# Convex Migration Guide - Branch Management System

## Overview
This guide walks you through migrating from localStorage to Convex backend with full branch management support.

---

## Prerequisites

### 1. Install Convex
```bash
npm install convex
```

### 2. Initialize Convex
```bash
npx convex dev
```

This will:
- Create a Convex project
- Generate `convex.json` config
- Set up authentication
- Deploy your schema and functions

### 3. Get Your Deployment URL
After initialization, you'll receive a deployment URL like:
```
https://your-project.convex.cloud
```

---

## Step 1: Configure Convex Client

### Update `src/main.tsx`

```tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        {/* ... rest of app */}
      </QueryClientProvider>
    </ConvexProvider>
  </React.StrictMode>
);
```

### Add Environment Variable
Create `.env.local`:
```
VITE_CONVEX_URL=https://your-project.convex.cloud
```

---

## Step 2: Migrate Branch Data

### Create Migration Script
Create `src/scripts/migrateToDB.ts`:

```typescript
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useMigrateBranches = () => {
  const createBranch = useMutation(api.branches.create);
  
  const migrate = async () => {
    const branches = JSON.parse(localStorage.getItem("branches") || "[]");
    
    for (const branch of branches) {
      await createBranch({
        name: branch.name,
        location: branch.location,
        phone: branch.phone,
        manager: branch.manager,
        image: branch.image || "",
        coordinates: branch.coordinates || {
          latitude: 5.6037,
          longitude: -0.1870
        }
      });
    }
    
    console.log(`Migrated ${branches.length} branches`);
  };
  
  return migrate;
};
```

### Run Migration (One-time)
Add a button in Admin Dashboard:
```tsx
const migrate = useMigrateBranches();

<Button onClick={migrate}>
  Migrate Data to Convex
</Button>
```

---

## Step 3: Update Branch Management Hook

### Replace `src/hooks/useBranchData.tsx`:

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export const useBranchData = () => {
  const branches = useQuery(api.branches.list) || [];
  const createBranch = useMutation(api.branches.create);
  const updateBranch = useMutation(api.branches.update);
  const deleteBranch = useMutation(api.branches.remove);
  
  const addBranch = async (branchData: {
    name: string;
    location: string;
    phone: string;
    manager: string;
    image?: string;
    coordinates?: { latitude: number; longitude: number };
  }) => {
    return await createBranch({
      ...branchData,
      image: branchData.image || "",
      coordinates: branchData.coordinates || {
        latitude: 5.6037,
        longitude: -0.1870
      }
    });
  };
  
  const update = async (branchId: Id<"branches">, updates: any) => {
    await updateBranch({ id: branchId, ...updates });
  };
  
  const remove = async (branchId: Id<"branches">) => {
    await deleteBranch({ id: branchId });
  };
  
  const getBranchById = (branchId: string) => {
    return branches.find(b => b._id === branchId);
  };
  
  const getManagerBranch = () => {
    const managerAuth = localStorage.getItem("managerAuth");
    if (!managerAuth) return null;
    
    try {
      const parsed = JSON.parse(managerAuth);
      return branches.find(b => b._id === parsed.branchId);
    } catch {
      return null;
    }
  };
  
  return {
    branches,
    addBranch,
    updateBranch: update,
    deleteBranch: remove,
    getBranchById,
    getManagerBranch,
    loadBranches: () => {}, // No-op for compatibility
    saveBranches: () => {}, // No-op for compatibility
  };
};
```

---

## Step 4: Update Admin Pages

### Admin Branches Page (`src/pages/admin/Branches.tsx`)

Replace localStorage calls with Convex:

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const Branches = () => {
  const branches = useQuery(api.branches.list) || [];
  const createBranch = useMutation(api.branches.create);
  const updateBranch = useMutation(api.branches.update);
  const deleteBranch = useMutation(api.branches.remove);
  
  const handleAddBranch = async () => {
    if (!newBranch.name || !newBranch.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    await createBranch({
      name: newBranch.name,
      location: newBranch.location,
      phone: newBranch.phone,
      manager: newBranch.manager,
      image: newBranch.image || "",
      coordinates: {
        latitude: 5.6037,
        longitude: -0.1870
      }
    });
    
    toast.success(`${newBranch.name} added successfully!`);
    setNewBranch({ name: "", location: "", phone: "", manager: "", image: "" });
    setIsAddOpen(false);
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch) return;

    await updateBranch({
      id: editingBranch._id,
      name: editingBranch.name,
      location: editingBranch.location,
      phone: editingBranch.phone,
      manager: editingBranch.manager,
      image: editingBranch.image
    });
    
    toast.success("Branch updated!");
    setIsEditOpen(false);
    setEditingBranch(null);
  };

  const handleRemove = async (id: Id<"branches">, name: string) => {
    if (confirm(`Remove ${name}? This will affect all data associated with this branch.`)) {
      await deleteBranch({ id });
      toast.success(`${name} removed`);
    }
  };
  
  // ... rest of component
};
```

---

## Step 5: Update Manager Pages

### Manager Dashboard (`src/pages/manager/Dashboard.tsx`)

```typescript
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useBranchData } from "@/hooks/useBranchData";

const Dashboard = () => {
  const { getManagerBranch } = useBranchData();
  const managerBranch = getManagerBranch();
  
  // Get orders for manager's branch only
  const orders = useQuery(
    api.orders.listByBranch, 
    managerBranch ? { branchId: managerBranch._id } : "skip"
  ) || [];
  
  const today = new Date().toDateString();
  const todayOrders = orders.filter(order => 
    new Date(order.timestamp).toDateString() === today
  );
  
  const stats = {
    totalOrders: todayOrders.length,
    pendingOrders: todayOrders.filter(o => o.status === "pending").length,
    completedToday: todayOrders.filter(o => o.status === "completed").length,
    todayRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
  };
  
  // ... rest of component
};
```

### Manager Settings (`src/pages/manager/Settings.tsx`)

```typescript
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useBranchData } from "@/hooks/useBranchData";

const Settings = () => {
  const { getManagerBranch } = useBranchData();
  const updateBranch = useMutation(api.branches.update);
  const managerBranch = getManagerBranch();
  
  const [branchInfo, setBranchInfo] = useState({
    name: managerBranch?.name || "",
    phone: managerBranch?.phone || "",
    location: managerBranch?.location || "",
    manager: managerBranch?.manager || ""
  });

  const handleSave = async () => {
    if (!managerBranch) {
      toast.error("Branch not found");
      return;
    }
    
    await updateBranch({
      id: managerBranch._id,
      ...branchInfo
    });
    
    toast.success("Branch settings saved successfully!");
  };
  
  // ... rest of component
};
```

---

## Step 6: Update Order Management

### Create Order (`src/pages/Checkout.tsx`)

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const Checkout = () => {
  const createOrder = useMutation(api.orders.create);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deliveryMethod === "delivery" && !deliveryCoords) {
      toast.error("Please select your delivery location on the map");
      setIsLocationDialogOpen(true);
      return;
    }

    const orderId = await createOrder({
      orderId: `KK-${Math.floor(1000 + Math.random() * 9000)}`,
      branchId: selectedRestaurant.id,
      branchName: selectedRestaurant.name,
      orderType: "online",
      deliveryMethod,
      items: cart,
      customer: formData,
      customerPhone: formData.phone,
      customerEmail: formData.email || "",
      deliveryAddress: formData.address || "",
      paymentMethod,
      total,
      customerLocation: deliveryCoords || undefined
    });

    localStorage.removeItem("cart");
    toast.success("Order placed successfully!");
    navigate(`/track-order?orderId=${orderId}`);
  };
  
  // ... rest of component
};
```

### Kitchen Orders (`src/pages/kitchen/Orders.tsx`)

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const KitchenOrders = () => {
  // Get manager's branch from auth
  const { getManagerBranch } = useBranchData();
  const managerBranch = getManagerBranch();
  
  // Real-time orders for this branch
  const orders = useQuery(
    api.orders.listByBranch,
    managerBranch ? { branchId: managerBranch._id } : "skip"
  ) || [];
  
  const updateOrderStatus = useMutation(api.orders.updateStatus);
  
  const handleStatusChange = async (orderId: Id<"orders">, newStatus: string) => {
    await updateOrderStatus({
      id: orderId,
      status: newStatus as any
    });
    toast.success("Order status updated!");
  };
  
  // ... rest of component
};
```

---

## Step 7: Update Driver Management

### Driver Signup (`src/pages/driver/Signup.tsx`)

```typescript
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const Signup = () => {
  const applyDriver = useMutation(api.drivers.apply);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await applyDriver({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      branchId: selectedBranch,
      vehicleType: formData.vehicleType,
      vehicleRegistration: formData.vehicleRegistration,
      ghanaCard: formData.ghanaCard,
      driverLicense: formData.driverLicense,
      passportPicture: formData.passportPicture,
      bankAccount: formData.bankAccount,
      emergencyContact: formData.emergencyContact
    });
    
    toast.success("Application submitted! Awaiting approval.");
    navigate("/driver/login");
  };
  
  // ... rest of component
};
```

### Manager Driver Approvals (`src/pages/manager/Drivers.tsx`)

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const DriverManagement = () => {
  const { getManagerBranch } = useBranchData();
  const managerBranch = getManagerBranch();
  
  const pendingDrivers = useQuery(
    api.drivers.listByStatus,
    { status: "pending" }
  ) || [];
  
  const approvedDrivers = useQuery(
    api.drivers.listByBranch,
    managerBranch ? { branchId: managerBranch._id } : "skip"
  ) || [];
  
  const approveDriver = useMutation(api.drivers.approve);
  const rejectDriver = useMutation(api.drivers.reject);
  
  const handleApprove = async (driverId: Id<"drivers">) => {
    await approveDriver({ id: driverId });
    toast.success("Driver approved!");
  };
  
  const handleReject = async (driverId: Id<"drivers">) => {
    await rejectDriver({ id: driverId });
    toast.success("Driver application rejected");
  };
  
  // ... rest of component
};
```

---

## Step 8: Implement Real-Time Features

### Real-Time Order Updates

```typescript
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Kitchen display - auto-updates when new orders arrive
const KitchenDisplay = () => {
  const { getManagerBranch } = useBranchData();
  const managerBranch = getManagerBranch();
  
  // This query automatically updates when data changes
  const orders = useQuery(
    api.orders.listByBranch,
    managerBranch ? { branchId: managerBranch._id } : "skip"
  ) || [];
  
  const confirmedOrders = orders.filter(o => 
    o.status === "confirmed" || o.status === "preparing"
  );
  
  return (
    <div>
      {confirmedOrders.map(order => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
};
```

### Real-Time Driver Queue

```typescript
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const DriverQueue = () => {
  const { getManagerBranch } = useBranchData();
  const managerBranch = getManagerBranch();
  
  // Auto-updates when drivers go online/offline
  const onlineDrivers = useQuery(
    api.drivers.getOnlineDrivers,
    managerBranch ? { branchId: managerBranch._id } : "skip"
  ) || [];
  
  return (
    <div>
      <h3>Available Drivers: {onlineDrivers.length}</h3>
      {onlineDrivers.map(driver => (
        <DriverCard key={driver._id} driver={driver} />
      ))}
    </div>
  );
};
```

---

## Step 9: Authentication Integration

### Update Auth Flow

Currently using localStorage for auth. With Convex, you can:

**Option 1: Keep localStorage (Simple)**
- Continue using localStorage for session management
- Use branchId from localStorage to query Convex
- Works immediately, no changes needed

**Option 2: Convex Auth (Recommended)**
- Install: `npm install @convex-dev/auth`
- Set up proper authentication with sessions
- More secure, better UX
- See: https://docs.convex.dev/auth

---

## Step 10: Testing Checklist

### Test Branch Management
- [ ] Admin can add new branch
- [ ] Manager login shows all branches in dropdown
- [ ] Manager can only see their branch's data
- [ ] Branch edits sync across all pages
- [ ] Branch deletion works correctly

### Test Order Management
- [ ] Customer can place online order
- [ ] Order appears in correct branch's kitchen
- [ ] Manager sees only their branch's orders
- [ ] Admin sees all orders or filtered by branch
- [ ] Order status updates in real-time

### Test Driver System
- [ ] Driver can sign up with branch selection
- [ ] Manager receives notification of new application
- [ ] Manager can approve/reject for their branch only
- [ ] Approved driver can log in
- [ ] Driver queue updates in real-time

### Test Menu Management
- [ ] Admin can add items to specific branches
- [ ] Manager can edit items for their branch
- [ ] Menu items filtered by branch correctly
- [ ] Availability toggle works per branch

---

## Performance Optimization

### Pagination for Large Datasets

```typescript
import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const Orders = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.orders.listByBranch,
    { branchId: managerBranch._id },
    { initialNumItems: 20 }
  );
  
  return (
    <div>
      {results.map(order => <OrderCard key={order._id} order={order} />)}
      {status === "CanLoadMore" && (
        <Button onClick={() => loadMore(20)}>Load More</Button>
      )}
    </div>
  );
};
```

### Indexes for Performance

Already defined in schema:
- `by_branch` on orders
- `by_category` on menu items
- `by_status` on drivers
- `by_active` on branches

---

## Rollback Plan

If you need to rollback to localStorage:

1. Keep both implementations running in parallel
2. Add feature flag:
```typescript
const USE_CONVEX = import.meta.env.VITE_USE_CONVEX === "true";

const branches = USE_CONVEX 
  ? useQuery(api.branches.list)
  : JSON.parse(localStorage.getItem("branches") || "[]");
```

3. Test thoroughly before removing localStorage code
4. Keep migration script for re-running if needed

---

## Support Resources

- **Convex Docs**: https://docs.convex.dev
- **Convex Discord**: https://convex.dev/community
- **React Integration**: https://docs.convex.dev/client/react

---

## Next Steps After Migration

1. ✅ Verify all data migrated correctly
2. ✅ Test all user workflows
3. ✅ Monitor real-time updates
4. ✅ Set up proper authentication (Convex Auth)
5. ✅ Implement push notifications via Convex actions
6. ✅ Add analytics and reporting queries
7. ✅ Optimize indexes based on query patterns
8. ✅ Set up staging and production deployments
