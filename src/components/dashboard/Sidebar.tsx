import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Network,
  FileWarning,
  Settings,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Server, label: 'Device Inventory', path: '/devices' },
  { icon: Network, label: 'Topology Map', path: '/topology' },
  { icon: FileWarning, label: 'SNMP Traps/Logs', path: '/logs' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 z-50">
      {/* Logo */}
      <div className="mb-8 p-2">
        <div
          className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={() => navigate('/')}
        >
          <Activity className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 w-full px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-200 group relative",
                isActive
                  ? "nav-item-active"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />

              {/* Tooltip */}
              <span className="absolute left-full ml-3 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-2 w-full">
        <div className="w-full aspect-square rounded-lg bg-sidebar-accent flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-nms-info flex items-center justify-center text-xs font-semibold text-primary-foreground">
            AD
          </div>
        </div>
      </div>
    </aside>
  );
}
