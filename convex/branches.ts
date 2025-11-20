import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create branch
export const create = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    phone: v.string(),
    manager: v.string(),
    image: v.optional(v.string()),
    coordinates: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const branchId = await ctx.db.insert("branches", {
      ...args,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    return branchId;
  },
});

// Get all branches
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("branches").collect();
  },
});

// Get active branches
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("branches")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Get branch by name
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branches")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
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
    coordinates: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
      })
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete branch
export const remove = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Toggle branch active status
export const toggleActive = mutation({
  args: { id: v.id("branches") },
  handler: async (ctx, args) => {
    const branch = await ctx.db.get(args.id);
    if (!branch) throw new Error("Branch not found");

    await ctx.db.patch(args.id, {
      isActive: !branch.isActive,
    });
  },
});
