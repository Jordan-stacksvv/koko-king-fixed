# Delivery & Rider Management System - Complete Specification

This document outlines the comprehensive delivery and rider management system for Koko King restaurant delivery operations.

---

## 🎯 System Overview

The delivery system manages the complete flow from order completion to customer delivery, including:
- Automatic or manual rider assignment
- Real-time order tracking
- Live location updates
- Multi-role status visibility
- Driver queue management

---

## 📋 Core Features

### 1. Done Orders Page (Kitchen Side)

**Location**: Kitchen Access → Done Orders Tab

**Current State**: Shows completed orders list
**New State**: Clean interface with single action button

**UI Requirements**:
- Header: Logo + "Done Orders" title + Logout button (top right only)
- Main Content: Centered card with:
  - Bike icon
  - "Delivery Management" heading
  - Description text
  - **"See Delivery Status"** button (primary action)

**What "See Delivery Status" Opens**:
A comprehensive delivery dashboard showing:

#### Tabs:
1. **Awaiting Assignment** - Orders ready for rider assignment
2. **Being Delivered** - Orders currently out for delivery
3. **Completed** - Successfully delivered orders

#### Each Order Card Shows:
- Order ID + Type badge (ONLINE/WALK-IN)
- Customer name + phone
- Delivery address with map icon
- Order items list
- Total amount
- Timestamp
- Current status badge
- Action button (varies by status)

#### Actions Available:
- **Awaiting Assignment**: "Assign to Rider" button
- **Being Delivered**: Live rider location + rider name + "View on Map"
- **Completed**: View receipt + timestamp

---

### 2. Assign to Rider Flow

When "Assign to Rider" is clicked:

#### If Auto-Assign is ON (Settings):
1. System automatically finds nearest available rider
2. Sends assignment request to rider
3. Shows loading state: "Finding nearest rider..."
4. Waits 15-20 seconds for rider response
5. If no response → tries next nearest rider
6. If still no response → broadcasts to all online riders in branch
7. First rider to accept gets assigned

#### If Auto-Assign is OFF (Settings):
1. Opens dialog showing list of online riders
2. Each rider card shows:
   - Rider name + photo
   - Current location (distance from restaurant)
   - Number of active deliveries
   - Average delivery time
   - Rating/reviews
   - "Assign" button
3. Receptionist manually selects rider
4. System sends assignment request
5. Same timeout/broadcast flow as auto-assign

---

### 3. Rider Queue System

**How Riders Enter Queue**:
- Rider logs into driver dashboard
- Toggles "Online/Offline" switch
- When Online → added to branch's available rider queue
- Queue is ordered by:
  1. Branch location (nearest first)
  2. Time since last delivery (fairest distribution)
  3. Current active deliveries (fewer = higher priority)

**Queue Management**:
- Kitchen/Receptionist can see live queue status
- Shows: Rider name, location, status (Available/On Delivery), last active time
- Auto-updates in real-time as riders go online/offline
- When rider accepts order → removed from queue until delivery complete

**Queue Rules**:
- Maximum 3 active deliveries per rider
- Riders on delivery stay in queue but lower priority
- Offline riders automatically removed from queue
- Riders can manually leave queue (toggle offline)

---

### 4. Rider Acceptance Flow

**What Rider Sees**:
1. Popup notification (sound + vibration on mobile)
2. Notification card shows:
   - "New Delivery Request"
   - Restaurant location
   - Customer location with mini-map
   - Delivery distance
   - Order items summary
   - Estimated earnings
   - "Accept" and "Decline" buttons
   - **15-20 second countdown timer**

**If Rider Accepts**:
1. Order immediately moves to rider's "Ongoing Deliveries"
2. Kitchen/Receptionist receives notification:
   - "Rider [Name] has accepted Order #[ID]"
   - Shows rider photo, name, phone
   - Live location tracking starts
3. Customer receives notification:
   - "Your order is on the way!"
   - Shows rider name + photo
   - Live tracking link
