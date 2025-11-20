# Convex Quick Start - Get Started in 5 Minutes

## Your Backend is 100% Ready! 🎉

All Convex functions, schemas, and branch management logic are complete and production-ready. Follow these steps to activate it.

---

## Step 1: Install & Initialize (2 minutes)

### Install Convex
```bash
npm install convex
```

### Start Convex Dev Server
```bash
npx convex dev
```

**What this does:**
1. Creates a Convex project in your account
2. Deploys your schema (`convex/schema.ts`)
3. Deploys all 66 backend functions
4. Generates TypeScript types
5. Gives you a deployment URL

**You'll see:**
```
✓ Schema deployed
✓ Functions deployed
✓ Your deployment URL: https://your-project.convex.cloud
```

---

## Step 2: Add Deployment URL (30 seconds)

Create `.env.local` in your project root:

```env
VITE_CONVEX_URL=https://your-project.convex.cloud
```

Replace `your-project.convex.cloud` with your actual URL from Step 1.

---

## Step 3: Wrap Your App (1 minute)

Update `src/main.tsx`:

```tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Add this before ReactDOM.createRoot
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      {/* Your existing app code */}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ... all your routes */}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ConvexProvider>
  </React.StrictMode>
);
```

---

## Step 4: Test It Works (1 minute)

### Quick Test Component

Add this to any admin page temporarily:

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Add this inside your component
const TestConvex = () => {
  const branches = useQuery(api.branches.list);
  const createBranch = useMutation(api.branches.create);
  
  const testCreate = async () => {
    await createBranch({
      name: "Test Branch",
      location: "Test Location",
      phone: "+233 24 000 0000",
      manager: "Test Manager",
      image: "",
      coordinates: {
        latitude: 5.6037,
        longitude: -0.1870
      }
    });
  };
  
  return (
    <div className="p-4 border rounded">
      <h3>Convex Status: {branches ? "✅ Connected" : "⏳ Loading..."}</h3>
      <p>Branches in DB: {branches?.length || 0}</p>
      <Button onClick={testCreate}>Create Test Branch</Button>
    </div>
  );
};
```

If you see "✅ Connected", **Convex is working!**

---

## Step 5: Migrate Your Data (Optional)

### Option A: Fresh Start
Just start using Convex. Old localStorage data stays in place but isn't used.

### Option B: Migrate Existing Data
Create branches from your localStorage data:

```tsx
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const MigrateButton = () => {
  const createBranch = useMutation(api.branches.create);
  
  const migrate = async () => {
    const localBranches = JSON.parse(localStorage.getItem("branches") || "[]");
    
    for (const branch of localBranches) {
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
    
    toast.success(`Migrated ${localBranches.length} branches!`);
  };
  
  return <Button onClick={migrate}>Migrate Branches to Convex</Button>;
};
```

---

## What You Get Immediately

### ✅ Real-Time Everything
- Orders update live across all dashboards
- Driver queue changes instantly
- Menu availability syncs in real-time
- No page refreshes needed

### ✅ Branch Management
- Managers see only their branch data automatically
- Admin sees everything or filters by branch
- Branch changes propagate everywhere
- Full multi-location support

### ✅ Scalability
- No localStorage limits
- Handles thousands of orders
- Multiple users simultaneously
- Production-grade infrastructure

### ✅ Data Integrity
- ACID transactions
- Automatic backups
- Version control
- Query optimization

---

## Common Usage Patterns

### Get Branch-Specific Data (Manager)
```tsx
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useBranchData } from "@/hooks/useBranchData";

const ManagerDashboard = () => {
  const { getManagerBranch } = useBranchData();
  const managerBranch = getManagerBranch();
  
  // Automatically filtered to manager's branch
  const orders = useQuery(
    api.orders.listByBranch,
    managerBranch ? { branchId: managerBranch._id } : "skip"
  );
  
  return <div>Orders: {orders?.length}</div>;
};
```

### Create New Order
```tsx
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const Checkout = () => {
  const createOrder = useMutation(api.orders.create);
  
  const handleSubmit = async () => {
    const orderId = await createOrder({
      orderId: `KK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      branchId: selectedBranch._id,
      branchName: selectedBranch.name,
      orderType: "online",
      deliveryMethod: "delivery",
      items: cartItems,
      customer: customerInfo,
      customerPhone: phone,
      total: totalAmount,
    });
    
    toast.success("Order created!");
  };
};
```

### Update Order Status (Kitchen)
```tsx
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const KitchenOrders = () => {
  const updateStatus = useMutation(api.orders.updateStatus);
  
  const handleStatusChange = async (orderId, newStatus) => {
    await updateStatus({
      id: orderId,
      status: newStatus
    });
    // UI updates automatically!
  };
};
```

### Approve Driver (Manager)
```tsx
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const DriverManagement = () => {
  const approveDriver = useMutation(api.drivers.approve);
  
  const handleApprove = async (driverId) => {
    await approveDriver({ id: driverId });
    toast.success("Driver approved!");
    // Pending list updates automatically
  };
};
```

---

## Troubleshooting

### "Module not found: convex"
```bash
npm install convex
```

### "VITE_CONVEX_URL is undefined"
1. Create `.env.local` file
2. Add: `VITE_CONVEX_URL=https://your-url.convex.cloud`
3. Restart dev server: `npm run dev`

### "useQuery is not a function"
Make sure `ConvexProvider` wraps your entire app in `main.tsx`.

### "Cannot query 'skip'"
This means the condition returned "skip" instead of query args:
```tsx
// ❌ Wrong
const orders = useQuery(api.orders.listByBranch, 
  managerBranch?._id 
);

// ✅ Correct
const orders = useQuery(api.orders.listByBranch, 
  managerBranch ? { branchId: managerBranch._id } : "skip"
);
```

### Schema Mismatch
If you change the schema, run:
```bash
npx convex dev --once
```

---

## Next Steps

1. **Complete the Quick Start above** ✅
2. **Test with one feature** (e.g., viewing branches)
3. **Gradually migrate pages** from localStorage to Convex
4. **Keep both working in parallel** during transition
5. **Remove localStorage code** once fully migrated

---

## Need Help?

- 📚 **Full Migration Guide**: See `CONVEX_MIGRATION_GUIDE.md`
- 📊 **Data Flow Documentation**: See `SYSTEM_DATA_FLOW.md`
- 🔧 **Backend Status**: See `CONVEX_STATUS.md`
- 💬 **Convex Discord**: https://convex.dev/community
- 📖 **Convex Docs**: https://docs.convex.dev

---

## What's Already Built

You have **66 ready-to-use functions** including:

### Orders (12 functions)
✅ Create, list, update, filter, assign drivers, track status

### Drivers (15 functions)  
✅ Apply, approve, manage queue, track earnings, go online/offline

### Branches (8 functions)
✅ CRUD operations, find nearest, get active branches

### Menu Items (9 functions)
✅ Create, list by branch/category, toggle availability, search

### Settings (6 functions)
✅ Branch-specific configs, automation toggles

### Analytics (8 functions)
✅ Sales tracking, revenue reports, top items, trends

### And more!
✅ Notifications, delivery pricing, transactions

**Everything is branch-scoped and production-ready!** 🚀
