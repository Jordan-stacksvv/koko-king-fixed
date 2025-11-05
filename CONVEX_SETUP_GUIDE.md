# Koko King - Complete Setup & Integration Guide

## 🎯 System Overview

Multi-location restaurant system with Customer, Kitchen, Driver, Manager, and Super Admin portals.

## 👥 DEFAULT CREDENTIALS

**Kitchen**: Code `kitchen2025` at `/kitchen/login`  
**Driver**: Signup with phone, login with passkey `driver2025` at `/driver/login`  
**Manager**: `manager` / `manager123` at `/manager/login`  
**Admin**: `admin` / `admin123` at `/admin/login`

## 📱 CUSTOMER FLOW
- Auto-location detection on first visit
- Browse menu → Add to cart → Checkout
- Order ID: `KK-XXXX` format
- Stored in localStorage with `pending` status

## 🍳 KITCHEN WORKFLOW (4 STAGES)

**PENDING** → New orders, walk-in ALWAYS prioritized, sound notification  
**CONFIRMED** → Split page (walk-in left, online right), Print + Start Preparing  
**PREPARING** → Long list style, Mark as Done button  
**DONE** → Long list style, completed orders archive  

**Display Screen** (`/kitchen/display`): Shows CONFIRMED orders only, auto-clears when done

**Receipts**: Always show order type (WALK-IN or ONLINE)

## 🚗 DRIVER FLOW
- Signup: Phone number only → Creates `DRV-XXXXXX`
- Login: Phone + system passkey `driver2025`
- Dashboard: Today's deliveries
- **All clickable**: Address, pencil icon, location text → Edit dialog
- Click address → Google Maps route
- Mark as Done → Updates all systems

## 👔 MANAGER ACCESS
- **Orders**: READ-ONLY list, click for details modal
- **Menu**: Edit items, upload images from computer
- **Settings**: Automation toggles (auto-confirm, auto-assign drivers, etc.)
- **Deliveries**: Track active/completed

## 👑 SUPER ADMIN ACCESS

### Dashboard
- Logo (clickable refresh)
- Sidebar: Dashboard, Branches, Analytics, Orders, Menu, Settings
- View: All Branches OR specific branch
- Cards: Total sales, orders, top items, highest branch

### Branches
- Default branches: East Legon, Osu, Cantonments, Airport, Spintex
- Add branch: Name, address, image upload, copy menu from other branch
- Click branch → Analytics (sales, top meals, orders)
- Share menu to other branches

### Analytics
- All branches + individual
- Sales trends, revenue, top/least ordered items
- Charts: Line, bar, pie

### All Orders
- Filter by branch, status, date, type
- Most/least ordered analysis per branch and total
- Click order → Details modal

### Menu Management
- Add item → Assign to specific branches OR push to all
- Upload images from computer
- Edit/reassign branches
- Bulk operations

### Settings
- **Branch Access Toggle**: Admin can manage specific branch as manager
- **Messaging**: Send/receive messages to/from managers
- **Feature Toggles**: Enable/disable walk-in, online, delivery, drivers
- Logo on all pages
- Save button (fixed)

## 💾 DATA STORAGE

```javascript
// Orders
localStorage: "orders" = [{
  id: "KK-XXXX",
  customer: {name, phone, address},
  items: [{...}],
  orderType: "walk-in" | "online",
  deliveryMethod: "pickup" | "delivery",
  branch: "East Legon",
  status: "pending|confirmed|preparing|completed",
  timestamp, completedAt
}]

// Drivers
localStorage: "drivers" = [{id: "DRV-XXXXXX", phone, deliveries}]

// Branches
localStorage: "branches" = [{id, name, address, manager, image, menu[]}]
```

## 🎨 UI NOTES
- Banner: `object-cover object-center` (centered, full-width)
- Preparing/Done: Long list style (not card boxes)
- Staff access: Footer only
- Customer login: Navbar only
- Copyright: **Liderlabs 2025**

## 🚀 BACKEND INTEGRATION

Replace localStorage with Convex:
- `orders:create`, `orders:list`, `orders:updateStatus`
- `branches:list`, `branches:create`, `analytics:branchStats`
- `menu:create`, `menu:assignBranches`
- `drivers:register`, `deliveries:forDriver`
- `settings:update`, `messages:send`

## 📝 KEY FILES
- `src/pages/kitchen/Orders.tsx` - 4-stage workflow
- `src/pages/driver/Deliveries.tsx` - Driver routes
- `src/pages/manager/Orders.tsx` - Read-only orders
- `src/pages/admin/Dashboard.tsx` - Multi-branch overview
- `src/pages/admin/Branches.tsx` - Branch management
- `src/pages/admin/Menu.tsx` - Global menu control
- `src/components/kitchen/AddOrderForm.tsx` - Walk-in orders

**Copyright © 2025 Liderlabs. All rights reserved.**
