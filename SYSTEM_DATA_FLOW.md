# System Data Flow & Branch Management

## Overview
This document outlines how data flows through the Koko King system, ensuring manager and admin changes propagate correctly to all necessary pages.

## Centralized Branch Management

### Hook: `useBranchData`
Located in `src/hooks/useBranchData.tsx`, this hook provides centralized branch management:

```typescript
const {
  branches,              // All branches
  loadBranches,          // Reload from localStorage
  saveBranches,          // Save and trigger sync
  addBranch,             // Add new branch
  updateBranch,          // Update existing branch
  deleteBranch,          // Remove branch
  getBranchById,         // Get single branch
  getManagerBranch       // Get manager's assigned branch
} = useBranchData();
```

**Key Features:**
- Automatic cross-tab synchronization via storage events
- Centralized data source (localStorage)
- Single source of truth for all branch operations

## Manager Authentication & Scoping

### Login Flow
1. Manager selects their branch from dropdown
2. Credentials validated: `manager@kokoking.com` / `manager123`
3. Auth stored with branch ID:
```typescript
localStorage.setItem("managerAuth", JSON.stringify({
  authenticated: true,
  branchId: selectedBranch,
  email: email
}));
```

### Branch-Scoped Operations
All manager operations are automatically filtered to their assigned branch:

**Dashboard:**
- Orders filtered by `order.branch === managerBranch.name` or `order.branchId === managerBranch.id`
- Stats calculated only for their branch
- Recent orders show only branch-specific data

**Settings:**
- Manager can only edit their branch information
- Changes update the branch in central storage
- Updates propagate to all pages using `useBranchData`

**Menu Management:**
- Menu items should be tagged with `branchId`
- Managers only see/edit items for their branch

**Driver Management:**
- Drivers filtered by `driver.branchId === managerBranch.id`
- Approval/rejection only affects their branch drivers

## Admin Operations

### Adding/Editing Branches
Admin uses `src/pages/admin/Branches.tsx`:

```typescript
const { addBranch, updateBranch, deleteBranch } = useBranchData();

// Add new branch
addBranch({
  name: "New Branch",
  location: "Address",
  phone: "+233...",
  manager: "Manager Name",
  image: "base64..."
});

// Update existing
updateBranch(branchId, {
  name: "Updated Name",
  // ... other fields
});
```

**Data Propagation:**
- Changes immediately saved to localStorage
- Storage event triggered automatically
- All components using `useBranchData` reload
- Restaurant selector updates automatically
- Checkout page reflects new branches
- Manager logins show updated branch list

### Deleting Branches
When admin deletes a branch:
1. Branch removed from storage
2. Warning shown about data loss
3. Related orders/drivers should be handled (currently remain in localStorage)

## Data Linking Across Pages

### Components Using Branch Data

**Customer-Facing:**
- `src/pages/Index.tsx` - Restaurant selection
- `src/components/LocationSelectorWithMap.tsx` - Branch selector
- `src/components/MapLocationPicker.tsx` - Map markers for branches
- `src/pages/Checkout.tsx` - Delivery branch selection

**Manager Pages:**
- `src/pages/manager/Dashboard.tsx` - Branch-scoped stats
- `src/pages/manager/Settings.tsx` - Branch info editing
- `src/pages/manager/Orders.tsx` - Branch orders only
- `src/pages/manager/Drivers.tsx` - Branch drivers only
- `src/pages/manager/MenuManagement.tsx` - Branch menu items

**Admin Pages:**
- `src/pages/admin/Branches.tsx` - Full branch CRUD
- `src/pages/admin/Dashboard.tsx` - All branches or selected branch
- `src/pages/admin/Orders.tsx` - Filter by branch
- `src/pages/admin/Analytics.tsx` - Per-branch or combined analytics

### Automatic Synchronization

**When Admin Updates Branch:**
1. `updateBranch(branchId, changes)` called
2. localStorage updated
3. Storage event dispatched
4. All mounted components with `useBranchData` reload
5. Changes visible immediately:
   - Restaurant selector shows updated name
   - Manager dashboard reflects new branch info
   - Checkout page has updated branch details
   - Analytics recalculate with new data

