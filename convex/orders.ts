import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create new order
export const create = mutation({
  args: {
    orderId: v.string(),
    branchId: v.string(),
    branchName: v.string(),
    orderType: v.union(v.literal("walk-in"), v.literal("online")),
    deliveryMethod: v.union(v.literal("pickup"), v.literal("delivery")),
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
      email: v.optional(v.string()),
      address: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    deliveryAddress: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    total: v.number(),
    customerLocation: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      ...args,
      status: "pending",
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    return orderId;
  },
});

// Get all orders
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

// Get orders by branch
export const listByBranch = query({
  args: { branchId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .order("desc")
      .collect();
  },
});

// Get orders by customer phone
export const listByCustomer = query({
  args: { customerPhone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_customer_phone", (q) =>
        q.eq("customerPhone", args.customerPhone)
      )
      .order("desc")
      .collect();
  },
});

// Get orders assigned to driver
export const listByDriver = query({
  args: { driverId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_assigned_driver", (q) =>
        q.eq("assignedDriver", args.driverId)
      )
      .order("desc")
      .collect();
  },
});

// Get order by orderId string (KK-XXXX)
export const getByOrderId = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_order_id", (q) => q.eq("orderId", args.orderId))
      .first();
  },
});

// Update order status
export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("done"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const update: any = { status: args.status };

    if (args.status === "confirmed") {
      update.confirmedAt = new Date().toISOString();
    } else if (args.status === "completed") {
      update.completedAt = new Date().toISOString();
    }

    await ctx.db.patch(args.id, update);
  },
});

// Update delivery status
export const updateDeliveryStatus = mutation({
  args: {
    id: v.id("orders"),
    deliveryStatus: v.union(
      v.literal("pending-approval"),
      v.literal("accepted"),
      v.literal("on-route"),
      v.literal("delivered")
    ),
  },
  handler: async (ctx, args) => {
    const update: any = { deliveryStatus: args.deliveryStatus };

    if (args.deliveryStatus === "delivered") {
      update.deliveredAt = new Date().toISOString();
      update.status = "completed";
    }

    await ctx.db.patch(args.id, update);
  },
});

// Assign driver to order
export const assignDriver = mutation({
  args: {
    id: v.id("orders"),
    driverId: v.string(),
    driverName: v.string(),
    driverPhone: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      assignedDriver: args.driverId,
      driverName: args.driverName,
      driverPhone: args.driverPhone,
      deliveryStatus: "pending-approval",
    });
  },
});

// Update customer location
export const updateCustomerLocation = mutation({
  args: {
    id: v.id("orders"),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      customerLocation: args.location,
    });
  },
});

// Get today's orders for a branch
export const getTodayOrders = query({
  args: { branchId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date().toDateString();
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .collect();

    return orders.filter(
      (order) => new Date(order.timestamp).toDateString() === today
    );
  },
});
