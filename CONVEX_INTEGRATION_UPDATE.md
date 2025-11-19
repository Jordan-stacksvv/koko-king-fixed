# Koko King - Convex Integration Update

This document extends the existing CONVEX_SETUP_GUIDE.md with additional schema, functions, and implementation details for the complete driver delivery system, payments, notifications, and real-time updates.

## 🚨 Critical Implementation Notes

### Environment Variables Required
```env
# Add to Convex environment (Dashboard → Settings → Environment Variables)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXX
```

### VS Code Setup Issues
- If Convex commands not working in VS Code terminal, use external terminal
- Run `npx convex dev` in project root (not in subdirectory)
- Ensure Convex CLI installed globally: `npm install -g convex`

### Webhook Endpoints
- Paystack webhooks: `https://your-app.convex.site/paystack-webhook`
- Configure in Paystack Dashboard → Settings → Webhooks
- Verify webhook signature in edge function for security

---

## Additional Convex Schema Tables

### 1. Driver Applications Table
```typescript
// convex/schema.ts - Add to existing schema
driverApplications: defineTable({
  fullName: v.string(),
  phone: v.string(),
  email: v.string(),
  password: v.string(), // Store hashed
  ghanaCard: v.optional(v.string()),
  vehicleType: v.string(), // "motorbike" | "bicycle" | "car"
  vehicleReg: v.string(),
  passportPic: v.optional(v.string()),
  licenseNumber: v.optional(v.string()),
  bankAccount: v.string(),
  emergencyContact: v.string(),
  status: v.string(), // "pending" | "approved" | "rejected"
  appliedAt: v.string(),
  reviewedAt: v.optional(v.string()),
  reviewedBy: v.optional(v.id("users")),
})
  .index("by_status", ["status"])
  .index("by_phone", ["phone"]),

// CONVEX NOTE: Use Convex auth for password hashing
// Store passwords using Convex's built-in password provider
```

### 2. Driver Queue Table
```typescript
// convex/schema.ts
driverQueue: defineTable({
  driverId: v.id("drivers"),
  branchId: v.id("branches"),
  status: v.string(), // "online" | "busy" | "offline"
  joinedAt: v.string(),
  lastOrderAt: v.optional(v.string()),
  position: v.number(), // Queue position
})
  .index("by_branch_status", ["branchId", "status"])
  .index("by_driver", ["driverId"])
  .index("by_position", ["branchId", "position"]),

// CONVEX NOTE: Update position field when driver accepts/completes orders
// Use mutations to maintain queue order
```

### 3. Driver Earnings Table
```typescript
// convex/schema.ts
driverEarnings: defineTable({
  driverId: v.id("drivers"),
  orderId: v.id("orders"),
  orderTotal: v.number(),
  commission: v.number(), // 20% = 0.20
  earnings: v.number(), // orderTotal * commission
  earnedAt: v.string(),
  paidOut: v.boolean(),
  paidOutAt: v.optional(v.string()),
})
  .index("by_driver", ["driverId"])
  .index("by_order", ["orderId"])
  .index("by_paidOut", ["driverId", "paidOut"]),

// CONVEX NOTE: Calculate earnings on order delivery
// Track payout status for driver payments
```

### 4. Notifications Table
```typescript
// convex/schema.ts
notifications: defineTable({
  recipientId: v.string(), // Can be driverId, userId, etc.
  recipientType: v.string(), // "driver" | "customer" | "admin" | "kitchen"
  type: v.string(), // "order_assigned" | "order_accepted" | "delivery_update"
  title: v.string(),
  message: v.string(),
  orderId: v.optional(v.id("orders")),
  read: v.boolean(),
  sentAt: v.string(),
  sentVia: v.string(), // "push" | "email" | "sms"
})
  .index("by_recipient", ["recipientId", "read"])
  .index("by_order", ["orderId"]),

// CONVEX NOTE: Integrate with Resend API for email notifications
// Store RESEND_API_KEY in Convex environment variables
// Use edge functions to trigger Resend emails
```

### 5. Payment Transactions Table
```typescript
// convex/schema.ts
paymentTransactions: defineTable({
  orderId: v.id("orders"),
  userId: v.optional(v.id("users")),
  amount: v.number(),
  currency: v.string(), // "GHS"
  provider: v.string(), // "paystack" | "cash"
  reference: v.string(), // Paystack transaction reference
  status: v.string(), // "pending" | "successful" | "failed"
  metadata: v.optional(v.any()),
  createdAt: v.string(),
  updatedAt: v.string(),
})
  .index("by_order", ["orderId"])
  .index("by_reference", ["reference"])
  .index("by_status", ["status"]),

// CONVEX NOTE: Store PAYSTACK_SECRET_KEY in environment variables
// Verify webhook signatures from Paystack
// Webhook endpoint: /api/webhooks/paystack
// Verify payment status before confirming orders
```

## Additional Convex Functions

