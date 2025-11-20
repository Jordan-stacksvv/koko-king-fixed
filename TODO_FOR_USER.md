# Tasks for Manual Implementation

This document outlines features and integrations that require manual setup, external accounts, or API keys that cannot be implemented automatically.

---

## ⚠️ IMPORTANT: Data Linking & System Architecture

**See `SYSTEM_DATA_FLOW.md` for complete details on how data flows through the system.**

### Branch Management System ✅ COMPLETED
- Centralized branch management via `useBranchData` hook
- Manager authentication now includes branch ID assignment
- Manager operations automatically scoped to their assigned branch
- Admin changes propagate to all pages via storage events
- Cross-tab synchronization implemented

### What Works Now:
- ✅ Admin can add/edit/delete branches - changes update everywhere
- ✅ Manager login requires branch selection
- ✅ Manager dashboard shows only their branch's data
- ✅ Manager settings edit only their branch information
- ✅ Branch updates sync across all components automatically
- ✅ No incorrect redirects to manager login pages

### Implementation Notes:
- All manager pages filter data by `managerBranch.id`
- Orders should include both `branch` name and `branchId` for compatibility
- Menu items and drivers should be tagged with `branchId`
- Restaurant selector syncs with branch data
- Geolocation consent dialog added for distance-based delivery pricing

---

## 🔐 1. Google Maps API Integration

**Status:** Required for production  
**Priority:** HIGH

### What You Need:
- Google Cloud Platform account
- Google Maps JavaScript API enabled
- Billing account set up (free tier available)

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Places API
4. Create API credentials (API Key)
5. Restrict API key to your domain for security
6. Add API key to your project

### Where to Add API Key:
- `src/components/MapLocationPicker.tsx` - Replace the demo Mapbox token with Google Maps key
- Consider using environment variables via Convex secrets for API key storage

### Current Status:
- Currently using demo Mapbox token (public, limited functionality)
- Full Google Maps integration needed for production-ready geolocation features

---

## 📱 2. WhatsApp Business API (Optional Enhancement)

**Status:** Optional  
**Priority:** MEDIUM

### Current Implementation:
- Basic WhatsApp deep linking via `wa.me` URLs (works without API)
- Opens WhatsApp with pre-filled message

### Enhancement Options:
If you want advanced WhatsApp features:
- **WhatsApp Business API** - For automated messages, templates, rich media
- Requires Meta Business account verification
- Involves webhook setup and message templates approval

### When to Consider:
- If you need automated delivery notifications via WhatsApp
- If you want two-way chat between driver and customer
- If you want rich media (images, location sharing) in WhatsApp

---

## 🔔 3. Push Notifications Setup

**Status:** Optional but Recommended  
**Priority:** MEDIUM

### Current Implementation:
- Toast notifications (in-app only)
- No push notifications when app is closed

### To Implement:
**Option A: Web Push Notifications (Free)**
- Use service worker (already in `public/service-worker.js`)
- Requires HTTPS domain
- User must grant notification permission
- No external service needed

**Option B: Firebase Cloud Messaging (Recommended)**
- Firebase account required (free tier generous)
- Cross-platform support
- Better delivery reliability
- Steps:
  1. Create Firebase project
  2. Add web app to Firebase project
  3. Get Firebase config
  4. Install Firebase SDK: `npm install firebase`
  5. Initialize Firebase in your app
  6. Update service worker for FCM

### Use Cases:
- Notify drivers of new delivery assignments
- Alert managers of new driver applications
- Notify customers when driver is arriving

---

## 💳 4. Paystack Integration (Payment Processing)

**Status:** Required for production payments  
**Priority:** HIGH

