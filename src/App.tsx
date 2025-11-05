import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Menu from "./pages/Menu";
import StoreLocator from "./pages/StoreLocator";

// Kitchen Routes
import KitchenLogin from "./pages/kitchen/Login";
import KitchenOrders from "./pages/kitchen/Orders";

// Manager Routes
import ManagerLogin from "./pages/manager/Login";
import Dashboard from "./pages/manager/Dashboard";
import ManagerOrders from "./pages/manager/Orders";
import Deliveries from "./pages/manager/Deliveries";
import MenuManagement from "./pages/manager/MenuManagement";
import Payments from "./pages/manager/Payments";
import Settings from "./pages/manager/Settings";

// Admin Routes
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import Branches from "./pages/admin/Branches";
import Analytics from "./pages/admin/Analytics";
import AdminOrders from "./pages/admin/Orders";
import AdminMenu from "./pages/admin/Menu";

// Kitchen Display
import KitchenDisplay from "./pages/kitchen/Display";

// Driver Routes
import DriverLogin from "./pages/driver/Login";
import DriverDeliveries from "./pages/driver/Deliveries";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/store-locator" element={<StoreLocator />} />
          
          {/* Kitchen Routes */}
          <Route path="/kitchen/login" element={<KitchenLogin />} />
          <Route path="/kitchen/orders" element={<KitchenOrders />} />
          <Route path="/kitchen/display" element={<KitchenDisplay />} />
          
          {/* Manager Routes */}
          <Route path="/manager/login" element={<ManagerLogin />} />
          <Route path="/manager/dashboard" element={<Dashboard />} />
          <Route path="/manager/orders" element={<ManagerOrders />} />
          <Route path="/manager/deliveries" element={<Deliveries />} />
          <Route path="/manager/menu" element={<MenuManagement />} />
          <Route path="/manager/payments" element={<Payments />} />
          <Route path="/manager/settings" element={<Settings />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/branches" element={<Branches />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/menu" element={<AdminMenu />} />

          {/* Driver Routes */}
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/driver/deliveries" element={<DriverDeliveries />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
