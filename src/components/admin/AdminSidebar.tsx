import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { TrendingUp, Store, ShoppingCart, Package, BarChart, Settings, LogOut } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: TrendingUp },
    { path: "/admin/branches", label: "Branches", icon: Store },
    { path: "/admin/analytics", label: "Sales Analytics", icon: BarChart },
    { path: "/admin/orders", label: "All Orders", icon: ShoppingCart },
    { path: "/admin/menu", label: "Menu Management", icon: Package },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-3 border-b">
            <img 
              src={kokoKingLogo} 
              alt="Koko King" 
              className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.location.reload()}
            />
          </div>
          <SidebarGroupLabel className="mt-2">Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.path)}
                    className={isActive(item.path) ? "bg-primary/10 text-primary font-medium" : ""}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem className="mt-4">
                <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