4. Order status updates to "Rider Accepted"

**If Rider Declines or Timeout**:
1. System moves to next rider in queue
2. Same notification flow
3. After 2 failed attempts → broadcasts to all online riders
4. Receptionist/Kitchen sees "Waiting for rider response..." status

**If No Rider Available**:
- Shows alert: "No riders currently available"
- Option to notify when rider comes online
- Option to manually call rider
- Order stays in "Awaiting Assignment" tab

---

### 5. Delivery Status Updates (Real-Time)

**Status Progression**:
1. ✅ **Order Completed** (Kitchen marks done)
2. 🚴 **Assigned** (Rider selected)
3. 👍 **Rider Accepted** (Rider confirms)
4. 📦 **Picked Up** (Rider collects from restaurant)
5. 🚗 **On Route to Customer** (En route)
6. 🏠 **Delivered** (Rider confirms delivery)
7. ✔️ **Completed** (Payment confirmed)

**Status Visibility**:
All statuses update in real-time across:
- Kitchen Display Page (Display tab + Done tab)
- Receptionist Dashboard
- Rider Dashboard (their own deliveries)
- Manager Dashboard (branch-specific)
- Admin Dashboard (all branches)
- Customer Order Tracking (if implemented)

**Real-Time Requirements**:
- No page refresh needed
- Use Convex subscriptions for live updates
- Status changes propagate within 1-2 seconds
- Location updates every 5-10 seconds during delivery

---

### 6. Map Integration (Critical)

#### Kitchen/Receptionist View:
**During Assignment**:
- Shows map with:
  - Restaurant location (fixed pin)
  - Customer location (delivery pin)
  - Available riders (blue pins with rider icon)
  - Distance/route preview

**During Delivery**:
- Live tracking map showing:
  - Rider's current location (moving pin)
  - Customer location (destination pin)
  - Route path (blue line)
  - Estimated time to arrival (ETA)
  - "View Full Map" button for expanded view

#### Rider View:
**Order Acceptance Card**:
- Mini-map preview showing:
  - Restaurant location
  - Customer location
  - Straight-line distance

**Active Delivery**:
- Full-screen map with:
  - Rider's current location (center, updates live)
  - Customer location (destination pin)
  - Turn-by-turn route (if available)
  - **"Open in Navigation"** button:
    - Detects device (iOS/Android)
    - Opens in Google Maps or Apple Maps
    - Pre-fills destination address
    - Starts navigation immediately

**Location Permissions**:
- Request location permission on rider login
- Show permission denied warning if blocked
- Continuous location tracking during active delivery
- Stop tracking when delivery marked complete

#### Customer Location Selection:
**For Receptionist Adding Orders**:
- Uses map picker interface (same as customer "To" field)
- Click anywhere on map → drops pin
- Auto-reverse geocodes to address
- Shows nearest restaurant automatically
- Can drag pin to adjust exact location

---

### 7. Settings Page Updates

**New Setting Section: "Delivery Automation"**

```
┌─────────────────────────────────────────┐
│ Delivery Automation                      │
├─────────────────────────────────────────┤
│                                          │
│ Auto-Assign Riders              [ON/OFF] │
│ When enabled, system automatically       │
│ assigns nearest available rider          │
│                                          │
│ Assignment Timeout           [15] seconds│
│ Time to wait for rider response          │
│                                          │
│ Max Active Deliveries per Rider    [3]  │
│                                          │
│ Priority Mode:                           │
│ ○ Nearest First                         │
│ ○ Fairest Distribution                  │
│ ○ Fastest Riders                        │
│                                          │
└─────────────────────────────────────────┘
```

**Access Control**:
- **Manager**: Can toggle for their branch only
- **Admin**: Can toggle for all branches or individually
- **Receptionist**: Can see setting but not change
- Setting saves per-branch in Convex `settings` table

---

### 8. Rider Dashboard Pages

**New/Updated Pages Required**:

