import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create notification
export const create = mutation({
  args: {
    recipientId: v.string(),
    recipientType: v.union(
      v.literal("driver"),
      v.literal("customer"),
      v.literal("admin"),
      v.literal("kitchen"),
      v.literal("manager")
    ),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    orderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
      sentAt: new Date().toISOString(),
    });
  },
});

// Get notifications for recipient
export const listByRecipient = query({
  args: { recipientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientId", args.recipientId).eq("read", false)
      )
      .order("desc")
      .collect();
  },
});

// Get all notifications for recipient (including read)
export const listAllByRecipient = query({
  args: { recipientId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .collect();
    
    return notifications
      .filter((n) => n.recipientId === args.recipientId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true });
  },
});

// Mark all notifications as read for recipient
export const markAllAsRead = mutation({
  args: { recipientId: v.string() },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientId", args.recipientId).eq("read", false)
      )
      .collect();

    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, { read: true })
      )
    );
  },
});

// Delete notification
export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get notifications by order
export const listByOrder = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});
