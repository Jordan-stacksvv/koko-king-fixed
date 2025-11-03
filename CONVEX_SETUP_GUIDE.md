# Koko King Restaurant System - Complete Setup Guide

## System Overview

Koko King is a comprehensive restaurant management system with three user roles:
- **Kitchen Staff**: Handle incoming orders and food preparation
- **Manager**: Oversee branch operations, menu, and sales
- **Admin**: Control all branches, analytics, and system-wide settings

## Getting Started

### Initial Setup
1. Clone or download the project
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Access the app at `http://localhost:8080`

---

## Customer Flow

### 1. Homepage (`/`)
- View rotating banner images
- Select "From" and "To" locations for delivery
- Browse food categories via carousel
- Search menu items using the search box
- Click on menu items to view details and add to cart

### 2. Menu Page (`/menu`)
- Browse all available menu items
- Filter by category
- Add items to cart
- View item details and prices

### 3. Cart & Checkout (`/cart`, `/checkout`)
- Review cart items
- Adjust quantities
- Proceed to checkout
- Complete order with delivery details

---

## Kitchen Staff Access

### Login
- Navigate to **Footer → Staff Access → Kitchen Login**
- Login URL: `/kitchen/login`
- Default credentials: `kitchen / kitchen123`

### Order Management Flow (`/kitchen/orders`)

The kitchen system follows a 4-stage order workflow:

#### Stage 1: PENDING ORDERS
- New orders appear here first
- Sound notification plays once for each new order
- Toast notification appears once
- Click **"Confirm Order"** to move to next stage

#### Stage 2: CONFIRMED ORDERS  
- Orders waiting to be prepared
- Print button available for order tickets
- Click **"Start Preparing"** to move order to preparing stage

#### Stage 3: PREPARING ORDERS
- Active orders being cooked
- Click **"Mark as Done"** when order is complete
- Moves to Done list

#### Stage 4: DONE ORDERS
- Read-only list of completed orders
- Shows all finished orders for the day
- No actions available - historical record only

### Kitchen Display Screen (`/kitchen/display`)
- Open via **"Open Display Page"** button in Kitchen Orders
- Designed for kitchen staff/cooks to view
- Shows only **CONFIRMED** orders waiting to be prepared
- Updates in real-time as orders are confirmed
- Orders disappear when marked as "Start Preparing"
- Best viewed on a separate monitor/tablet

### Walk-in Orders (`/kitchen/orders` - Add Order Form)
- Use search box to find menu items
- Click on items from mini-menu to add
- Adjust quantities with +/- buttons
- Complete customer details
- Submit walk-in order

---

## Manager Access

### Login
- Navigate to **Footer → Staff Access → Manager Login**
- Login URL: `/manager/login`
- Default credentials: `manager / manager123`

### Manager Dashboard (`/manager/dashboard`)
- View branch statistics
- Monitor daily revenue
- Track order counts
- Quick overview of branch performance

### Orders View (`/manager/orders`)
- **READ ONLY** - No actions available
- View completed orders in list format
- Click on any order to see full details
- Filter orders by date
- Export/print order reports

### Menu Management (`/manager/menu`)
- View all menu items
- Edit existing items:
  - Update name, price, category
  - Change or add item images via Image URL field
  - Toggle item availability
- Add new menu items
- Delete items no longer offered

### Deliveries (`/manager/deliveries`)
- Track active deliveries
- View delivery routes
- Update delivery status

### Payments (`/manager/payments`)
- View payment records
- Track payment methods
- Generate payment reports

### Settings (`/manager/settings`)
- Branch-specific settings
- Notification preferences
- Operating hours configuration

---

## Admin Access (Super Admin)

### Login
- Navigate to **Footer → Staff Access → Admin Login**
- Login URL: `/admin/login`
- Default credentials: `admin / admin123`

### Admin Dashboard (`/admin/dashboard`)
- **Overview Cards:**
  - Total Revenue (all branches combined)
  - Total Orders across all locations
  - Top Selling Item system-wide
  - Highest Earning Branch

- **Charts & Analytics:**
  - Revenue by Branch (bar chart)
  - Top Selling Items (pie chart)
  - Branch performance comparison

- **Branch Performance List:**
  - Click on any branch to view detailed analytics
  - Shows revenue and order count per branch

### Branch Management (`/admin/branches`)
- **View All Branches:**
  - Grid/list view of all restaurant locations
  - Quick stats for each branch

