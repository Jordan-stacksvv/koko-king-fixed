# Koko King Restaurant System - Complete Setup Guide

## System Overview

Koko King is a comprehensive restaurant management system with three user roles:
- **Kitchen Staff**: Handle incoming orders and food preparation
- **Manager**: Oversee branch operations, menu, and sales
- **Admin**: Control all branches, analytics, and system-wide settings

---

## Getting Started

### Initial Setup
1. Clone or download the project
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Access the app at `http://localhost:8080`

---

## Customer Flow

### 1. Homepage (`/`)
- **Auto Location Detection**: On first visit, the app automatically detects user's location and selects the nearest Koko King restaurant
- View rotating banner images showcasing food items
- Banner uses `object-contain` to display full images centered
- **Location Selector**: "From" and "To" fields for delivery setup
  - "From" shows selected restaurant (auto-detected on first visit)
  - "To" is the delivery address input field
  - Click edit icon to change restaurant or delivery address
- Browse food categories via horizontal carousel
- Search menu items using the search box below categories
- Click on menu items to view details and add to cart
- **Login button** available in navbar for customer authentication

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
- **Order ID Format**: Orders are assigned short IDs like `KK-1234` for easy reference

---

## Kitchen Staff Access

### Login
- Navigate to **Footer → Staff Access → Kitchen Login**
- Login URL: `/kitchen/login`
- Default credentials: `kitchen / kitchen123`

### Order Management Flow (`/kitchen/orders`)

The kitchen system follows a **4-stage order workflow**:

#### Stage 1: PENDING ORDERS
- **New orders appear here first**
- Sound notification plays **once per new order**
- Toast notification appears **once per new order**
- Orders display with short ID format (e.g., `KK-1234`)
- Click **"Confirm Order"** to move to next stage
- **Notification Behavior**: The system tracks which orders have triggered notifications using `notifiedOrders` in localStorage
- Once an order is confirmed, notifications stop for that order

#### Stage 2: CONFIRMED ORDERS  
- Orders waiting to be prepared
- **Print button** available for order tickets
- Click **"Start Preparing"** to move order to preparing stage
- Orders in this stage appear on the Kitchen Display Screen

#### Stage 3: PREPARING ORDERS
- Active orders being cooked
- Click **"Mark as Done"** when order is complete
- Moves to Done list

#### Stage 4: DONE ORDERS
- **Read-only list** of completed orders
- Shows all finished orders for the day
- Displayed in simple list format
- No actions available - historical record only

### Kitchen Display Screen (`/kitchen/display`)
- Open via **"Open Display Page"** button in Kitchen Orders
- Opens in a **new browser tab/window**
- Designed for kitchen staff/cooks to view on a separate monitor
- Shows only **CONFIRMED** orders waiting to be prepared
- Updates in real-time as orders are confirmed by receptionist
- Orders disappear when marked as "Start Preparing"
- Best viewed on a separate monitor/tablet in the kitchen
- No interaction needed - just displays what needs to be cooked

**Technical Implementation**:
```typescript
// Kitchen Orders Page tracks notification state
const [notifiedOrders, setNotifiedOrders] = useState<Set<string>>(new Set());

// Load previously notified orders from localStorage
useEffect(() => {
  const notified = JSON.parse(localStorage.getItem("notifiedOrders") || "[]");
  setNotifiedOrders(new Set(notified));
}, []);

// Only notify for truly new pending orders
pendingOrders.forEach(order => {
  if (!notifiedOrders.has(order.id)) {
    // Play sound and show toast only once
    playNotificationSound();
    toast({
      title: "New Order!",
      description: `Order ${order.id} received`,
    });
    
    // Mark as notified
    const updated = new Set(notifiedOrders);
    updated.add(order.id);
    setNotifiedOrders(updated);
    localStorage.setItem("notifiedOrders", JSON.stringify([...updated]));
  }
});
```

### Walk-in Orders (`/kitchen/orders` - Add Order Form)
- Use search box to find menu items
- Click on items from mini-menu to add
- Adjust quantities with +/- buttons
- Complete customer details
- Submit walk-in order
- Order receives automatic KK-XXXX ID format

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
- Shows completed orders count, not active orders