#### A. Rider Login/Signup
- Already exists, keep current flow
- Add location permission request after login

#### B. Rider Home Dashboard
**Sections**:
1. **Online Status Toggle** (prominent at top)
   - Shows: "You are [Online/Offline]"
   - Switch to toggle status
   - Shows queue position when online

2. **Incoming Requests** (if any pending)
   - Shows active assignment request
   - Countdown timer
   - Accept/Decline buttons

3. **Today's Summary Cards**
   - Total Deliveries
   - Active Deliveries
   - Earnings Today
   - Average Rating

4. **Ongoing Deliveries**
   - List of active deliveries
   - Each shows: Order #, Customer, Address, ETA
   - "Navigate" button per delivery
   - "Mark Delivered" button when arrived

5. **Completed Today**
   - Scrollable list of completed deliveries
   - Shows earnings per delivery

#### C. Rider Delivery Detail Page
Opens when rider taps active delivery:
- Full-screen map with live tracking
- Customer info card at bottom:
  - Name, Phone (call button)
  - Full address
  - Order items + total
  - Delivery notes
- Action buttons:
  - "Mark Picked Up" (when at restaurant)
  - "Navigate" (opens maps app)
  - "Mark Delivered" (when at customer)
  - "Call Customer"
- Status timeline showing progress

---

## 🛠️ Technical Implementation

### Convex Schema Updates

**New Tables**:

#### 1. `rider_queue`
```typescript
rider_queue: defineTable({
  riderId: v.id("users"),
  branchId: v.id("branches"),
  status: v.union(v.literal("online"), v.literal("offline"), v.literal("on_delivery")),
  currentLocation: v.object({
    latitude: v.number(),
    longitude: v.number(),
    timestamp: v.number()
  }),
  activeDeliveries: v.number(), // count of current deliveries
  lastDeliveryTime: v.optional(v.number()),
  joinedQueueAt: v.number(),
})
.index("by_branch_status", ["branchId", "status"])
.index("by_rider", ["riderId"])
```

#### 2. `delivery_assignments`
```typescript
delivery_assignments: defineTable({
  orderId: v.id("orders"),
  riderId: v.optional(v.id("users")),
  branchId: v.id("branches"),
  status: v.union(
    v.literal("awaiting_assignment"),
    v.literal("assigned"),
    v.literal("accepted"),
    v.literal("picked_up"),
    v.literal("on_route"),
    v.literal("delivered"),
    v.literal("completed")
  ),
  assignedAt: v.optional(v.number()),
  acceptedAt: v.optional(v.number()),
  pickedUpAt: v.optional(v.number()),
  deliveredAt: v.optional(v.number()),
  riderLocation: v.optional(v.object({
    latitude: v.number(),
    longitude: v.number(),
    timestamp: v.number()
  })),
  customerLocation: v.object({
    latitude: v.number(),
    longitude: v.number(),
    address: v.string()
  }),
  estimatedDistance: v.number(), // in km
  estimatedEarnings: v.number(),
  actualEarnings: v.optional(v.number()),
  timeoutAttempts: v.number(), // how many riders timed out
  broadcastToAll: v.boolean(), // if sent to all riders
})
.index("by_order", ["orderId"])
.index("by_rider_status", ["riderId", "status"])
.index("by_branch_status", ["branchId", "status"])
```

#### 3. Update `settings` table
Add fields:
```typescript
// Add to existing settings table
autoAssignRiders: v.boolean(),
assignmentTimeout: v.number(), // seconds
maxActiveDeliveriesPerRider: v.number(),
priorityMode: v.union(
  v.literal("nearest"),
  v.literal("fair"),
  v.literal("fastest")
),
```

### Convex Functions Required

