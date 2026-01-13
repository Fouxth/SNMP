import { Search, Bell, CheckCircle, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getDeviceStats } from '@/lib/mockData';

export function Header() {
  const stats = getDeviceStats();
  const systemHealthy = stats.offline === 0 && stats.warning === 0;
  
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search by IP or hostname..." 
          className="pl-10 bg-background border-border font-mono text-sm placeholder:font-sans"
        />
      </div>
      
      {/* Global Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50">
          <div className={`status-dot ${systemHealthy ? 'status-online' : 'status-warning'}`} />
          <span className="text-sm font-medium">
            {systemHealthy ? 'System Healthy' : `${stats.offline + stats.warning} Issues`}
          </span>
          {systemHealthy && <CheckCircle className="w-4 h-4 text-nms-online" />}
        </div>
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {stats.criticalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-nms-offline text-xs flex items-center justify-center rounded-full font-medium">
              {stats.criticalAlerts}
            </span>
          )}
        </Button>
        
        {/* User Profile */}
        <button className="flex items-center gap-2 hover:bg-secondary/50 rounded-lg px-3 py-2 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-nms-info flex items-center justify-center text-xs font-semibold text-primary-foreground">
            AD
          </div>
          <span className="text-sm font-medium">Admin</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
