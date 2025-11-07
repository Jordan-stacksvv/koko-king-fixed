# Koko King - Complete System Workflow Documentation

## System Overview

Koko King is a multi-location restaurant ordering and kitchen management system with five distinct user portals:
1. **Customer Portal** - Order placement and tracking
2. **Kitchen Portal** - Order preparation and tracking
3. **Driver Portal** - Delivery management
4. **Manager Portal** - Branch-level management
5. **Admin Portal** - System-wide administration

---

## 1. CUSTOMER WORKFLOW

### Landing Page (/)
- **Hero Banner**: Auto-rotating carousel with 8 food images (centered, object-cover)
- **Location Selector**: Shows delivery from/to with clickable fields
  - "From": Restaurant location (clickable)
  - "To": Delivery address (clickable)
  - Edit icon: Opens location/address dialog
- **Category Carousel**: Browse menu categories
- **Quick Actions**: View Menu, Order Now

### Menu Browsing (/menu)
- Filter by category
- View item details (name, description, price, image)
- Add to cart with quantity and extras
- Cart icon shows item count

### Cart (/cart)
- Review items and quantities
- Adjust quantities or remove items
- See subtotal, delivery fee, total
- Proceed to checkout

### Checkout (/checkout)
- **Customer Details**:
  - Name
  - Phone number
  - Address (if delivery)
- **Order Options**:
  - Delivery method: Pickup or Delivery
  - Payment method: Cash, Mobile Money, Card
- **Special Instructions**: Optional notes
- **Place Order**: Creates order with `KK-XXXX` ID
- Order status: `pending`
- Stored in localStorage

### Order Confirmation
- Order ID displayed
- Estimated time
- Track order button
- Option to order again

---

## 2. KITCHEN WORKFLOW

### Kitchen Login (/kitchen/login)
- **Access Code**: `kitchen2025`
- No username required
- Redirects to orders page

### Kitchen Orders Page (/kitchen/orders)
Four-stage workflow with tabs:

#### Stage 1: PENDING
- **Walk-in orders ALWAYS appear first** (prioritized)
- Online orders appear below walk-in
- New order sound notification
- Each order shows:
  - Order ID
  - Order Type badge (WALK-IN or ONLINE)
  - Customer name
  - Items list
  - Total amount
  - Timestamp
- **Actions**: 
  - Confirm button → Moves to CONFIRMED
  - Print receipt

#### Stage 2: CONFIRMED
- **Split-screen layout**:
  - **Left side**: Walk-in orders
  - **Right side**: Online orders
- Each order card shows:
  - Order ID
  - Order Type badge
  - Items with quantities
  - Total
- **Actions**:
  - Print Receipt
  - Start Preparing → Moves to PREPARING

#### Stage 3: PREPARING
- **Long list style** (not card boxes)
- Each order displays:
  - Order ID
  - Order Type badge
  - Items being prepared
  - Timer showing preparation time
- **Actions**:
  - Mark as Done button (at end of each row) → Moves to DONE

#### Stage 4: DONE
- **Long list style**
- Completed orders archive
- Each order shows:
  - Order ID
  - Order Type badge
  - Completion timestamp
  - Total amount
- Auto-archives after 24 hours

### Kitchen Display Screen (/kitchen/display)
- **Shows CONFIRMED orders only**
- Large screen view for kitchen staff
- Auto-updates in real-time
- Clears automatically when order moves to PREPARING
- Shows:
  - Order ID
  - Order Type
  - Items to prepare
  - Special instructions

### Add Walk-in Order
- **Button**: "Add Walk-in Order" on Pending tab
- **Form**:
  - Customer name (optional)
  - Phone number (optional)
  - Main items dropdown
  - **Side dishes**: Can add sides as extras
  - Quantity selectors
  - Special notes
- **Order Type**: Automatically set as `walk-in`
- **Submit**: Creates order with `pending` status

### Receipt Printing
- **Always shows**:
  - Order Type (WALK-IN or ONLINE)
  - Order ID
  - Customer details
  - Items with quantities
  - Subtotal
  - Total
  - Timestamp
  - Branch name

---

## 3. DRIVER WORKFLOW

### Driver Signup (/driver/login - Signup Tab)
- **Phone number only** required
- System generates driver ID: `DRV-XXXXXX`
- No password needed
- Account created instantly

### Driver Login (/driver/login - Login Tab)
- **Phone number**
- **System passkey**: `driver2025`
- Validates and redirects to deliveries dashboard

### Deliveries Dashboard (/driver/deliveries)
- **Today's Deliveries**: Shows active deliveries for logged-in driver
- Each delivery card shows:
  - Order ID (clickable → opens Google Maps route)
  - Customer name
  - **Address** (clickable → opens Google Maps)
  - Phone number (clickable → call)
  - **Edit icon** (clickable → edit dialog)
  - **"View Location"** text (clickable → opens Google Maps)
  - Items summary
  - Total amount
  - Delivery status badge
