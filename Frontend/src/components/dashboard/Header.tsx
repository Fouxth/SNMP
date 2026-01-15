import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, CheckCircle, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getDeviceStats, alerts, devices } from '@/lib/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function Header() {
  const stats = getDeviceStats();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof devices>([]);
  const [showResults, setShowResults] = useState(false);
  const systemHealthy = stats.offline === 0 && stats.warning === 0;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = devices.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.ip.includes(query)
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleDeviceClick = (deviceId: string) => {
    toast.info('Device selected', { description: `Viewing device ${deviceId}` });
    setShowResults(false);
    setSearchQuery('');
    navigate('/devices');
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by IP or hostname..."
          className="pl-10 bg-background border-border font-mono text-sm placeholder:font-sans"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
            {searchResults.map(device => (
              <button
                key={device.id}
                className="w-full px-4 py-2 text-left hover:bg-muted flex items-center justify-between"
                onClick={() => handleDeviceClick(device.id)}
              >
                <div>
                  <p className="font-medium text-sm">{device.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{device.ip}</p>
                </div>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  device.status === 'online' && 'bg-nms-online/20 text-nms-online',
                  device.status === 'offline' && 'bg-nms-offline/20 text-nms-offline',
                  device.status === 'warning' && 'bg-nms-warning/20 text-nms-warning',
                )}>
                  {device.status}
                </span>
              </button>
            ))}
          </div>
        )}
        {showResults && searchResults.length === 0 && searchQuery.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground text-sm">
            No devices found
          </div>
        )}
      </div>

      {/* Global Status */}
      <div className="flex items-center gap-6">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition-colors"
          onClick={() => navigate('/logs')}
        >
          <div className={`status-dot ${systemHealthy ? 'status-online' : 'status-warning'}`} />
          <span className="text-sm font-medium">
            {systemHealthy ? 'System Healthy' : `${stats.offline + stats.warning} Issues`}
          </span>
          {systemHealthy && <CheckCircle className="w-4 h-4 text-nms-online" />}
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {stats.criticalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-nms-offline text-xs flex items-center justify-center rounded-full font-medium">
                  {stats.criticalAlerts}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b border-border">
              <h4 className="font-semibold">Notifications</h4>
            </div>
            <div className="max-h-64 overflow-auto">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 border-b border-border last:border-0 hover:bg-muted cursor-pointer',
                    alert.severity === 'critical' && 'bg-nms-offline/5'
                  )}
                  onClick={() => {
                    navigate('/logs');
                    toast.info(`Viewing alert for ${alert.device}`);
                  }}
                >
                  <p className={cn(
                    'text-sm font-medium',
                    alert.severity === 'critical' && 'text-nms-offline',
                    alert.severity === 'warning' && 'text-nms-warning',
                  )}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.device} • {alert.timestamp}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-border">
              <Button variant="ghost" className="w-full text-sm" onClick={() => navigate('/logs')}>
                View all alerts
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-secondary/50 rounded-lg px-3 py-2 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-nms-info flex items-center justify-center text-xs font-semibold text-primary-foreground">
                AD
              </div>
              <span className="text-sm font-medium">Admin</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => toast.info('Profile opened')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-nms-offline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
