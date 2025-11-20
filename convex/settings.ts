import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update setting
export const upsert = mutation({
  args: {
    branchId: v.optional(v.string()),
    key: v.string(),
    value: v.string(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if setting exists
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .filter((q) =>
        args.branchId
          ? q.eq(q.field("branchId"), args.branchId)
          : q.eq(q.field("branchId"), undefined)
      )
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: new Date().toISOString(),
        updatedBy: args.updatedBy,
      });
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert("settings", {
        branchId: args.branchId,
        key: args.key,
        value: args.value,
        updatedAt: new Date().toISOString(),
        updatedBy: args.updatedBy,
      });
    }
  },
});

// Get setting by key
export const getByKey = query({
  args: {
    key: v.string(),
    branchId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .filter((q) =>
        args.branchId
          ? q.eq(q.field("branchId"), args.branchId)
          : q.eq(q.field("branchId"), undefined)
      )
      .first();
  },
});

// Get all settings for a branch
export const listByBranch = query({
  args: { branchId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("settings")
      .withIndex("by_branch", (q) =>
        args.branchId ? q.eq("branchId", args.branchId) : q
      )
      .collect();
  },
});

// Get all global settings
export const listGlobal = query({
  args: {},
  handler: async (ctx) => {
    const allSettings = await ctx.db.query("settings").collect();
    return allSettings.filter((s) => !s.branchId);
  },
});

// Delete setting
export const remove = mutation({
  args: { id: v.id("settings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