- **Actions**:
  - Click address → Opens Google Maps with route
  - Click edit icon → Opens edit dialog
  - Click location text → Opens Google Maps
  - **Mark as Done** → Updates order status to `completed`
    - Updates across all systems (Kitchen, Manager, Admin)
    - Driver receives completion notification

### Edit Delivery Dialog
- **Triggered by**:
  - Clicking address
  - Clicking edit pencil icon
  - Clicking location text
- **Fields**:
  - Customer address (editable)
  - Phone number (editable)
  - Special delivery notes
- **Save**: Updates delivery details

---

## 4. MANAGER WORKFLOW

### Manager Login (/manager/login)
- **Username**: `manager`
- **Password**: `manager123`
- Redirects to manager dashboard

### Manager Dashboard (/manager/dashboard)
- **Today's Stats**:
  - Total orders
  - Revenue
  - Pending orders
  - Completed orders
- **Recent Orders**: Last 10 orders
- **Quick Actions**:
  - View all orders
  - Menu management
  - Settings

### Manager Orders (/manager/orders)
- **READ-ONLY** list view
- **Filters**:
  - Status (all, pending, confirmed, preparing, completed)
  - Search by order ID or customer name
  - **Date filter**: Select specific date
  - **Category filter**: Filter by food category
- **Click order** → Opens details modal:
  - Customer details
  - Order items
  - Order type
  - Payment method
  - Status
  - Timestamps
  - Special instructions

### Menu Management (/manager/menu)
- View all menu items
- Search and filter
- **Edit existing items**:
  - **Upload image from computer**
  - Change name
  - Update description
  - Adjust price
  - Change category
- **Delete items**
- **Add new items**: Redirects to admin for approval

### Manager Settings (/manager/settings)
- **Restaurant Information**:
  - Name
  - Phone
  - Address
  - Email
- **Operating Hours**:
  - Opening time
  - Closing time
  - 24/7 toggle
- **Delivery Settings**:
  - Delivery fee
  - Minimum order
  - Estimated delivery time
- **Automation Toggles**:
  - Auto-confirm orders (when enabled, orders skip pending → go directly to confirmed)
  - Auto-assign drivers (automatically assigns nearest available driver)
  - Auto-send notifications
  - Kitchen auto-print receipts
- **Notification Preferences**:
  - Order alerts
  - Delivery updates
  - Low stock alerts
- **Save Changes**: Sticky button at bottom

### Manager Deliveries (/manager/deliveries)
- View active deliveries
- Track delivery status
- Driver assignments
- Delivery history

### Manager Payments (/manager/payments)
- Daily payment summary
- Payment methods breakdown
- Transaction history
- Revenue analytics

---

## 5. ADMIN (SUPER ADMIN) WORKFLOW

### Admin Login (/admin/login)
- **Username**: `admin`
- **Password**: `admin123`
- Full system access

### Admin Dashboard (/admin/dashboard)
- **Header**: 
  - **Koko King logo** (clickable → refreshes data)
  - Sidebar toggle
- **Sidebar Navigation**:
  - Dashboard (current)
  - Branches
  - Sales Analytics
  - All Orders
  - Menu Management
  - Settings
  - Logout
- **View Toggle**: 
  - All Branches (combined data)
  - OR specific branch dropdown
- **Dashboard Cards**:
  - **Total Sales**: All branches combined or selected branch
  - **Total Orders**: Count with growth percentage
  - **Top Items**: Best-selling items
  - **Highest Revenue Branch**: Branch comparison
  - **Recent Activity**: Latest orders and actions
- **Charts**:
  - Revenue trend (line chart)
  - Orders by branch (bar chart)
  - Category distribution (pie chart)

### Branches Management (/admin/branches)
- **Logo**: Clickable Koko King logo (refreshes)
- **Default Branches**:
  - East Legon
  - Osu
  - Cantonments
  - Airport Residential
  - Spintex
- **Add New Branch**:
  - Branch name
  - Address
  - Phone
  - Manager name
  - **Upload image from computer**
  - **Copy menu from**: Dropdown of existing branches
  - Operating hours
- **Branch Cards**:
  - Branch image
  - Name, address, phone
  - Manager name
  - Stats (orders, revenue)
  - **Actions**:
    - **Click branch** → View analytics
    - **Edit** → Update branch details
    - **Delete** → Remove branch (with confirmation)
    - **Share menu** → Push menu to other branches
- **Branch Analytics** (when clicked):
  - Sales trends
  - Top meals
  - Orders count
  - Revenue breakdown
  - Customer satisfaction