### Orders View (`/manager/orders`)
- **READ ONLY** - No actions available
- View completed orders in **list/table format**
- Click on any order to see full details in a dialog
- Each row shows:
  - Order ID (e.g., KK-1234)
  - Customer name
  - Items ordered
  - Total amount
  - Status
  - Order date/time
- Filter orders by date
- Export/print order reports
- **No "Start Preparing" or action buttons** - managers only view history

**Technical Implementation**:
```typescript
// Manager Orders - Read-only list view
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Order ID</TableHead>
      <TableHead>Customer</TableHead>
      <TableHead>Items</TableHead>
      <TableHead>Total</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {orders.filter(o => o.status === 'done').map(order => (
      <TableRow key={order.id} className="cursor-pointer" onClick={() => viewDetails(order)}>
        <TableCell>{order.id}</TableCell>
        <TableCell>{order.customerName}</TableCell>
        <TableCell>{order.items.length} items</TableCell>
        <TableCell>₵{order.total}</TableCell>
        <TableCell><Badge>Completed</Badge></TableCell>
        <TableCell>{formatDate(order.createdAt)}</TableCell>
        <TableCell>
          <Button variant="ghost" size="sm">View Details</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Menu Management (`/manager/menu`)
- View all menu items for your branch
- **Edit existing items**:
  - Update name, price, category
  - **Change or add item images via Image URL field**
  - Toggle item availability (in stock / out of stock)
- Add new menu items to your branch
- Delete items no longer offered
- Changes only affect your branch

**Image URL Field**:
```typescript
// Edit Menu Item Dialog includes Image URL field
<FormField
  control={form.control}
  name="imageUrl"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Image URL</FormLabel>
      <FormControl>
        <Input 
          placeholder="https://example.com/image.jpg" 
          {...field} 
        />
      </FormControl>
      <FormDescription>
        Paste a direct link to the food image
      </FormDescription>
    </FormItem>
  )}
