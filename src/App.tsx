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
import KitchenLogin from "./pages/manager/Login";
import Dashboard from "./pages/manager/Dashboard";
import Orders from "./pages/manager/Orders";
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
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/store-locator" element={<StoreLocator />} />
          <Route path="/kitchen/login" element={<KitchenLogin />} />
          <Route path="/kitchen/dashboard" element={<Dashboard />} />
          <Route path="/kitchen/orders" element={<Orders />} />
          <Route path="/kitchen/deliveries" element={<Deliveries />} />
          <Route path="/kitchen/menu" element={<MenuManagement />} />
          <Route path="/kitchen/payments" element={<Payments />} />
          <Route path="/kitchen/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