### Sales Analytics (/admin/analytics)
- **Logo**: Clickable logo (refreshes)
- **View Options**:
  - **All Branches**: Combined analytics
  - **Individual Branch**: Select from dropdown
- **Date Range Filters**:
  - Today
  - This Week
  - This Month
  - Custom Range
- **Analytics Cards**:
  - Total Revenue
  - Orders Count
  - Average Order Value
  - Growth Rate
- **Charts**:
  - **Sales Trend**: Line chart over time
  - **Revenue by Branch**: Bar chart comparison
  - **Top Items**: Best sellers across system or per branch
  - **Least Ordered**: Items needing attention
  - **Category Performance**: Pie chart
  - **Peak Hours**: Heatmap of order times

### All Orders Page (/admin/orders)
- **Logo**: Clickable logo
- **Filters**:
  - **Branch**: All or specific branch
  - **Status**: All, pending, confirmed, preparing, completed
  - **Date**: Date picker for specific date
  - **Category**: Filter by food category
  - **Search**: Order ID or customer name
- **Order List**:
  - Order ID
  - Branch name
  - Customer name
  - Date
  - Status badge
  - Order type badge
  - Total amount
- **Click order** → Details modal:
  - Full order details
  - Customer information
  - Items breakdown
  - Payment method
  - Delivery details
  - Status history
  - Special instructions
- **Analytics Section**:
  - **Most Ordered Items**: Per branch and total
  - **Least Ordered Items**: Per branch and total
  - **Order Volume Trends**
  - **Peak Times Analysis**

### Menu Management (/admin/menu)
- **Logo**: Clickable logo
- **Add New Item**:
  - Item name
  - Description
  - Price
  - Category
  - **Upload image from computer**
  - **Assign to branches**:
    - Select specific branches
    - OR toggle "Push to all branches"
- **Menu List**:
  - All items across all branches
  - Filter by category
  - Search items
- **Item Cards**:
  - Image
  - Name
  - Price
  - Category
  - Assigned branches
  - **Actions**:
    - **Click image or edit** → Edit dialog:
      - Update name
      - Change description
      - Adjust price
      - **Upload new image from computer**
      - Reassign branches
      - Delete item
- **Bulk Operations**:
  - Select multiple items
  - Push to branches
  - Update category
  - Delete selected

### Admin Settings (/admin/settings)
- **Logo**: Clickable logo (refreshes)
- **Branch Access Control**:
  - **Toggle**: "Allow admin to manage specific branch as manager"
  - When enabled, admin can access any branch's manager view
- **Communication**:
  - **Send Message to Managers**:
    - Select recipient (all or specific manager)
    - Subject
    - Message content
    - Send button
  - **Inbox**: View messages from managers
    - Request notifications
    - Support tickets
    - Feedback
- **Category Management**:
  - **Add New Category**:
    - Category ID (e.g., "pasta")
    - Category Name (e.g., "Pasta & Italian")
    - Add button
  - **Categories automatically update**:
    - Appears in menu filters
    - Available in order filters
    - Shows in analytics
    - Visible to managers
- **System Features** (Toggles):
  - Walk-in Orders
  - Online Ordering
  - Delivery Service
  - Driver Management
  - SMS Notifications
  - Email Notifications
  - Auto-Assignment
  - Kitchen Display
  - Receipt Printing
- **Global Configuration**:
  - Tax Rate (%)
  - Service Charge (%)
  - Currency Symbol
  - Default Delivery Fee
  - Minimum Order Value
- **Save All Settings**: Fixed button at bottom

---

## DATA FLOW

### Order Lifecycle

```
1. CUSTOMER PLACES ORDER
   ↓
2. Order created with status: "pending"
   Order stored in localStorage
   ↓
3. KITCHEN RECEIVES ORDER
   - Appears in Pending tab
   - Walk-in orders always at top
   - Notification sound plays
   ↓
4. KITCHEN CONFIRMS ORDER
   - Order moves to Confirmed tab
   - Splits into walk-in/online columns
   - Appears on Display Screen
   - Status: "confirmed"
   ↓
5. KITCHEN STARTS PREPARING
   - Order moves to Preparing tab
   - Removed from Display Screen
   - Timer starts
   - Status: "preparing"
   ↓
6. KITCHEN MARKS DONE
   - Order moves to Done tab
   - If delivery: assigned to driver
   - Status: "ready" or "completed"
   ↓
7. DRIVER DELIVERS (if applicable)
   - Driver sees order in dashboard
   - Clicks address → Opens maps
   - Completes delivery
   - Marks as done
   - Status: "completed"
   ↓
8. ORDER ARCHIVED
   - Visible in Manager/Admin order history
   - Counted in analytics
   - Used for reports
```

### Data Storage (localStorage)

