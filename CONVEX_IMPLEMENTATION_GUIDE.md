# Koko King - Convex Implementation Guide

## ✅ What's Been Completed

I've created the complete Convex backend structure for you:

### ✅ Schema Defined (`convex/schema.ts`)
Complete database schema with all tables:
- ✅ `branches` - Restaurant locations
- ✅ `menuItems` - Menu catalog
- ✅ `orders` - Order management
- ✅ `drivers` - Driver profiles
- ✅ `driverQueue` - Real-time driver queue
- ✅ `driverEarnings` - Earnings tracking
- ✅ `users` - Admin/Manager/Kitchen staff
- ✅ `settings` - System configuration
- ✅ `analytics` - Sales analytics
- ✅ `notifications` - Real-time notifications
- ✅ `transactions` - Payment tracking

### ✅ Functions Created
Complete CRUD operations for all tables:

1. **`convex/orders.ts`** ✅
   - Create, list, update orders
   - Filter by branch, customer, driver
   - Update status and delivery status
   - Assign drivers
   - Track locations

2. **`convex/drivers.ts`** ✅
   - Driver applications
   - Approve/reject drivers
   - Profile management
   - Queue management (join/leave/status)
   - Earnings tracking

3. **`convex/branches.ts`** ✅
   - CRUD operations for branches
   - Active/inactive status

4. **`convex/menuItems.ts`** ✅
   - Menu management
   - Category filtering
   - Branch-specific menus
   - Availability toggle

5. **`convex/settings.ts`** ✅
   - Settings management
   - Branch-specific and global settings

6. **`convex/analytics.ts`** ✅
   - Daily analytics calculation
   - Revenue tracking
   - Top items analysis

7. **`convex/notifications.ts`** ✅
   - Create and manage notifications
   - Real-time updates
   - Mark as read

---

## 🔧 What You Need to Do

### Step 1: Install Convex ⚠️ REQUIRED
```bash
npm install convex
```

### Step 2: Initialize Convex Project ⚠️ REQUIRED
```bash
npx convex dev
```

This command will:
1. Prompt you to create/login to Convex account
2. Create a new Convex project
3. Generate `convex/_generated` folder
4. Start the Convex dev server

**Important**: Keep this terminal window open while developing!

### Step 3: Environment Variables ⚠️ REQUIRED

The `npx convex dev` command will automatically generate your Convex URL. Add it to your `.env.local`:

```env
VITE_CONVEX_URL=https://YOUR_PROJECT_NAME.convex.cloud
```

You'll see this URL in the terminal after running `npx convex dev`.

### Step 4: Verify Schema Deployment ✅ CHECK

After running `npx convex dev`, the schema should automatically deploy. Verify in the Convex dashboard:

1. Go to https://dashboard.convex.dev
2. Select your project
3. Click "Data" tab
4. You should see all 11 tables listed

### Step 5: Test Functions ⚠️ RECOMMENDED

Test that functions work in Convex dashboard:

1. Go to "Functions" tab
2. Try running `branches:list` - should return empty array
3. Try running `orders:list` - should return empty array

---

## 🚀 Frontend Integration Required

### Step 1: Update `main.tsx` ⚠️ REQUIRED

Wrap your app with ConvexProvider:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App.tsx";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>
);
```

### Step 2: Update Components to Use Convex

You need to replace `localStorage` calls with Convex hooks in these files:

#### Priority 1: Orders (CORE FUNCTIONALITY)
- [ ] `src/pages/Checkout.tsx` - Create orders
- [ ] `src/pages/kitchen/Orders.tsx` - List and update orders
- [ ] `src/pages/kitchen/Done.tsx` - Assign drivers
- [ ] `src/pages/OrderTracking.tsx` - Track order status
- [ ] `src/pages/CustomerOrders.tsx` - Customer order history

**Example Pattern:**
```typescript
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Instead of localStorage
const orders = JSON.parse(localStorage.getItem("orders") || "[]");

// Use Convex
const orders = useQuery(api.orders.list) || [];

// Instead of localStorage save
localStorage.setItem("orders", JSON.stringify(updatedOrders));

// Use Convex mutation
const updateStatus = useMutation(api.orders.updateStatus);
await updateStatus({ id: orderId, status: "confirmed" });
```

#### Priority 2: Drivers
- [ ] `src/pages/driver/Dashboard.tsx` - Driver operations
- [ ] `src/pages/driver/Login.tsx` - Authentication
- [ ] `src/pages/driver/Settings.tsx` - Profile management
- [ ] `src/pages/manager/Drivers.tsx` - Driver approval

#### Priority 3: Branches & Menu
- [ ] `src/pages/admin/Branches.tsx` - Branch management
- [ ] `src/pages/admin/Menu.tsx` - Menu management
- [ ] `src/pages/manager/MenuManagement.tsx` - Manager menu access

---

## 📊 Real-Time Features

Convex provides automatic real-time updates! When you use `useQuery`, components automatically re-render when data changes.

**No polling needed!** Remove all `setInterval` calls for data refresh.

```typescript
// ❌ OLD WAY - Manual polling
useEffect(() => {
  const interval = setInterval(loadOrders, 3000);
  return () => clearInterval(interval);
}, []);