- **Add New Branch:**
  - Branch name
  - Full address/location
  - Phone number
  - Manager assignment

- **Branch Details (click on any branch):**
  - Overview tab: Branch information, stats
  - Recent Orders tab: Last 10 orders from this branch
  - Top Items tab: Best-selling items at this location
  - View total revenue, order count, average order value

- **Delete Branch:**
  - Remove underperforming or closed locations

### Sales Analytics (`/admin/analytics`)
- **Daily/Weekly/Monthly Views:**
  - Sales trends over time (line chart)
  - Revenue breakdown (bar chart)
  - Order frequency analysis

- **Performance Metrics:**
  - Compare branches
  - Identify peak hours
  - Track growth trends

### All Orders (`/admin/orders`)
- View orders from ALL branches
- Filter by:
  - Branch
  - Date range
  - Order status
- Click to view full order details
- Export order data

### Menu Management (`/admin/menu`)
- **System-Wide Menu Control:**
  - View all menu items across all branches
  - Add new items available to all branches
  - Edit item details (name, price, category, image)
  - Delete items from system

- **Branch-Specific Items:**
  - Assign items to specific branches
  - Manage location-specific menu variations

- **Menu Categories:**
  - Pizza, Wraps, Sandwiches
  - Sides, Drinks, Salads
  - Combo Meals, Specials

---

## Order Status Flow

```
PENDING → CONFIRMED → PREPARING → READY → COMPLETED
```

1. **PENDING**: New order received, notification sent
2. **CONFIRMED**: Kitchen staff acknowledged order
3. **PREPARING**: Food is being cooked
4. **READY**: Order complete, ready for pickup/delivery  
5. **COMPLETED**: Order delivered/picked up

---

## Data Storage

All data is stored in browser localStorage:
- `orders`: All customer orders
- `branches`: Restaurant locations
- `customMenuItems`: Admin-added menu items
- `cart`: Customer shopping cart
- `kitchenAuth`: Kitchen login state
- `managerAuth`: Manager login state
- `adminAuth`: Admin login state

### Order ID Format
- Orders use format: `KK-XXXX` (e.g., KK-1234)
- Short, easy to communicate
- Sequential numbering

---

## Navigation Structure

### Public Pages
- `/` - Homepage
- `/menu` - Full menu
- `/cart` - Shopping cart
- `/checkout` - Order checkout
- `/contact` - Contact information
- `/store-locator` - Find locations

### Kitchen Pages
- `/kitchen/login` - Kitchen staff login
- `/kitchen/orders` - Order management
- `/kitchen/display` - Kitchen display screen

### Manager Pages
- `/manager/login` - Manager login
- `/manager/dashboard` - Overview
- `/manager/orders` - Order history (read-only)
- `/manager/menu` - Menu editing
- `/manager/deliveries` - Delivery tracking
- `/manager/payments` - Payment records
- `/manager/settings` - Branch settings

### Admin Pages
- `/admin/login` - Admin login
- `/admin/dashboard` - System overview
- `/admin/branches` - Branch management & analytics
- `/admin/analytics` - Sales analytics
- `/admin/orders` - All orders view
- `/admin/menu` - Global menu management

---

## Key Features

### Customer Features
- Location-based ordering (From/To)
- Search functionality
- Category browsing
- Shopping cart
- Order tracking

### Kitchen Features
- Real-time order notifications (plays once per order)
- Multi-stage workflow
- Order printing
- Walk-in order entry
- Dedicated display screen for cooks

### Manager Features
- Read-only order viewing
- Menu editing with image updates
- Branch performance monitoring
- Delivery tracking

### Admin Features
- Multi-branch overview
- Detailed branch analytics
- Sales trends and charts
- System-wide menu control
- Branch creation and management
- Top items and revenue tracking

---

## Default Login Credentials

**Kitchen Staff:**
- Username: `kitchen`
- Password: `kitchen123`

**Manager:**
- Username: `manager`
- Password: `manager123`

**Admin:**
- Username: `admin`
- Password: `admin123`

*Change these in production for security!*

---

## Troubleshooting

### Orders not appearing?
- Check localStorage for `orders` key
- Verify order status matches the view you're in

### Notifications repeating?
- Fixed: Notifications now only play once per new pending order

### Can't access admin pages?
- Verify you're logged in via `/admin/login`
- Check localStorage for `adminAuth: "true"`

---

**Last Updated**: 2025
**Version**: 2.0
