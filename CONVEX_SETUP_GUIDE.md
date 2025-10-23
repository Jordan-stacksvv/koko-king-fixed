# Convex Setup Guide for Koko King Multi-Restaurant System

## Overview
This guide provides complete instructions for integrating Convex into your Koko King restaurant ordering system. Convex will handle real-time order management, authentication, and data synchronization across multiple restaurant locations.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Schema](#database-schema)
4. [Authentication Setup](#authentication-setup)
5. [Functions & Queries](#functions--queries)
6. [Frontend Integration](#frontend-integration)
7. [Real-time Order Updates](#real-time-order-updates)
8. [Testing Guide](#testing-guide)

---

## Prerequisites

### Required Accounts & Tools
- Node.js 16+ installed
- Convex account (sign up at https://convex.dev)
- Existing Koko King project

### Installation
```bash
npm install convex
npx convex dev
```

---

## Project Setup

### Step 1: Initialize Convex
```bash
npx convex dev
```
This will:
- Create a `convex/` directory in your project
- Generate configuration files
- Connect to your Convex dashboard

### Step 2: Project Structure
Create the following structure:
```
convex/
├── schema.ts              # Database schema
├── auth.config.ts         # Authentication configuration
├── restaurants.ts         # Restaurant queries/mutations
├── orders.ts             # Order management
├── menuItems.ts          # Menu management
├── users.ts              # User management
└── http.ts               # HTTP endpoints
```

---

## Database Schema

### File: `convex/schema.ts`
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Restaurants table
  restaurants: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    isActive: v.boolean(),
    operatingHours: v.object({
      open: v.string(),
      close: v.string(),
    }),
  })
    .index("by_active", ["isActive"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  // Menu Items table
  menuItems: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(),
    isAvailable: v.boolean(),
    extras: v.optional(
      v.array(
        v.object({
          name: v.string(),
          price: v.number(),
        })
      )
    ),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_category", ["category"])
    .index("by_restaurant_and_category", ["restaurantId", "category"]),

  // Orders table
  orders: defineTable({
    restaurantId: v.id("restaurants"),
    customerId: v.optional(v.id("users")),
    customerName: v.string(),
    customerPhone: v.string(),
    customerAddress: v.optional(v.string()),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
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
    subtotal: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
    deliveryMethod: v.union(v.literal("delivery"), v.literal("pickup")),
    paymentMethod: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    specialInstructions: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"])
    .index("by_restaurant_and_status", ["restaurantId", "status"])
    .index("by_created_at", ["createdAt"]),

  // Users table (customers and staff)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("customer"),
      v.literal("kitchen"),
      v.literal("manager"),
      v.literal("admin")
    ),
    restaurantId: v.optional(v.id("restaurants")), // For kitchen/manager staff
    addresses: v.optional(
      v.array(
        v.object({
          label: v.string(),
          address: v.string(),
          coordinates: v.optional(
            v.object({
              lat: v.number(),
              lng: v.number(),
            })
          ),
        })
      )
    ),
    isActive: v.boolean(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_restaurant", ["restaurantId"]),

  // Order notifications for staff
  notifications: defineTable({
    restaurantId: v.id("restaurants"),
    orderId: v.id("orders"),
    userId: v.id("users"),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_unread", ["userId", "isRead"]),
});
```

---

## Authentication Setup

### File: `convex/auth.config.ts`
```typescript
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const { email, name } = args;
      
      // Check if user exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (existingUser) {
        return existingUser._id;
      }

      // Create new customer user
      const userId = await ctx.db.insert("users", {
        email,
        name: name || email.split("@")[0],
        role: "customer",
        isActive: true,
      });

      return userId;
    },
  },
});
```

---

## Functions & Queries

### File: `convex/restaurants.ts`
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get nearest restaurant based on coordinates
export const getNearestRestaurant = query({
  args: {
    userLat: v.number(),
    userLng: v.number(),
  },
  handler: async (ctx, args) => {
    const restaurants = await ctx.db
      .query("restaurants")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Calculate distances using Haversine formula
    const restaurantsWithDistance = restaurants.map((restaurant) => {
      const distance = calculateDistance(
        args.userLat,
        args.userLng,
        restaurant.coordinates.lat,
        restaurant.coordinates.lng
      );
      return { ...restaurant, distance };
    });

    // Sort by distance and return nearest
    return restaurantsWithDistance.sort((a, b) => a.distance - b.distance)[0];
  },
});

// Get all active restaurants
export const listRestaurants = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("restaurants")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Helper function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

### File: `convex/menuItems.ts`
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get menu items for a specific restaurant
export const getMenuByRestaurant = query({
  args: {
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect();
  },
});

// Get menu items by category
export const getMenuByCategory = query({
  args: {
    restaurantId: v.id("restaurants"),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant_and_category", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("category", args.category)
      )
      .filter((q) => q.eq(q.field("isAvailable"), true))
      .collect();
  },
});

// Add menu item (manager only)
export const addMenuItem = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(),
    extras: v.optional(v.array(v.object({ name: v.string(), price: v.number() }))),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check for manager role
    return await ctx.db.insert("menuItems", {
      ...args,
      isAvailable: true,
    });
  },
});

// Update menu item
export const updateMenuItem = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    isAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});
```

### File: `convex/orders.ts`
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create new order
export const createOrder = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    customerName: v.string(),
    customerPhone: v.string(),
    customerAddress: v.optional(v.string()),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        extras: v.optional(v.array(v.object({ name: v.string(), price: v.number() }))),
      })
    ),
    subtotal: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
    deliveryMethod: v.union(v.literal("delivery"), v.literal("pickup")),
    paymentMethod: v.string(),
    specialInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const orderId = await ctx.db.insert("orders", {
      ...args,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Notify restaurant staff
    const staff = await ctx.db
      .query("users")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .filter((q) => 
        q.or(
          q.eq(q.field("role"), "kitchen"),
          q.eq(q.field("role"), "manager")
        )
      )
      .collect();

    for (const staffMember of staff) {
      await ctx.db.insert("notifications", {
        restaurantId: args.restaurantId,
        orderId,
        userId: staffMember._id,
        message: `New order from ${args.customerName}`,
        isRead: false,
        createdAt: now,
      });
    }

    return orderId;
  },
});