#### 1. Rider Queue Management
```typescript
// rider/goOnline.ts
export const goOnline = mutation({
  args: {
    branchId: v.id("branches"),
    currentLocation: v.object({
      latitude: v.number(),
      longitude: v.number()
    })
  },
  handler: async (ctx, args) => {
    // Add rider to queue
    // Update rider status
    // Return queue position
  }
});

// rider/goOffline.ts
export const goOffline = mutation({
  args: {},
  handler: async (ctx) => {
    // Remove from queue
    // Update status
  }
});

// rider/updateLocation.ts
export const updateLocation = mutation({
  args: {
    latitude: v.number(),
    longitude: v.number()
  },
  handler: async (ctx, args) => {
    // Update rider's current location
    // Update all active delivery assignments
  }
});

// rider/getQueue.ts
export const getQueue = query({
  args: {
    branchId: v.id("branches")
  },
  handler: async (ctx, args) => {
    // Get all online riders for branch
    // Sort by priority mode
    // Return queue list
  }
});
```

#### 2. Assignment Flow
```typescript
// delivery/assignToRider.ts
export const assignToRider = mutation({
  args: {
    orderId: v.id("orders"),
    riderId: v.optional(v.id("users")), // optional for auto-assign
    auto: v.boolean()
  },
  handler: async (ctx, args) => {
    // If auto: get next rider from queue
    // If manual: use provided riderId
    // Create delivery_assignment record
    // Send notification to rider
    // Start timeout timer
    // Return assignment ID
  }
});

// delivery/riderAccept.ts
export const riderAccept = mutation({
  args: {
    assignmentId: v.id("delivery_assignments")
  },
  handler: async (ctx, args) => {
    // Update assignment status to "accepted"
    // Update order status
    // Notify kitchen/receptionist
    // Notify customer
    // Remove from other riders' notifications
  }
});

// delivery/riderDecline.ts
export const riderDecline = mutation({
  args: {
    assignmentId: v.id("delivery_assignments")
  },
  handler: async (ctx, args) => {
    // Try next rider in queue
    // Or broadcast if already tried 2+
  }
});

// delivery/handleTimeout.ts
export const handleTimeout = mutation({
  args: {
    assignmentId: v.id("delivery_assignments")
  },
  handler: async (ctx, args) => {
    // Increment timeout attempts
    // If < 2: try next rider
    // If >= 2: broadcast to all online riders
  }
});

// delivery/broadcastToAll.ts
export const broadcastToAll = mutation({
  args: {
    assignmentId: v.id("delivery_assignments"),
    branchId: v.id("branches")
  },
  handler: async (ctx, args) => {
    // Get all online riders for branch
    // Send notification to all
    // First to accept wins
  }
});
```

#### 3. Status Updates
```typescript
// delivery/markPickedUp.ts
export const markPickedUp = mutation({
  args: {
    assignmentId: v.id("delivery_assignments")
  },
  handler: async (ctx, args) => {
    // Update status to "picked_up"
    // Record timestamp
    // Notify all stakeholders
  }
});

// delivery/markDelivered.ts
export const markDelivered = mutation({
  args: {
    assignmentId: v.id("delivery_assignments")
  },
  handler: async (ctx, args) => {
    // Update status to "delivered"
    // Calculate earnings
    // Update rider back to queue
    // Notify all stakeholders
  }
});

// delivery/updateDeliveryStatus.ts
export const updateDeliveryStatus = mutation({
  args: {
    assignmentId: v.id("delivery_assignments"),
    status: v.string(),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number()
    }))
  },
  handler: async (ctx, args) => {
    // Update assignment status
    // Update location if provided
    // Real-time broadcast update
  }
});
```

#### 4. Real-Time Queries
```typescript
// delivery/getLiveDeliveries.ts
export const getLiveDeliveries = query({
  args: {
    branchId: v.optional(v.id("branches"))
  },
  handler: async (ctx, args) => {
    // Get all active deliveries
    // Filter by branch if provided
    // Include rider location
    // Return real-time data
  }
});

// delivery/getRiderDeliveries.ts
export const getRiderDeliveries = query({
  args: {},
  handler: async (ctx) => {
    // Get current rider's deliveries
    // Separate by status (active, completed)
    // Include customer locations
  }
});

// delivery/getDeliveryDetail.ts
export const getDeliveryDetail = query({
  args: {
    assignmentId: v.id("delivery_assignments")
  },
  handler: async (ctx, args) => {
    // Get full delivery details
    // Include order items
    // Include customer info
    // Include rider location
  }
});
```

