import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create menu item
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(),
    isDefault: v.boolean(),
    branches: v.array(v.string()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const menuItemId = await ctx.db.insert("menuItems", {
      ...args,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    });
    return menuItemId;
  },
});

// Get all menu items
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("menuItems").collect();
  },
});

// Get menu items by category
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Get available menu items
export const listAvailable = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_available", (q) => q.eq("isAvailable", true))
      .collect();
  },
});

// Get menu items for specific branch
export const listByBranch = query({
  args: { branchId: v.string() },
  handler: async (ctx, args) => {
    const allItems = await ctx.db.query("menuItems").collect();
    return allItems.filter((item) => item.branches.includes(args.branchId));
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
    branches: v.optional(v.array(v.string())),
    isAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete menu item
export const remove = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Toggle menu item availability
export const toggleAvailability = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Menu item not found");

    await ctx.db.patch(args.id, {
      isAvailable: !item.isAvailable,
    });
  },
});

// Add branch to menu item
export const addBranch = mutation({
  args: {
    id: v.id("menuItems"),
    branchId: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Menu item not found");

    if (!item.branches.includes(args.branchId)) {
      await ctx.db.patch(args.id, {
        branches: [...item.branches, args.branchId],
      });
    }
  },
});

// Remove branch from menu item
export const removeBranch = mutation({
  args: {
    id: v.id("menuItems"),
    branchId: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Menu item not found");

    await ctx.db.patch(args.id, {
      branches: item.branches.filter((id) => id !== args.branchId),
    });
  },
});