**When Manager Updates Settings:**
1. Manager edits branch info in Settings
2. `updateBranch(managerBranch.id, newInfo)` called
3. Changes saved to central storage
4. Admin's branch list automatically updates
5. Customer-facing pages show updated info

## Orders and Branch Association

### Order Structure
Orders should include both `branch` (name) and `branchId`:
```typescript
{
  id: "KK-1234",
  branch: "East Legon",
  branchId: "branch-east-legon",
  items: [...],
  customer: {...},
  // ... other fields
}
```

### Filtering Orders

**Manager View:**
```typescript
const orders = JSON.parse(localStorage.getItem("orders") || "[]");
const branchOrders = orders.filter(order => 
  order.branch === managerBranch.name || 
  order.branchId === managerBranch.id
);
```

**Admin View:**
```typescript
// All branches
const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");

// Single branch
const branchOrders = allOrders.filter(order => 
  order.branchId === selectedBranchId
);
```

## Drivers and Branch Association

### Driver Structure
```typescript
{
  id: "driver-123",
  branchId: "branch-east-legon",
  name: "John Doe",
  phone: "+233...",
  status: "online",
  // ... other fields
}
```

### Manager Driver Management
Managers only see and approve drivers for their branch:
```typescript
const drivers = JSON.parse(localStorage.getItem("drivers") || "[]");
const branchDrivers = drivers.filter(d => d.branchId === managerBranch.id);
```

## Restaurant/Location Data

### Data Source
Branches serve as restaurant locations for customer ordering:
- `src/data/menuItems.ts` defines `restaurants` array
- Should be synced with branches from localStorage
- Or branches should extend the Restaurant interface

### Coordinates
Each branch should have coordinates for:
- Distance calculation
- Map markers
- Delivery fee calculation

```typescript
interface Branch {
  id: string;
  name: string;
  location: string;
  phone: string;
  manager: string;
  image?: string;
  createdAt: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}
```

## Implementation Checklist

### Completed ✅
- [x] Created `useBranchData` hook for centralized management
- [x] Updated manager login to store branchId
- [x] Updated manager dashboard to filter by branch
- [x] Updated manager settings to be branch-specific
- [x] Updated admin branches page to use centralized hook
- [x] Added storage event synchronization
- [x] Updated LocationSelectorWithMap to sync with branch data

### Todo 📋
- [ ] Update all manager pages to use `getManagerBranch()`
- [ ] Add `branchId` to menu items
- [ ] Filter menu items by branch in manager menu management
- [ ] Sync `restaurants` array with `branches` data
- [ ] Add coordinates input to branch creation/editing
- [ ] Update order creation to include `branchId`
- [ ] Add branch filtering to admin analytics
- [ ] Update driver queue to be branch-scoped
- [ ] Add branch selector to admin pages for filtering
- [ ] Ensure delivery pricing is branch-specific

## Best Practices

1. **Always use `useBranchData` hook** instead of directly accessing localStorage
2. **Filter by both `branch` name and `branchId`** for backward compatibility
3. **Use `getManagerBranch()` in all manager pages** to get the current manager's branch
4. **Trigger storage events** after any data modification for cross-tab sync
5. **Include branchId** in all new data structures (orders, menu items, drivers, etc.)
6. **Test branch scoping** by logging in as different branch managers
7. **Validate branch access** in all manager operations

## Migration Notes

### Existing Data
- Old orders may not have `branchId` - use `branch` name as fallback
- Menu items need `branchId` added
- Drivers created before system may need branch assignment
- Consider migration script to add missing `branchId` fields

### Testing
1. Create multiple branches as admin
2. Login as manager for Branch A
3. Verify only Branch A data is visible
4. Update Branch A settings
5. Login as admin - verify changes reflected
6. Login as manager for Branch B
7. Verify Branch A changes don't affect Branch B
8. Test cross-tab synchronization