/>
```

### Deliveries (`/manager/deliveries`)
- Track active deliveries for your branch
- View delivery routes
- Update delivery status
- Monitor delivery times

### Payments (`/manager/payments`)
- View payment records for your branch
- Track payment methods used
- Generate payment reports
- Monitor cash vs card transactions

### Settings (`/manager/settings`)
- Branch-specific settings
- Notification preferences
- Operating hours configuration
- Staff management

---

## Admin Access (Super Admin)

### Login
- Navigate to **Footer → Staff Access → Admin Login**
- Login URL: `/admin/login`
- Default credentials: `admin / admin123`
- **Authentication**: Uses localStorage key `adminAuth: "true"`
- Upon successful login, redirects to `/admin/dashboard`

**Login Implementation**:
```typescript
// Admin Login Component
const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (credentials.username === "admin" && credentials.password === "admin123") {
    localStorage.setItem("adminAuth", "true");
    toast({
      title: "Login Successful",
      description: "Welcome, Admin!",
    });
    navigate("/admin/dashboard");
  } else {
    toast({
      title: "Login Failed",
      description: "Invalid credentials",
      variant: "destructive",
    });
  }
};
```

### Admin Dashboard (`/admin/dashboard`)

**Layout**: Sidebar navigation with main content area

**Sidebar Sections**:
- Dashboard Overview
- Branches
- Sales Analytics
- All Orders
- Menu Management
- Settings (future)

**Overview Cards** (Top of dashboard):
- **Total Revenue**: Sum of all sales across all branches
- **Total Orders**: Count of all orders system-wide
- **Top Selling Item**: Most frequently ordered item
- **Highest Earning Branch**: Branch with most revenue

**Charts & Analytics**:
1. **Revenue by Branch** (Bar Chart)
   - X-axis: Branch names
   - Y-axis: Revenue amount
   - Shows comparative performance

2. **Top Selling Items** (Pie Chart)
   - Shows distribution of popular menu items
   - Percentage breakdown of orders

3. **Orders Over Time** (Line Chart)
   - Daily/weekly/monthly trends
   - Helps identify peak periods

**Branch Performance List**:
- Grid/table of all branches
- Each card shows:
  - Branch name and location
  - Total revenue
  - Order count
  - Average order value
- Click on any branch to view detailed analytics

**Technical Implementation**:
```typescript
// Admin Dashboard - Calculate metrics
const calculateMetrics = () => {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const branches = JSON.parse(localStorage.getItem("branches") || "[]");
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  
  // Find top selling item
  const itemCounts = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
  });
  const topItem = Object.entries(itemCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A";
  
  // Find highest earning branch
  const branchRevenue = {};
  orders.forEach(order => {
    const branch = order.branchId || "Main";
    branchRevenue[branch] = (branchRevenue[branch] || 0) + order.total;
  });
  const topBranch = Object.entries(branchRevenue)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A";
  
  return { totalRevenue, totalOrders, topItem, topBranch };
};
```

### Branch Management (`/admin/branches`)

**View All Branches**:
- Grid layout showing all restaurant locations
- Each card displays:
  - Branch name
  - Location/address
  - Phone number
  - Manager name
  - Quick stats (orders, revenue)
  - Action buttons (View Details, Edit, Delete)

**Add New Branch**:
- Click "Add New Branch" button
- Opens dialog form with fields:
  - **Branch Name**: e.g., "Koko King - Osu"
  - **Address**: Full street address
  - **Phone**: Contact number
  - **Manager**: Assign manager (dropdown)
  - **Operating Hours**: Opening and closing times
- Submit to create new branch in system
- Stored in localStorage under `branches` key

**Branch Details View** (Click on any branch card):

Opens detailed view with tabs:

1. **Overview Tab**:
   - Branch information (name, address, phone)
   - Manager details
   - Operating hours
   - Total revenue for this branch
   - Total orders from this branch
   - Average order value
   - Edit button to modify details

2. **Recent Orders Tab**:
   - Last 10-20 orders from this branch
   - Table format with:
     - Order ID
     - Customer name
     - Items count
     - Total amount
     - Date/time
   - Click to view full order details

3. **Top Items Tab**:
   - Best-selling items at this location
   - Shows:
     - Item name
     - Times ordered
     - Revenue generated
     - Percentage of total sales
   - Helps identify location-specific preferences

4. **Analytics Tab**:
   - Branch-specific charts
   - Revenue trends over time
   - Peak ordering hours
   - Customer demographics (if available)

**Delete Branch**:
- Click delete icon on branch card
- Confirmation dialog appears
- Warns if branch has active orders
- Upon confirmation, removes branch from system
- Historical orders remain but marked as "Closed Branch"

**Technical Implementation**:
```typescript
// Branch Management - CRUD Operations
// Data structure stored in localStorage

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId: string;
  managerName: string;
  operatingHours: {
    open: string;
    close: string;
  };
  createdAt: string;
  isActive: boolean;
}

