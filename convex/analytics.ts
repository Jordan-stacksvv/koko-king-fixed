import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update daily analytics
export const upsert = mutation({
  args: {
    branchId: v.string(),
    date: v.string(),
    totalOrders: v.number(),
    totalRevenue: v.number(),
    averageOrderValue: v.number(),
    deliveryOrders: v.number(),
    pickupOrders: v.number(),
    topItems: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        revenue: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check if analytics for this date exists
    const existing = await ctx.db
      .query("analytics")
      .withIndex("by_branch_date", (q) =>
        q.eq("branchId", args.branchId).eq("date", args.date)
      )
      .first();

    if (existing) {
      // Update existing
      const { branchId, date, ...updates } = args;
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert("analytics", args);
    }
  },
});

// Get analytics for specific date
export const getByDate = query({
  args: {
    branchId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analytics")
      .withIndex("by_branch_date", (q) =>
        q.eq("branchId", args.branchId).eq("date", args.date)
      )
      .first();
  },
});

// Get analytics for date range
export const getByDateRange = query({
  args: {
    branchId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const branchAnalytics = await ctx.db
      .query("analytics")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .collect();

    return branchAnalytics.filter(
      (a) => a.date >= args.startDate && a.date <= args.endDate
    );
  },
});

// Get all branches analytics for a specific date
export const getAllBranchesByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analytics")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

// Calculate and store analytics from orders
export const calculateDailyAnalytics = mutation({
  args: {
    branchId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all orders for the branch on this date
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .collect();

    const dateOrders = orders.filter(
      (order) => new Date(order.timestamp).toDateString() === new Date(args.date).toDateString()
    );

    if (dateOrders.length === 0) {
      return null;
    }

    // Calculate metrics
    const totalOrders = dateOrders.length;
    const totalRevenue = dateOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalRevenue / totalOrders;
    const deliveryOrders = dateOrders.filter((o) => o.deliveryMethod === "delivery").length;
    const pickupOrders = dateOrders.filter((o) => o.deliveryMethod === "pickup").length;

    // Calculate top items
    const itemsMap = new Map<string, { quantity: number; revenue: number }>();
    dateOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = itemsMap.get(item.name) || { quantity: 0, revenue: 0 };
        itemsMap.set(item.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.price * item.quantity,
        });
      });
    });

    const topItems = Array.from(itemsMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Upsert analytics
    return await ctx.runMutation(api.analytics.upsert, {
      branchId: args.branchId,
      date: args.date,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      deliveryOrders,
      pickupOrders,
      topItems,
    });
  },
});
