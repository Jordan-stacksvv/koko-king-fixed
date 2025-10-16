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
          
          {/* Manager Routes */}
          <Route path="/manager/login" element={<ManagerLogin />} />
          <Route path="/manager/dashboard" element={<Dashboard />} />
          <Route path="/manager/orders" element={<ManagerOrders />} />
          <Route path="/manager/deliveries" element={<Deliveries />} />
          <Route path="/manager/menu" element={<MenuManagement />} />
          <Route path="/manager/payments" element={<Payments />} />
          <Route path="/manager/settings" element={<Settings />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