// Get orders for a restaurant
export const getRestaurantOrders = query({
  args: {
    restaurantId: v.id("restaurants"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let ordersQuery = ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId));

    if (args.status) {
      ordersQuery = ordersQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    return await ordersQuery.order("desc").take(100);
  },
});

// Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Get customer order history
export const getCustomerOrders = query({
  args: {
    customerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
  },
});
```

---

## Frontend Integration

### Step 1: Install Convex Client
Already installed, just need to configure.

### Step 2: Update `src/main.tsx`
```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Wrap your app with ConvexProvider
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
```

### Step 3: Environment Variables
Create `.env.local`:
```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### Step 4: Pages to Update

#### **src/pages/Index.tsx**
Replace localStorage geolocation with Convex:
```typescript
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const Index = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const nearestRestaurant = useQuery(
    api.restaurants.getNearestRestaurant,
    userLocation ? { userLat: userLocation.lat, userLng: userLocation.lng } : "skip"
  );

  const menuItems = useQuery(
    api.menuItems.getMenuByRestaurant,
    nearestRestaurant ? { restaurantId: nearestRestaurant._id } : "skip"
  );

  // ... rest of component
};
```

#### **src/pages/Menu.tsx**
```typescript
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const Menu = () => {
  const restaurantId = localStorage.getItem("selectedRestaurantId");
  
  const menuItems = useQuery(
    api.menuItems.getMenuByRestaurant,
    restaurantId ? { restaurantId: restaurantId as any } : "skip"
  );

  // ... rest of component
};
```

#### **src/pages/Checkout.tsx**
```typescript
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const Checkout = () => {
  const createOrder = useMutation(api.orders.createOrder);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const restaurantId = localStorage.getItem("selectedRestaurantId");
    
    try {
      const orderId = await createOrder({
        restaurantId: restaurantId as any,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: deliveryMethod === "delivery" ? formData.address : undefined,
        items: cart.map((item: any) => ({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          extras: item.extras,
        })),
        subtotal,
        deliveryFee,
        total,
        deliveryMethod,
        paymentMethod,
        specialInstructions: formData.notes || undefined,
      });

      localStorage.removeItem("cart");
      toast.success("Order placed successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  // ... rest of component
};
```

