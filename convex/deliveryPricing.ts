import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create delivery pricing tier
export const create = mutation({
  args: {
    branchId: v.string(),
    minDistance: v.number(),
    maxDistance: v.number(),
    price: v.number(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("deliveryPricing", {
      ...args,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  },
});

// Get all pricing tiers for a branch
export const listByBranch = query({
  args: { branchId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deliveryPricing")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Update pricing tier
export const update = mutation({
  args: {
    id: v.id("deliveryPricing"),
    minDistance: v.optional(v.number()),
    maxDistance: v.optional(v.number()),
    price: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete pricing tier
export const remove = mutation({
  args: { id: v.id("deliveryPricing") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false });
  },
});

// Calculate delivery fee based on distance
export const calculateFee = query({
  args: {
    branchId: v.string(),
    distance: v.number(), // in km
  },
  handler: async (ctx, args) => {
    const tiers = await ctx.db
      .query("deliveryPricing")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Find matching tier
    const matchingTier = tiers.find(
      (tier) =>
        args.distance >= tier.minDistance && args.distance <= tier.maxDistance
    );

    return matchingTier?.price || 5.0; // Default to ₵5.00 if no tier found
  },
});