### Driver Application Functions
```typescript
// convex/driverApplications.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit driver application
export const submitApplication = mutation({
  args: {
    fullName: v.string(),
    phone: v.string(),
    email: v.string(),
    password: v.string(),
    ghanaCard: v.optional(v.string()),
    vehicleType: v.string(),
    vehicleReg: v.string(),
    bankAccount: v.string(),
    emergencyContact: v.string(),
  },
  handler: async (ctx, args) => {
    // CONVEX NOTE: Hash password using Convex auth
    const hashedPassword = await ctx.auth.hashPassword(args.password);
    
    return await ctx.db.insert("driverApplications", {
      ...args,
      password: hashedPassword,
      status: "pending",
      appliedAt: new Date().toISOString(),
    });
  },
});

// Get pending applications (Admin only)
export const getPendingApplications = query({
  args: {},
  handler: async (ctx) => {
    // CONVEX NOTE: Add admin authentication check
    return await ctx.db
      .query("driverApplications")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

// Approve driver application
export const approveApplication = mutation({
  args: { applicationId: v.id("driverApplications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    // Create approved driver
    const driverId = await ctx.db.insert("drivers", {
      fullName: application.fullName,
      phone: application.phone,
      email: application.email,
      password: application.password,
      vehicleType: application.vehicleType,
      vehicleReg: application.vehicleReg,
      status: "active",
      approvedAt: new Date().toISOString(),
    });

    // Update application
    await ctx.db.patch(args.applicationId, {
      status: "approved",
      reviewedAt: new Date().toISOString(),
    });

    // CONVEX NOTE: Send approval email via Resend
    // Trigger notification function here

    return driverId;
  },
});
```

### Driver Queue Functions
```typescript
// convex/driverQueue.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Driver goes online - join queue
export const goOnline = mutation({
  args: {
    driverId: v.id("drivers"),
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    // Check if already in queue
    const existing = await ctx.db
      .query("driverQueue")
      .withIndex("by_driver", (q) => q.eq("driverId", args.driverId))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, { status: "online" });
    }

    // Get current queue length
    const queueLength = await ctx.db
      .query("driverQueue")
      .withIndex("by_branch_status", (q) =>
        q.eq("branchId", args.branchId).eq("status", "online")
      )
      .collect();

    return await ctx.db.insert("driverQueue", {
      driverId: args.driverId,
      branchId: args.branchId,
      status: "online",
      joinedAt: new Date().toISOString(),
      position: queueLength.length,
    });
  },
});

// Driver goes offline - leave queue
export const goOffline = mutation({
  args: { driverId: v.id("drivers") },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("driverQueue")
      .withIndex("by_driver", (q) => q.eq("driverId", args.driverId))
      .first();

    if (entry) {
      await ctx.db.delete(entry._id);
      // CONVEX NOTE: Reorder remaining queue positions
    }
  },
});

// Get next available driver in queue
export const getNextDriver = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("driverQueue")
      .withIndex("by_position", (q) => q.eq("branchId", args.branchId))
      .filter((q) => q.eq(q.field("status"), "online"))
      .first();
  },
});

// Assign order to driver with timeout
export const assignOrderToDriver = mutation({
  args: {
    orderId: v.id("orders"),
    driverId: v.id("drivers"),
    timeout: v.number(), // seconds
  },
  handler: async (ctx, args) => {
    // Update order with driver assignment
    await ctx.db.patch(args.orderId, {
      driverId: args.driverId,
      status: "assigned-to-driver",
      assignedAt: new Date().toISOString(),
      assignmentTimeout: Date.now() + args.timeout * 1000,
    });

    // Update driver status to busy
    const queueEntry = await ctx.db
      .query("driverQueue")
      .withIndex("by_driver", (q) => q.eq("driverId", args.driverId))
      .first();

    if (queueEntry) {
      await ctx.db.patch(queueEntry._id, { status: "busy" });
    }

    // CONVEX NOTE: Send notification to driver via Resend
    // Implement timeout logic using Convex scheduled functions
    // If no response in X seconds, reassign to next driver
  },
});

// Broadcast order to all online drivers
export const broadcastOrder = mutation({
  args: {
    orderId: v.id("orders"),
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    const onlineDrivers = await ctx.db
      .query("driverQueue")
      .withIndex("by_branch_status", (q) =>
        q.eq("branchId", args.branchId).eq("status", "online")
      )
      .collect();

    // CONVEX NOTE: Send push notification to all online drivers
    // First to accept gets the order
    // Store broadcast timestamp in order
    await ctx.db.patch(args.orderId, {
      status: "broadcast",
      broadcastAt: new Date().toISOString(),
      broadcastTo: onlineDrivers.map((d) => d.driverId),
    });
  },
});
```

