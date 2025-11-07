# Koko King - Complete Convex Integration Guide

## 🎯 Overview

This guide provides step-by-step instructions for integrating Convex backend into the Koko King multi-location restaurant system. Convex will replace localStorage with a real-time, serverless backend.

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Convex Setup](#convex-setup)
3. [Schema Design](#schema-design)
4. [Functions Implementation](#functions-implementation)
5. [Frontend Integration](#frontend-integration)
6. [Migration Steps](#migration-steps)
7. [Testing Checklist](#testing-checklist)

---

## 🏗️ System Architecture

### Current System (localStorage)
- **Orders**: Stored locally per browser
- **Branches**: Local configuration
- **Menu**: Static data + custom items locally
- **Drivers**: Local driver records
- **Settings**: Local preferences

### After Convex Integration
- **Real-time sync** across all devices/locations
- **Centralized database** for all branches
- **Live updates** for kitchen, drivers, managers
- **Persistent data** with backup and recovery
- **User authentication** for role-based access

---

## 🚀 Convex Setup

### Step 1: Install Convex
```bash
npm install convex
npx convex dev
```

### Step 2: Initialize Convex Project
1. Create a Convex account at https://convex.dev
2. Run `npx convex dev` and follow the prompts
3. This creates a `convex/` folder in your project root

### Step 3: Update Environment Variables
Create `.env.local` file:
```env
VITE_CONVEX_URL=https://your-project.convex.cloud
```

---

## 📊 Schema Design

### File: `convex/schema.ts`

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Branches Table
  branches: defineTable({
    name: v.string(),
    location: v.string(),
    phone: v.string(),
    manager: v.string(),
    image: v.optional(v.string()),
    isActive: v.boolean(),
    coordinates: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
    createdAt: v.string(),
  }).index("by_name", ["name"]),

  // Menu Items Table
  menuItems: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(),
    isDefault: v.boolean(), // true for system items, false for custom
    branches: v.array(v.id("branches")), // which branches have this item
    isAvailable: v.boolean(),
    createdAt: v.string(),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_category", ["category"])
    .index("by_branches", ["branches"]),

  // Orders Table
  orders: defineTable({
    orderId: v.string(), // KK-XXXX format
    branchId: v.id("branches"),
    orderType: v.union(v.literal("walk-in"), v.literal("online")),
    deliveryMethod: v.union(v.literal("pickup"), v.literal("delivery")),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("done"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    items: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        extras: v.optional(
          v.array(
            v.object({
              name: v.string(),
              price: v.number(),
            })
          )
        ),
      })
    ),
    customer: v.object({
      name: v.string(),
      phone: v.string(),
      address: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
    paymentMethod: v.optional(v.string()),
    total: v.number(),
    timestamp: v.string(),
    confirmedAt: v.optional(v.string()),
    preparingAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    driverId: v.optional(v.id("drivers")),
    assignedAt: v.optional(v.string()),
  })
    .index("by_branch", ["branchId"])
    .index("by_status", ["status"])
    .index("by_order_type", ["orderType"])
    .index("by_branch_and_status", ["branchId", "status"]),

  // Drivers Table
  drivers: defineTable({
    driverId: v.string(), // DRV-XXXXXX format
    phone: v.string(),
    name: v.optional(v.string()),
    branchId: v.optional(v.id("branches")),
    isActive: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_phone", ["phone"])
    .index("by_branch", ["branchId"]),

  // Users Table (Admin, Manager, Kitchen Staff)
  users: defineTable({
    username: v.string(),
    password: v.string(), // Hash this in production!
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("kitchen"),
      v.literal("driver")
    ),
    branchId: v.optional(v.id("branches")), // managers/kitchen tied to branch
    phone: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_username", ["username"])
    .index("by_role", ["role"])
    .index("by_branch", ["branchId"]),

  // Settings Table
  settings: defineTable({
    key: v.string(),
    value: v.any(),
    branchId: v.optional(v.id("branches")), // global if null, branch-specific if set
    updatedAt: v.string(),
    updatedBy: v.id("users"),
  }).index("by_key", ["key"]),

  // Messages Table (Admin <-> Managers)
  messages: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.optional(v.id("users")), // null = broadcast to all managers
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_recipient", ["toUserId"])
    .index("by_sender", ["fromUserId"]),

  // Analytics Cache (Optional - for performance)
  analytics: defineTable({
    branchId: v.optional(v.id("branches")),
    metric: v.string(), // "daily_sales", "top_items", etc.
    date: v.string(), // YYYY-MM-DD
    data: v.any(),
    calculatedAt: v.string(),
  }).index("by_branch_and_date", ["branchId", "date"]),
});
```

---

## 🔧 Functions Implementation

### 1. Branch Functions

#### File: `convex/branches.ts`

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all branches
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("branches").collect();
  },
});

// Get branch by ID
export const getById = query({
  args: { id: v.id("branches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get active branches only
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("branches")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Create new branch
export const create = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    phone: v.string(),
    manager: v.string(),
    image: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("branches", {
      name: args.name,
      location: args.location,
      phone: args.phone,
      manager: args.manager,
      image: args.image,
      isActive: true,
      coordinates: {
        latitude: args.latitude,
        longitude: args.longitude,
      },
      createdAt: new Date().toISOString(),
    });
  },
});

// Update branch
export const update = mutation({
  args: {
    id: v.id("branches"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
    phone: v.optional(v.string()),
    manager: v.optional(v.string()),
    image: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});
```

---

### 2. Order Functions

#### File: `convex/orders.ts`

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create new order
export const create = mutation({
  args: {
    branchId: v.id("branches"),
    orderType: v.union(v.literal("walk-in"), v.literal("online")),
    deliveryMethod: v.union(v.literal("pickup"), v.literal("delivery")),
    items: v.array(v.any()),
    customer: v.object({
      name: v.string(),
      phone: v.string(),
      address: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
    paymentMethod: v.optional(v.string()),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    // Generate order ID
    const orderId = `KK-${Math.floor(1000 + Math.random() * 9000)}`;

    return await ctx.db.insert("orders", {
      orderId,
      branchId: args.branchId,
      orderType: args.orderType,
      deliveryMethod: args.deliveryMethod,
      status: "pending",
      items: args.items,
      customer: args.customer,
      paymentMethod: args.paymentMethod,
      total: args.total,
      timestamp: new Date().toISOString(),
    });
  },
});

// Get orders by branch and status
export const listByBranchAndStatus = query({
  args: {
    branchId: v.id("branches"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_branch_and_status", (q) =>
        q.eq("branchId", args.branchId).eq("status", args.status)
      )
      .collect();
  },
});

// Get all orders for a branch
export const listByBranch = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .order("desc")
      .collect();
  },
});

// Update order status
export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("done"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const updates: any = { status: args.status };

    // Add timestamps based on status
    if (args.status === "confirmed") {
      updates.confirmedAt = new Date().toISOString();
    } else if (args.status === "preparing") {
      updates.preparingAt = new Date().toISOString();
    } else if (args.status === "completed") {
      updates.completedAt = new Date().toISOString();
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Assign driver to order
export const assignDriver = mutation({
  args: {
    orderId: v.id("orders"),
    driverId: v.id("drivers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      driverId: args.driverId,
      assignedAt: new Date().toISOString(),
    });
  },
});
```

---

### 3. Menu Functions

#### File: `convex/menu.ts`

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get menu items for a branch
export const listByBranch = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    const allItems = await ctx.db.query("menuItems").collect();
    return allItems.filter((item) => item.branches.includes(args.branchId));
  },
});

// Create custom menu item
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(),
    branches: v.array(v.id("branches")),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      name: args.name,
      description: args.description,
      price: args.price,
      category: args.category,
      image: args.image,
      isDefault: false,
      branches: args.branches,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      createdBy: args.createdBy,
    });
  },
});

// Update menu item
export const update = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    image: v.optional(v.string()),
    branches: v.optional(v.array(v.id("branches"))),
    isAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete menu item
export const remove = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Assign menu item to additional branches
export const assignToBranches = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    branchIds: v.array(v.id("branches")),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.menuItemId);
    if (!item) throw new Error("Menu item not found");

    const updatedBranches = [...new Set([...item.branches, ...args.branchIds])];
    await ctx.db.patch(args.menuItemId, { branches: updatedBranches });
  },
});
```

---

### 4. Driver Functions

#### File: `convex/drivers.ts`

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Register new driver
export const register = mutation({
  args: {
    phone: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate driver ID
    const driverId = `DRV-${Math.floor(100000 + Math.random() * 900000)}`;

    return await ctx.db.insert("drivers", {
      driverId,
      phone: args.phone,
      name: args.name,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  },
});

// Get driver by phone
export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("drivers")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
  },
});

// Get active deliveries for driver
export const getDeliveries = query({
  args: { driverId: v.id("drivers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) =>
        q.and(
          q.eq(q.field("driverId"), args.driverId),
          q.neq(q.field("status"), "completed")
        )
      )
      .collect();
  },
});
```

---

### 5. Settings Functions

#### File: `convex/settings.ts`

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get setting by key
export const get = query({
  args: {
    key: v.string(),
    branchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .filter((q) => q.eq(q.field("branchId"), args.branchId))
      .first();
  },
});

// Update or create setting
export const upsert = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    branchId: v.optional(v.id("branches")),
    updatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .filter((q) => q.eq(q.field("branchId"), args.branchId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: new Date().toISOString(),
        updatedBy: args.updatedBy,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("settings", {
        key: args.key,
        value: args.value,
        branchId: args.branchId,
        updatedAt: new Date().toISOString(),
        updatedBy: args.updatedBy,
      });
    }
  },
});
```

---

## 🎨 Frontend Integration

### Step 1: Setup Convex Provider

#### File: `src/main.tsx`

```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Wrap App with ConvexProvider
root.render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>
);
```

---

### Step 2: Replace localStorage Calls

#### Example: Kitchen Orders Page
#### File: `src/pages/kitchen/Orders.tsx`

**BEFORE (localStorage):**
```typescript
const [orders, setOrders] = useState([]);

useEffect(() => {
  const loadOrders = () => {
    const stored = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(stored);
  };
  loadOrders();
}, []);
```

**AFTER (Convex):**
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const branchId = "your-branch-id"; // Get from auth context

const pendingOrders = useQuery(api.orders.listByBranchAndStatus, {
  branchId,
  status: "pending",
});

const updateOrderStatus = useMutation(api.orders.updateStatus);

// Update order
const handleConfirm = (orderId: string) => {
  updateOrderStatus({ id: orderId, status: "confirmed" });
};
```

---

### Step 3: Update Each Page

#### Files to Update:

1. **`src/pages/kitchen/Orders.tsx`**
   - Replace: `localStorage.getItem("orders")` → `useQuery(api.orders.listByBranchAndStatus)`
   - Replace: Order status updates → `useMutation(api.orders.updateStatus)`

2. **`src/pages/driver/Deliveries.tsx`**
   - Replace: `localStorage.getItem("drivers")` → `useQuery(api.drivers.getByPhone)`
   - Replace: Delivery list → `useQuery(api.drivers.getDeliveries)`

3. **`src/pages/manager/Orders.tsx`**
   - Replace: Order fetching → `useQuery(api.orders.listByBranch)`

4. **`src/pages/admin/Dashboard.tsx`**
   - Replace: Branch data → `useQuery(api.branches.list)`
   - Replace: Order aggregations → `useQuery(api.analytics.getDashboardStats)` (create this)

5. **`src/pages/admin/Branches.tsx`**
   - Replace: Branch management → `useMutation(api.branches.create/update)`

6. **`src/pages/admin/Menu.tsx`**
   - Replace: Menu items → `useQuery(api.menu.listByBranch)`
   - Replace: Menu mutations → `useMutation(api.menu.create/update/remove)`

7. **`src/pages/Checkout.tsx`**
   - Replace: Order creation → `useMutation(api.orders.create)`

---

## 🔄 Migration Steps

### Phase 1: Setup (Day 1)
1. ✅ Install Convex: `npm install convex`
2. ✅ Initialize project: `npx convex dev`
3. ✅ Create `convex/schema.ts`
4. ✅ Deploy schema: Schema auto-deploys on save

### Phase 2: Data Migration (Day 2)
1. ✅ Export localStorage data to JSON files
2. ✅ Create seed script: `convex/seed.ts`
3. ✅ Import branches, menu items, settings
4. ✅ Verify data in Convex dashboard

#### Seed Script Example:
```typescript
// convex/seed.ts
import { mutation } from "./_generated/server";

export const seedBranches = mutation({
  handler: async (ctx) => {
    const branches = [
      { name: "East Legon", location: "East Legon Main Road", ... },
      // ... more branches
    ];

    for (const branch of branches) {
      await ctx.db.insert("branches", branch);
    }
  },
});
```

Run: `npx convex run seed:seedBranches`

### Phase 3: Frontend Integration (Day 3-5)
1. ✅ Update `src/main.tsx` with ConvexProvider
2. ✅ Replace localStorage in Kitchen pages
3. ✅ Replace localStorage in Driver pages
4. ✅ Replace localStorage in Manager pages
5. ✅ Replace localStorage in Admin pages
6. ✅ Replace localStorage in Customer flow (Checkout)

### Phase 4: Testing (Day 6)
1. ✅ Test order flow end-to-end
2. ✅ Test real-time updates (open kitchen + admin simultaneously)
3. ✅ Test driver assignment and tracking
4. ✅ Test menu management across branches
5. ✅ Test authentication and permissions

### Phase 5: Cleanup (Day 7)
1. ✅ Remove all localStorage code
2. ✅ Add error handling for Convex queries
3. ✅ Add loading states
4. ✅ Optimize queries with indexes
5. ✅ Deploy to production

---

## ✅ Testing Checklist

### Customer Flow
- [ ] Browse menu from detected location
- [ ] Add items to cart
- [ ] Change location and see updated menu
- [ ] Complete checkout
- [ ] Order appears in kitchen pending

### Kitchen Flow
- [ ] See new orders in real-time
- [ ] Confirm walk-in and online orders
- [ ] Move orders through stages
- [ ] Mark orders as done
- [ ] Display screen shows only confirmed orders

### Driver Flow
- [ ] Register with phone number
- [ ] Login with passkey
- [ ] See assigned deliveries
- [ ] Update delivery address
- [ ] Mark deliveries as completed

### Manager Flow
- [ ] View branch orders (read-only)
- [ ] Edit menu items for branch
- [ ] Upload images
- [ ] Update settings
- [ ] View delivery tracking

### Admin Flow
- [ ] View all branches dashboard
- [ ] Create new branches
- [ ] View branch-specific analytics
- [ ] Manage global menu
- [ ] Push menu items to multiple branches
- [ ] Send messages to managers
- [ ] Toggle features per branch

---

## 🔒 Security Best Practices

1. **Authentication**: Use Convex Auth for user authentication
2. **Authorization**: Add permission checks in mutations
3. **Data Validation**: Validate all inputs in function args
4. **Rate Limiting**: Implement for order creation
5. **Encryption**: Hash passwords, don't store plain text

---

## 📊 Performance Optimization

1. **Indexes**: All queries should use indexes (already defined in schema)
2. **Pagination**: For large order lists, use `.paginate()`
3. **Caching**: Use React Query caching for static data
4. **Real-time**: Convex automatically optimizes subscriptions

---

## 🆘 Troubleshooting

### Orders not showing up
- Check branch ID matches between order and query
- Verify status filter in query
- Check browser console for Convex errors

### Real-time updates not working
- Ensure `useQuery` is being used (not regular fetch)
- Check Convex connection status
- Verify schema deployed successfully

### Authentication issues
- Implement Convex Auth properly
- Store user session correctly
- Check role-based permissions

---

## 📚 Resources

- **Convex Docs**: https://docs.convex.dev
- **React Integration**: https://docs.convex.dev/client/react
- **Schema Design**: https://docs.convex.dev/database/schemas
- **Functions Guide**: https://docs.convex.dev/functions

---

## 🎉 Success Criteria

Your Convex integration is complete when:
- ✅ All localStorage calls removed
- ✅ Orders sync in real-time across all portals
- ✅ Multiple branches can operate independently
- ✅ Kitchen display updates automatically
- ✅ Drivers see live delivery assignments
- ✅ Admin dashboard shows accurate analytics
- ✅ Data persists across browser sessions
- ✅ System works across multiple devices simultaneously

---

**Copyright © 2025 Liderlabs. All rights reserved.**