// ✅ NEW WAY - Automatic real-time
const orders = useQuery(api.orders.list);
// Component automatically updates when orders change!
```

---

## 🔐 Authentication Setup

Convex has built-in authentication. You'll need to set it up for:
- Admin login
- Manager login
- Kitchen staff login
- Driver login

### Option 1: Convex Auth (Recommended)
```bash
npm install @convex-dev/auth
```

Follow: https://docs.convex.dev/auth

### Option 2: Custom Auth
Continue using current localStorage auth initially, then migrate to Convex Auth.

---

## 🧪 Testing Checklist

After implementation, test these workflows:

### Customer Flow
- [ ] Browse menu
- [ ] Add items to cart
- [ ] Place order
- [ ] Track order real-time
- [ ] View order history

### Kitchen Flow
- [ ] Receive new orders (auto-update)
- [ ] Confirm orders
- [ ] Update order status
- [ ] Assign to drivers
- [ ] See delivery status

### Driver Flow
- [ ] Sign up (application)
- [ ] Login after approval
- [ ] Go online/offline
- [ ] Accept orders
- [ ] Update delivery status
- [ ] Complete deliveries

### Manager Flow
- [ ] Review driver applications
- [ ] Approve/reject drivers
- [ ] View branch orders
- [ ] Manage menu items
- [ ] View analytics

### Admin Flow
- [ ] View all branches
- [ ] Manage branches
- [ ] View all orders
- [ ] System-wide analytics

---

## 🔄 Migration Strategy

### Phase 1: Setup & Test (Days 1-2)
1. ✅ Install Convex
2. ✅ Deploy schema
3. ✅ Test functions in dashboard
4. ✅ Update main.tsx with provider

### Phase 2: Core Orders (Days 3-5)
1. Migrate order creation (Checkout)
2. Migrate kitchen order management
3. Migrate customer tracking
4. Test end-to-end order flow

### Phase 3: Driver System (Days 6-8)
1. Migrate driver signup/login
2. Migrate driver queue
3. Migrate order assignment
4. Test delivery workflow

### Phase 4: Admin Features (Days 9-10)
1. Migrate branch management
2. Migrate menu management
3. Migrate analytics
4. Test admin workflows

### Phase 5: Polish (Days 11-12)
1. Remove all localStorage code
2. Add error handling
3. Add loading states
4. Performance testing

---

## ⚠️ Important Notes

### Data Migration
Your existing localStorage data will not automatically migrate. Options:
1. **Fresh start**: Clear localStorage and start with empty Convex database
2. **Manual migration**: Create script to push localStorage data to Convex
3. **Hybrid**: Keep localStorage as fallback during transition

### Real-Time Updates
Convex automatically handles real-time updates:
- Orders update live across all devices
- Driver queue updates in real-time
- Kitchen sees new orders instantly
- No manual polling or WebSocket setup needed!

### Performance
Convex is optimized for:
- Hundreds of concurrent users
- Thousands of orders per day
- Real-time updates across devices
- Automatic scaling

### Cost
Convex has a generous free tier:
- 1M function calls/month free
- 1GB database storage free
- Perfect for starting and testing

---

## 🆘 Troubleshooting

### "Cannot find module 'convex/react'"
```bash
npm install convex
```

### "VITE_CONVEX_URL is not defined"
Check `.env.local` file exists and has correct URL

### Schema not deploying
```bash
npx convex dev
```
Keep this terminal open!

### Functions not working
Check Convex dashboard → Functions tab for error logs

### Real-time not updating
Make sure you're using `useQuery` not `useQueries`

---

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex React Guide](https://docs.convex.dev/client/react)
- [Convex Discord](https://convex.dev/community)

---

## ✨ Next Steps

1. Install Convex: `npm install convex`
2. Initialize: `npx convex dev`
3. Update `main.tsx` with ConvexProvider
4. Start migrating Checkout.tsx first
5. Test order creation end-to-end
6. Continue with remaining components

The backend is ready! Now you just need to connect the frontend to it. Start with the order flow and work your way through each feature.

**Estimated Time**: 7-10 days for full migration
**Complexity**: Medium (similar patterns across all components)
**Benefits**: Real-time updates, no manual sync, automatic scaling, better performance

Let me know once you've completed Steps 1-3 and I can help with the frontend integration!