### Payment Integration Functions
```typescript
// convex/payments.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Initialize Paystack payment
export const initializePayment = mutation({
  args: {
    orderId: v.id("orders"),
    amount: v.number(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // CONVEX NOTE: Call Paystack API to initialize transaction
    // Use PAYSTACK_SECRET_KEY from environment
    // const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {...})
    
    const reference = `KK-${Date.now()}`; // Generate unique reference
    
    return await ctx.db.insert("paymentTransactions", {
      orderId: args.orderId,
      amount: args.amount,
      currency: "GHS",
      provider: "paystack",
      reference,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

// Verify Paystack webhook
export const verifyPayment = mutation({
  args: {
    reference: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query("paymentTransactions")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();

    if (!transaction) throw new Error("Transaction not found");

    // CONVEX NOTE: Verify webhook signature from Paystack
    // const isValid = verifyPaystackSignature(webhookData, signature);

    await ctx.db.patch(transaction._id, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });

    // Update order status if payment successful
    if (args.status === "successful") {
      await ctx.db.patch(transaction.orderId, {
        paymentStatus: "paid",
        paidAt: new Date().toISOString(),
      });
    }
  },
});

// CONVEX WEBHOOK SETUP:
// 1. Create endpoint: /api/webhooks/paystack
// 2. Verify signature using Paystack secret key
// 3. Call verifyPayment mutation
// 4. Store webhook events for debugging
```

### Notification Functions
```typescript
// convex/notifications.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Send notification via Resend
export const sendNotification = mutation({
  args: {
    recipientId: v.string(),
    recipientType: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    orderId: v.optional(v.id("orders")),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // CONVEX NOTE: Integrate with Resend API
    // Use RESEND_API_KEY from environment variables
    
    /* Example Resend integration:
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    if (args.email) {
      await resend.emails.send({
        from: 'Koko King <orders@kokoking.com>',
        to: args.email,
        subject: args.title,
        html: `<p>${args.message}</p>`
      });
    }
    */

    return await ctx.db.insert("notifications", {
      recipientId: args.recipientId,
      recipientType: args.recipientType,
      type: args.type,
      title: args.title,
      message: args.message,
      orderId: args.orderId,
      read: false,
      sentAt: new Date().toISOString(),
      sentVia: args.email ? "email" : "push",
    });
  },
});

// Get unread notifications
export const getUnreadNotifications = query({
  args: { recipientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientId", args.recipientId).eq("read", false)
      )
      .collect();
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});
```

## Environment Variables Setup

Add these to your Convex project:

```bash
# .env.local (for Convex)
CONVEX_DEPLOYMENT=<your-deployment>

# Add these secrets in Convex Dashboard -> Settings -> Environment Variables
RESEND_API_KEY=re_xxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx
```

## VS Code Issues & Fixes

### Issue 1: Type Inference
```typescript
// PROBLEM: Convex ID types not inferred correctly
// FIX: Import and use strict typing
import { Id } from "./_generated/dataModel";

const driverId: Id<"drivers"> = "..." // Properly typed
```

### Issue 2: Async Functions
```typescript
// PROBLEM: Handler functions must be async
// FIX: Always use async handler
export const myMutation = mutation({
  handler: async (ctx, args) => { // ✅ async
    // Your code
  }
});
```

### Issue 3: Index Usage
```typescript
// PROBLEM: Query performance without indexes
// FIX: Always add indexes for common queries
.index("by_status", ["status"])
.index("by_driver_status", ["driverId", "status"])
```

## Frontend Integration Examples

### Driver Dashboard with Convex
```typescript
// src/pages/driver/Dashboard.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const DriverDashboard = () => {
  const driver = useQuery(api.drivers.getCurrent);
  const pendingOrders = useQuery(api.orders.getPendingForDriver);
  const goOnline = useMutation(api.driverQueue.goOnline);
  const acceptOrder = useMutation(api.orders.acceptOrder);

  // Real-time updates automatically handled by Convex
};
```

### Payment Integration
```typescript
// src/pages/Checkout.tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const handlePayment = async () => {
  const transaction = await initializePayment({
    orderId,
    amount: total,
    email: customerEmail,
  });

  // Redirect to Paystack payment page
  window.location.href = transaction.authorizationUrl;
};
```

## Testing Checklist

- [ ] Driver application submission
- [ ] Admin approval workflow
- [ ] Driver queue management (online/offline)
- [ ] Order assignment with timeout
- [ ] Broadcast to multiple drivers
- [ ] Driver accepts order
- [ ] Driver marks picked up
- [ ] Driver marks delivered
- [ ] Earnings calculation
- [ ] Payment initialization
- [ ] Webhook verification
- [ ] Email notifications (Resend)
- [ ] Real-time updates across dashboards
- [ ] PWA install prompt
- [ ] Mobile responsiveness

## Next Steps

1. **Set up Convex project**: `npx convex dev`
2. **Add environment variables** in Convex Dashboard
3. **Copy schema** to `convex/schema.ts`
4. **Create function files** for each module
5. **Update frontend** to use Convex hooks
6. **Test each workflow** systematically
7. **Deploy**: `npx convex deploy`

---

**IMPORTANT NOTES:**
- All real-time updates are automatic with Convex
- Use Convex auth for driver authentication
- Store all API keys as Convex environment variables
- Webhook endpoints need server-side verification
- Test timeout and broadcast logic thoroughly
- Monitor Convex logs for debugging
