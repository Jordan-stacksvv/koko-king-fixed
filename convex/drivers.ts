import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create driver application
export const apply = mutation({
  args: {
    fullName: v.string(),
    phone: v.string(),
    email: v.string(),
    passkey: v.string(),
    branch: v.string(),
    vehicleType: v.string(),
    vehicleReg: v.string(),
    ghanaCard: v.optional(v.string()),
    passportPic: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    bankAccount: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const driverId = await ctx.db.insert("drivers", {
      ...args,
      status: "pending",
      totalEarnings: 0,
      appliedAt: new Date().toISOString(),
    });
    return driverId;
  },
});

// Get all drivers
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("drivers").collect();
  },
});

// Get drivers by status
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("suspended")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("drivers")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get drivers by branch
export const listByBranch = query({
  args: { branch: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("drivers")
      .withIndex("by_branch", (q) => q.eq("branch", args.branch))
      .collect();
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

// Approve driver
export const approve = mutation({
  args: {
    id: v.id("drivers"),
    approvedBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "approved",
      approvedAt: new Date().toISOString(),
      approvedBy: args.approvedBy,
    });
  },
});

// Reject driver
export const reject = mutation({
  args: {
    id: v.id("drivers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "rejected",
    });
  },
});

// Update driver profile
export const updateProfile = mutation({
  args: {
    id: v.id("drivers"),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    vehicleType: v.optional(v.string()),
    vehicleReg: v.optional(v.string()),
    profilePicUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Update driver passkey
export const updatePasskey = mutation({
  args: {
    id: v.id("drivers"),
    passkey: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      passkey: args.passkey,
    });
  },
});

// Add earnings to driver
export const addEarnings = mutation({
  args: {
    id: v.id("drivers"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const driver = await ctx.db.get(args.id);
    if (!driver) throw new Error("Driver not found");

    await ctx.db.patch(args.id, {
      totalEarnings: driver.totalEarnings + args.amount,
    });
  },
});

// Driver Queue Functions

// Join queue (go online)
export const joinQueue = mutation({
  args: {
    driverId: v.string(),
    name: v.string(),
    phone: v.string(),
    branch: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if driver already in queue
    const existing = await ctx.db
      .query("driverQueue")
      .withIndex("by_driver", (q) => q.eq("driverId", args.driverId))
      .first();

    if (existing) {
      // Update status to online
      await ctx.db.patch(existing._id, {
        status: "online",
        joinedAt: new Date().toISOString(),
      });
      return existing._id;
    } else {
      // Add to queue
      return await ctx.db.insert("driverQueue", {
        ...args,
        status: "online",
        joinedAt: new Date().toISOString(),
      });
    }
  },
});

// Leave queue (go offline)
export const leaveQueue = mutation({
  args: { driverId: v.string() },
  handler: async (ctx, args) => {
    const queueEntry = await ctx.db
      .query("driverQueue")
      .withIndex("by_driver", (q) => q.eq("driverId", args.driverId))
      .first();

    if (queueEntry) {
      await ctx.db.patch(queueEntry._id, {
        status: "offline",
      });
    }
  },
});

// Get online drivers by branch
export const getOnlineDrivers = query({
  args: { branch: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("driverQueue")
      .withIndex("by_branch_status", (q) =>
        q.eq("branch", args.branch).eq("status", "online")
      )
      .collect();
  },
});

// Update driver queue status
export const updateQueueStatus = mutation({
  args: {
    driverId: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("on-delivery"),
      v.literal("offline")
    ),
    currentDelivery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const queueEntry = await ctx.db
      .query("driverQueue")
      .withIndex("by_driver", (q) => q.eq("driverId", args.driverId))
      .first();

    if (queueEntry) {
      const update: any = { status: args.status };
      if (args.currentDelivery !== undefined) {
        update.currentDelivery = args.currentDelivery;
      }
      if (args.status === "online" && args.currentDelivery === null) {
        update.lastOrderAt = new Date().toISOString();
      }

      await ctx.db.patch(queueEntry._id, update);
    }
  },
});

// Record driver earnings
export const recordEarnings = mutation({
  args: {
    driverId: v.string(),
    orderId: v.string(),
    orderTotal: v.number(),
    commission: v.number(),
  },
  handler: async (ctx, args) => {
    const earnings = args.orderTotal * args.commission;

    await ctx.db.insert("driverEarnings", {
      ...args,
      earnings,
      earnedAt: new Date().toISOString(),
      paidOut: false,
    });

    // Update driver's total earnings
    const driver = await ctx.db
      .query("drivers")
      .filter((q) => q.eq(q.field("_id"), args.driverId))
      .first();

    if (driver) {
      await ctx.db.patch(driver._id, {
        totalEarnings: driver.totalEarnings + earnings,
      });
    }
  },
});

// Get driver earnings
export const getEarnings = query({
  args: { driverId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("driverEarnings")
      .withIndex("by_driver", (q) => q.eq("driverId", args.driverId))
      .collect();
  },
});