### What You Need:
- Paystack account ([https://paystack.com](https://paystack.com))
- Test and Live API keys

### Current Status:
- Payment logic exists in checkout
- Paystack integration incomplete
- Currently using mock payment processing via localStorage

### Implementation Steps:
1. Sign up for Paystack account
2. Get test API keys from Paystack dashboard
3. Add Paystack public key to Convex secrets or environment variables
4. Update `src/pages/Checkout.tsx` to integrate Paystack inline:
   ```tsx
   import { usePaystackPayment } from 'react-paystack';
   ```
5. Set up webhook endpoint in Convex edge function for payment verification
6. Test with Paystack test cards
7. Switch to live keys for production

### Convex Integration:
- Create `convex/paystack.ts` edge function for webhook verification
- Store transaction references in `transactions` table
- Verify payments server-side before order confirmation

---

## 🚗 5. Driver Payouts System

**Status:** Backend ready, frontend implementation needed  
**Priority:** MEDIUM

### What's Ready:
- `convex/drivers.ts` has earnings tracking functions
- `driverEarnings` table stores commission per delivery
- Schema supports earning records

### What You Need to Build:
1. **Manager/Admin Payout Interface:**
   - View driver earnings summary
   - Initiate payout requests
   - Track payout history

2. **Paystack Transfer API Integration:**
   - Use Paystack Transfer API to send money to driver accounts
   - Requires Transfer API enabled on Paystack account
   - Add recipient bank account verification

3. **Driver Earnings Dashboard:**
   - Show daily/weekly/monthly earnings
   - Display commission breakdown per delivery
   - Show pending vs paid amounts

### Implementation Files:
- `src/pages/manager/Drivers.tsx` - Add "Initiate Payout" button
- `src/pages/driver/Dashboard.tsx` - Add earnings summary card
- `convex/paystack.ts` - Create transfer function

---

## 🗺️ 6. Real-Time GPS Tracking

**Status:** Partially implemented  
**Priority:** MEDIUM

### Current Implementation:
- Driver arrival detection (within 50m triggers alert)
- Static location markers on maps

### What's Missing:
- **Live driver location updates** on customer tracking page
- Continuous GPS coordinate broadcasting
- Real-time map marker movement

### To Implement:
1. **Driver Side (src/pages/driver/Deliveries.tsx):**
   ```tsx
   // Already has geolocation watch, add broadcast:
   navigator.geolocation.watchPosition((position) => {
     // Save to Convex orders table
     updateDriverLocation(orderId, {
       lat: position.coords.latitude,
       lng: position.coords.longitude,
       timestamp: Date.now()
     });
   });
   ```

2. **Customer Side (src/pages/OrderTracking.tsx):**
   - Subscribe to driver location updates via Convex real-time queries
   - Display moving marker on Google Maps
   - Update ETA based on distance changes

3. **Convex Schema Update:**
   - Add `driverLocation` field to orders table with timestamp
   - Index by orderId for fast lookups

---

## 🔄 7. Convex Real-Time Subscriptions

**Status:** Backend functions ready, frontend integration needed  
**Priority:** HIGH

### What's Ready:
- All Convex queries support real-time subscriptions
- Backend functions return live data

### What You Need to Do:
Replace localStorage usage with Convex hooks across all pages:

**Priority Pages:**
1. **Kitchen Orders** (`src/pages/kitchen/Orders.tsx`)
   ```tsx
   import { useQuery, useMutation } from "convex/react";
   import { api } from "../../convex/_generated/api";
   
   const orders = useQuery(api.orders.listByBranch, { branchId });
   const updateStatus = useMutation(api.orders.updateStatus);
   ```

2. **Manager Dashboard** (`src/pages/manager/Dashboard.tsx`)
   ```tsx
   const branchOrders = useQuery(api.orders.listByBranch, { branchId });
   const branchSales = useQuery(api.analytics.getBranchSales, { branchId });
   ```

3. **Driver Dashboard** (`src/pages/driver/Dashboard.tsx`)
   ```tsx
   const myDeliveries = useQuery(api.orders.list, {
     filters: { assignedDriver: driverId }
   });
   ```

### Migration Strategy:
- Start with one page at a time
- Keep localStorage as fallback during migration
- Test real-time updates before removing localStorage
- Ensure offline functionality is maintained

---

## 🔐 8. Authentication System

**Status:** Mock authentication in place  
**Priority:** HIGH for production

### Current Status:
- All roles use localStorage for authentication
- No password hashing
- No session management
- Security risk for production

### Options:

**Option A: Convex Auth (Recommended)**
- Built into Convex
- Zero external dependencies
- Supports email/password, OAuth, phone auth
- Steps:
  1. Enable auth in Convex dashboard
  2. Install Convex auth helpers
  3. Replace localStorage auth checks
  4. Add password hashing

**Option B: Supabase Auth**
- Robust auth system
- Requires Supabase account
- More features but external dependency

### Implementation Priority:
1. Customer authentication (email/password)
2. Admin/Manager authentication (secure credentials)
3. Kitchen staff authentication (PIN or password)
4. Driver authentication (phone + PIN)

---

## 📊 9. Analytics Dashboard Enhancements

**Status:** Basic analytics ready in Convex  
**Priority:** LOW

### What's Ready:
- `convex/analytics.ts` has sales tracking functions
- Daily sales, top items, revenue tracking

### Future Enhancements:
- Export sales reports to PDF/Excel
- Graphical charts (integrate Chart.js or Recharts)
- Predictive analytics (busy hours, popular items)
- Customer retention metrics

### Suggested Libraries:
- `recharts` - Already installed, needs implementation
- `jspdf` - For PDF report generation
- `xlsx` - For Excel export

---

## 🖼️ 10. Image Optimization & Storage

**Status:** Basic image upload works via base64  
**Priority:** MEDIUM

### Current Implementation:
- Images stored as base64 in localStorage
- Works but inefficient for large images
- No compression

### Recommended Improvements:
1. **Image Compression:**
   ```bash
   npm install browser-image-compression
   ```
   - Compress images before base64 conversion
   - Reduce file size by 70-80%

2. **Cloud Storage (Future):**
   - Use Convex file storage (when available)
   - Or integrate Cloudinary/AWS S3
   - Store image URLs instead of base64

### Implementation:
- Update `src/pages/admin/Settings.tsx` banner/logo upload handlers
- Add compression before localStorage save
- Display compressed previews

---

## 🔧 11. Environment Configuration

**Status:** Needs setup  
**Priority:** HIGH

### Create `.env.local` file:
```env
# Convex
VITE_CONVEX_URL=https://your-project.convex.cloud

# Google Maps (when ready)
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Paystack (when ready)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxx

# App Config
VITE_APP_NAME=Koko King
VITE_APP_URL=https://your-domain.com
```

### Convex Secrets (via Dashboard):
- `PAYSTACK_SECRET_KEY` - For backend payment verification
- `GOOGLE_MAPS_API_KEY` - If using server-side geocoding
- `RESEND_API_KEY` - For email notifications (optional)

---

## 📱 12. PWA Features Enhancement

**Status:** Basic PWA setup exists  
**Priority:** LOW

### Current Status:
- `manifest.json` exists
- `service-worker.js` exists
- Install prompt component exists

### Enhancements Needed:
1. Update `manifest.json` with your branding:
   - App name
   - App icons (generate 192x192, 512x512)
   - Theme colors
   - Start URL

2. Improve service worker:
   - Add offline page
   - Cache static assets
   - Cache API responses
   - Background sync for orders

3. Install prompt optimization:
   - Better UX for install button
   - A/B test install messaging

---

## 📋 Implementation Checklist

### Week 1 - Critical Setup:
- [ ] Set up Convex project (`npx convex dev`)
- [ ] Add `VITE_CONVEX_URL` to `.env.local`
- [ ] Deploy Convex schema
- [ ] Test Convex dashboard access

### Week 2 - Core Features:
- [ ] Get Google Maps API key
- [ ] Test map integration on one page
- [ ] Set up Paystack test account
- [ ] Migrate checkout to Paystack

### Week 3 - Real-Time:
- [ ] Replace localStorage with Convex on kitchen orders page
- [ ] Test real-time order updates
- [ ] Migrate manager dashboard to Convex

### Week 4 - Polish:
- [ ] Add image compression
- [ ] Set up push notifications (optional)
- [ ] Implement driver GPS tracking
- [ ] Test end-to-end workflows

---

## 🆘 Need Help?

### Resources:
- [Convex Documentation](https://docs.convex.dev/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Paystack Docs](https://paystack.com/docs)
- [Lovable Troubleshooting](https://docs.lovable.dev/tips-tricks/troubleshooting)

### Common Issues:
- **Convex not connecting:** Check VITE_CONVEX_URL in .env.local
- **Maps not loading:** Verify API key restrictions and billing
- **Real-time not working:** Ensure ConvexProvider wraps app in main.tsx
- **Payment failing:** Use Paystack test cards and check console logs

---

## ✅ What's Already Done

You don't need to worry about these:
- ✅ Complete Convex schema (11 tables)
- ✅ 66 backend functions across 8 files
- ✅ Driver branch selection and approval workflow
- ✅ Manager driver management interface
- ✅ Distance-based delivery pricing
- ✅ Driver customer calling (phone + WhatsApp)
- ✅ Automatic arrival alerts
- ✅ Responsive image handling
- ✅ All routing configured
- ✅ Complete UI components
- ✅ PWA manifest and service worker
- ✅ Role-based access control (frontend)

---

**Last Updated:** 2025-11-20  
**Next Review:** After Week 1 implementation
