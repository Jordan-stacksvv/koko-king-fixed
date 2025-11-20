import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Branches Table
  branches: defineTable({
    name: v.string(),
    location: v.string(),
    phone: v.string(),
    manager: v.string(),
    image: v.optional(v.string()),
    isActive: v.boolean(),
    coordinates: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
    createdAt: v.string(),
  })
    .index("by_name", ["name"])
    .index("by_active", ["isActive"]),

  // Menu Items Table
  menuItems: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(),
    isDefault: v.boolean(),
    branches: v.array(v.string()), // branch IDs
    isAvailable: v.boolean(),
    createdAt: v.string(),
    createdBy: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_available", ["isAvailable"]),

  // Orders Table
  orders: defineTable({
    orderId: v.string(), // KK-XXXX format
    branchId: v.string(),
    branchName: v.string(),
    orderType: v.union(v.literal("walk-in"), v.literal("online")),
    deliveryMethod: v.union(v.literal("pickup"), v.literal("delivery")),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("done"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    deliveryStatus: v.optional(
      v.union(
        v.literal("pending-approval"),
        v.literal("accepted"),
        v.literal("on-route"),
        v.literal("delivered")
      )
    ),
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
    assignedDriver: v.optional(v.string()),
    driverName: v.optional(v.string()),
    driverPhone: v.optional(v.string()),
    customerLocation: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    timestamp: v.string(),
    createdAt: v.string(),
    confirmedAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
    deliveredAt: v.optional(v.string()),
  })
    .index("by_branch", ["branchId"])
    .index("by_status", ["status"])
    .index("by_delivery_status", ["deliveryStatus"])
    .index("by_customer_phone", ["customerPhone"])
    .index("by_assigned_driver", ["assignedDriver"])
    .index("by_order_id", ["orderId"])
    .index("by_timestamp", ["timestamp"]),

  // Drivers Table
  drivers: defineTable({
    fullName: v.string(),
    phone: v.string(),
    email: v.string(),
    passkey: v.string(),
    branch: v.string(),
    branchId: v.optional(v.string()), // Reference to branches table
    vehicleType: v.string(),
    vehicleReg: v.string(),
    ghanaCard: v.optional(v.string()),
    passportPic: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    bankAccount: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    profilePicUrl: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("suspended")
    ),
    totalEarnings: v.number(),
    appliedAt: v.string(),
    approvedAt: v.optional(v.string()),
    approvedBy: v.optional(v.string()),
  })
    .index("by_phone", ["phone"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_branch", ["branch"]),

  // Driver Queue Table
  driverQueue: defineTable({
    driverId: v.string(),
    name: v.string(),
    phone: v.string(),
    branch: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("on-delivery"),
      v.literal("offline")
    ),
    currentDelivery: v.optional(v.string()), // order ID
    joinedAt: v.string(),
    lastOrderAt: v.optional(v.string()),
  })
    .index("by_driver", ["driverId"])
    .index("by_branch_status", ["branch", "status"])
    .index("by_status", ["status"]),

  // Driver Earnings Table
  driverEarnings: defineTable({
    driverId: v.string(),
    orderId: v.string(),
    orderTotal: v.number(),
    commission: v.number(),
    earnings: v.number(),
    earnedAt: v.string(),
    paidOut: v.boolean(),
    paidOutAt: v.optional(v.string()),
  })
    .index("by_driver", ["driverId"])
    .index("by_order", ["orderId"])
    .index("by_paidOut", ["driverId", "paidOut"]),

  // Users Table (for admin, manager, kitchen staff)
  users: defineTable({
    email: v.string(),
    password: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("kitchen"),
      v.literal("receptionist")
    ),
    fullName: v.string(),
    phone: v.optional(v.string()),
    branchId: v.optional(v.string()), // managers/kitchen staff assigned to branch
    isActive: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_branch", ["branchId"]),

  // Settings Table
  settings: defineTable({
    branchId: v.optional(v.string()),
    key: v.string(),
    value: v.string(),
    updatedAt: v.string(),
    updatedBy: v.optional(v.string()),
  })
    .index("by_branch", ["branchId"])
    .index("by_key", ["key"]),

  // Analytics Table
  analytics: defineTable({
    branchId: v.string(),
    date: v.string(), // YYYY-MM-DD
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
  })
    .index("by_branch", ["branchId"])
    .index("by_date", ["date"])
    .index("by_branch_date", ["branchId", "date"]),

  // Notifications Table
  notifications: defineTable({
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
    read: v.boolean(),
    sentAt: v.string(),
  })
    .index("by_recipient", ["recipientId", "read"])
    .index("by_order", ["orderId"]),

  // Payment Transactions Table
  transactions: defineTable({
    orderId: v.string(),
    customerId: v.optional(v.string()),
    amount: v.number(),
    paymentMethod: v.string(),
    provider: v.optional(v.string()), // "paystack", "momo", "cash"
    reference: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("success"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    createdAt: v.string(),
    completedAt: v.optional(v.string()),
  })
    .index("by_order", ["orderId"])
    .index("by_status", ["status"])
    .index("by_reference", ["reference"]),

  // Delivery Pricing Tiers Table
  deliveryPricing: defineTable({
    branchId: v.string(),
    minDistance: v.number(), // in km
    maxDistance: v.number(), // in km
    price: v.number(),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedBy: v.optional(v.string()),
  })
    .index("by_branch", ["branchId"])
    .index("by_active", ["isActive"]),
});