// Add Branch
const addBranch = (branchData: Omit<Branch, 'id' | 'createdAt'>) => {
  const branches = JSON.parse(localStorage.getItem("branches") || "[]");
  const newBranch: Branch = {
    ...branchData,
    id: `BR-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  branches.push(newBranch);
  localStorage.setItem("branches", JSON.stringify(branches));
};

// Calculate Branch Analytics
const getBranchAnalytics = (branchId: string) => {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const branchOrders = orders.filter(o => o.branchId === branchId);
  
  const totalRevenue = branchOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = branchOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Top items for this branch
  const itemCounts = {};
  branchOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { count: 0, revenue: 0 };
      }
      itemCounts[item.name].count += item.quantity;
      itemCounts[item.name].revenue += item.price * item.quantity;
    });
  });
  
  const topItems = Object.entries(itemCounts)
    .map(([name, data]: [string, any]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  return { totalRevenue, totalOrders, avgOrderValue, topItems };
};
```

### Sales Analytics (`/admin/analytics`)

**Time Period Filters**:
- Daily view (last 7 days)
- Weekly view (last 4 weeks)
- Monthly view (last 12 months)
- Custom date range picker

**Charts Displayed**:

1. **Sales Trends Line Chart**:
   - X-axis: Time periods
   - Y-axis: Revenue
   - Multiple lines for different branches
   - Toggle branches on/off

2. **Revenue Breakdown Bar Chart**:
   - Compare revenue across time periods
   - Stacked bars showing branch contributions

3. **Order Frequency Chart**:
   - Shows busiest times of day
   - Helps with staff scheduling
   - Peaks typically at lunch and dinner

4. **Category Performance**:
   - Which food categories sell best
   - Pizza, Wraps, Drinks, etc.
   - Pie or donut chart format

**Performance Metrics Table**:
- Branch-by-branch comparison
- Columns:
  - Branch name
  - Revenue
  - Orders
  - Avg. order value
  - Growth % (compared to previous period)
  - Top item
- Sortable by any column
- Export to CSV option

**Technical Implementation**:
```typescript
// Analytics Page - Time-based filtering
const getAnalyticsData = (period: 'daily' | 'weekly' | 'monthly') => {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const now = new Date();
  
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
    
    switch(period) {
      case 'daily': return diffDays <= 7;
      case 'weekly': return diffDays <= 28;
      case 'monthly': return diffDays <= 365;
      default: return true;
    }
  });
  
  // Group by time period
  const grouped = {};
  filteredOrders.forEach(order => {
    const date = new Date(order.createdAt);
    let key;
    
    if (period === 'daily') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (period === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (!grouped[key]) {
      grouped[key] = { revenue: 0, orders: 0 };
    }
    grouped[key].revenue += order.total;
    grouped[key].orders += 1;
  });
  
  return grouped;
};

// Recharts implementation
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="revenue" stroke="#e94d35" />
  </LineChart>
</ResponsiveContainer>
```

### All Orders View (`/admin/orders`)

**Features**:
- View orders from **ALL branches** in one place
- Advanced filtering:
  - **By Branch**: Dropdown to select specific branch or "All"
  - **By Date Range**: Start date and end date pickers
  - **By Status**: Pending, Confirmed, Preparing, Done
  - **By Order ID**: Search for specific order
  - **By Customer Name**: Search by customer

**Table Display**:
- Columns:
  - Order ID (e.g., KK-1234)
  - Branch name
  - Customer name
  - Items (count)
  - Total amount
  - Status badge (colored)
  - Date/time
  - Actions (View Details button)

**Order Details Dialog**:
- Click any order row to open detailed view
- Shows:
  - Full order information
  - Customer details (name, phone, address)
  - Itemized list with quantities and prices
  - Subtotal, delivery fee, total
  - Order status history/timeline
  - Branch location
  - Payment method
  - Special instructions

**Export Options**:
- Export to CSV
- Export to PDF
- Print order report
- Date range export for accounting

**Technical Implementation**:
```typescript
// Admin Orders - Multi-branch view with filters
const [filters, setFilters] = useState({
  branchId: 'all',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  searchTerm: '',
});

const filteredOrders = useMemo(() => {
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  
  if (filters.branchId !== 'all') {
    orders = orders.filter(o => o.branchId === filters.branchId);
  }
  
  if (filters.status !== 'all') {
    orders = orders.filter(o => o.status === filters.status);
  }
  
  if (filters.dateFrom) {
    orders = orders.filter(o => new Date(o.createdAt) >= new Date(filters.dateFrom));
  }
  
  if (filters.dateTo) {
    orders = orders.filter(o => new Date(o.createdAt) <= new Date(filters.dateTo));
  }
  
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term)
    );
  }
  
  return orders.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}, [filters]);
```

### Menu Management (`/admin/menu`)

**System-Wide Menu Control**:
- View all menu items across entire system
- Manage global menu catalog
- Changes affect all branches unless branch-specific overrides exist

**Add New Menu Item**:
- Click "Add New Item" button
- Form fields:
  - **Name**: Item name (e.g., "Spicy Chicken Wrap")
  - **Description**: Brief description
  - **Price**: Amount in ₵
  - **Category**: Select from categories (Pizza, Wraps, Sandwiches, etc.)
  - **Image URL**: Direct link to item image
  - **Available**: Toggle on/off
  - **Branch Assignment**: Select which branches should offer this item
    - "All Branches" option
    - Or select specific branches via checkboxes

**Edit Menu Item**:
- Click edit icon on any item card
- Opens pre-filled form with current values
- Can modify:
  - Name, description, price
  - **Change image URL** to update picture
  - Change category
  - Toggle availability
  - Reassign to different branches
- Save updates all instances across selected branches

**Delete Menu Item**:
- Click delete icon
- Confirmation dialog with warning
- Shows which branches will be affected
- Upon confirmation, removes item from system
- Historical orders still show the item name

**Branch-Specific Menu Variations**:
- Some items can be branch-specific
- Example: "Beach Special" only at coastal location
- Mark item as "Branch Exclusive" during creation
- Select single branch for assignment

**Menu Categories**:
- Pizza
- Wraps
- Sandwiches
- Sides (Fries, Coleslaw, etc.)
- Drinks (Soft drinks, Juices)
- Salads
- Combo Meals
- Specials (Limited time offers)
- Porridge
- Bakery

**Technical Implementation**:
```typescript
// Admin Menu Management
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  branches: string[]; // Array of branch IDs, or ["all"]
  createdAt: string;
  updatedAt: string;
}

// Add menu item
const addMenuItem = (itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
  const customMenuItems = JSON.parse(localStorage.getItem("customMenuItems") || "[]");
  const newItem: MenuItem = {
    ...itemData,
    id: `ITEM-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  customMenuItems.push(newItem);
  localStorage.setItem("customMenuItems", JSON.stringify(customMenuItems));
};

// Update menu item (including image URL)
const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
  const customMenuItems = JSON.parse(localStorage.getItem("customMenuItems") || "[]");
  const index = customMenuItems.findIndex(item => item.id === itemId);
  
  if (index !== -1) {
    customMenuItems[index] = {
      ...customMenuItems[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("customMenuItems", JSON.stringify(customMenuItems));
  }
};

// Get menu items for specific branch
const getBranchMenu = (branchId: string) => {
  const allItems = JSON.parse(localStorage.getItem("customMenuItems") || "[]");
  return allItems.filter(item => 
    item.available && 
    (item.branches.includes("all") || item.branches.includes(branchId))
  );
};
```

---

## Order Status Flow

```
PENDING → CONFIRMED → PREPARING → DONE → COMPLETED
```

1. **PENDING**: New order received, notification sent to kitchen (once)
2. **CONFIRMED**: Kitchen staff acknowledged order, shows on display screen
3. **PREPARING**: Food is being actively cooked, visible to cooks
4. **DONE**: Order complete in kitchen, ready for pickup/delivery  
5. **COMPLETED**: Order delivered/picked up by customer

**Status Tracking**:
```typescript
interface Order {
  id: string; // Format: KK-1234
  status: 'pending' | 'confirmed' | 'preparing' | 'done' | 'completed';
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  total: number;
  branchId: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: string;
    timestamp: string;
    updatedBy: string; // kitchen/manager/admin
  }[];
}
```

---

## Data Storage

All data is currently stored in browser localStorage:

### Keys and Structures:

1. **`orders`**: Array of all customer orders
   ```json
   [{
     "id": "KK-1234",
     "status": "pending",
     "customerName": "John Doe",
     "customerPhone": "0201234567",
     "deliveryAddress": "123 Main St",
     "items": [...],
     "total": 45.50,
     "branchId": "BR-001",
     "createdAt": "2025-01-15T10:30:00Z"
   }]
   ```

2. **`branches`**: Array of restaurant locations
   ```json
   [{
     "id": "BR-001",
     "name": "Koko King - Osu",
     "address": "123 Oxford Street, Osu",
     "phone": "0301234567",
     "managerId": "MGR-001",
     "managerName": "Jane Smith"
   }]
   ```

3. **`customMenuItems`**: Admin-added menu items
4. **`cart`**: Customer shopping cart (current session)
5. **`kitchenAuth`**: Kitchen login state (boolean string)
6. **`managerAuth`**: Manager login state (boolean string)
7. **`adminAuth`**: Admin login state (boolean string)
8. **`notifiedOrders`**: Array of order IDs that have triggered notifications
9. **`locationDetected`**: Boolean flag for auto-location detection

### Order ID Format
- Orders use short format: `KK-XXXX` (e.g., KK-1234)
- Easy to communicate over phone
- Sequential numbering based on timestamp

**ID Generation**:
```typescript
const generateOrderId = () => {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const lastOrder = orders[orders.length - 1];
  const lastNum = lastOrder ? parseInt(lastOrder.id.split('-')[1]) : 1000;
  return `KK-${lastNum + 1}`;
};
```

---

## Navigation Structure

### Public Pages
- `/` - Homepage (auto-detects location, search, categories, menu)
- `/menu` - Full menu page
- `/cart` - Shopping cart
- `/checkout` - Order checkout
- `/contact` - Contact information
- `/store-locator` - Find restaurant locations
- `/auth` - Customer login/signup (button in navbar)

### Kitchen Pages
- `/kitchen/login` - Kitchen staff login (in footer)
- `/kitchen/orders` - Order management (4-stage workflow)
- `/kitchen/display` - Kitchen display screen (shows CONFIRMED orders only)

### Manager Pages
- `/manager/login` - Manager login (in footer)
- `/manager/dashboard` - Overview and stats
- `/manager/orders` - Order history (read-only list view)
- `/manager/menu` - Menu editing (with image URL field)
- `/manager/deliveries` - Delivery tracking
- `/manager/payments` - Payment records
- `/manager/settings` - Branch settings

### Admin Pages
- `/admin/login` - Admin login (in footer)
- `/admin/dashboard` - System overview with charts
- `/admin/branches` - Branch management & detailed analytics
- `/admin/analytics` - Sales analytics with time filters
- `/admin/orders` - All orders from all branches
- `/admin/menu` - Global menu management

---

## Key Features

### Customer Features
- **Auto Location Detection**: Automatically selects nearest Koko King on first visit
- Location-based ordering (From/To selector)
- Search functionality across all menu items
- Category browsing with carousel
- Shopping cart with floating widget
- Short, memorable order IDs (KK-XXXX)
- Responsive design for mobile and desktop
- Login button in navbar for account access

### Kitchen Features
- **Real-time order notifications** (plays once per new order)
- 4-stage workflow (Pending → Confirmed → Preparing → Done)
- Order printing capability
- Walk-in order entry system
- **Dedicated display screen** for cooks (shows confirmed orders)
- Short order IDs for easy reference
- Sound and visual notifications

### Manager Features
- **Read-only order viewing** in list format
- Click to view detailed order information
- Menu editing with **image URL updates**
- Branch performance monitoring
- Delivery tracking
- Payment records
- Cannot modify order status (view only)

### Admin Features
- **Multi-branch overview** dashboard
- Detailed branch analytics with charts
- Sales trends (daily/weekly/monthly views)
- System-wide menu control
- Branch creation and management
- View orders from all locations
- Top items and revenue tracking
- **Highest earning branch** identification
- Recharts integration for data visualization

---

## Default Login Credentials

**Kitchen Staff:**
- Username: `kitchen`
- Password: `kitchen123`
- Redirects to: `/kitchen/orders`

**Manager:**
- Username: `manager`
- Password: `manager123`
- Redirects to: `/manager/dashboard`

**Admin:**
- Username: `admin`
- Password: `admin123`
- Redirects to: `/admin/dashboard`

**Customer:**
- Via `/auth` page (login button in navbar)
- Can create account or login
- Not required for ordering (guest checkout available)

*⚠️ IMPORTANT: Change these credentials in production for security!*

---

## Technical Implementation Details

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Recharts** for data visualization
- **Lucide React** for icons

### Key Files to Edit for Integration

**Routing Configuration** (`src/App.tsx`):
- Central place for all route definitions
- Add new routes here for new pages
- Already configured with all customer, kitchen, manager, and admin routes

**Data Structure** (`src/data/menuItems.ts`):
- Contains menu items, categories, and restaurant locations
- Edit to add new restaurants, categories, or menu items
- Used across the application

**Location Detection** (`src/lib/geolocation.ts`):
- Auto-detects user location on homepage
- Uses browser's geolocation API
- Shows toast notifications for status

**Order Management** (`src/pages/kitchen/Orders.tsx`):
- 4-stage order workflow
- Notification system (once per order)
- Print functionality
- Walk-in order form

**Kitchen Display** (`src/pages/kitchen/Display.tsx`):
- Shows only confirmed orders
- Auto-updates in real-time
- Designed for secondary screen

**Manager Orders** (`src/pages/manager/Orders.tsx`):
- Read-only list view
- Filter and search functionality
- Click to view order details dialog

**Admin Dashboard** (`src/pages/admin/Dashboard.tsx`):
- Sidebar navigation
- Overview cards with metrics
- Charts using Recharts
- Branch performance list

**Admin Branches** (`src/pages/admin/Branches.tsx`):
- Branch CRUD operations
- Detailed analytics per branch
- Tabs for overview, orders, top items

**Admin Analytics** (`src/pages/admin/Analytics.tsx`):
- Time-based filtering
- Multiple chart types
- Export functionality

**Admin Orders** (`src/pages/admin/Orders.tsx`):
- Multi-branch order view
- Advanced filtering
- Export options

**Admin Menu** (`src/pages/admin/Menu.tsx`):
- System-wide menu management
- Branch-specific item assignment
- Image URL editing

**Components**:
- `Navbar` - Customer login button, cart, navigation
- `Footer` - Staff access links (Kitchen, Manager, Admin)
- `HeroBanner` - Centered banner images (object-contain)
- `LocationSelector` - From/To fields with auto-detection
- `CategoryCarousel` - Horizontal category navigation

---

## Troubleshooting

### Orders not appearing?
- Check localStorage for `orders` key
- Verify order status matches the view you're in
- Kitchen: Only `pending` shows in Pending Orders
- Display: Only `confirmed` shows on Kitchen Display
- Manager: Only `done` orders appear in Orders list
- Admin: All orders visible with filtering

### Notifications repeating?
- **FIXED**: Notifications now only play once per new pending order
- System tracks notified orders in localStorage key `notifiedOrders`
- Clear this key to reset: `localStorage.removeItem("notifiedOrders")`

### Can't access admin pages?
- Verify you're logged in via `/admin/login`
- Check localStorage for `adminAuth: "true"`
- Clear browser cache if persistent issues
- Ensure you're using correct credentials (admin/admin123)

### Admin redirecting to manager page?
- **FIXED**: Admin login now correctly redirects to `/admin/dashboard`
- Check that `adminAuth` is set, not `managerAuth`
- Clear all auth keys and re-login if issue persists

### Kitchen Display not showing orders?
- Display only shows orders with status = `confirmed`
- Ensure receptionist clicked "Confirm Order" first
- Check that `orders` localStorage is not corrupted
- Refresh display page after confirming orders

### Manager can't edit orders?
- **BY DESIGN**: Manager Orders page is read-only
- Managers can only view order details, not modify status
- Use Kitchen access for order management

### Images not loading?
- Check that image URLs are valid and accessible
- For menu items, verify `imageUrl` field is populated
- Banner images use `object-contain` for centered display
- For manager menu edits, paste full image URL (https://...)

### Location not auto-detecting?
- User must allow browser location permissions
- Check browser console for geolocation errors
- Fallback: User can manually select restaurant
- Location detection only runs once (check `locationDetected` key)

### Order ID format wrong?
- **FIXED**: Now uses `KK-XXXX` format
- Previous orders may still have old format
- New orders will use short format
- Check `generateOrderId()` function in AddOrderForm and Checkout

### Charts not displaying in Admin?
- Ensure `recharts` package is installed
- Check that orders data exists in localStorage
- Verify date ranges are correct
- Browser console may show specific errors

---

**Last Updated**: 2025-01-15  
**Version**: 3.0  
**Status**: Production Ready