```javascript
// Orders
orders: [{
  id: "KK-0001",
  customer: {name, phone, address},
  items: [{name, price, quantity, extras, category}],
  orderType: "walk-in" | "online",
  deliveryMethod: "pickup" | "delivery",
  paymentMethod: "cash" | "mobile-money" | "card",
  branch: "East Legon",
  branchId: "branch-east-legon",
  status: "pending|confirmed|preparing|ready|completed",
  timestamp: "2025-01-07T10:30:00Z",
  completedAt: "2025-01-07T11:15:00Z",
  total: 75.00,
  notes: "No onions please"
}]

// Drivers
drivers: [{
  id: "DRV-123456",
  phone: "+233241234567",
  name: "John Doe",
  deliveries: ["KK-0001", "KK-0002"],
  activeDeliveries: ["KK-0003"]
}]

// Branches
branches: [{
  id: "branch-east-legon",
  name: "East Legon",
  location: "East Legon Main Road, Accra",
  phone: "+233 24 123 4567",
  manager: "John Mensah",
  image: "branch-image-url",
  createdAt: "2025-01-01T00:00:00Z",
  menu: [] // Branch-specific menu items
}]

// Categories (user-created)
categories: [{
  id: "pasta",
  name: "Pasta & Italian",
  image: ""
}]
```

---

## ACCESS POINTS

### Footer Links
- **Kitchen Access** → /kitchen/login
- **Driver Access** → /driver/login
- **Manager Access** → /manager/login
- **Admin Access** → /admin/login
- Copyright: **© 2025 Liderlabs. All rights reserved.**

### Navbar Links (Customer)
- Home
- Menu
- Contact
- Cart
- **Login** (customer authentication)

---

## DESIGN SYSTEM

### Banner
- 8 rotating food images
- Auto-advance every 5 seconds
- Navigation arrows
- Dot indicators
- **Responsive**:
  - Mobile: `object-cover object-center` (centered, full-width)
  - Tablet: Same styling
  - Desktop: Same styling
- Height: 250px (mobile) → 320px (tablet) → 380px (desktop)

### Color Scheme
- Primary: Koko King brand color
- Success: Green (completed, confirmed)
- Warning: Yellow (pending)
- Danger: Red (cancelled)
- Info: Blue (preparing)

### Order Type Badges
- **WALK-IN**: Orange badge
- **ONLINE**: Blue badge
- Always visible on orders throughout system

---

## BACKEND INTEGRATION PLAN

When moving to Convex backend:

### Collections Needed
1. **orders**
2. **users** (customers, managers, admins)
3. **drivers**
4. **branches**
5. **menuItems**
6. **categories**
7. **messages**
8. **settings**

### Real-time Updates
- Order status changes
- New order notifications
- Driver location tracking
- Kitchen display updates

### APIs to Implement
- `orders:create`
- `orders:list`
- `orders:updateStatus`
- `branches:list`
- `branches:create`
- `analytics:branchStats`
- `menu:create`
- `menu:assignBranches`
- `drivers:register`
- `deliveries:forDriver`
- `settings:update`
- `messages:send`

---

## TESTING WORKFLOW

1. **Customer Orders**:
   - Place online order
   - Verify appears in Kitchen Pending
   - Check order type badge

2. **Walk-in Orders**:
   - Add walk-in order in kitchen
   - Verify appears ABOVE online orders
   - Confirm walk-in badge shows

3. **Kitchen Flow**:
   - Confirm order → Check Confirmed tab split screen
   - Start preparing → Verify Display Screen updates
   - Mark done → Check Done tab

4. **Driver Flow**:
   - Login with phone + passkey
   - View deliveries
   - Click address → Verify Maps opens
   - Mark done → Check status updates everywhere

5. **Manager Access**:
   - View orders (read-only)
   - Filter by date and category
   - Edit menu with image upload
   - Adjust automation settings

6. **Admin Access**:
   - Switch between branches
   - View analytics per branch vs all
   - Add category → Verify updates everywhere
   - Send message to manager
   - Edit branch details

---

## DEPLOYMENT CHECKLIST

- [ ] All customer flows tested
- [ ] Kitchen workflow verified (4 stages)
- [ ] Driver login and delivery tracking working
- [ ] Manager permissions correct (read-only orders)
- [ ] Admin has full access
- [ ] Location selector clickable
- [ ] Date filters working
- [ ] Category filters functional
- [ ] Image uploads from computer working
- [ ] Banners responsive
- [ ] Order type badges visible
- [ ] Walk-in orders prioritized
- [ ] Google Maps integration working
- [ ] Footer links correct
- [ ] Copyright text: Liderlabs 2025

---

**Last Updated**: January 7, 2025  
**Version**: 1.0  
**Author**: Koko King Development Team