#### **src/pages/kitchen/Orders.tsx**
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const Orders = () => {
  const restaurantId = localStorage.getItem("kitchenRestaurantId");
  
  const orders = useQuery(
    api.orders.getRestaurantOrders,
    restaurantId ? { restaurantId: restaurantId as any } : "skip"
  );

  const updateStatus = useMutation(api.orders.updateOrderStatus);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    await updateStatus({ orderId: orderId as any, status: status as any });
    toast.success("Order status updated");
  };

  // ... rest of component
};
```

#### **src/pages/manager/Dashboard.tsx**
```typescript
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const Dashboard = () => {
  const restaurantId = localStorage.getItem("managerRestaurantId");
  
  const orders = useQuery(
    api.orders.getRestaurantOrders,
    restaurantId ? { restaurantId: restaurantId as any } : "skip"
  );

  // Calculate stats from orders
  const todayOrders = orders?.filter(order => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });

  const revenue = todayOrders?.reduce((sum, order) => sum + order.total, 0) || 0;

  // ... rest of component
};
```

#### **src/pages/manager/MenuManagement.tsx**
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const MenuManagement = () => {
  const restaurantId = localStorage.getItem("managerRestaurantId");
  
  const menuItems = useQuery(
    api.menuItems.getMenuByRestaurant,
    restaurantId ? { restaurantId: restaurantId as any } : "skip"
  );

  const addItem = useMutation(api.menuItems.addMenuItem);
  const updateItem = useMutation(api.menuItems.updateMenuItem);

  // ... rest of component
};
```

---

## Real-time Order Updates

Convex automatically provides real-time updates. No additional setup needed!

```typescript
// Orders will automatically update when status changes
const orders = useQuery(api.orders.getRestaurantOrders, { restaurantId });

// This will re-render automatically when any order updates
```

---

## Testing Guide

### 1. Test Restaurant Selection
- Open homepage
- Allow location access
- Verify nearest restaurant is selected

### 2. Test Order Flow
- Browse menu from selected restaurant
- Add items to cart
- Complete checkout
- Verify order appears in kitchen dashboard

### 3. Test Kitchen Dashboard
- Login to kitchen access
- See real-time orders
- Update order status
- Verify status updates reflect immediately

### 4. Test Manager Dashboard
- Login to manager access
- View orders and statistics
- Manage menu items
- View deliveries

---

## Next Steps

1. **Deploy to Production**
   ```bash
   npx convex deploy
   ```

2. **Add Authentication UI**
   - Implement login/signup forms
   - Add role-based access control

3. **Add Payment Integration**
   - Integrate Mobile Money API
   - Add card payment processing

4. **Add Notifications**
   - Push notifications for new orders
   - SMS notifications for customers

---

## Support & Resources

- Convex Documentation: https://docs.convex.dev
- Convex Dashboard: https://dashboard.convex.dev
- Community Discord: https://convex.dev/community

---

## Important Notes

- Each restaurant has isolated access to their own orders
- Real-time updates happen automatically
- All data is secured and validated
- Geolocation determines which restaurant receives orders
- Kitchen and manager dashboards are restaurant-specific

---

## File Summary for Quick Reference

**Files to Create:**
- `convex/schema.ts`
- `convex/auth.config.ts`
- `convex/restaurants.ts`
- `convex/orders.ts`
- `convex/menuItems.ts`
- `.env.local`

**Files to Update:**
- `src/main.tsx`
- `src/pages/Index.tsx`
- `src/pages/Menu.tsx`
- `src/pages/Checkout.tsx`
- `src/pages/kitchen/Orders.tsx`
- `src/pages/manager/Dashboard.tsx`
- `src/pages/manager/MenuManagement.tsx`
- `src/pages/manager/Orders.tsx`

Good luck with your Convex integration! 🚀