### Frontend Updates Required

**Pages to Create**:
1. `src/pages/kitchen/DeliveryStatus.tsx` - Main delivery dashboard
2. `src/pages/rider/Home.tsx` - Rider dashboard (update existing)
3. `src/pages/rider/DeliveryDetail.tsx` - Single delivery view

**Components to Create**:
1. `src/components/delivery/AssignRiderDialog.tsx`
2. `src/components/delivery/RiderQueueList.tsx`
3. `src/components/delivery/LiveTrackingMap.tsx`
4. `src/components/delivery/DeliveryStatusBadge.tsx`
5. `src/components/delivery/RiderNotificationCard.tsx`

**Hooks to Create**:
1. `src/hooks/useRiderQueue.ts` - Manage rider queue
2. `src/hooks/useDeliveryTracking.ts` - Track live deliveries
3. `src/hooks/useRiderLocation.ts` - Handle rider location updates

---

## 🔔 Notification System

**Notification Types**:
1. **Rider Assignment** → To rider (popup + sound)
2. **Rider Accepted** → To kitchen/receptionist (popup)
3. **Order Picked Up** → To customer (SMS/push if available)
4. **On Route** → To customer (SMS/push if available)
5. **Delivered** → To kitchen/receptionist (update status)
6. **Timeout** → To receptionist (alert sound)

**Implementation**:
- Use Convex actions for push notifications
- Use browser Notification API for web notifications
- Show in-app toasts for status changes
- Play sound alerts for critical events (rider acceptance, timeout)

---

## 📱 Mobile Considerations

**Rider Mobile App Requirements**:
- Background location tracking during active delivery
- Push notifications for assignment requests
- Offline mode handling (queue when connection restored)
- Battery optimization (location updates every 10s, not continuous)
- Deep linking to maps apps (Google Maps/Apple Maps)

**Responsive Design**:
- All dashboards must work on mobile screens
- Map interfaces optimized for touch
- Large buttons for rider actions
- Voice navigation support (if possible)

---

## 🧪 Testing Checklist

- [ ] Rider can go online/offline
- [ ] Auto-assign finds nearest rider
- [ ] Manual assign shows rider list
- [ ] Rider receives assignment notification
- [ ] Timeout triggers next rider
- [ ] Broadcast goes to all riders
- [ ] First to accept gets order
- [ ] Kitchen sees rider acceptance popup
- [ ] Status updates in real-time
- [ ] Map shows live rider location
- [ ] Rider can mark picked up
- [ ] Rider can mark delivered
- [ ] Earnings calculated correctly
- [ ] Multiple deliveries per rider work
- [ ] Queue reorders correctly
- [ ] Settings toggle works per branch

---

## 🚀 Implementation Priority

**Phase 1** (Core Functionality):
1. Rider queue system
2. Manual rider assignment
3. Basic status updates
4. Delivery status dashboard

**Phase 2** (Auto-Assignment):
1. Auto-assign logic
2. Timeout handling
3. Broadcast system
4. Settings toggles

**Phase 3** (Live Tracking):
1. Live location updates
2. Map integration
3. Navigation links
4. Real-time status sync

**Phase 4** (Polish):
1. Notifications
2. Earnings tracking
3. Analytics
4. Customer tracking

---

## 📚 Additional Documentation

See also:
- `CONVEX_SETUP_GUIDE.md` - Backend implementation details
- `CONVEX_INTEGRATION_UPDATE.md` - Extended Convex functions
- Frontend integration examples in each page component

---

**Last Updated**: 2025-01-19
**Status**: Specification Complete - Ready for Implementation
