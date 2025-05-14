import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Outlet } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,  
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard,
  Monitor, 
  Users, 
  ClipboardList,
  Settings,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const DashboardLayout = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile !== isMobile) {
        setSidebarOpen(!mobile);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAuthenticated, navigate, isMobile]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="flex items-center justify-center py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-lg font-bold text-sidebar-foreground"
            >
              License Manager
            </motion.div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild onClick={() => navigate('/dashboard')}>
                    <div className="flex items-center">
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      <span>Dashboard</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild onClick={() => navigate('/devices')}>
                    <div className="flex items-center">
                      <Monitor className="mr-2 h-5 w-5" />
                      <span>Devices</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </motion.div>

              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild onClick={() => navigate('/users')}>
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        <span>Users</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild onClick={() => navigate('/logs')}>
                    <div className="flex items-center">
                      <ClipboardList className="mr-2 h-5 w-5" />
                      <span>Logs</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </motion.div>

              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild onClick={() => navigate('/settings')}>
                      <div className="flex items-center">
                        <Settings className="mr-2 h-5 w-5" />
                        <span>Settings</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              )}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <div className="p-4">
              <div className="mb-2 text-sm text-sidebar-foreground/70">
                Logged in as <span className="font-medium">{user?.username}</span>
              </div>
              <Button 
                variant="outline" 
                className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 flex flex-col">
          <div className="flex items-center p-4 border-b">
            <SidebarTrigger asChild>
              <Button variant="outline" size="icon">
                <ChevronLeft className="sidebar-open:hidden" />
                <ChevronRight className="hidden sidebar-open:block" />
              </Button>
            </SidebarTrigger>
            <div className="ml-4 font-medium">
              {user && (
                <span>Welcome, {user.username} ({user.role})</span>
              )}
            </div>
          </div>

          <main className="flex-1 p-6 overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
