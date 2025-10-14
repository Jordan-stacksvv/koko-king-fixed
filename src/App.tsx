import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import StoreLocator from "./pages/StoreLocator";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import KitchenLogin from "./pages/manager/Login";
import KitchenDashboard from "./pages/manager/Dashboard";
import KitchenOrders from "./pages/manager/Orders";
import KitchenMenu from "./pages/manager/MenuManagement";
import KitchenDeliveries from "./pages/manager/Deliveries";
import KitchenPayments from "./pages/manager/Payments";
import KitchenSettings from "./pages/manager/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/store-locator" element={<StoreLocator />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/kitchen/login" element={<KitchenLogin />} />
          <Route path="/kitchen/dashboard" element={<KitchenDashboard />} />
          <Route path="/kitchen/orders" element={<KitchenOrders />} />
          <Route path="/kitchen/menu" element={<KitchenMenu />} />
          <Route path="/kitchen/deliveries" element={<KitchenDeliveries />} />
          <Route path="/kitchen/payments" element={<KitchenPayments />} />
          <Route path="/kitchen/settings" element={<KitchenSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
